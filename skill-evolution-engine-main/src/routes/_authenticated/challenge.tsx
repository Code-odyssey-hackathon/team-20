import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/app/Header";
import { CodeEditor } from "@/components/app/CodeEditor";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { generateChallenge } from "@/lib/ai/challenge.functions";
import { evaluateSubmission } from "@/lib/ai/evaluate.functions";
import { TRACKS, type TrackKind } from "@/lib/tracks";
import { getActiveTrack } from "./tracks";
import { Lightbulb, Send, RefreshCw, ArrowRight, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/challenge")({
  head: () => ({ meta: [{ title: "Challenge — Saptapath" }] }),
  component: Challenge,
});

interface ChallengeData {
  context: string;
  task: string;
  constraints: string[];
  difficulty: string;
  hints: string[];
  expectedOutput: string;
  topics: string[];
}
interface Review {
  verdict: "correct" | "partial" | "incorrect";
  score: number;
  explanation: string;
  weakConcepts: string[];
  strongConcepts: string[];
  followUpHint: string;
}

function Challenge() {
  const navigate = useNavigate();
  const gen = useServerFn(generateChallenge);
  const evalFn = useServerFn(evaluateSubmission);

  const [track, setTrack] = useState<TrackKind | null>(null);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [historyId, setHistoryId] = useState<string | null>(null);
  const [level, setLevel] = useState(1);
  const [data, setData] = useState<ChallengeData | null>(null);
  const [code, setCode] = useState("");
  const [shownHints, setShownHints] = useState(0);
  const [review, setReview] = useState<Review | null>(null);
  const [xpAward, setXpAward] = useState(0);

  useEffect(() => {
    const t = getActiveTrack();
    if (!t) { navigate({ to: "/tracks" }); return; }
    setTrack(t);
  }, [navigate]);

  const fetchNew = async () => {
    if (!track) return;
    setLoading(true); setReview(null); setShownHints(0); setData(null);
    try {
      const r = await gen({ data: { track } });
      setHistoryId(r.id);
      setLevel(r.level);
      setData(r.challenge);
      setCode(track === "python" ? "# Your solution here\n" : "// Your solution here\n#include <iostream>\nusing namespace std;\n\nint main() {\n  return 0;\n}\n");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to load challenge");
    } finally { setLoading(false); }
  };

  useEffect(() => { if (track && !data) fetchNew(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [track]);

  const submit = async () => {
    if (!historyId || !code.trim()) return;
    setEvaluating(true);
    try {
      const r = await evalFn({ data: { historyId, userCode: code } });
      setReview(r.review);
      setXpAward(r.xpAward);
      if (r.review.verdict === "correct") toast.success(`+${r.xpAward} XP — clean solve.`);
      else if (r.review.verdict === "partial") toast.message(`+${r.xpAward} XP — close, see notes.`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Evaluation failed");
    } finally { setEvaluating(false); }
  };

  if (!track) return null;
  const t = TRACKS[track];
  const isPython = track === "python";

  return (
    <div className="min-h-screen" data-track={isPython ? "pythoria" : "yantra"}>
      <Header />
      <main className="mx-auto max-w-7xl px-6 pt-10 pb-24">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{t.codename} · L{level}</div>
            <h1 className={`mt-1 font-display text-3xl font-semibold ${isPython ? "text-gradient-pythoria" : "text-gradient-yantra"}`}>Challenge</h1>
          </div>
          <Button variant="outline" size="sm" onClick={fetchNew} disabled={loading || evaluating}>
            <RefreshCw className={`mr-1 size-4 ${loading ? "animate-spin" : ""}`} /> New
          </Button>
        </div>

        {loading && !data && (
          <div className="rounded-2xl border border-border/60 p-12 text-center text-sm text-muted-foreground" style={{ background: "var(--gradient-surface)" }}>
            Generating an adaptive challenge for you…
          </div>
        )}

        {data && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Brief */}
            <div className="rounded-2xl border border-border/60 p-6" style={{ background: "var(--gradient-surface)" }}>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{data.difficulty}</Badge>
                {data.topics.slice(0, 4).map(tp => <Badge key={tp} variant="outline" className="capitalize">{tp}</Badge>)}
              </div>
              <p className="mt-5 text-sm italic leading-relaxed text-muted-foreground">{data.context}</p>
              <h3 className="mt-4 font-display text-xl font-semibold">{data.task}</h3>

              {data.constraints.length > 0 && (
                <div className="mt-5">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Constraints</div>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground/85">
                    {data.constraints.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
              )}

              <div className="mt-5">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Expected</div>
                <pre className="mt-2 overflow-auto rounded-lg border border-border/60 bg-background/40 p-3 text-xs">{data.expectedOutput}</pre>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Hints</div>
                  {shownHints < data.hints.length && (
                    <Button variant="ghost" size="sm" onClick={() => setShownHints(s => s + 1)}>
                      <Lightbulb className="mr-1 size-4" /> Reveal hint {shownHints + 1}
                    </Button>
                  )}
                </div>
                <div className="mt-2 space-y-2">
                  {data.hints.slice(0, shownHints).map((h, i) => (
                    <div key={i} className="rounded-lg border border-border/60 bg-background/40 p-3 text-sm">
                      <span className="font-mono text-xs text-primary">#{i + 1}</span> · {h}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Editor + review */}
            <div className="space-y-4">
              <CodeEditor language={track} value={code} onChange={setCode} />
              <div className="flex justify-end gap-2">
                <Button onClick={submit} disabled={evaluating || !code.trim()}>
                  <Send className="mr-1 size-4" /> {evaluating ? "Reviewing…" : "Submit for AI review"}
                </Button>
              </div>

              <AnimatePresence>
                {review && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-border/60 p-6"
                    style={{ background: "var(--gradient-surface)" }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {review.verdict === "correct" && <CheckCircle2 className="size-5 text-success" />}
                        {review.verdict === "partial" && <AlertCircle className="size-5 text-warning" />}
                        {review.verdict === "incorrect" && <XCircle className="size-5 text-destructive" />}
                        <span className="font-display text-lg font-semibold capitalize">{review.verdict}</span>
                        <span className="text-xs text-muted-foreground">· {review.score}/100</span>
                      </div>
                      <span className="text-xs font-mono text-primary">+{xpAward} XP</span>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">{review.explanation}</p>
                    {review.strongConcepts.length > 0 && (
                      <div className="mt-4">
                        <div className="text-xs uppercase tracking-wider text-muted-foreground">You showed strength in</div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {review.strongConcepts.map(c => <Badge key={c} variant="secondary" className="capitalize">{c}</Badge>)}
                        </div>
                      </div>
                    )}
                    {review.weakConcepts.length > 0 && (
                      <div className="mt-4">
                        <div className="text-xs uppercase tracking-wider text-muted-foreground">Worth revisiting</div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {review.weakConcepts.map(c => <Badge key={c} variant="outline" className="capitalize">{c}</Badge>)}
                        </div>
                      </div>
                    )}
                    <div className="mt-5 rounded-lg border border-border/60 bg-background/40 p-3 text-sm">
                      <span className="font-medium">Next:</span> {review.followUpHint}
                    </div>
                    <div className="mt-5 flex gap-2">
                      <Button onClick={fetchNew}>Continue <ArrowRight className="ml-1 size-4" /></Button>
                      <Link to="/dashboard"><Button variant="outline">Dashboard</Button></Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
