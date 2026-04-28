import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import { eq } from 'drizzle-orm';

dotenv.config();

const app = express();
app.use(cors({
  origin: true, // Allow all origins in production for simplicity, or specify your Vercel URL
  credentials: true
}));
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: true,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Neon Database Connection
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

// --- AI LOGIC (Ported from lib/aiHelper.ts) ---
// Note: For brevity, I'm using a simplified version here, but it includes the NVIDIA integration.

async function getAISuggestions(message: string) {
  if (!process.env.NVIDIA_API_KEY) {
    return { text: "AI is currently in offline mode. Here are some classics! 🍕", suggestions: [] };
  }

  if (!process.env.NVIDIA_API_KEY || process.env.NVIDIA_API_KEY.includes('your_nvidia')) {
    console.error('[AI] ERROR: No valid NVIDIA_API_KEY found in server/.env');
    return { text: "AI is currently in local-only mode. (Check your API key!) 🍕", suggestions: [] };
  }

  try {
    console.log(`[AI] Calling NVIDIA integration...`);
    const response = await fetch(`${process.env.NVIDIA_API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta/llama-3.1-8b-instruct',
        messages: [{ 
          role: 'system', 
          content: 'You are a professional food concierge. Respond with helpful text and valid JSON. Structure: { "text": "...", "suggestions": [ { "restaurant": "Name", "itemDetails": [ { "name": "Dish", "price": 299, "isVeg": true, "image": "URL" } ] } ] }' 
        }, { role: 'user', content: message }],
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[AI ERROR] NVIDIA Status: ${response.status} - ${errorText}`);
      throw new Error(`NVIDIA API failed: ${response.status}`);
    }

    const data = await response.json() as any;
    const content = data.choices[0].message.content;
    const jsonStr = content.substring(content.indexOf('{'), content.lastIndexOf('}') + 1);
    const aiResponse = JSON.parse(jsonStr);

    // Ensure every item has a unique ID and total estimate
    aiResponse.suggestions = aiResponse.suggestions.map((s: any) => ({
      ...s,
      totalEstimate: s.itemDetails.reduce((acc: number, item: any) => acc + (item.price || 0), 0),
      itemDetails: s.itemDetails.map((i: any) => ({ 
        ...i, 
        id: `ai-${Math.random().toString(36).substr(2, 9)}`,
        description: i.description || 'Delicious meal from ' + s.restaurant
      }))
    }));

    return aiResponse;

  } catch (e) {
    console.error('[AI FALLBACK] Error:', e);
    return { 
      text: "I've pulled up some squad favorites for you! 🍕🔥", 
      suggestions: [
        {
          restaurant: "SquadBite Premium",
          totalEstimate: 718,
          itemDetails: [
            { id: 'm1', name: "Butter Chicken Deluxe", price: 389, isVeg: false, image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=200&h=200&fit=crop" },
            { id: 'm2', name: "Paneer Tikka Platter", price: 329, isVeg: true, image: "https://images.unsplash.com/photo-1567184109411-b28f21ee097a?w=200&h=200&fit=crop" }
          ]
        }
      ] 
    };
  }
}

// --- API ROUTES ---

app.post('/api/suggest', async (req, res) => {
  const { message } = req.body;
  const result = await getAISuggestions(message);
  res.json(result);
});

app.post('/api/room', async (req, res) => {
  const roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
  await db.insert(schema.rooms).values({ code: roomCode });
  res.json({ roomId: roomCode });
});

// --- SOCKET.IO REAL-TIME LOGIC ---

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', async (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
    
    // Load existing messages and cart from Neon
    const existingMessages = await db.query.messages.findMany({
      where: eq(schema.messages.roomId, roomId),
      orderBy: (messages, { asc }) => [asc(messages.timestamp)],
    });
    
    const existingCart = await db.query.cartItems.findMany({
      where: eq(schema.cartItems.roomId, roomId),
    });

    socket.emit('init-data', { messages: existingMessages, cart: existingCart });
  });

  socket.on('send-message', async (data: any) => {
    const { roomId, sender, senderId, text, type } = data;
    
    // Save to Neon
    const [newMessage] = await db.insert(schema.messages).values({
      roomId, sender, senderId, text, type: type || 'text'
    }).returning();

    io.to(roomId).emit('new-message', newMessage);

    // PROACTIVE DEMO MODE: Reply to everything for now
    try {
      console.log(`[AI] Processing message from ${sender}: "${text}"`);
      const aiResult = await getAISuggestions(text);
      console.log(`[AI] Generated response: "${aiResult.text}"`);

      const [aiMessage] = await db.insert(schema.messages).values({
        roomId,
        sender: 'SquadBot',
        senderId: 'ai-bot',
        text: aiResult.text,
        type: 'ai',
        suggestions: aiResult.suggestions
      }).returning();
      
      console.log(`[AI] Message saved and broadcasting...`);
      io.to(roomId).emit('new-message', aiMessage);
    } catch (err) {
      console.error('[AI ERROR] Failed to process or send AI message:', err);
    }
  });

  socket.on('add-to-cart', async (data: any) => {
    try {
      const { roomId, item, user } = data;
      console.log(`[CART] User ${user.name} adding ${item.name} to room ${roomId}`);

      await db.insert(schema.cartItems).values({
        roomId,
        name: item.name,
        price: item.price,
        addedBy: user.name,
        userId: user.id,
        image: item.image,
        isVeg: !!item.isVeg,
      });
      
      const allItems = await db.select().from(schema.cartItems).where(eq(schema.cartItems.roomId, roomId));
      io.to(roomId).emit('cart-updated', allItems);
    } catch (err) {
      console.error('[CART ERROR] Failed to add item:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`SquadBite Backend running on port ${PORT}`);
});
