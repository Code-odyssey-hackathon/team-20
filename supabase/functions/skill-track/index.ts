// Skill-Track edge function: dual-track (Pythoria/Python + Project Yantra/C++)
// adaptive challenge generation + AI evaluation with mastery tracking.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type Track = "python" | "cpp";

const CENTERS: Record<Track, Array<{ name: string; subtitle: string; start: number; end: number; topics: string[]; vibe: string }>> = {
  python: [
    { name: "Gateway Grove", subtitle: "Awakening dormant systems", start: 1, end: 20,
      topics: ["print", "variables", "data types", "input", "arithmetic", "strings", "booleans", "type conversion", "conditions", "loops", "nested loops", "problem solving"],
      vibe: "Glowing inscriptions in a quiet observatory grove." },
    { name: "Library of Arya", subtitle: "Workflows of the archives", start: 21, end: 35,
      topics: ["lists", "tuples", "sets", "string methods", "slicing", "iteration patterns"],
      vibe: "Vaulted halls of routing systems and scrolling indexes." },
    { name: "Water Observatory", subtitle: "Modular intelligence", start: 36, end: 50,
      topics: ["functions", "parameters", "return values", "scope", "modular programming"],
      vibe: "Reflective basins flowing through reusable rituals." },
    { name: "Celestial Tower", subtitle: "Simulations of the sky", start: 51, end: 80,
      topics: ["dictionaries", "nested structures", "comprehensions", "recursion", "simulations", "matrices", "randomness", "debugging"],
      vibe: "Star-charted matrices and predictive engines." },
    { name: "Garden of Memory", subtitle: "Designing intelligent entities", start: 81, end: 100,
      topics: ["OOP", "classes", "inheritance", "modular systems", "mini projects", "architecture"],
      vibe: "Living architectures rooted in adaptive memory." },
  ],
  cpp: [
    { name: "Control Systems", subtitle: "Industrial logic & automation", start: 1, end: 20,
      topics: ["cout", "cin", "variables", "arithmetic", "I/O", "conditions", "loops", "nested loops", "arrays", "strings"],
      vibe: "Lit consoles managing factory floors." },
    { name: "Memory & Engineering", subtitle: "Inside the machine", start: 21, end: 50,
      topics: ["functions", "parameters", "scope", "modular programming", "pointers", "references", "memory addresses", "dereferencing", "dynamic memory", "new/delete", "debugging", "memory leaks"],
      vibe: "Schematics, oscilloscopes, raw silicon." },
    { name: "Software Architecture", subtitle: "Scale & systems", start: 51, end: 100,
      topics: ["classes", "objects", "constructors", "encapsulation", "inheritance", "polymorphism", "STL", "vectors", "maps", "algorithms", "mini projects", "architecture"],
      vibe: "Coordinated robotics frameworks at planetary scale." },
  ],
};

const centerForLevel = (track: Track, level: number) => {
  const c = CENTERS[track];
  return c.find((x) => level >= x.start && level <= x.end) ?? c[c.length - 1];
};

const xpForLevel = (level: number) => 80 + level * 20;

async function callAI(messages: any[], tool: any) {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) throw new Error("LOVABLE_API_KEY missing");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages,
      tools: [tool],
      tool_choice: { type: "function", function: { name: tool.function.name } },
    }),
  });
  if (res.status === 429) throw new Error("Rate limit reached. Please wait a moment and try again.");
  if (res.status === 402) throw new Error("AI credits exhausted. Add credits in Workspace settings.");
  if (!res.ok) throw new Error(`AI gateway error: ${res.status}: ${await res.text()}`);
  const json = await res.json();
  const call = json.choices?.[0]?.message?.tool_calls?.[0];
  if (!call) throw new Error("AI returned no tool call");
  return JSON.parse(call.function.arguments);
}

const TRACK_LORE: Record<Track, string> = {
  python:
    "PYTHORIA — an ancient computational civilization called the Saptapath (Sevenfold Trail). Long ago seven sages built monuments preserving knowledge, logic, memory and prediction. After the Great Silence the systems shut down. The learner walks the monuments restoring intelligence. Tone: warm ancient architecture, observatories, brass automata slowly awakening, scientific mysticism — like Studio Ghibli meets ancient Nalanda. Calm, intelligent, ancient-yet-futuristic. Each successful program visibly restores part of a monument.",
  cpp:
    "PROJECT YANTRA — Yantra Institute of Systems Engineering, a futuristic engineering campus where students learn through live machine systems, robotics labs, infrastructure simulations and engineering restoration environments. Tone: modern, immersive, slightly futuristic, engineering-focused, practical, system-oriented. Inspired by robotics labs, industrial simulation systems, control rooms. Never fantasy lore. The student progression: 'I can write code' → 'I can solve engineering problems' → 'I can build software systems' → 'I can design architectures.'",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "missing auth" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userRes } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    const userId = userRes?.user?.id;
    if (!userId) {
      return new Response(JSON.stringify({ error: "unauthenticated" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await req.json();
    const action = body.action ?? "generate";

    // ---- GENERATE ----
    if (action === "generate") {
      const track: Track = body.track === "cpp" ? "cpp" : "python";

      // Load or create progress
      let { data: progress } = await supabase
        .from("user_progress").select("*").eq("user_id", userId).eq("track", track).maybeSingle();
      if (!progress) {
        const center0 = centerForLevel(track, 1).name;
        const ins = await supabase.from("user_progress").insert({
          user_id: userId, track, level: 1, xp: 0, streak: 0, current_center: center0,
        }).select().single();
        if (ins.error) throw new Error(ins.error.message);
        progress = ins.data;
      }
      const level: number = progress!.level;
      const center = centerForLevel(track, level);

      // Mastery context
      const { data: mastery } = await supabase
        .from("topic_mastery").select("topic, mastery_score").eq("user_id", userId).eq("track", track);
      const weak = (mastery ?? []).filter((m: any) => m.mastery_score < 50).map((m: any) => m.topic).slice(0, 5);

      const { data: recent } = await supabase
        .from("question_history").select("topics").eq("user_id", userId).eq("track", track)
        .order("created_at", { ascending: false }).limit(5);
      const recentTopics = Array.from(new Set((recent ?? []).flatMap((r: any) => r.topics ?? []))).slice(0, 8);

      const lang = track === "python" ? "Python" : "C++";
      const difficulty =
        level <= 20 ? "Beginner" : level <= 50 ? "Intermediate" : level <= 80 ? "Advanced" : "System-level";

      const seed = crypto.randomUUID();
      const sys =
        `You are an intelligent ${lang} mentor inside ${TRACK_LORE[track]}\n` +
        `Generate ONE adaptive coding challenge.\n\n` +
        `HARD RULES:\n` +
        `- "context" is 1-2 lines MAX. Atmospheric narrative that fits the world but NEVER confuses the learner.\n` +
        `- "task" must be crystal clear, technical, immediately solvable. The challenge for the learner is "how do I solve this", never "what does this mean".\n` +
        `- Match difficulty to user level (1-100). Current level: ${level} (${difficulty}). Center: "${center.name}" — ${center.subtitle}. Vibe: ${center.vibe}\n` +
        `- Center topics pool: ${JSON.stringify(center.topics)}\n` +
        `- Prefer engineering-oriented framing over toy problems.\n` +
        `- Use weak topics ${JSON.stringify(weak)} when meaningful; AVOID repeating recent topics ${JSON.stringify(recentTopics)}.\n` +
        `- Always call the emit_challenge tool. Random seed: ${seed}.`;

      const TOOL = {
        type: "function",
        function: {
          name: "emit_challenge",
          description: "Emit one concise immediately-understandable coding challenge.",
          parameters: {
            type: "object",
            properties: {
              context: { type: "string" },
              task: { type: "string" },
              constraints: { type: "array", items: { type: "string" } },
              difficulty: { type: "string", enum: ["Beginner", "Intermediate", "Advanced", "System-level"] },
              hints: { type: "array", items: { type: "string" } },
              expectedOutput: { type: "string" },
              starterCode: { type: "string" },
              topics: { type: "array", items: { type: "string" } },
            },
            required: ["context", "task", "constraints", "difficulty", "hints", "expectedOutput", "starterCode", "topics"],
            additionalProperties: false,
          },
        },
      };

      const challenge = await callAI(
        [
          { role: "system", content: sys },
          { role: "user", content: `Generate a ${lang} challenge for level ${level} in center "${center.name}".` },
        ],
        TOOL,
      );

      const ins = await supabase.from("question_history").insert({
        user_id: userId, track, level, topics: challenge.topics, prompt: challenge,
      }).select().single();
      if (ins.error) throw new Error(ins.error.message);

      return new Response(
        JSON.stringify({
          id: ins.data.id, level, track, center: { name: center.name, subtitle: center.subtitle, vibe: center.vibe },
          challenge,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ---- EVALUATE ----
    if (action === "evaluate") {
      const { historyId, userCode } = body;
      if (!historyId || !userCode) {
        return new Response(JSON.stringify({ error: "historyId and userCode required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const { data: row, error } = await supabase
        .from("question_history").select("*").eq("id", historyId).eq("user_id", userId).single();
      if (error || !row) throw new Error("Challenge not found");

      const lang = row.track === "python" ? "Python" : "C++";
      const TOOL = {
        type: "function",
        function: {
          name: "emit_review",
          description: "Mentor review of submitted code.",
          parameters: {
            type: "object",
            properties: {
              verdict: { type: "string", enum: ["correct", "partial", "incorrect"] },
              score: { type: "number" },
              explanation: { type: "string" },
              weakConcepts: { type: "array", items: { type: "string" } },
              strongConcepts: { type: "array", items: { type: "string" } },
              followUpHint: { type: "string" },
              errorTrace: {
                type: "array",
                description: "Backtrace of where the submitted code went wrong. One entry per failure point. Empty if verdict is correct.",
                items: {
                  type: "object",
                  properties: {
                    line: { type: "number", description: "1-indexed line number in the submitted code where the issue originates." },
                    snippet: { type: "string", description: "Exact line of code from the submission that caused the problem." },
                    issue: { type: "string", description: "What is wrong on that line (syntax error, wrong logic, off-by-one, wrong type, etc.)." },
                    why: { type: "string", description: "Why this is a problem — the underlying reasoning a learner needs to grasp." },
                    fix: { type: "string", description: "Concrete suggestion to repair this line WITHOUT giving the entire solution." },
                  },
                  required: ["line", "snippet", "issue", "why", "fix"],
                  additionalProperties: false,
                },
              },
            },
            required: ["verdict", "score", "explanation", "weakConcepts", "strongConcepts", "followUpHint", "errorTrace"],
            additionalProperties: false,
          },
        },
      };

      const review = await callAI(
        [
          { role: "system", content:
            `You are an intelligent ${lang} engineering mentor. Be encouraging, human, specific. ` +
            `Identify what works and what doesn't. Always call emit_review.\n\n` +
            `BACKTRACE RULES (critical):\n` +
            `- If verdict is "incorrect" or "partial", populate errorTrace with 1-4 entries pinpointing exactly where the submitted code went wrong.\n` +
            `- Walk the code top-down: first failure first, then any cascading or secondary failures.\n` +
            `- "line" must be the 1-indexed line number from the SUBMITTED code (count newlines in the user's snippet, not the starter).\n` +
            `- "snippet" must be the exact text of that line, copied verbatim.\n` +
            `- "issue" is what's wrong (e.g. "off-by-one in range", "missing return", "wrong operator", "uninitialized pointer").\n` +
            `- "why" explains the underlying concept the learner is missing.\n` +
            `- "fix" nudges toward the correction WITHOUT writing the full fixed line. Never paste the solution.\n` +
            `- If verdict is "correct", set errorTrace to an empty array [].`,
          },
          { role: "user", content: `CHALLENGE:\n${JSON.stringify(row.prompt, null, 2)}\n\nLEARNER SUBMISSION (${lang}):\n\`\`\`\n${userCode}\n\`\`\`\n\nReview correctness, identify weak/strong concepts, and provide a forward-looking hint.` },
        ],
        TOOL,
      );

      const xpAward = review.verdict === "correct"
        ? Math.round(xpForLevel(row.level) * 0.4)
        : review.verdict === "partial" ? Math.round(xpForLevel(row.level) * 0.15) : 5;

      await supabase.from("question_history").update({
        user_code: userCode, verdict: review.verdict, feedback: review,
        xp_awarded: xpAward, submitted_at: new Date().toISOString(),
      }).eq("id", row.id);

      // Update progress
      const { data: progress } = await supabase
        .from("user_progress").select("*").eq("user_id", userId).eq("track", row.track).single();
      let leveledUp = false;
      if (progress) {
        let newXp = progress.xp + xpAward;
        let newLevel = progress.level;
        while (newXp >= xpForLevel(newLevel) && newLevel < 100) {
          newXp -= xpForLevel(newLevel);
          newLevel += 1;
          leveledUp = true;
        }
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const last = progress.last_active_at ? new Date(progress.last_active_at) : null;
        let streak = progress.streak;
        if (!last) streak = 1;
        else {
          const lastDay = new Date(last); lastDay.setHours(0, 0, 0, 0);
          const diff = (today.getTime() - lastDay.getTime()) / 86400000;
          if (diff === 0) { /* same day */ }
          else if (diff === 1) streak += 1;
          else streak = 1;
        }
        const center = centerForLevel(row.track, newLevel);
        await supabase.from("user_progress").update({
          xp: newXp, level: newLevel, streak, last_active_at: new Date().toISOString(),
          current_center: center.name,
        }).eq("id", progress.id);
      }

      // Mastery
      for (const topic of (row.topics ?? [])) {
        const { data: m } = await supabase.from("topic_mastery").select("*")
          .eq("user_id", userId).eq("track", row.track).eq("topic", topic).maybeSingle();
        const correctInc = review.verdict === "correct" ? 1 : 0;
        const partialBoost = review.verdict === "partial" ? 5 : 0;
        if (m) {
          const attempts = m.attempts + 1;
          const correct = m.correct + correctInc;
          const score = Math.min(100, Math.max(0, Math.round((correct / attempts) * 100) + partialBoost));
          await supabase.from("topic_mastery").update({
            attempts, correct, mastery_score: score, updated_at: new Date().toISOString(),
          }).eq("id", m.id);
        } else {
          await supabase.from("topic_mastery").insert({
            user_id: userId, track: row.track, topic,
            attempts: 1, correct: correctInc,
            mastery_score: correctInc ? 60 : (partialBoost ? 25 : 10),
          });
        }
      }

      // Award app-wide XP via existing RPC (keeps levels working internally).
      if (xpAward > 0) await supabase.rpc("add_xp", { p_xp: xpAward });
      // Story Time reward: 1 coin per question attempted (regardless of verdict).
      const coinsEarned = 1;
      await supabase.rpc("add_coins", { p_coins: coinsEarned });

      return new Response(JSON.stringify({ review, xpAward, leveledUp, coinsEarned }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "unknown action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
