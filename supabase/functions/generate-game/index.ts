// Generate fresh questions for any FUNCODE game type.
// Always returns: { questions: [{ question, code?, options[4], correct_index, explanation }] }

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PROMPTS: Record<string, (t: string, d: string) => string> = {
  mcq: (t, d) =>
    `Generate fresh ${d} multiple-choice questions about ${t}. Real exam-quality, never repeat common textbook examples. Each has 4 options.`,
  riddle: (t, d) =>
    `Generate fresh ${d} CODE OUTPUT RIDDLES for ${t}. Each item: a short ${t} snippet in "code", question asks "What is the output?", 4 plausible outputs as options.`,
  error_detect: (t, d) =>
    `Generate fresh ${d} ERROR DETECTION puzzles for ${t}. Each item: a ${t} snippet in "code" containing exactly ONE bug. Question: "Which line/expression contains the bug?". Options describe candidate problems; one is correct.`,
  fill_blank: (t, d) =>
    `Generate fresh ${d} FILL-IN-THE-BLANK puzzles for ${t}. Each item: a ${t} snippet in "code" with a "____" blank. 4 token options, only one compiles/works correctly.`,
  rapid_fire: (t, d) =>
    `Generate fresh ${d} RAPID TRUE/FALSE statements about ${t}. Question is a single bold claim. Options are exactly ["True","False"]. correct_index 0 or 1.`,
  code_golf: (t, d) =>
    `Generate fresh ${d} CODE GOLF puzzles for ${t}. Question describes a tiny task; options are 4 ${t} one-liners; the correct one is the SHORTEST that still works.`,
  bug_hunt_pro: (t, d) =>
    `Generate fresh ${d} ADVANCED BUG HUNT puzzles for ${t}. Each item: a ${t} snippet in "code" with subtle bugs. Question asks the ROOT cause; 4 expert-level options.`,
  time_attack: (t, d) =>
    `Generate fresh ${d} LIGHTNING MCQs about ${t}. Tight one-line questions, 4 short options. Optimised for 8-second answering. No code unless essential.`,
  memory_matrix: (t, d) =>
    `Generate fresh ${d} MATCHING questions for ${t}. Question is a single concept, syntax, or outcome. The 4 options are candidate definitions/results — exactly one correctly matches. Crisp and unambiguous.`,
  boss_rush: (t, d) =>
    `Generate fresh ESCALATING ${t} questions. Item 1 is easy; difficulty increases each item up to expert by the last. Mix output prediction, bug spotting, and concept recall. 4 options each.`,
  refactor_master: (t, d) =>
    `Generate fresh ${d} REFACTOR puzzles for ${t}. Each item: an ugly but working ${t} snippet in "code". Question: "Pick the best refactor". 4 candidate rewrites as options — exactly one is correct, idiomatic, and equivalent in behaviour.`,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { topic, gameType = "mcq", difficulty = "medium", count = 10 } = await req.json();
    if (!topic) {
      return new Response(JSON.stringify({ error: "topic required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const builder = PROMPTS[gameType] ?? PROMPTS.mcq;
    const userPrompt = `${builder(topic, difficulty)} Produce exactly ${count} unique items. Use a unique random seed: ${crypto.randomUUID()}.`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a coding game question generator. Always return data via the provided tool. No prose." },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "emit_questions",
              description: "Emit the generated questions",
              parameters: {
                type: "object",
                properties: {
                  questions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        question: { type: "string" },
                        code: { type: "string", description: "Optional code snippet" },
                        options: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 4 },
                        correct_index: { type: "integer", minimum: 0, maximum: 3 },
                        explanation: { type: "string" },
                      },
                      required: ["question", "options", "correct_index", "explanation"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["questions"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "emit_questions" } },
      }),
    });

    if (resp.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit hit. Try again in a moment." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (resp.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Workspace > Usage." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!resp.ok) {
      const t = await resp.text();
      console.error("AI error", resp.status, t);
      throw new Error("AI gateway error");
    }
    const data = await resp.json();
    const args = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    const parsed = args ? JSON.parse(args) : { questions: [] };
    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
