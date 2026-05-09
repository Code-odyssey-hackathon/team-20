import {
  Brain, Puzzle, Bug, Eraser, Zap, Scissors, ShieldAlert,
  Timer, Layers, Swords, Wand2,
} from "lucide-react";

export type GameType =
  | "mcq"
  | "riddle"
  | "error_detect"
  | "fill_blank"
  // pro
  | "rapid_fire"
  | "code_golf"
  | "time_attack"
  | "memory_matrix"
  // elite
  | "bug_hunt_pro"
  | "boss_rush"
  | "refactor_master";

export type Tier = "free" | "pro" | "elite";

export interface GameDef {
  id: GameType;
  name: string;
  tagline: string;
  description: string;
  icon: any;
  tier: Tier;
  premium: boolean;
  timePerQ: number;
  questionCount: number;
  accent: string;
}

export const GAMES: GameDef[] = [
  // ───── FREE ──────────────────────────────────────────
  {
    id: "mcq",
    name: "MCQ Wars",
    tagline: "Classic concept blitz",
    description: "Pick the right answer. 4 options. Speed = bonus XP.",
    icon: Brain, tier: "free", premium: false,
    timePerQ: 30, questionCount: 10, accent: "text-primary",
  },
  {
    id: "riddle",
    name: "Code Riddles",
    tagline: "Predict the output",
    description: "Read the snippet. Guess what it prints. No pencils, no mercy.",
    icon: Puzzle, tier: "free", premium: false,
    timePerQ: 30, questionCount: 10, accent: "text-secondary",
  },
  {
    id: "error_detect",
    name: "Bug Hunt",
    tagline: "Spot the bug",
    description: "One snippet. One bug. Find it before the timer eats you.",
    icon: Bug, tier: "free", premium: false,
    timePerQ: 30, questionCount: 10, accent: "text-accent",
  },
  {
    id: "fill_blank",
    name: "Fill The Void",
    tagline: "Complete the code",
    description: "Pick the token that makes the snippet compile and behave.",
    icon: Eraser, tier: "free", premium: false,
    timePerQ: 25, questionCount: 10, accent: "text-[hsl(var(--neon-mint))]",
  },


  // ───── PRO ───────────────────────────────────────────
  {
    id: "rapid_fire",
    name: "Rapid Fire",
    tagline: "True / False blitz",
    description: "20 statements. 5 seconds each. Pure reflex.",
    icon: Zap, tier: "pro", premium: true,
    timePerQ: 5, questionCount: 20, accent: "text-primary",
  },
  {
    id: "time_attack",
    name: "Time Attack",
    tagline: "8-second sprints",
    description: "Lightning MCQs at 8 seconds each. Combo bonuses for streaks.",
    icon: Timer, tier: "pro", premium: true,
    timePerQ: 8, questionCount: 12, accent: "text-secondary",
  },
  {
    id: "memory_matrix",
    name: "Memory Matrix",
    tagline: "Concept ↔ definition",
    description: "Match concepts, syntaxes, and outcomes. One right pairing per round.",
    icon: Layers, tier: "pro", premium: true,
    timePerQ: 18, questionCount: 12, accent: "text-accent",
  },
  {
    id: "code_golf",
    name: "Code Golf",
    tagline: "Shortest correct wins",
    description: "Four one-liners. Pick the shortest one that actually works.",
    icon: Scissors, tier: "pro", premium: true,
    timePerQ: 35, questionCount: 10, accent: "text-accent",
  },

  // ───── ELITE ─────────────────────────────────────────
  {
    id: "bug_hunt_pro",
    name: "Bug Hunt: ELITE",
    tagline: "Senior-level bug analysis",
    description: "Subtle bugs, deep traces, root-cause picks.",
    icon: ShieldAlert, tier: "elite", premium: true,
    timePerQ: 45, questionCount: 8, accent: "text-secondary",
  },
  {
    id: "boss_rush",
    name: "Boss Rush",
    tagline: "Escalating difficulty",
    description: "10 questions. Each one harder than the last. Survive the spike.",
    icon: Swords, tier: "elite", premium: true,
    timePerQ: 40, questionCount: 10, accent: "text-destructive",
  },
  {
    id: "refactor_master",
    name: "Refactor Master",
    tagline: "Pick the cleanest rewrite",
    description: "See ugly code. Choose the refactor that's correct, idiomatic, and fast.",
    icon: Wand2, tier: "elite", premium: true,
    timePerQ: 40, questionCount: 8, accent: "text-primary",
  },
];

export const getGame = (id: string) => GAMES.find((g) => g.id === id);

export const PARTY_SIZES = [
  { id: 1, name: "Solo", desc: "You vs the grid" },
  { id: 2, name: "Duo", desc: "2 players" },
  { id: 3, name: "Trio", desc: "3 players" },
  { id: 4, name: "Squad", desc: "4 players" },
] as const;

export const TIERS = [
  {
    id: "free",
    name: "Rookie",
    price: "₹0",
    period: "forever",
    color: "text-muted-foreground",
    perks: [
      "All 5 free games",
      "23+ topics",
      "Solo + multiplayer rooms",
      "Story Time (earn coins ➜ spend in Shop)",
      "Global leaderboard",
    ],
    cta: "Current Plan",
  },
  {
    id: "pro",
    name: "Pro Hacker",
    price: "₹89",
    period: "/ month",
    color: "text-primary",
    badge: "Most Popular",
    perks: [
      "Everything in Rookie",
      "Rapid Fire · Time Attack · Memory Matrix · Code Golf",
      "2× XP weekend boosts",
      "Pro avatar frame",
      "+50 bonus coins on signup",
    ],
    cta: "Go Pro",
  },
  {
    id: "elite",
    name: "Cyber Elite",
    price: "₹149",
    period: "/ month",
    color: "text-accent",
    perks: [
      "Everything in Pro",
      "Bug Hunt: ELITE · Boss Rush · Refactor Master",
      "Private squad rooms",
      "Custom topics + animated nameplate",
      "Priority match queue",
      "+150 bonus coins on signup",
    ],
    cta: "Go Elite",
  },
] as const;
