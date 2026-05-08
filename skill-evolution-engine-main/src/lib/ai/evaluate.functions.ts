import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { xpForLevel } from "@/lib/tracks";

const InputSchema = z.object({
  historyId: z.string().uuid(),
  userCode: z.string().min(1).max(20000),
});

const TOOL = {
  type: "function",
  function: {
    name: "emit_review",
    description: "Mentor review of submitted code.",
    parameters: {
      type: "object",
      properties: {
        verdict: { type: "string", enum: ["correct", "partial", "incorrect"] },
        score: { type: "number", description: "0-100" },
        explanation: { type: "string", description: "Mentor-style review of the solution. Encouraging, human, specific." },
        weakConcepts: { type: "array", items: { type: "string" } },
        strongConcepts: { type: "array", items: { type: "string" } },
        followUpHint: { type: "string", description: "One sentence pointing to what to learn next." },
      },
      required: ["verdict", "score", "explanation", "weakConcepts", "strongConcepts", "followUpHint"],
      additionalProperties: false,
    },
  },
};

export const evaluateSubmission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const { data: row, error } = await supabase
      .from("question_history").select("*").eq("id", data.historyId).eq("user_id", userId).single();
    if (error || !row) throw new Error("Challenge not found");

    const lang = row.track === "python" ? "Python" : "C++";
    const challenge = row.prompt as Record<string, unknown>;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: `You are an intelligent ${lang} engineering mentor. Be encouraging, human, specific. Identify what works and what doesn't. Always call emit_review.` },
          { role: "user", content: `CHALLENGE:\n${JSON.stringify(challenge, null, 2)}\n\nLEARNER SUBMISSION (${lang}):\n\`\`\`${row.track}\n${data.userCode}\n\`\`\`\n\nReview correctness, identify weak/strong concepts, and provide a forward-looking hint.` },
        ],
        tools: [TOOL],
        tool_choice: { type: "function", function: { name: "emit_review" } },
      }),
    });

    if (res.status === 429) throw new Error("Rate limit reached. Please wait and retry.");
    if (res.status === 402) throw new Error("AI credits exhausted.");
    if (!res.ok) throw new Error(`AI gateway error: ${res.status}`);

    const json = await res.json();
    const call = json.choices?.[0]?.message?.tool_calls?.[0];
    if (!call) throw new Error("AI returned no review");
    const review = JSON.parse(call.function.arguments) as {
      verdict: "correct" | "partial" | "incorrect";
      score: number;
      explanation: string;
      weakConcepts: string[];
      strongConcepts: string[];
      followUpHint: string;
    };

    const xpAward = review.verdict === "correct" ? Math.round(xpForLevel(row.level) * 0.4)
      : review.verdict === "partial" ? Math.round(xpForLevel(row.level) * 0.15)
      : 5;

    await supabase.from("question_history").update({
      user_code: data.userCode,
      verdict: review.verdict,
      feedback: review as unknown as import("@/integrations/supabase/types").Json,
      xp_awarded: xpAward,
      submitted_at: new Date().toISOString(),
    }).eq("id", row.id);

    // Update progress
    const { data: progress } = await supabase
      .from("user_progress").select("*").eq("user_id", userId).eq("track", row.track).single();
    if (progress) {
      let newXp = progress.xp + xpAward;
      let newLevel = progress.level;
      while (newXp >= xpForLevel(newLevel) && newLevel < 100) {
        newXp -= xpForLevel(newLevel);
        newLevel += 1;
      }
      const today = new Date(); today.setHours(0,0,0,0);
      const last = progress.last_active_at ? new Date(progress.last_active_at) : null;
      let streak = progress.streak;
      if (!last) streak = 1;
      else {
        const lastDay = new Date(last); lastDay.setHours(0,0,0,0);
        const diff = (today.getTime() - lastDay.getTime()) / (1000*60*60*24);
        if (diff === 0) { /* same day */ }
        else if (diff === 1) streak += 1;
        else streak = 1;
      }
      await supabase.from("user_progress").update({
        xp: newXp, level: newLevel, streak, last_active_at: new Date().toISOString(),
      }).eq("id", progress.id);
    }

    // Update topic mastery
    for (const topic of row.topics) {
      const { data: m } = await supabase
        .from("topic_mastery").select("*")
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
          mastery_score: correctInc ? 60 : partialBoost ? 25 : 10,
        });
      }
    }

    return { review, xpAward };
  });
