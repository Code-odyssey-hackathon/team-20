import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppNavbar } from "@/components/funcode/AppNavbar";
import { Button } from "@/components/ui/button";
import { TRACKS, ALL_TRACK_IDS, type TrackKind, xpForLevel } from "@/lib/tracks";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ArrowRight, Flame, Sparkles, Trophy } from "lucide-react";

interface ProgressRow {
  track: TrackKind;
  level: number;
  xp: number;
  streak: number;
  current_center: string | null;
}

const ACCENTS: Record<TrackKind, { gradient: string; glow: string; orb: string }> = {
  c: {
    gradient: "from-violet-500/20 via-fuchsia-500/10 to-purple-500/20",
    glow: "hover:shadow-[0_0_50px_-8px_hsl(280_100%_65%/0.6)]",
    orb: "linear-gradient(135deg,#a78bfa,#7c3aed)",
  },
  cpp: {
    gradient: "from-cyan-400/20 via-primary/10 to-blue-500/20",
    glow: "hover:shadow-[0_0_50px_-8px_hsl(186_100%_50%/0.6)]",
    orb: "linear-gradient(135deg,#00f5ff,#4a90ff)",
  },
  python: {
    gradient: "from-yellow-500/20 via-orange-500/10 to-amber-500/20",
    glow: "hover:shadow-[0_0_50px_-8px_hsl(40_100%_60%/0.6)]",
    orb: "linear-gradient(135deg,#ffb347,#ff7e5f)",
  },
  java: {
    gradient: "from-emerald-500/20 via-green-500/10 to-teal-500/20",
    glow: "hover:shadow-[0_0_50px_-8px_hsl(150_80%_50%/0.6)]",
    orb: "linear-gradient(135deg,#34d399,#059669)",
  },
};

const StoryMap = () => {
  const nav = useNavigate();
  const { user } = useAuth();
  const [progress, setProgress] = useState<Record<TrackKind, ProgressRow | null>>({
    python: null, cpp: null, c: null, java: null,
  });

  useEffect(() => {
    if (!user) return;
    supabase
      .from("user_progress")
      .select("track,level,xp,streak,current_center")
      .eq("user_id", user.id)
      .then(({ data }) => {
        const map: Record<TrackKind, ProgressRow | null> = { python: null, cpp: null, c: null, java: null };
        (data ?? []).forEach((r: any) => {
          if (map[r.track as TrackKind] !== undefined) map[r.track as TrackKind] = r;
        });
        setProgress(map);
      });
  }, [user]);

  return (
    <div className="min-h-screen">
      <AppNavbar />
      <main className="pt-32 pb-20 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-accent">// Story Time · Choose Your Language</span>
            <h1 className="mt-3 font-display font-black text-4xl sm:text-5xl text-gradient-neon">Pick your weapon</h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base text-muted-foreground">
              Four languages. The same hero's journey. 6 Acts × 10 trials = 60 challenges. Survive them all to face the Final Boss.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {ALL_TRACK_IDS.map((id) => {
              const t = TRACKS[id];
              const p = progress[id];
              const lvl = p?.level ?? 1;
              const accent = ACCENTS[id];
              const solved = (() => {
                try {
                  return parseInt(localStorage.getItem(`storyTime:${id}:solved`) ?? "0", 10) || 0;
                } catch { return 0; }
              })();
              return (
                <button
                  key={id}
                  onClick={() => nav(id === "c" ? `/story/c/play` : `/story/${id}`)}
                  className={`group relative text-left overflow-hidden glass-panel neon-border rounded-3xl p-7 transition-all hover:-translate-y-1 ${accent.glow} bg-gradient-to-br ${accent.gradient}`}
                >
                  <div
                    className="absolute -right-16 -top-16 size-56 rounded-full opacity-30 blur-3xl"
                    style={{ background: accent.orb }}
                  />
                  <div className="relative z-10">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{t.codename}</div>
                    <h2 className="mt-2 font-display font-black text-3xl sm:text-4xl text-gradient-neon">{t.name}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{t.language} · {t.tagline}</p>
                    <p className="mt-4 italic text-foreground/80 text-sm leading-relaxed max-w-md">"{t.feeling}"</p>

                    <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                      <div className="rounded-xl border border-border/60 p-3 bg-black/30">
                        <div className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Trophy className="w-3 h-3" /> Level</div>
                        <div className="font-mono font-bold text-lg">{lvl}</div>
                      </div>
                      <div className="rounded-xl border border-border/60 p-3 bg-black/30">
                        <div className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Sparkles className="w-3 h-3" /> XP</div>
                        <div className="font-mono font-bold text-lg">{p?.xp ?? 0}<span className="text-muted-foreground text-xs">/{xpForLevel(lvl)}</span></div>
                      </div>
                      <div className="rounded-xl border border-border/60 p-3 bg-black/30">
                        <div className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Flame className="w-3 h-3" /> Streak</div>
                        <div className="font-mono font-bold text-lg">{p?.streak ?? 0}</div>
                      </div>
                    </div>

                    <div className="mt-5 rounded-xl border border-border/60 bg-black/30 p-3">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-accent">
                        <span aria-hidden>{t.emoji}</span> Story progress
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="font-mono">{Math.min(solved, 60)} / 60 trials</span>
                        <span className="text-muted-foreground">Act {Math.min(6, Math.floor(solved / 10) + 1)} / 6</span>
                      </div>
                      <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                          style={{ width: `${Math.min(100, (solved / 60) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <Button variant="hero" size="lg" className="mt-6 w-full group-hover:scale-[1.02] transition-transform">
                      {solved > 0 ? "Continue journey" : "Begin your story"} <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-10 text-center text-xs text-muted-foreground">
            Same hero. Same Acts. Each language teaches a different set of powers.
          </div>
        </div>
      </main>
    </div>
  );
};

export default StoryMap;
