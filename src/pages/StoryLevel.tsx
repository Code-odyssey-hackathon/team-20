import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppNavbar } from "@/components/funcode/AppNavbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  TRACKS, ALL_TRACK_IDS, type TrackKind, centerForLevel, xpForLevel, starterCodeFor,
  actForSolved, getAct, FINAL_BOSS_THRESHOLD, QUESTIONS_PER_ACT,
} from "@/lib/tracks";
import { NarratorDialog, type NarratorScene } from "@/components/funcode/NarratorDialog";
import { toast } from "sonner";
import {
  ArrowLeft, Lightbulb, Loader2, Send, RefreshCw, CheckCircle2, AlertCircle,
  XCircle, Coins, Trophy, Flame, Sparkles, BookOpen, Cpu, Swords, Bot
} from "lucide-react";
import { generateLiveFeedback } from "@/lib/gemini";

interface Challenge {
  context: string;
  task: string;
  constraints: string[];
  difficulty: string;
  hints: string[];
  expectedOutput: string;
  starterCode: string;
  topics: string[];
}
interface ErrorTraceEntry {
  line: number;
  snippet: string;
  issue: string;
  why: string;
  fix: string;
}
interface Review {
  verdict: "correct" | "partial" | "incorrect";
  score: number;
  explanation: string;
  weakConcepts: string[];
  strongConcepts: string[];
  followUpHint: string;
  errorTrace?: ErrorTraceEntry[];
}

const StoryLevel = () => {
  const { track: trackParam } = useParams();
  const track: TrackKind = (ALL_TRACK_IDS as string[]).includes(trackParam ?? "")
    ? (trackParam as TrackKind)
    : "python";
  const t = TRACKS[track];
  const isPython = track === "python";

  // ---- Story Time state ---------------------------------------------------
  const SOLVED_KEY = `storyTime:${track}:solved`;
  const INTRO_KEY = `storyTime:${track}:introSeen`;
  const ACT_SEEN_KEY = (act: number) => `storyTime:${track}:act${act}Seen`;
  const BOSS_SEEN_KEY = `storyTime:${track}:bossSeen`;

  const readSolved = () => {
    try { return parseInt(localStorage.getItem(SOLVED_KEY) ?? "0", 10) || 0; } catch { return 0; }
  };

  const [solved, setSolved] = useState<number>(readSolved());
  const [openingOpen, setOpeningOpen] = useState(false);
  const [actDialogAct, setActDialogAct] = useState<number | null>(null);
  const [bossOpen, setBossOpen] = useState(false);

  const currentAct = actForSolved(solved);
  const actInfo = getAct(track, currentAct);
  const bossUnlocked = solved >= FINAL_BOSS_THRESHOLD;

  // Show opening on first ever entry to this track
  useEffect(() => {
    try {
      if (!localStorage.getItem(INTRO_KEY)) {
        setOpeningOpen(true);
      } else if (!bossUnlocked && actInfo && !localStorage.getItem(ACT_SEEN_KEY(currentAct))) {
        // Returning player who hasn't seen the current act intro yet
        setActDialogAct(currentAct);
      } else if (bossUnlocked && !localStorage.getItem(BOSS_SEEN_KEY)) {
        setBossOpen(true);
      }
    } catch { /* localStorage unavailable */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track]);

  const closeOpening = () => {
    try { localStorage.setItem(INTRO_KEY, "1"); } catch {}
    setOpeningOpen(false);
    // After opening, immediately show Act 1 intro
    if (actInfo && !bossUnlocked) setActDialogAct(currentAct);
  };
  const closeActDialog = () => {
    if (actDialogAct != null) {
      try { localStorage.setItem(ACT_SEEN_KEY(actDialogAct), "1"); } catch {}
    }
    setActDialogAct(null);
  };
  const closeBoss = () => {
    try { localStorage.setItem(BOSS_SEEN_KEY, "1"); } catch {}
    setBossOpen(false);
  };

  const openingScenes: NarratorScene[] = useMemo(() => {
    return t.openingScript.map((line, i) =>
      i === t.openingScript.length - 1
        ? { text: line, bullets: t.acts.map((a) => `${a.name} — ${a.power}`) }
        : { text: line }
    );
  }, [t]);

  const actScenes: NarratorScene[] = useMemo(() => {
    if (actDialogAct == null) return [];
    const a = getAct(track, actDialogAct);
    if (!a) return [];
    return [
      { text: `${a.name}. You are about to gain the ${a.power}.` },
      { text: a.intro, bullets: a.briefBullets },
      { text: `Solve ${QUESTIONS_PER_ACT} trials to absorb this Power. Each correct answer brings you closer.` },
    ];
  }, [actDialogAct, track]);

  const bossScenes: NarratorScene[] = useMemo(
    () => t.finalBossScript.map((line) => ({ text: line })),
    [t]
  );
  const nav = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [historyId, setHistoryId] = useState<string | null>(null);
  const [data, setData] = useState<Challenge | null>(null);
  const [code, setCode] = useState("");
  const [shownHints, setShownHints] = useState(0);
  const [review, setReview] = useState<Review | null>(null);
  const [xpAward, setXpAward] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [leveledUp, setLeveledUp] = useState(false);
  const [liveFeedback, setLiveFeedback] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // progress sidebar
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);

  const dbTrack = (track === "python" ? "python" : "cpp") as "python" | "cpp";

  const refreshProgress = async () => {
    if (!user) return;
    const { data: p } = await supabase
      .from("user_progress").select("level,xp,streak")
      .eq("user_id", user.id).eq("track", dbTrack).maybeSingle();
    if (p) { setLevel(p.level); setXp(p.xp); setStreak(p.streak); }
  };

  const fetchNew = async () => {
    setLoading(true); setReview(null); setShownHints(0); setData(null); setCoinsEarned(0); setLeveledUp(false);
    try {
      const { data: r, error } = await supabase.functions.invoke("skill-track", { body: { action: "generate", track } });
      if (error) throw error;
      if (r?.error) throw new Error(r.error);
      setHistoryId(r.id);
      setLevel(r.level);
      setData(r.challenge as Challenge);
      setCode((r.challenge?.starterCode as string) || starterCodeFor(track));
      await refreshProgress();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load challenge");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    refreshProgress();
    fetchNew();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, track]);

  // Live code feedback debouncer
  useEffect(() => {
    if (!code || !data || evaluating) return;
    setIsAnalyzing(true);
    const handler = setTimeout(async () => {
      const feedback = await generateLiveFeedback(data.task, code);
      setLiveFeedback(feedback);
      setIsAnalyzing(false);
    }, 2000);
    return () => {
      clearTimeout(handler);
    };
  }, [code, data, evaluating]);

  const submit = async () => {
    if (!historyId || !code.trim()) {
      toast.error("Write some code first");
      return;
    }
    setEvaluating(true);
    setReview(null);
    try {
      const { data: r, error } = await supabase.functions.invoke("skill-track", {
        body: { action: "evaluate", historyId, userCode: code },
      });
      if (error) throw error;
      if (r?.error) throw new Error(r.error);
      setReview(r.review as Review);
      setXpAward(r.xpAward ?? 0);
      setCoinsEarned(r.coinsEarned ?? 0);
      setLeveledUp(!!r.leveledUp);
      if (r.review?.verdict === "correct") {
        toast.success(`+${r.coinsEarned ?? 1} coin — clean solve.`);
        // Story Time progression: count solved + maybe trigger next-act / boss
        const next = readSolved() + 1;
        try { localStorage.setItem(SOLVED_KEY, String(next)); } catch {}
        setSolved(next);
        const nextAct = actForSolved(next);
        if (next >= FINAL_BOSS_THRESHOLD) {
          try {
            if (!localStorage.getItem(BOSS_SEEN_KEY)) setBossOpen(true);
          } catch { setBossOpen(true); }
        } else if (nextAct !== currentAct) {
          try {
            if (!localStorage.getItem(ACT_SEEN_KEY(nextAct))) setActDialogAct(nextAct);
          } catch { setActDialogAct(nextAct); }
        }
      } else if (r.review?.verdict === "partial") toast(`+${r.coinsEarned ?? 1} coin — close, see notes.`);
      else toast.error(`+${r.coinsEarned ?? 1} coin — review the feedback.`);
      await refreshProgress();
    } catch (e: any) {
      toast.error(e?.message ?? "Evaluation failed");
    } finally {
      setEvaluating(false);
    }
  };

  const center = centerForLevel(track, level);

  return (
    <div className="min-h-screen">
      <AppNavbar />
      <main className="pt-28 pb-20 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          {/* Top header */}
          <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
            <Button variant="ghost" size="sm" onClick={() => nav("/story")}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Tracks
            </Button>
            <div className="flex items-center gap-2 flex-wrap">
              {ALL_TRACK_IDS.filter((id) => id !== track).map((id) => (
                <Button
                  key={id}
                  variant="outline"
                  size="sm"
                  onClick={() => nav(`/story/${id}`)}
                >
                  {TRACKS[id].language}
                </Button>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpeningOpen(true)}
                title="Replay the opening cinematic"
              >
                Replay story
              </Button>
              <Button variant="outline" size="sm" onClick={fetchNew} disabled={loading || evaluating}>
                <RefreshCw className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} /> New
              </Button>
            </div>
          </div>

          {/* Title row */}
          <div className="mb-6">
            <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              {t.codename} · L{level} · {bossUnlocked ? "FINAL BOSS" : `Act ${currentAct} / 6`}
            </div>
            <h1 className="mt-1 font-display font-black text-3xl sm:text-4xl text-gradient-neon">{t.name}</h1>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
              {bossUnlocked ? (
                <>
                  <Swords className="w-3.5 h-3.5 text-destructive" />
                  <span className="font-medium text-foreground/90">Final Boss unlocked</span>
                  <span>· use every Power you've earned</span>
                </>
              ) : actInfo ? (
                <>
                  {isPython ? <BookOpen className="w-3.5 h-3.5" /> : <Cpu className="w-3.5 h-3.5" />}
                  <span className="font-medium text-foreground/90">{actInfo.name}</span>
                  <span>· {actInfo.power}</span>
                  <span className="ml-auto sm:ml-2 font-mono text-[11px]">
                    {solved % QUESTIONS_PER_ACT}/{QUESTIONS_PER_ACT} trials in this Act · {solved}/{FINAL_BOSS_THRESHOLD} total
                  </span>
                </>
              ) : (
                <>
                  {isPython ? <BookOpen className="w-3.5 h-3.5" /> : <Cpu className="w-3.5 h-3.5" />}
                  <span className="font-medium text-foreground/90">{center.name}</span> · {center.subtitle}
                </>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="rounded-xl border border-border/60 p-3 bg-black/30 flex items-center gap-3">
              <Trophy className="w-5 h-5 text-primary" />
              <div>
                <div className="text-[10px] uppercase text-muted-foreground">Level</div>
                <div className="font-mono font-bold">{level}</div>
              </div>
            </div>
            <div className="rounded-xl border border-border/60 p-3 bg-black/30">
              <div className="flex items-center justify-between text-[10px] uppercase text-muted-foreground">
                <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> XP</span>
                <span className="font-mono">{xp}/{xpForLevel(level)}</span>
              </div>
              <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                     style={{ width: `${Math.min(100, (xp / xpForLevel(level)) * 100)}%` }} />
              </div>
            </div>
            <div className="rounded-xl border border-border/60 p-3 bg-black/30 flex items-center gap-3">
              <Flame className="w-5 h-5 text-accent" />
              <div>
                <div className="text-[10px] uppercase text-muted-foreground">Streak</div>
                <div className="font-mono font-bold">{streak} day{streak === 1 ? "" : "s"}</div>
              </div>
            </div>
          </div>

          {loading && !data && (
            <div className="glass-panel neon-border rounded-3xl p-16 text-center">
              <Loader2 className="w-10 h-10 mx-auto animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground italic">
                {isPython ? "Awakening the next monument…" : "Calibrating the next system…"}
              </p>
            </div>
          )}

          {data && (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Brief */}
              <div className="glass-panel neon-border rounded-3xl p-6 sm:p-7 animate-fade-in">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{data.difficulty}</Badge>
                  {data.topics.slice(0, 4).map((tp) => (
                    <Badge key={tp} variant="outline" className="capitalize text-xs">{tp}</Badge>
                  ))}
                </div>

                <div className="mt-5 flex items-start gap-2 text-xs uppercase tracking-widest text-accent">
                  <BookOpen className="w-3.5 h-3.5 mt-0.5" /> Scene
                </div>
                <p className="mt-1 italic text-foreground/85 leading-relaxed">{data.context}</p>

                <h3 className="mt-5 font-display font-bold text-xl">{data.task}</h3>

                {data.constraints.length > 0 && (
                  <div className="mt-4">
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">Constraints</div>
                    <ul className="mt-2 list-disc pl-5 text-sm space-y-1 text-foreground/85">
                      {data.constraints.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                )}

                <div className="mt-4">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">Expected output</div>
                  <pre className="mt-2 p-3 rounded-xl bg-black/50 border border-border text-xs font-mono text-[hsl(var(--neon-mint))] whitespace-pre-wrap">
{data.expectedOutput}
                  </pre>
                </div>

                <div className="mt-5">
                  <div className="flex items-center justify-between">
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">Hints</div>
                    {shownHints < data.hints.length && (
                      <button
                        onClick={() => setShownHints((s) => s + 1)}
                        className="text-accent hover:text-primary flex items-center gap-1 text-[11px]"
                      >
                        <Lightbulb className="w-3.5 h-3.5" /> Reveal hint {shownHints + 1}
                      </button>
                    )}
                  </div>
                  <div className="mt-2 space-y-2">
                    {data.hints.slice(0, shownHints).map((h, i) => (
                      <div key={i} className="rounded-lg border border-accent/40 bg-accent/5 p-3 text-sm animate-fade-in">
                        <span className="font-mono text-xs text-accent mr-1">#{i + 1}</span>{h}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Editor + verdict */}
              <div className="space-y-4">
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                    Code · {t.language}
                  </div>
                  <Textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    rows={18}
                    spellCheck={false}
                    className="font-mono text-sm bg-black/60 border-border text-foreground min-h-[420px]"
                  />
                </div>
                
                {/* AI Live Feedback Box */}
                <div className="rounded-xl border border-border/60 bg-black/30 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="w-4 h-4 text-primary" />
                    <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">AI Live Insights</span>
                    {isAnalyzing && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground ml-2" />}
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed min-h-[1.25rem]">
                    {liveFeedback || "Start typing code to get live hints..."}
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button variant="hero" size="lg" onClick={submit} disabled={evaluating || !code.trim()}>
                    {evaluating ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Reviewing…</>) :
                                   (<><Send className="w-4 h-4 mr-2" /> Submit for AI review</>)}
                  </Button>
                </div>

                {review && (
                  <div
                    className={`relative overflow-hidden glass-panel neon-border rounded-3xl p-6 animate-fade-in ${
                      review.verdict === "correct" ? "border-[hsl(var(--neon-mint))]" :
                      review.verdict === "partial" ? "border-yellow-400" : "border-destructive"
                    }`}
                  >
                    {review.verdict === "correct" && (
                      <>
                        {Array.from({ length: 14 }).map((_, i) => (
                          <span key={i} className="absolute top-0 w-2 h-2 rounded-full anim-float-up"
                            style={{
                              left: `${(i * 7) % 100}%`,
                              background: ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--neon-mint))"][i % 3],
                              animationDelay: `${i * 0.1}s`, animationDuration: "2.4s",
                            }} />
                        ))}
                      </>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {review.verdict === "correct" && <CheckCircle2 className="w-6 h-6 text-[hsl(var(--neon-mint))] anim-grow" />}
                        {review.verdict === "partial" && <AlertCircle className="w-6 h-6 text-yellow-400" />}
                        {review.verdict === "incorrect" && <XCircle className="w-6 h-6 text-destructive anim-shake" />}
                        <span className="font-display font-bold text-lg capitalize">{review.verdict}</span>
                        <span className="text-xs text-muted-foreground">· {review.score}/100</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full border border-yellow-400/40 bg-yellow-400/10 px-2 py-0.5 text-xs font-bold">
                          <Coins className="w-3 h-3 text-yellow-400" /> +{coinsEarned || 1} coin
                        </span>
                      </div>
                    </div>
                    {leveledUp && (
                      <div className="mt-3 rounded-lg border border-primary/40 bg-primary/10 p-2 text-center text-sm font-bold text-gradient-neon">
                        🎉 Level up! Welcome to L{level}.
                      </div>
                    )}
                    <p className="mt-4 text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">{review.explanation}</p>

                    {review.verdict !== "correct" && review.errorTrace && review.errorTrace.length > 0 && (
                      <div className="mt-5">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-destructive">
                          <AlertCircle className="w-3.5 h-3.5" /> Error backtrace · where it broke
                        </div>
                        <ol className="mt-2 space-y-2">
                          {review.errorTrace.map((err, i) => (
                            <li
                              key={i}
                              className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm animate-fade-in"
                            >
                              <div className="flex items-center gap-2 text-[11px] font-mono text-destructive">
                                <span className="rounded bg-destructive/20 px-1.5 py-0.5">line {err.line}</span>
                                <span className="text-muted-foreground">step {i + 1}</span>
                              </div>
                              {err.snippet && (
                                <pre className="mt-2 p-2 rounded bg-black/60 border border-border/60 text-xs font-mono text-[hsl(var(--neon-mint))] overflow-x-auto whitespace-pre-wrap">
{err.snippet}
                                </pre>
                              )}
                              <div className="mt-2">
                                <span className="font-medium text-destructive/90">Issue:</span>{" "}
                                <span className="text-foreground/90">{err.issue}</span>
                              </div>
                              <div className="mt-1">
                                <span className="font-medium text-yellow-400">Why:</span>{" "}
                                <span className="text-foreground/85">{err.why}</span>
                              </div>
                              <div className="mt-1">
                                <span className="font-medium text-accent">Hint to fix:</span>{" "}
                                <span className="text-foreground/85">{err.fix}</span>
                              </div>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {review.strongConcepts.length > 0 && (
                      <div className="mt-4">
                        <div className="text-xs uppercase tracking-widest text-muted-foreground">You showed strength in</div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {review.strongConcepts.map((c) => <Badge key={c} variant="secondary" className="capitalize">{c}</Badge>)}
                        </div>
                      </div>
                    )}
                    {review.weakConcepts.length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs uppercase tracking-widest text-muted-foreground">Worth revisiting</div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {review.weakConcepts.map((c) => <Badge key={c} variant="outline" className="capitalize">{c}</Badge>)}
                        </div>
                      </div>
                    )}
                    <div className="mt-4 rounded-lg border border-border/60 bg-black/30 p-3 text-sm">
                      <span className="font-medium text-accent">Next:</span> {review.followUpHint}
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <Button variant="hero" onClick={fetchNew} disabled={loading}>
                        Next challenge <RefreshCw className="w-4 h-4 ml-1" />
                      </Button>
                      <Button variant="ghostNeon" onClick={() => nav("/story")}>Back to tracks</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ===== Story Time narrator pop-ups ===== */}
      <NarratorDialog
        open={openingOpen}
        eyebrow={`Story Time · ${t.language}`}
        character="The Mentor"
        avatar={t.emoji}
        title={`${t.name} — Prologue`}
        scenes={openingScenes}
        onClose={closeOpening}
        beepFrequency={500}
      />
      <NarratorDialog
        open={actDialogAct != null}
        eyebrow={`Story Time · ${t.language}`}
        character="The Mentor"
        avatar="📜"
        title={actInfo ? actInfo.name : ""}
        scenes={actScenes}
        onClose={closeActDialog}
        beepFrequency={560}
      />
      <NarratorDialog
        open={bossOpen}
        eyebrow={`Story Time · ${t.language}`}
        character="The Mentor"
        avatar="⚔️"
        title="Final Boss Unlocked"
        scenes={bossScenes}
        onClose={closeBoss}
        beepFrequency={420}
      />
    </div>
  );
};

export default StoryLevel;
