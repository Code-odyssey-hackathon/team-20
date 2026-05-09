import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppNavbar } from "@/components/funcode/AppNavbar";
import { supabase } from "@/integrations/supabase/client";
import * as Icons from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface Topic {
  id: string;
  slug: string;
  name: string;
  category: string;
  icon: string | null;
  description: string | null;
}

const Topics = () => {
  const nav = useNavigate();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [filter, setFilter] = useState<string>("All");

  useEffect(() => {
    supabase
      .from("topics")
      .select("*")
      .order("category")
      .order("name")
      .then(({ data }) => {
        const all = (data as Topic[]) ?? [];
        // Sustainability category was removed along with the Eco Action game.
        const SUSTAIN_SLUGS = new Set([
          "water-saving", "energy-saving", "recycling",
          "hand-hygiene", "reforestation", "climate-action",
        ]);
        setTopics(all.filter((t) => t.category !== "Sustainability" && !SUSTAIN_SLUGS.has(t.slug)));
      });
  }, []);

  const categories = useMemo(() => ["All", ...Array.from(new Set(topics.map((t) => t.category)))], [topics]);
  const filtered = filter === "All" ? topics : topics.filter((t) => t.category === filter);

  return (
    <div className="min-h-screen">
      <AppNavbar />
      <main className="pt-32 pb-20 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <span className="text-xs font-bold tracking-[0.3em] uppercase text-accent">// Pick a Battle</span>
            <h1 className="mt-2 font-display font-black text-3xl sm:text-5xl">
              Choose Your <span className="text-gradient-neon">Topic</span>
            </h1>
            <p className="mt-3 text-muted-foreground max-w-2xl">
              23+ topics across languages, web, systems, and theory. 7 game modes per topic. Always-fresh AI questions.
            </p>
          </div>

          <div className="glass-panel neon-border rounded-2xl p-4 mb-8 flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-muted-foreground mr-1">Filter:</span>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-colors ${
                  filter === c
                    ? "border-primary text-primary bg-primary/10"
                    : "border-border text-muted-foreground hover:text-primary"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <button
            onClick={() => nav("/story")}
            className="w-full text-left mb-6 group glass-panel neon-border rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-primary/15 via-accent/10 to-secondary/15 hover:-translate-y-1 transition-transform"
          >
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-accent">// New · Adaptive Story Tracks</span>
                <h3 className="mt-1 font-display font-black text-2xl sm:text-3xl text-gradient-neon">Pythoria & Project Yantra</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                  Two narrative coding worlds — Python (Pythoria) and C++ (Project Yantra). 100 adaptive levels each, AI-generated challenges tuned to your weak topics, mastery graph, streaks and XP.
                </p>
              </div>
              <Button variant="hero" size="lg" className="group-hover:scale-105 transition-transform">
                Choose your path <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((t) => {
              const Icon = ((Icons as any)[t.icon ?? "Code"] ?? Icons.Code) as React.ComponentType<{
                className?: string;
              }>;
              return (
                <div
                  key={t.id}
                  className="group glass-panel neon-border rounded-2xl p-5 flex flex-col transition-transform hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-11 h-11 rounded-xl p-[1px]" style={{ background: "var(--gradient-neon)" }}>
                      <div className="w-full h-full rounded-xl bg-card flex items-center justify-center">
                        <Icon className="w-5 h-5 text-foreground" />
                      </div>
                    </div>
                    <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border border-border text-muted-foreground">
                      {t.category}
                    </span>
                  </div>
                  <h3 className="font-display font-black text-lg group-hover:text-primary transition-colors">
                    {t.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1.5 flex-1 leading-relaxed">{t.description}</p>
                  <Button variant="hero" size="sm" className="mt-4 w-full" onClick={() => nav(`/games/${t.slug}`)}>
                    Choose Game <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Topics;
