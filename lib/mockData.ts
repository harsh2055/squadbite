export interface MenuItem {
  id: string;
  name: string;
  price: number;
  isVeg: boolean;
  emoji?: string;
  image?: string;
  description?: string;
  spiceLevel?: 'mild' | 'medium' | 'hot';
  tags?: string[];
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  priceForTwo: number;
  image: string;
  items: MenuItem[];
  tags?: string[];
}

export interface CartItem {
  id: string;
  menuItemId: string;
  restaurantId: string;
  restaurantName: string;
  name: string;
  price: number;
  quantity: number;
  addedBy: string;
  addedByName: string;
  isVeg: boolean;
  emoji?: string;
  image?: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  type: 'user' | 'ai' | 'system';
  timestamp: number;
  suggestions?: AISuggestion[];
}

export interface AISuggestion {
  restaurant: string;
  items: string[];
  totalEstimate: number;
  isVeg?: boolean;
  spicy?: boolean;
  restaurantId?: string;
  itemDetails?: MenuItem[];
  reason?: string;
}

export interface RoomUser {
  id: string;
  name: string;
  avatar: string;
  joinedAt: number;
  isActive: boolean;
}

export const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: 'rest-1',
    name: "The Biryani House",
    cuisine: 'North Indian, Hyderabadi',
    rating: 4.5,
    deliveryTime: '25-30 min',
    priceForTwo: 500,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?w=800&q=80',
    tags: ['top rated', 'biryani'],
    items: [
      { 
        id: 'item-7', 
        name: 'Hyderabadi Chicken Biryani', 
        price: 249, 
        isVeg: false, 
        spiceLevel: 'medium', 
        emoji: '🍛', 
        tags: ['bestseller'],
        image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&q=80',
        description: 'Authentic spice-infused rice with tender chicken.'
      },
      { 
        id: 'item-8', 
        name: 'Veg Biryani Special', 
        price: 179, 
        isVeg: true, 
        spiceLevel: 'medium', 
        emoji: '🍚',
        image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80',
        description: 'Flavorful biryani with crispy paneer and veggies.'
      },
      { 
        id: 'item-11', 
        name: 'Chicken 65 (Full)', 
        price: 149, 
        isVeg: false, 
        spiceLevel: 'medium', 
        emoji: '🍢',
        image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=400&q=80',
        description: 'Spicy, deep-fried chicken appetizer.'
      },
    ],
  },
  {
    id: 'rest-2',
    name: 'Burger Craft',
    cuisine: 'American, Fast Food',
    rating: 4.2,
    deliveryTime: '15-20 min',
    priceForTwo: 400,
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&q=80',
    tags: ['fast food', 'burgers'],
    items: [
      { 
        id: 'item-14', 
        name: 'Crispy Chicken Burger', 
        price: 149, 
        isVeg: false, 
        emoji: '🍔', 
        tags: ['bestseller'],
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
        description: 'Crispy chicken patty with secret sauce.'
      },
      { 
        id: 'item-13', 
        name: 'Veggie Delight Burger', 
        price: 99, 
        isVeg: true, 
        emoji: '🍔',
        image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&q=80',
        description: 'Garden fresh veggie patty with cheddar melt.'
      },
      { 
        id: 'item-16', 
        name: 'Peri Peri Fries', 
        price: 99, 
        isVeg: true, 
        emoji: '🍟', 
        tags: ['popular'],
        image: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=400&q=80',
        description: 'Crispy fries dusted with fiery peri peri.'
      },
    ],
  },
  {
    id: 'rest-3',
    name: 'Pizza Paradiso',
    cuisine: 'Italian, Pizzas',
    rating: 4.6,
    deliveryTime: '30-40 min',
    priceForTwo: 800,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
    tags: ['italian', 'premium'],
    items: [
      { 
        id: 'item-1', 
        name: 'Margherita Bliss', 
        price: 299, 
        isVeg: true, 
        emoji: '🍕', 
        tags: ['popular'],
        image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400&q=80',
        description: 'Classic mozzarella and fresh basil.'
      },
      { 
        id: 'item-3', 
        name: 'Chicken Tikka Overload', 
        price: 399, 
        isVeg: false, 
        spiceLevel: 'hot', 
        emoji: '🍕', 
        tags: ['bestseller'],
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80',
        description: 'Tandoori chicken chunks on a cheese bed.'
      },
      { 
        id: 'item-4', 
        name: 'Garlic Breadsticks', 
        price: 120, 
        isVeg: true, 
        emoji: '🥖', 
        tags: ['popular'],
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80',
        description: 'Warm, buttery bread with herbs.'
      },
    ],
  },
];

export const AVATAR_EMOJIS = ['😎', '🤩', '🥳', '😋', '🤤', '😍', '🧑‍🍳', '👨‍🍳', '🍜', '🍕'];

export function getRandomAvatar(): string {
  return AVATAR_EMOJIS[Math.floor(Math.random() * AVATAR_EMOJIS.length)];
}

export function generateRoomId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}
