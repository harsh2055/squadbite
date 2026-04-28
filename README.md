# 🍕 SquadBite — AI-Powered Group Food Ordering

> Order food together with your squad. AI suggestions, real-time shared cart, smart bill splitting.

![SquadBite](https://img.shields.io/badge/SquadBite-v1.0.0-FC8019?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![Firebase](https://img.shields.io/badge/Firebase-Realtime-orange?style=for-the-badge&logo=firebase)
![NVIDIA AI](https://img.shields.io/badge/NVIDIA-LLM%20API-76b900?style=for-the-badge)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🏠 **Group Rooms** | Create unique rooms, share codes, join without signup |
| 🤖 **AI Chat (SquadBot)** | NVIDIA LLM-powered food suggestions via natural language |
| 🛒 **Shared Cart** | Real-time cart synced across all users via Firebase |
| 🧾 **Smart Bill Split** | Split by items ordered OR equal split with per-user totals |
| 📱 **Mobile-First** | Fully responsive Swiggy-inspired dark UI |
| ⚡ **Zero Login** | Temporary session, no account needed |

---

## 🚀 Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials (see Configuration section below).

### 3. Run the development server

```bash
npm run dev
```

Visit → **http://localhost:3000**

---

## ⚙️ Configuration

### 🔑 NVIDIA LLM API (Required for real AI)

1. Get a free API key at [https://build.nvidia.com](https://build.nvidia.com)
2. Add to `.env.local`:
```env
NVIDIA_API_KEY=nvapi-xxxxxxxxxxxxxxxxxxxx
NVIDIA_API_BASE_URL=https://integrate.api.nvidia.com/v1
```

> **Without NVIDIA API key**: The app works with smart mock AI responses based on keyword matching (veg/non-veg, budget, spice level). Perfect for demos!

### 🔥 Firebase Realtime Database (Required for multi-user)

1. Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Realtime Database**
3. Set database rules to:
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```
4. Add credentials to `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
```

> **Without Firebase**: App still works! Cart and chat are local-only (single user demo mode).

---

## 🧠 AI Integration Details

SquadBot uses NVIDIA's LLM API (`meta/llama-3.1-8b-instruct`) with this prompt structure:

```
User: "Veg food under ₹300"
→ AI returns structured JSON:
{
  "text": "Found some great veg picks under ₹300! 🎉",
  "suggestions": [
    {
      "restaurant": "Domino's Pizza",
      "items": ["Margherita Pizza", "Garlic Bread"],
      "totalEstimate": 288,
      "isVeg": true
    }
  ]
}
```

Try asking SquadBot:
- `"Veg food under ₹200"`
- `"Something spicy and non-veg"`
- `"Pizza for 4 people"`
- `"Budget meal under ₹150"`
- `"Biryani options"`
- `"Quick delivery"`

---

## 📁 Project Structure

```
squadbite/
├── app/
│   ├── page.tsx              # Landing page
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Tailwind + custom styles
│   ├── room/[roomId]/
│   │   └── page.tsx          # Main room page
│   └── api/
│       ├── suggest/route.ts  # AI suggestion endpoint
│       └── room/route.ts     # Room creation endpoint
├── components/
│   ├── ChatPanel.tsx         # AI chat interface
│   ├── CartPanel.tsx         # Shared cart UI
│   ├── BillPanel.tsx         # Bill splitting UI
│   └── JoinModal.tsx         # Name entry modal
├── lib/
│   ├── firebase.ts           # Firebase init
│   ├── firebaseHelpers.ts    # Realtime DB helpers
│   ├── aiHelper.ts           # NVIDIA LLM + fallback AI
│   ├── mockData.ts           # Restaurant/menu mock data
│   └── store.ts              # Zustand state management
└── public/
```

---

## 🚢 Deployment (Vercel)

```bash
npm run build
```

Deploy to Vercel:
1. Push to GitHub
2. Import project in [vercel.com](https://vercel.com)
3. Add all environment variables in Vercel dashboard
4. Deploy!

---

## 🎨 Design System

| Token | Value |
|---|---|
| Primary Orange | `#FC8019` |
| Background | `#0c0c0c` |
| Card | `#161616` |
| Border | `#252525` |
| Display Font | Syne |
| Body Font | Plus Jakarta Sans |

---

## 📱 How to Demo (60 seconds)

1. Open http://localhost:3000
2. Click **"Create a Room"**
3. Enter your name → **Join Squad Room**
4. Type: **"Spicy chicken under ₹300"** → See AI suggestions
5. Click **+** buttons to add items to cart
6. Switch to **Cart** tab → see real-time updates
7. Switch to **Bill** tab → see bill split
8. Open same URL in another tab → join as different user!

---

Built with ❤️ for Swiggy Builder Hackathon
