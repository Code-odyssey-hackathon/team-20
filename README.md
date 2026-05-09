# 🛡️ Code Quest Arena: The Prime Compiler of Kailasa

[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Groq](https://img.shields.io/badge/AI-Groq%20Llama%203.3-orange?style=for-the-badge)](https://groq.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**Code Quest Arena** is a cinematic, AI-powered coding adventure that transforms learning C programming into an epic treasure hunt. Navigate the ancient ruins of Kailasa, solve dynamically generated puzzles, and unlock the secrets of the Prime Compiler.

---

## 🗺️ Cinematic Story Mode: The Search for Kailasa

Experience a 100-level deep narrative adventure where every coding challenge is a step closer to the ultimate treasure.

*   **Interactive 4K Treasure Map**: A realistic, screen-fitted adventure map that tracks your journey across 10 distinct acts—from the *Whispering Jungle* to the *Temple of the Prime Compiler*.
*   **Dynamic AI Dungeon Master**: Powered by **Groq (Llama-3.3-70B)**, every challenge is uniquely generated to fit the story beat and your current progress.
*   **Strict Compiler Mode**: No more simple MCQs. Write real C code in a full-screen editor. The AI acts as a strict reviewer, providing interactive feedback and compilation insights to help you fix your logic.
*   **Checkpoint Animations**: Watch your progress come alive with smooth SVG path animations as you move from one checkpoint to the next.

---

## 🚀 Technical Architecture

*   **Frontend**: React + TypeScript + Vite for a blazing-fast development experience.
*   **Styling**: Modern UI with Tailwind CSS, featuring glassmorphism, neon borders, and cinematic overlays.
*   **AI Engine**: Native integration with **Groq Cloud API** for near-instantaneous code evaluation and story generation.
*   **Database/Backend**: Supabase for user profiles, XP tracking, and global leaderboard integration.
*   **State Management**: Optimized local persistence for story progress combined with Supabase sync.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- A Groq API Key
- A Supabase Project

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Code-odyssey-hackathon/team-20.git
    cd code-quest-arena
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Setup Environment Variables**:
    Create a `.env` file in the root directory:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    VITE_GROQ_API_KEY=your_groq_api_key
    ```

4.  **Run the development server**:
    ```bash
    npm run dev
    ```

---

## 🎮 How to Play

1.  **Enter Story Mode**: Navigate to the "C Story" track from the main map.
2.  **Read the Lore**: Every level begins with a story beat—pay attention to the context!
3.  **Code the Solution**: Use the integrated editor to write your C code.
4.  **Submit & Unlock**: Click "Run & Unlock". If your code passes the AI compiler's review, you'll advance on the treasure map!
5.  **Track Progress**: Monitor your level-ups and XP gains directly from the Pilot HUD Dashboard.

---

## 🤝 Team 20
Built with ❤️ for the Code Odyssey Hackathon.

---

*“The ancient code holds true. Will you be the one to unlock the Prime Compiler?”*
