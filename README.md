# 🛡️ Code Quest Arena: The Prime Compiler of Kailasa

[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Groq](https://img.shields.io/badge/AI-Groq%20Llama%203.3-orange?style=for-the-badge)](https://groq.com/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-blueviolet?style=for-the-badge&logo=supabase)](https://supabase.com/)

**Code Quest Arena** is an immersive, AI-driven gamified learning platform that transforms C programming into a high-stakes adventure. Set in the mystical ruins of Kailasa, it challenges users to solve dynamically generated puzzles, master the "Prime Compiler," and climb the global ranks through narrative story modes and competitive arenas.

---

## 🌟 Key Features

### 🗺️ 100-Level C Story Mode
Embark on a massive 10-Act journey. Navigate a realistic 4K 3D treasure map where every checkpoint is a narrative-driven coding trial.
*   **Dynamic Lore**: 100 unique "story beats" that evolve as you progress.
*   **Procedural Challenges**: Every level's code task is generated on-the-fly by **Llama-3.3-70B**, ensuring a unique experience for every player.
*   **Animated Progression**: Watch your avatar travel through jungles, temples, and peaks with smooth SVG-path animations.

### 🤖 AI "Strict Compiler" Evaluation
Move beyond multiple-choice questions. 
*   **Real-time Review**: Submit actual C code in a full-screen, low-latency editor.
*   **Interactive Insights**: The AI acts as a digital mentor, providing specific logic hints and compilation insights instead of just "Correct/Incorrect."
*   **Optimized Performance**: High-speed inference via **Groq**, optimized to minimize API costs and maximize response speed.

### 📊 Pilot HUD (Dashboard)
A centralized hub to track your rise through the ranks.
*   **Progression Tracking**: Real-time stats on Level, Total XP, and Accuracy.
*   **Live Sync**: Story progress and XP are seamlessly synchronized between LocalStorage and your **Supabase** cloud profile.
*   **Recent Runs**: A history of your latest triumphs and code trials.

### ⚔️ Battle Arenas & Multiplayer
*   **Topic Specialization**: Choose from 12+ C-programming specialties (Pointers, Memory, Logic, etc.).
*   **Lobby & Rooms**: Join or create rooms for collaborative or competitive coding sessions.
*   **Leaderboard**: A global ranking system to prove you are the ultimate C architect.

---

## 🚀 Technical Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS, Lucide Icons, Shadcn UI |
| **AI Intelligence** | Groq Cloud API (Llama-3.3-70B & 8B Fallback) |
| **Backend/Auth** | Supabase (PostgreSQL, Realtime, Edge Functions) |
| **State/Query** | TanStack Query (React Query) |

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- A Groq API Key (from Groq Cloud)
- A Supabase Project URL & Anon Key

### Quick Start
1.  **Clone the Repo**
    ```bash
    git clone https://github.com/Code-odyssey-hackathon/team-20.git
    cd code-quest-arena
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Configuration**
    Create a `.env` file in the root:
    ```env
    VITE_SUPABASE_URL=your_project_url
    VITE_SUPABASE_ANON_KEY=your_anon_key
    VITE_GROQ_API_KEY=your_groq_key
    ```

4.  **Launch the Arena**
    ```bash
    npm run dev
    ```

---

## 🏗️ Core Project Structure

```text
src/
├── components/     # Reusable UI components (AppNavbar, StatCards, etc.)
├── hooks/          # Custom React hooks (Auth, Tier management)
├── lib/            # Core logic (AI prompt builders, Story definitions)
│   ├── gemini.ts   # Groq API integration and prompt engineering
│   └── c_story.ts  # 100-level story beats and narrative logic
├── pages/          # Full-page views (CStoryMode, Dashboard, Leaderboard)
└── integrations/   # Supabase client and database schemas
```

---

## 🤝 The Team (Team 20)
Built with precision and passion for the **Code Odyssey Hackathon**. 

*“Only those who can think like the machine shall unlock the Prime Compiler.”*
