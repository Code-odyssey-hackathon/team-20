import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const InputSchema = z.object({
  track: z.enum(["python", "cpp"]),
});

interface Challenge {
  context: string;
  task: string;
  constraints: string[];
  difficulty: string;
  hints: string[];
  expectedOutput: string;
  topics: string[];
}

const TOOL = {
  type: "function",
  function: {
    name: "emit_challenge",
    description: "Emit a single concise, immediately understandable coding challenge.",
    parameters: {
      type: "object",
      properties: {
        context: { type: "string", description: "1-2 lines of immersive narrative framing. No lore paragraphs." },
        task: { type: "string", description: "Clear, technical task — what the user must implement." },
        constraints: { type: "array", items: { type: "string" } },
        difficulty: { type: "string", enum: ["Beginner", "Intermediate", "Advanced", "System-level"] },
        hints: { type: "array", items: { type: "string" }, description: "2-3 progressive hints." },
        expectedOutput: { type: "string", description: "Exact expected output or behavior." },
        topics: { type: "array", items: { type: "string" } },
      },
      required: ["context", "task", "constraints", "difficulty", "hints", "expectedOutput", "topics"],
      additionalProperties: false,
    },
  },
};

export const generateChallenge = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    // Load progress
    const { data: progress } = await supabase
      .from("user_progress").select("*").eq("user_id", userId).eq("track", data.track).maybeSingle();

    let level = 1;
    let center = "Gateway Grove";
    if (!progress) {
      const ins = await supabase.from("user_progress").insert({
        user_id: userId, track: data.track, level: 1, xp: 0, streak: 0, current_center: center,
      }).select().single();
      if (ins.error) throw new Error(ins.error.message);
    } else {
      level = progress.level;
      center = progress.current_center ?? center;
    }

    // Load mastery for context
    const { data: mastery } = await supabase
      .from("topic_mastery").select("topic, mastery_score").eq("user_id", userId).eq("track", data.track);
    const weak = (mastery ?? []).filter(m => m.mastery_score < 50).map(m => m.topic).slice(0, 5);

    // Recent topics
    const { data: recent } = await supabase
      .from("question_history").select("topics").eq("user_id", userId).eq("track", data.track)
      .order("created_at", { ascending: false }).limit(5);
    const recentTopics = Array.from(new Set((recent ?? []).flatMap(r => r.topics ?? []))).slice(0, 8);

    const trackInfo = data.track === "python"
      ? { lang: "Python", world: "Pythoria — an ancient computational civilization restored through the Saptapath. Calm, intelligent, ancient-yet-futuristic." }
      : { lang: "C++", world: "Project Yantra — a futuristic systems engineering institute. Structured, technical, industrial." };

    const systemPrompt = `You are an intelligent ${trackInfo.lang} mentor inside ${trackInfo.world}
Generate ONE adaptive coding challenge.

Hard rules:
- Context is 1-2 lines MAX. Atmospheric but never confusing.
- The task must be crystal clear and immediately solvable.
- Match difficulty to user level (1-100). Current level: ${level}.
- Prefer engineering-oriented framing over toy problems.
- Use weak topics ${JSON.stringify(weak)} when meaningful; AVOID repeating recent topics ${JSON.stringify(recentTopics)}.
- Always call the emit_challenge tool.`;

    const userPrompt = `Generate a ${trackInfo.lang} challenge for level ${level} in center "${center}".`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [TOOL],
        tool_choice: { type: "function", function: { name: "emit_challenge" } },
      }),
    });

    if (res.status === 429) throw new Error("Rate limit reached. Please wait a moment and try again.");
    if (res.status === 402) throw new Error("AI credits exhausted. Add credits in Workspace settings.");
    if (!res.ok) throw new Error(`AI gateway error: ${res.status}`);

    const json = await res.json();
    const call = json.choices?.[0]?.message?.tool_calls?.[0];
    if (!call) throw new Error("AI returned no challenge");
    const challenge: Challenge = JSON.parse(call.function.arguments);

    const insertRes = await supabase.from("question_history").insert({
      user_id: userId,
      track: data.track,
      level,
      topics: challenge.topics,
      prompt: challenge as unknown as import("@/integrations/supabase/types").Json,
    }).select().single();
    if (insertRes.error) throw new Error(insertRes.error.message);

    return { id: insertRes.data.id, level, challenge };
  });
