# Adaptive AI Coding Platform — Build Plan

A premium, dark-mode learning platform with two themed tracks (Python: Pythoria, C++: Project Yantra), powered by AI-generated adaptive challenges and per-user progression.

## Scope (V1)

1. **Auth & Backend** — Lovable Cloud (Supabase) with email/password + Google sign-in. Per-user progress, mastery, history.
2. **Two tracks** — Python (Pythoria, 5 centers, 100 levels) and C++ (Yantra, 3 divisions, 100 levels).
3. **AI question generation** — Lovable AI (`google/gemini-3-flash-preview`) via server function, structured tool-calling output, adaptive to level/topic/weak concepts.
4. **Code editor** — Monaco editor in challenge view, run + submit.
5. **AI feedback** — Mentor-style review of submitted code, identifies weak topics, suggests follow-up.
6. **Dashboard** — Track, level, XP, streak, mastery chart, weak concepts, recent activity, recommended next challenge.
7. **Progression** — XP, levels (1–100), streak, topic mastery (0–100 per topic), question history.

## Pages / Routes

```
/                          Landing (hero, two-track teaser)
/login, /signup            Auth
/_authenticated/
  ├── tracks               Choose Python or C++
  ├── dashboard            Per-user dashboard
  ├── challenge            AI-generated current challenge (editor + feedback)
  └── history              Past attempts
```

## Design System

- **Theme**: Dark-mode only. Deep near-black background (`oklch(0.14 0.02 260)`), elevated surfaces, subtle borders.
- **Accents**: Pythoria = warm gold/amber glow; Yantra = cyan/electric blue glow. Track-aware accent token swap.
- **Typography**: Display = `Space Grotesk`; Body = `Inter`; Code = `JetBrains Mono`.
- **Effects**: subtle radial glows, soft gradients on cards, smooth framer-motion transitions, glass borders.
- **Inspiration**: Linear / Vercel / Raycast.

All colors as `oklch` semantic tokens in `src/styles.css`. No hardcoded colors in components.

## Database (Supabase)

```
profiles(id, display_name, created_at)
user_progress(user_id, track['python'|'cpp'], level, xp, streak, last_active_at, current_center)
topic_mastery(user_id, track, topic, mastery_score 0-100, attempts, correct)
question_history(id, user_id, track, level, topic, prompt_json, user_code, verdict, feedback, created_at)
```
RLS: each user can only read/write their own rows. Profile auto-created on signup via trigger.

## Server Functions

- `generateChallenge({ track, level, weakTopics, recentTopics })` → calls Lovable AI with tool-calling schema returning `{ context, task, constraints, difficulty, hints[], expectedOutput, topics[] }`. Persists to `question_history`.
- `evaluateSubmission({ historyId, userCode })` → AI evaluates correctness, returns `{ verdict, explanation, weakConcepts[], encouragement, followUpHint }`. Updates XP, mastery, streak.

Both protected with `requireSupabaseAuth`.

## Track Content (static seed data in `src/lib/tracks.ts`)

Encodes centers/divisions, level ranges, topic progression per the spec. Used by AI prompt + UI.

## Files to Create

- `src/styles.css` — overhaul tokens (dark theme, track accents, gradients, shadows, fonts)
- `src/routes/index.tsx` — landing
- `src/routes/login.tsx`, `signup.tsx`
- `src/routes/_authenticated.tsx`, `_authenticated/tracks.tsx`, `dashboard.tsx`, `challenge.tsx`, `history.tsx`
- `src/components/` — `Header.tsx`, `TrackCard.tsx`, `MasteryChart.tsx`, `CodeEditor.tsx`, `ChallengeView.tsx`, `FeedbackPanel.tsx`, `XPBar.tsx`, `StreakBadge.tsx`
- `src/lib/tracks.ts` — Pythoria & Yantra data
- `src/lib/ai/challenge.functions.ts`, `src/lib/ai/evaluate.functions.ts` — server functions
- `src/integrations/supabase/*` — auto-generated when Cloud is enabled
- Migrations for the four tables + RLS + signup trigger

## Stack Notes

- TanStack Start, file-based routes, `_authenticated` layout for guards
- Monaco editor (`@monaco-editor/react`)
- Recharts for mastery chart
- framer-motion for transitions
- Lovable AI Gateway via `LOVABLE_API_KEY` (auto when Cloud is on)

## Out of Scope (V1)

- Real code execution sandbox (the AI evaluates code instead — clearly framed as "AI review")
- Social/leaderboards, achievements UI beyond XP/streak
- Mobile-specific layouts beyond responsive defaults
