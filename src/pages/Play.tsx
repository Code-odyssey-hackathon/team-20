import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AppNavbar } from "@/components/funcode/AppNavbar";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ArrowRight, Check, Loader2, Sparkles, Timer, Trophy, X } from "lucide-react";
import { getGame } from "@/lib/games";
import { generateGameQuestions } from "@/lib/gemini";

interface Q {
  question: string;
  code?: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

const Play = () => {
  const { topic: topicParam, gameType } = useParams();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const { user } = useAuth();

  const game = gameType ? getGame(gameType) : null;
  const TIME_PER_Q = game?.timePerQ ?? 20;
  const QUESTION_COUNT = game?.questionCount ?? 10;

  const difficulty = params.get("difficulty") ?? "mixed";
  const roomId = params.get("room");
  const isSolo = !roomId;

  const [topic, setTopic] = useState<{ id: string; name: string } | null>(null);
  const [questions, setQuestions] = useState<Q[]>([]);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_Q);
  const [done, setDone] = useState(false);
  const startedAt = useRef<number>(Date.now());
  const savedRef = useRef(false);

  // Load topic + questions
  useEffect(() => {
    if (!topicParam || !game) return;
    (async () => {
      setLoading(true);
      try {
        // topicParam may be slug or uuid
        const isUuid = /^[0-9a-f-]{36}$/i.test(topicParam);
        const { data: t } = await supabase
          .from("topics")
          .select("id, name")
          .eq(isUuid ? "id" : "slug", topicParam)
          .maybeSingle();
        if (!t) {
          toast.error("Topic not found");
          nav("/topics");
          return;
        }
        setTopic(t as any);

        // Source questions
        if (roomId) {
          const { data: r } = await supabase.from("rooms").select("questions").eq("id", roomId).maybeSingle();
          const qs = ((r as any)?.questions as Q[]) ?? [];
          setQuestions(qs.slice(0, QUESTION_COUNT));
        } else {
          let qs: Q[] = [];
          try {
            const data = await generateGameQuestions(
              (t as any).name,
              game.id,
              difficulty === "mixed" ? "medium" : difficulty,
              QUESTION_COUNT
            );
            qs = (data?.questions as Q[]) ?? [];
          } catch (error: any) {
            console.error("Gemini API Error", error);
            throw new Error(error.message || "AI returned an error");
          }
          if (qs.length === 0) throw new Error("AI returned no questions");
          setQuestions(qs.slice(0, QUESTION_COUNT));
        }
        startedAt.current = Date.now();
        setTimeLeft(TIME_PER_Q);
      } catch (e: any) {
        toast.error(e?.message ?? "Failed to load");
        nav("/topics");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicParam, gameType, roomId]);

  // Timer
  useEffect(() => {
    if (loading || done || picked !== null) return;
    if (timeLeft <= 0) {
      setPicked(-1);
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, picked, loading, done]);

  const current = questions[idx];

  const choose = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === current.correct_index) {
      const speedBonus = Math.max(0, timeLeft) * 5;
      const points = 100 + speedBonus;
      setScore((s) => s + points);
      setCorrectCount((c) => c + 1);
    }
  };

  const next = async () => {
    if (idx + 1 >= questions.length) {
      await finish();
      return;
    }
    setIdx((i) => i + 1);
    setPicked(null);
    setTimeLeft(TIME_PER_Q);
  };

  const xpPreview = useMemo(() => correctCount * 25 + Math.floor(score / 20), [correctCount, score]);

  const finish = async () => {
    if (savedRef.current) return;
    savedRef.current = true;
    setDone(true);
    if (!user || !topic) return;
    const duration = Math.round((Date.now() - startedAt.current) / 1000);
    const xp = correctCount * 25 + Math.floor(score / 20);
    try {
      await supabase.from("matches").insert({
        user_id: user.id,
        topic_id: topic.id,
        mode: roomId ? "room" : "solo",
        game_type: gameType,
        room_id: roomId,
        score,
        total_questions: questions.length,
        correct_count: correctCount,
        xp_earned: xp,
        duration_seconds: duration,
      });
      await supabase.rpc("add_xp", { p_xp: xp });
      if (roomId) {
        await supabase
          .from("room_members")
          .update({
            score,
            correct_count: correctCount,
            finished: true,
            finished_at: new Date().toISOString(),
          })
          .eq("room_id", roomId)
          .eq("user_id", user.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <AppNavbar />
        <main className="pt-40 grid place-items-center">
          <div className="text-center">
            <Loader2 className="w-10 h-10 mx-auto animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">AI is forging fresh questions…</p>
          </div>
        </main>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen">
        <AppNavbar />
        <main className="pt-32 pb-20 px-4">
          <div className="max-w-2xl mx-auto glass-panel neon-border rounded-3xl p-8 text-center">
            <Trophy className="w-14 h-14 mx-auto text-primary mb-4 animate-pulse" />
            <h1 className="font-display font-black text-4xl text-gradient-neon">Run Complete</h1>
            <p className="text-muted-foreground mt-2">{topic?.name} · {game?.name}</p>
            <div className="grid grid-cols-3 gap-4 mt-8">
              <Stat label="Correct" value={`${correctCount}/${questions.length}`} />
              <Stat label="Score" value={score.toLocaleString()} />
              <Stat label="XP" value={`+${xpPreview}`} />
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              {roomId ? (
                <Button variant="hero" onClick={() => nav(`/room/${roomId}`)}>Back to Room</Button>
              ) : (
                <Button variant="hero" onClick={() => nav(`/games/${topicParam}`)}>Play Again</Button>
              )}
              <Button variant="ghostNeon" onClick={() => nav("/leaderboard")}>Leaderboard</Button>
              <Button variant="ghost" onClick={() => nav("/dashboard")}>Dashboard</Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!current || !game) return null;

  return (
    <div className="min-h-screen">
      <AppNavbar />
      <main className="pt-32 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-5 text-sm">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-widest text-primary">{topic?.name}</span>
              <span className="text-xs font-bold uppercase tracking-widest text-accent">{game.name}</span>
              <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                <Sparkles className="w-3 h-3" /> AI
              </span>
            </div>
            <div className="font-mono text-muted-foreground">
              {idx + 1} / {questions.length}
            </div>
          </div>

          <div className="h-1.5 bg-muted rounded-full mb-3 overflow-hidden">
            <div
              className="h-full transition-all"
              style={{
                width: `${((idx + (picked !== null ? 1 : 0)) / questions.length) * 100}%`,
                background: "var(--gradient-neon)",
              }}
            />
          </div>

          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-1.5 text-sm">
              <Timer className={`w-4 h-4 ${timeLeft <= 5 ? "text-destructive animate-pulse" : "text-primary"}`} />
              <span className={`font-mono ${timeLeft <= 5 ? "text-destructive" : "text-foreground"}`}>{timeLeft}s</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Score: <span className="text-primary font-mono">{score}</span>
            </div>
          </div>

          <div className="glass-panel neon-border rounded-3xl p-6 sm:p-8">
            <h2 className="font-sans font-semibold text-xl sm:text-2xl leading-relaxed text-foreground/90">{current.question}</h2>

            {current.code && (
              <pre className="mt-4 p-4 rounded-xl bg-black/50 border border-border overflow-x-auto text-sm font-mono text-[hsl(var(--neon-mint))] whitespace-pre">
                {current.code}
              </pre>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
              {current.options.map((opt, i) => {
                const isCorrect = i === current.correct_index;
                const isPicked = i === picked;
                let cls = "border-border hover:border-primary hover:bg-primary/5";
                if (picked !== null) {
                  if (isCorrect) cls = "border-[hsl(var(--neon-mint))] bg-[hsl(var(--neon-mint))]/10";
                  else if (isPicked) cls = "border-destructive bg-destructive/10";
                  else cls = "border-border opacity-50";
                }
                return (
                  <button
                    key={i}
                    onClick={() => choose(i)}
                    disabled={picked !== null}
                    className={`relative text-left p-4 rounded-xl border transition-all ${cls}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground shrink-0 mt-1">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-base font-medium flex-1">{opt}</span>
                      {picked !== null && isCorrect && <Check className="w-5 h-5 text-[hsl(var(--neon-mint))]" />}
                      {picked !== null && isPicked && !isCorrect && <X className="w-5 h-5 text-destructive" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {picked !== null && (
              <div className="mt-6 p-4 rounded-xl bg-muted/40 border border-border">
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Explanation</div>
                <p className="text-sm">{current.explanation || "—"}</p>
                <Button variant="hero" className="mt-4 w-full sm:w-auto" onClick={next}>
                  {idx + 1 >= questions.length ? "Finish" : "Next"} <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="rounded-xl border border-border p-4">
    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
    <div className="font-display font-black text-2xl mt-1 text-gradient-neon">{value}</div>
  </div>
);

export default Play;
