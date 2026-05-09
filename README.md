# 🛡️ FunCode: The Coding Odyssey

Team : Quad core   
Team number:20 
Problem Statement: Current learning platforms fall short in keeping learners engaged because learning, most of the time, is theoretical, repetitive, and not emotionally engaging. We propose an interactive web-based platform that combines play, storytelling, and coding challenges into a single learning experience- FUNCODE.


[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Groq](https://img.shields.io/badge/AI-Groq%20Llama%203.3-orange?style=for-the-badge)](https://groq.com/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-blueviolet?style=for-the-badge&logo=supabase)](https://supabase.com/)

**FunCode** is an immersive, AI-driven learning platform that transforms programming into a high-stakes adventure. Set across multiple mystical civilizations, it challenges users to solve dynamically generated puzzles, master the "Prime Compiler," and climb the global ranks through narrative story modes and competitive arenas.

---

## 🌟 Key Features

### 🗺️ Multilingual Story Tracks
Embark on massive narrative journeys across the most powerful languages in the world. Each track features a realistic 4K 3D adventure map with checkpoint animations.
*   **Project Vyana (C)**: A 100-level deep-dive into raw memory and pointers.
*   **Project Yantra (C++)**: Master systems engineering and the STL across 60+ trials.
*   **Pythoria (Python)**: Restore an ancient computational civilization with high-level logic.
*   **Project Surya (Java)**: Forge enterprise-grade architectures and reignite the JVM.

### 🤖 AI "Strict Compiler" Evaluation
Move beyond simple multiple-choice questions. 
*   **Real-time Review**: Submit actual code in a full-screen, low-latency editor.
*   **Interactive Insights**: Powered by **Groq (Llama-3.3-70B)**, the AI acts as a digital mentor, providing specific logic hints and compilation insights.
*   **Procedural Challenges**: Every level's task is generated on-the-fly, ensuring a unique experience for every player.

### 📊 Pilot HUD (Dashboard)
A centralized hub to track your rise through the ranks.
*   **Progression Tracking**: Real-time stats on Level, Total XP, and Accuracy across all languages.
*   **Live Sync**: Story progress and XP are seamlessly synchronized between LocalStorage and your **Supabase** cloud profile.
*   **Recent Runs**: A history of your latest triumphs and code trials.

### ⚔️ Battle Arenas & Multiplayer
*   **Topic Specialization**: Choose from 12+ programming specialties (Pointers, Memory, Logic, OOP, etc.).
*   **Lobby & Rooms**: Join or create rooms for collaborative or competitive coding sessions.
*   **Leaderboard**: A global ranking system to prove you are the ultimate architect.

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
    cd funcode
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

4.  **Launch the Platform**
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
│   └── c_story.ts  # 100-level story beats for the C track
├── pages/          # Full-page views (CStoryMode, Dashboard, StoryMap)
└── integrations/   # Supabase client and database schemas
```

---

## 🤝 The Team (Team 20)
Built with precision and passion for the **Code Odyssey Hackathon**. 

*“Only those who can think like the machine shall unlock the Prime Compiler.”*
