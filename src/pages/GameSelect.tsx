import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AppNavbar } from "@/components/funcode/AppNavbar";
import { supabase } from "@/integrations/supabase/client";
import { GAMES } from "@/lib/games";
import { useTier } from "@/hooks/useTier";
import { Button } from "@/components/ui/button";
import { Crown, Lock, Play, Sparkles, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const GameSelect = () => {
  const { slug } = useParams();
  const nav = useNavigate();
  const { isPro, isElite } = useTier();
  const [topic, setTopic] = useState<{ id: string; name: string; category: string } | null>(null);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | "mixed">("mixed");

  useEffect(() => {
    if (!slug) return;
    supabase
      .from("topics")
      .select("id, name, category")
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) {
          toast.error("Topic not found");
          nav("/topics");
        } else setTopic(data as any);
      });
  }, [slug, nav]);

  const canPlay = (tier: "free" | "pro" | "elite") => {
    if (tier === "free") return true;
    if (tier === "elite") return isElite;
    return isPro || isElite;
  };

  return (
    <div className="min-h-screen">
      <AppNavbar />
      <main className="pt-32 pb-20 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <Link
            to="/topics"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-primary mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> All Topics
          </Link>
          <span className="text-xs font-bold tracking-[0.3em] uppercase text-accent">// {topic?.category ?? "Loading"}</span>
          <h1 className="mt-2 font-display font-black text-3xl sm:text-5xl">
            <span className="text-gradient-neon">{topic?.name ?? "..."}</span> · Choose Game
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            7 game modes. Always-fresh AI questions. Solo or party of up to 4.
          </p>

          {/* Difficulty */}
          <div className="glass-panel neon-border rounded-2xl p-4 my-6 flex flex-wrap items-center gap-3">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Difficulty:</span>
            {(["easy", "medium", "hard", "mixed"] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-colors ${
                  difficulty === d
                    ? "border-primary text-primary bg-primary/10"
                    : "border-border text-muted-foreground hover:text-primary"
                }`}
              >
                {d}
              </button>
            ))}
            <span className="ml-auto flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-accent">
              <Sparkles className="w-3.5 h-3.5" /> Always AI-generated
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {GAMES.map((g) => {
              const Icon = g.icon;
              const allowed = canPlay(g.tier);
              return (
                <div
                  key={g.id}
                  className={`relative group glass-panel neon-border rounded-2xl p-6 flex flex-col transition-transform ${
                    allowed ? "hover:-translate-y-1" : "opacity-70"
                  }`}
                >
                  {g.tier !== "free" && (
                    <span
                      className={`absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full ${
                        g.tier === "elite"
                          ? "bg-accent/15 text-accent border border-accent/40"
                          : "bg-primary/15 text-primary border border-primary/40"
                      }`}
                    >
                      <Crown className="w-3 h-3" /> {g.tier === "elite" ? "Elite" : "Pro"}
                    </span>
                  )}
                  <div
                    className="w-12 h-12 rounded-xl p-[1px] mb-4"
                    style={{ background: "var(--gradient-neon)" }}
                  >
                    <div className="w-full h-full rounded-xl bg-card flex items-center justify-center">
                      <Icon className={`w-6 h-6 ${g.accent}`} />
                    </div>
                  </div>
                  <h3 className="font-display font-black text-xl">{g.name}</h3>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mt-0.5">{g.tagline}</p>
                  <p className="text-sm text-muted-foreground mt-3 flex-1">{g.description}</p>
                  <div className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="px-2 py-0.5 rounded bg-muted">{g.questionCount} Qs</span>
                    <span className="px-2 py-0.5 rounded bg-muted">{g.timePerQ}s each</span>
                  </div>
                  {allowed ? (
                    <Button
                      variant="hero"
                      size="sm"
                      className="mt-5 w-full"
                      onClick={() =>
                        nav(`/lobby/${slug}/${g.id}?difficulty=${difficulty}`)
                      }
                    >
                      <Play className="w-3.5 h-3.5 mr-1.5" /> Play
                    </Button>
                  ) : (
                    <Button
                      variant="ghostNeon"
                      size="sm"
                      className="mt-5 w-full"
                      onClick={() => nav("/pricing")}
                    >
                      <Lock className="w-3.5 h-3.5 mr-1.5" /> Unlock
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default GameSelect;
