import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/app/Header";
import { XPBar } from "@/components/app/XPBar";
import { MasteryChart } from "@/components/app/MasteryChart";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/app/AuthProvider";
import { TRACKS, centerForLevel, type TrackKind } from "@/lib/tracks";
import { getActiveTrack, setActiveTrack } from "./tracks";
import { Flame, Sparkles, ArrowRight, Cpu } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Saptapath" }] }),
  component: Dashboard,
});

interface Progress { level: number; xp: number; streak: number; current_center: string | null }
interface MasteryRow { topic: string; mastery_score: number }
interface HistRow { id: string; created_at: string; topics: string[]; verdict: string | null; level: number }

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [track, setTrack] = useState<TrackKind | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [mastery, setMastery] = useState<MasteryRow[]>([]);
  const [history, setHistory] = useState<HistRow[]>([]);

  useEffect(() => {
    let t = getActiveTrack();
    if (!t) { navigate({ to: "/tracks" }); return; }
    setTrack(t);
  }, [navigate]);

  useEffect(() => {
    if (!track || !user) return;
    (async () => {
      const { data: prog } = await supabase.from("user_progress").select("level,xp,streak,current_center")
        .eq("user_id", user.id).eq("track", track).maybeSingle();
      setProgress(prog ?? { level: 1, xp: 0, streak: 0, current_center: null });
      const { data: m } = await supabase.from("topic_mastery").select("topic,mastery_score")
        .eq("user_id", user.id).eq("track", track).order("mastery_score", { ascending: false }).limit(8);
      setMastery(m ?? []);
      const { data: h } = await supabase.from("question_history").select("id,created_at,topics,verdict,level")
        .eq("user_id", user.id).eq("track", track).order("created_at", { ascending: false }).limit(6);
      setHistory(h ?? []);
    })();
  }, [track, user]);

  if (!track) return null;
  const t = TRACKS[track];
  const lvl = progress?.level ?? 1;
  const center = centerForLevel(track, lvl);
  const weak = mastery.filter(m => m.mastery_score < 50).slice(0, 4);
  const isPython = track === "python";

  return (
    <div className="min-h-screen" data-track={isPython ? "pythoria" : "yantra"}>
      <Header />
      <main className="mx-auto max-w-7xl px-6 pt-12 pb-24">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{t.codename}</div>
            <h1 className={`mt-1 font-display text-4xl font-semibold ${isPython ? "text-gradient-pythoria" : "text-gradient-yantra"}`}>{t.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">Center: <span className="text-foreground/90">{center.name}</span> · {center.subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => { setActiveTrack(track === "python" ? "cpp" : "python"); window.location.reload(); }}>
              Switch to {track === "python" ? "Yantra" : "Pythoria"}
            </Button>
            <Link to="/challenge"><Button size="sm">Next challenge <ArrowRight className="ml-1 size-4" /></Button></Link>
          </div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <div className="rounded-2xl border border-border/60 p-6" style={{ background: "var(--gradient-surface)" }}>
            <XPBar level={lvl} xp={progress?.xp ?? 0} />
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-border/60 p-6" style={{ background: "var(--gradient-surface)" }}>
            <Flame className="size-9 text-primary" />
            <div>
              <div className="font-display text-2xl font-semibold">{progress?.streak ?? 0} day{(progress?.streak ?? 0) === 1 ? "" : "s"}</div>
              <div className="text-xs text-muted-foreground">Active streak</div>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-border/60 p-6" style={{ background: "var(--gradient-surface)" }}>
            <Cpu className="size-9 text-primary" />
            <div>
              <div className="font-display text-2xl font-semibold">{history.filter(h => h.verdict === "correct").length}</div>
              <div className="text-xs text-muted-foreground">Recent solves</div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-border/60 p-6" style={{ background: "var(--gradient-surface)" }}>
            <h3 className="font-display text-lg font-semibold">Mastery graph</h3>
            <p className="text-xs text-muted-foreground">Topic strength updates with every submission.</p>
            <div className="mt-4">
              <MasteryChart data={mastery.map(m => ({ topic: m.topic, score: m.mastery_score }))} />
            </div>
          </div>
          <div className="rounded-2xl border border-border/60 p-6" style={{ background: "var(--gradient-surface)" }}>
            <h3 className="font-display text-lg font-semibold">Weak concepts</h3>
            {weak.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">No weak areas detected yet. Keep going.</p>
            ) : (
              <ul className="mt-4 space-y-2 text-sm">
                {weak.map(w => (
                  <li key={w.topic} className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
                    <span className="capitalize">{w.topic}</span>
                    <span className="font-mono text-xs text-muted-foreground">{w.mastery_score}%</span>
                  </li>
                ))}
              </ul>
            )}
            <Link to="/challenge" className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary">
              <Sparkles className="size-4" /> Train weak topic now
            </Link>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-border/60 p-6" style={{ background: "var(--gradient-surface)" }}>
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">Recent activity</h3>
            <Link to="/history" className="text-xs text-muted-foreground hover:text-foreground">View all →</Link>
          </div>
          {history.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Your activity will appear here.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border/40">
              {history.map(h => (
                <li key={h.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <span className="font-medium">L{h.level}</span>
                    <span className="ml-2 text-muted-foreground">{h.topics.slice(0, 3).join(" · ")}</span>
                  </div>
                  <span className={`font-mono text-xs ${h.verdict === "correct" ? "text-success" : h.verdict === "partial" ? "text-warning" : "text-muted-foreground"}`}>
                    {h.verdict ?? "in progress"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
