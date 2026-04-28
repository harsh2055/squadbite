import { AISuggestion, MOCK_RESTAURANTS, MenuItem } from './mockData';

interface AIRequest {
  userMessage: string;
  preferences?: {
    isVeg?: boolean;
    budget?: number;
    spicy?: boolean;
  };
}

interface AIResponse {
  text: string;
  suggestions: AISuggestion[];
}

function parseUserIntent(message: string): { isVeg?: boolean; budget?: number; spicy?: boolean; keywords: string[] } {
  const lower = message.toLowerCase();
  return {
    isVeg: lower.includes('veg') && !lower.includes('non-veg') && !lower.includes('nonveg') ? true :
           lower.includes('non-veg') || lower.includes('nonveg') || lower.includes('chicken') || lower.includes('mutton') || lower.includes('egg') ? false : undefined,
    budget: (() => {
      const match = lower.match(/(?:under|below|within|₹|rs\.?|inr)\s*(\d+)/);
      return match ? parseInt(match[1]) : undefined;
    })(),
    spicy: lower.includes('spicy') || lower.includes('spice') || lower.includes('hot'),
    keywords: lower.split(/\s+/).filter(w => w.length > 2),
  };
}

function filterMenuItems(intent: ReturnType<typeof parseUserIntent>): { restaurant: typeof MOCK_RESTAURANTS[0]; items: MenuItem[] }[] {
  const results: { restaurant: typeof MOCK_RESTAURANTS[0]; items: MenuItem[] }[] = [];

  for (const restaurant of MOCK_RESTAURANTS) {
    let items = [...restaurant.items];

    if (intent.isVeg === true) items = items.filter(i => i.isVeg);
    if (intent.isVeg === false) items = items.filter(i => !i.isVeg);
    if (intent.budget) items = items.filter(i => i.price <= intent.budget!);
    if (intent.spicy) items = items.filter(i => i.spiceLevel === 'hot' || i.spiceLevel === 'medium');

    // keyword matching
    if (intent.keywords.length > 0) {
      const boosted = items.filter(i => {
        const itemText = (i.name + (i.tags || []).join(' ')).toLowerCase();
        return intent.keywords.some(kw => itemText.includes(kw));
      });
      if (boosted.length > 0) items = boosted;
    }

    if (items.length > 0) {
      results.push({ restaurant, items: items.slice(0, 3) });
    }
  }

  // Sort by relevance to budget
  if (intent.budget) {
    results.sort((a, b) => {
      const sumA = a.items.reduce((s, i) => s + i.price, 0);
      const sumB = b.items.reduce((s, i) => s + i.price, 0);
      return (intent.budget! - sumA) - (intent.budget! - sumB);
    });
  }

  return results.slice(0, 3);
}

export async function getAISuggestions(req: AIRequest): Promise<AIResponse> {
  // Always try to call NVIDIA API first
  if (process.env.NVIDIA_API_KEY && process.env.NVIDIA_API_KEY !== 'your_nvidia_api_key_here') {
    try {
      return await callNvidiaAPI(req);
    } catch (e) {
      console.warn('NVIDIA API failed, falling back to mock logic:', e);
    }
  }
  
  // Fallback to internal logic if API fails or key is missing
  return getMockSuggestions(req);
}

async function callNvidiaAPI(req: AIRequest): Promise<AIResponse> {
  const intent = parseUserIntent(req.userMessage);
  const contextRestaurants = MOCK_RESTAURANTS.map(r => ({
    name: r.name,
    cuisine: r.cuisine,
    items: r.items.map(i => ({ name: i.name, price: i.price, isVeg: i.isVeg }))
  }));

  const systemPrompt = `You are SquadBot, a senior Swiggy food concierge. 
  You help groups of friends order the perfect meal. 
  
  Context:
  - User Message: "${req.userMessage}"
  - User Intent: Veg: ${intent.isVeg}, Budget: ${intent.budget}, Spicy: ${intent.spicy}
  - Available Food Data: ${JSON.stringify(contextRestaurants)}

  Task:
  1. Generate a friendly, short response (max 2 sentences).
  2. Provide exactly 1-3 best matching combos or dishes from the food data.
  3. If there's a budget, prioritize items that fit well within it.
  
  Format ONLY as JSON:
  {
    "text": "friendly recommendation text",
    "suggestions": [
      {
        "restaurant": "Restaurant Name",
        "items": ["Item Name"],
        "totalEstimate": 250,
        "isVeg": true,
        "reason": "Why this is a good pick"
      }
    ]
  }
  
  Respond ONLY with JSON. No text before or after.`;

  const response = await fetch(`${process.env.NVIDIA_API_BASE_URL || 'https://integrate.api.nvidia.com/v1'}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'meta/llama-3.1-8b-instruct',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: req.userMessage },
      ],
      max_tokens: 1024,
      temperature: 0.2, // Low temperature for consistent JSON
    }),
  });

  if (!response.ok) throw new Error(`NVIDIA API error: ${response.status}`);

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Map back to real item objects
      const enriched = (parsed.suggestions || []).map((s: any) => {
        const restaurant = MOCK_RESTAURANTS.find(r => 
          r.name.toLowerCase().includes(s.restaurant.toLowerCase()) || 
          s.restaurant.toLowerCase().includes(r.name.toLowerCase())
        ) || MOCK_RESTAURANTS[0];

        const itemDetails = (s.items || []).map((itemName: string) => {
          return restaurant.items.find(i => 
            i.name.toLowerCase().includes(itemName.toLowerCase())
          ) || restaurant.items[0];
        });

        return {
          restaurant: restaurant.name,
          restaurantId: restaurant.id,
          items: itemDetails.map((i: MenuItem) => i.name),
          itemDetails: itemDetails,
          totalEstimate: itemDetails.reduce((sum: number, i: MenuItem) => sum + i.price, 0),
          isVeg: itemDetails.every((i: MenuItem) => i.isVeg),
          spicy: itemDetails.some((i: MenuItem) => i.spiceLevel === 'hot' || i.spiceLevel === 'medium'),
          reason: s.reason
        };
      });

      return { text: parsed.text || "Here are my top picks!", suggestions: enriched };
    }
  } catch (e) {
    console.error("Failed to parse AI JSON:", e);
  }

  return getMockSuggestions(req);
}

function getMockSuggestions(req: AIRequest): AIResponse {
  const intent = parseUserIntent(req.userMessage);
  const filtered = filterMenuItems(intent);

  if (filtered.length === 0) {
    // Ultimate fallback if nothing matches
    const defaultRest = MOCK_RESTAURANTS[0];
    return {
      text: "I couldn't find exactly that, but how about some classics? 🍕",
      suggestions: [{
        restaurant: defaultRest.name,
        restaurantId: defaultRest.id,
        items: [defaultRest.items[0].name],
        itemDetails: [defaultRest.items[0]],
        totalEstimate: defaultRest.items[0].price,
        isVeg: defaultRest.items[0].isVeg,
        reason: "Always a squad favorite!"
      }]
    };
  }

  const suggestions: AISuggestion[] = filtered.map(({ restaurant, items }) => ({
    restaurant: restaurant.name,
    restaurantId: restaurant.id,
    items: items.map(i => i.name),
    itemDetails: items,
    totalEstimate: items.reduce((sum, i) => sum + i.price, 0),
    isVeg: items.every(i => i.isVeg),
    spicy: items.some(i => i.spiceLevel === 'hot' || i.spiceLevel === 'medium'),
    reason: intent.budget ? `Perfectly fits your ₹${intent.budget} budget!` : "Highly rated by other squads!"
  }));

  const responseTexts = [
    `Found some amazing options for your squad! 🍽️`,
    `Here's what I recommend based on your squad's vibe:`,
    `Checked 50+ restaurants and these came out on top! 🔥`,
  ];

  return {
    text: responseTexts[Math.floor(Math.random() * responseTexts.length)],
    suggestions,
  };
}

