// Story Time: generates a coding challenge for a level, or judges a submission.
// Difficulty scales with level. Always fresh via random seed.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TOTAL_LEVELS = 12;

const themeFor = (level: number) => {
  const acts = [
    "Chapter 1 — The Awakening (variables, printing, basic IO)",
    "Chapter 2 — The Loop Forest (loops, conditionals)",
    "Chapter 3 — Function Mountain (functions, recursion basics)",
    "Chapter 4 — Array Caves (arrays, strings, manipulation)",
    "Chapter 5 — The Final Algorithm (sorting, searching, complexity)",
  ];
  const idx = Math.min(acts.length - 1, Math.floor((level - 1) / 3));
  return acts[idx];
};

const difficultyFor = (level: number) => {
  if (level <= 3) return "very easy";
  if (level <= 6) return "easy";
  if (level <= 9) return "medium";
  if (level <= 11) return "hard";
  return "boss-level hard";
};

async function callAI(messages: any[], tools?: any[]) {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");
  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages,
      ...(tools ? { tools, tool_choice: { type: "function", function: { name: tools[0].function.name } } } : {}),
    }),
  });
  if (!resp.ok) throw new Error(`AI ${resp.status}: ${await resp.text()}`);
  return await resp.json();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = await req.json();
    const action = body.action ?? "generate";

    if (action === "generate") {
      const level = Math.max(1, Math.min(TOTAL_LEVELS, Number(body.level) || 1));
      const language = body.language ?? "Python";
      const seed = crypto.randomUUID();
      const data = await callAI(
        [
          {
            role: "system",
            content:
              "You generate single-shot programming challenges for a story-mode game. Always return via the provided tool. Keep prompts crisp and self-contained. Hints should NEVER reveal the solution directly.",
          },
          {
            role: "user",
            content:
              `Create ONE ${difficultyFor(level)} ${language} challenge for ${themeFor(level)}. ` +
              `Level ${level} of ${TOTAL_LEVELS}. The challenge must be solvable in ~10-30 lines. ` +
              `Provide a tiny starter code template. Provide one short helpful hint that nudges, never solves. ` +
              `Provide a vivid story_intro (2-3 sentences, narrative tone, fits the chapter theme). ` +
              `Random seed: ${seed}.`,
          },
        ],
        [
          {
            type: "function",
            function: {
              name: "emit_level",
              description: "Emit a story level",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  story_intro: { type: "string" },
                  prompt: { type: "string", description: "The full coding task description" },
                  starter_code: { type: "string" },
                  hint: { type: "string" },
                  language: { type: "string" },
                  example_io: { type: "string", description: "Example input/output" },
                },
                required: ["title", "story_intro", "prompt", "starter_code", "hint", "language"],
                additionalProperties: false,
              },
            },
          },
        ],
      );
      const args = JSON.parse(data.choices[0].message.tool_calls[0].function.arguments);
      return new Response(JSON.stringify({ level, total_levels: TOTAL_LEVELS, ...args }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "judge") {
      const { prompt, code, language } = body;
      if (!prompt || !code) {
        return new Response(JSON.stringify({ error: "prompt and code required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const data = await callAI(
        [
          {
            role: "system",
            content:
              "You are a strict but fair code judge. Decide if the submitted code correctly solves the task. Be lenient about style; strict about correctness and intent.",
          },
          {
            role: "user",
            content: `TASK:\n${prompt}\n\nLANGUAGE: ${language ?? "Python"}\n\nSUBMITTED CODE:\n\`\`\`\n${code}\n\`\`\`\n\nJudge it.`,
          },
        ],
        [
          {
            type: "function",
            function: {
              name: "emit_judgment",
              description: "Emit verdict",
              parameters: {
                type: "object",
                properties: {
                  passed: { type: "boolean" },
                  score: { type: "integer", description: "0-100" },
                  feedback: { type: "string", description: "1-3 sentences, encouraging" },
                },
                required: ["passed", "score", "feedback"],
                additionalProperties: false,
              },
            },
          },
        ],
      );
      const args = JSON.parse(data.choices[0].message.tool_calls[0].function.arguments);
      return new Response(JSON.stringify(args), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
