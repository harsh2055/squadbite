# 🍕 SquadBite

**The smartest way for squads to decide what to eat.**

SquadBite is a premium, real-time web application designed to solve the age-old problem of "What should we eat?". It combines real-time group synchronization with an AI-powered food concierge to make group ordering seamless, interactive, and fun.

🚀 **Live Demo:** [https://squadbite.vercel.app/](https://squadbite.vercel.app/)

---

## ✨ Key Features

### 🤖 Smart AI Food Concierge
Integrated with **NVIDIA Llama-3.1**, our SquadBot analyzes your group's cravings and provides intelligent, personalized restaurant and dish suggestions directly in the chat.

### 🔄 Real-time Multi-user Sync
Powered by **Socket.io**, every action—from sending a message to adding an item to the cart—is instantly synchronized across all squad members' screens. No more "refresh to see updates."

### 🛒 Shared Squad Cart
A unified cart for the entire room. See exactly what everyone is adding in real-time. Transparent, collaborative, and easy to manage.

### 💬 Instant Group Chat
Discuss your options in a beautiful, glassmorphic chat interface. Get AI suggestions or just debate whether to get extra garlic bread.

### 🧾 Smart Bill Splitting
Automatically calculates individual totals and the grand total. Perfect for knowing exactly who owes what before the food even arrives.

### 🎨 Premium Design Aesthetics
- **Modern Dark UI**: A sleek, high-contrast design using deep charcoal and vibrant orange accents.
- **Glassmorphism**: Subtle translucency and blur effects for a premium, lightweight feel.
- **Micro-animations**: Smooth transitions and hover effects powered by **Framer Motion**.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion, Lucide React.
- **Backend**: Node.js, Express, Socket.io.
- **Database**: Neon (Serverless Postgres) with Drizzle ORM.
- **AI**: NVIDIA NIM (Llama-3.1-8b-instruct).
- **Hosting**: Vercel (Frontend) & Render (Backend).

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- A Neon Database URL
- An NVIDIA API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/harsh2055/squadbite.git
   cd squadbite
   ```

2. **Install dependencies:**
   ```bash
   npm install
   cd server && npm install
   cd ..
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root and in the `server/` directory with your database and API keys.

4. **Run the development server:**
   ```bash
   npm run dev:all
   ```

---

## 📄 License

This project is licensed under the MIT License.

---

*Built with ❤️ for squads everywhere.*
