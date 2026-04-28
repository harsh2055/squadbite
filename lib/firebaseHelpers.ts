import { ref, set, get, onValue, push, update, remove, off, DatabaseReference } from 'firebase/database';
import { db, isFirebaseConfigured } from './firebase';
import { CartItem, ChatMessage, RoomUser } from './mockData';

const FB_TIMEOUT = 3000; // 3 seconds

function requireFirebase() {
  if (!isFirebaseConfigured) throw new Error('Firebase not configured');
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = FB_TIMEOUT): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Firebase timeout')), timeoutMs))
  ]);
}

// ── Room ──────────────────────────────────────────────────
export async function createRoom(roomId: string, hostUser: RoomUser) {
  requireFirebase();
  await withTimeout(set(ref(db, `rooms/${roomId}`), {
    createdAt: Date.now(),
    hostId: hostUser.id,
    users: { [hostUser.id]: hostUser },
    cart: {},
    messages: {},
  }));
}

export async function roomExists(roomId: string): Promise<boolean> {
  requireFirebase();
  const snap = await withTimeout(get(ref(db, `rooms/${roomId}`)));
  return snap.exists();
}

export async function joinRoom(roomId: string, user: RoomUser) {
  requireFirebase();
  await withTimeout(set(ref(db, `rooms/${roomId}/users/${user.id}`), user));
}

export async function leaveRoom(roomId: string, userId: string) {
  requireFirebase();
  await withTimeout(remove(ref(db, `rooms/${roomId}/users/${userId}`)));
}

// ── Users ─────────────────────────────────────────────────
export function subscribeUsers(roomId: string, cb: (users: RoomUser[]) => void): DatabaseReference {
  requireFirebase();
  const r = ref(db, `rooms/${roomId}/users`);
  onValue(r, (snap) => {
    const data = snap.val();
    cb(data ? Object.values(data) : []);
  });
  return r;
}

// ── Cart ──────────────────────────────────────────────────
export async function addCartItem(roomId: string, item: CartItem) {
  requireFirebase();
  await withTimeout(set(ref(db, `rooms/${roomId}/cart/${item.id}`), item));
}

export async function removeCartItem(roomId: string, itemId: string) {
  requireFirebase();
  await withTimeout(remove(ref(db, `rooms/${roomId}/cart/${itemId}`)));
}

export async function updateCartItemQty(roomId: string, itemId: string, quantity: number) {
  requireFirebase();
  if (quantity <= 0) return removeCartItem(roomId, itemId);
  await withTimeout(update(ref(db, `rooms/${roomId}/cart/${itemId}`), { quantity }));
}

export function subscribeCart(roomId: string, cb: (items: CartItem[]) => void): DatabaseReference {
  requireFirebase();
  const r = ref(db, `rooms/${roomId}/cart`);
  onValue(r, (snap) => {
    const data = snap.val();
    cb(data ? Object.values(data) : []);
  });
  return r;
}

// ── Messages ──────────────────────────────────────────────
export async function sendMessage(roomId: string, msg: ChatMessage) {
  requireFirebase();
  await withTimeout(set(ref(db, `rooms/${roomId}/messages/${msg.id}`), msg));
}

export function subscribeMessages(roomId: string, cb: (msgs: ChatMessage[]) => void): DatabaseReference {
  requireFirebase();
  const r = ref(db, `rooms/${roomId}/messages`);
  onValue(r, (snap) => {
    const data = snap.val();
    if (data) {
      const msgs: ChatMessage[] = Object.values(data);
      msgs.sort((a, b) => a.timestamp - b.timestamp);
      cb(msgs);
    } else {
      cb([]);
    }
  });
  return r;
}

export function unsubscribe(r: DatabaseReference) {
  off(r);
}


