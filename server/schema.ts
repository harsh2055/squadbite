import { pgTable, serial, text, integer, timestamp, jsonb, boolean } from 'drizzle-orm/pg-core';

export const rooms = pgTable('rooms', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
  status: text('status').default('active'),
});

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  roomId: text('room_id').notNull(),
  sender: text('sender').notNull(),
  senderId: text('sender_id').notNull(),
  text: text('text').notNull(),
  type: text('type').default('text'), // 'text' | 'ai' | 'system'
  suggestions: jsonb('suggestions'),
  timestamp: timestamp('timestamp').defaultNow(),
});

export const cartItems = pgTable('cart_items', {
  id: serial('id').primaryKey(),
  roomId: text('room_id').notNull(),
  name: text('name').notNull(),
  price: integer('price').notNull(),
  quantity: integer('quantity').default(1),
  addedBy: text('added_by').notNull(),
  userId: text('user_id').notNull(),
  restaurantId: text('restaurant_id'),
  image: text('image'),
  isVeg: boolean('is_veg').default(false),
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  roomId: text('room_id').notNull(),
  totalAmount: integer('total_amount').notNull(),
  items: jsonb('items').notNull(),
  splitMode: text('split_mode').default('individual'),
  createdAt: timestamp('created_at').defaultNow(),
});
