import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppNavbar } from "@/components/funcode/AppNavbar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Zap, Target, Flame, Swords, ArrowRight, Map as MapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Profile {
  username: string;
  display_name: string | null;
  total_xp: number;
  level: number;
}
interface MatchRow {
  id: string;
  score: number;
  correct_count: number;
  total_questions: number;
  xp_earned: number;
  finished_at: string;
  topics: { name: string; slug: string } | null;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [stats, setStats] = useState({ total: 0, correct: 0, accuracy: 0 });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: p } = await supabase
        .from("profiles")
        .select("username, display_name, total_xp, level")
        .eq("id", user.id)
        .maybeSingle();
      setProfile(p as Profile | null);

      const { data: m } = await supabase
        .from("matches")
        .select("id, score, correct_count, total_questions, xp_earned, finished_at, topics(name, slug)")
        .eq("user_id", user.id)
        .order("finished_at", { ascending: false })
        .limit(8);
      const rows = (m as any) ?? [];
      setMatches(rows);

      const total = rows.reduce((s: number, r: any) => s + r.total_questions, 0);
      const correct = rows.reduce((s: number, r: any) => s + r.correct_count, 0);
      setStats({ total, correct, accuracy: total ? Math.round((correct / total) * 100) : 0 });
    })();
  }, [user]);

  const xp = profile?.total_xp ?? 0;
  const level = profile?.level ?? 1;
  const xpInLevel = xp % 500;
  const pct = Math.round((xpInLevel / 500) * 100);

  return (
    <div className="min-h-screen">
      <AppNavbar />
      <main className="pt-32 pb-20 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <span className="text-xs font-bold tracking-[0.3em] uppercase text-primary">// Pilot HUD</span>
            <h1 className="mt-2 font-display font-black text-3xl sm:text-5xl">
              Welcome, <span className="text-gradient-neon">{profile?.display_name ?? profile?.username ?? "player"}</span>
            </h1>
          </div>

          {/* Stat grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <StatCard icon={Trophy} label="Level" value={level} accent="text-primary" />
            <StatCard icon={Zap} label="Total XP" value={xp.toLocaleString()} accent="text-accent" />
            <StatCard icon={Target} label="Accuracy" value={`${stats.accuracy}%`} accent="text-secondary" />
            <StatCard 
              icon={MapIcon} 
              label="C Story Progress" 
              value={`${parseInt(localStorage.getItem('cStoryMode:solved') || '0', 10)}/100`} 
              accent="text-[hsl(var(--neon-mint))]" 
            />
          </div>

          {/* Level progress */}
          <div className="glass-panel neon-border rounded-2xl p-6 mb-10">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Level {level} → {level + 1}</span>
              <span className="font-mono text-primary">{xpInLevel} / 500 XP</span>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full transition-all duration-700"
                style={{ width: `${pct}%`, background: "var(--gradient-neon)" }}
              />
            </div>
          </div>

          {/* CTA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
            <ActionCard
              to="/topics"
              title="Start a Quiz Battle"
              desc="Pick a topic and grind XP across 12 specialties."
              icon={Swords}
              variant="hero"
            />
            <ActionCard
              to="/leaderboard"
              title="View Global Ranks"
              desc="See where you stand against the grid."
              icon={Trophy}
              variant="ghostNeon"
            />
          </div>

          {/* Recent matches */}
          <h2 className="font-display font-black text-2xl mb-4">Recent Runs</h2>
          {matches.length === 0 ? (
            <div className="glass-panel rounded-2xl p-10 text-center text-muted-foreground">
              No matches yet. <Link to="/topics" className="text-primary hover:underline">Start your first run →</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {matches.map((m) => (
                <div key={m.id} className="glass-panel neon-border rounded-2xl p-5">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                    {m.topics?.name ?? "Mixed"}
                  </div>
                  <div className="font-display font-black text-3xl text-gradient-neon">
                    {m.correct_count}/{m.total_questions}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-accent">+{m.xp_earned} XP</span>
                    <span className="text-muted-foreground">
                      {new Date(m.finished_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const StatCard = ({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: any;
  label: string;
  value: React.ReactNode;
  accent: string;
}) => (
  <div className="glass-panel neon-border rounded-2xl p-5">
    <Icon className={`w-6 h-6 ${accent} mb-3`} />
    <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
    <div className="font-display font-black text-2xl mt-1">{value}</div>
  </div>
);

const ActionCard = ({
  to,
  title,
  desc,
  icon: Icon,
  variant,
}: {
  to: string;
  title: string;
  desc: string;
  icon: any;
  variant: "hero" | "ghostNeon";
}) => (
  <Link to={to} className="group glass-panel neon-border rounded-2xl p-7 transition-transform hover:-translate-y-1">
    <Icon className="w-9 h-9 text-primary mb-4 group-hover:scale-110 transition-transform" />
    <h3 className="font-display font-black text-xl">{title}</h3>
    <p className="text-sm text-muted-foreground mt-1.5">{desc}</p>
    <Button variant={variant} size="sm" className="mt-5">
      Go <ArrowRight className="w-4 h-4 ml-1" />
    </Button>
  </Link>
);

export default Dashboard;
