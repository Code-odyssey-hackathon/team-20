import { useEffect, useState } from "react";
import { AppNavbar } from "@/components/funcode/AppNavbar";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Medal, Award } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Row {
  id: string;
  username: string;
  display_name: string | null;
  total_xp: number;
  level: number;
  matches_played: number;
  total_correct: number;
}

const Leaderboard = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    supabase
      .from("leaderboard")
      .select("*")
      .order("total_xp", { ascending: false })
      .limit(100)
      .then(({ data }) => setRows((data as Row[]) ?? []));
  }, []);

  const medal = (i: number) => {
    if (i === 0) return <Trophy className="w-5 h-5 text-primary" />;
    if (i === 1) return <Medal className="w-5 h-5 text-secondary" />;
    if (i === 2) return <Award className="w-5 h-5 text-accent" />;
    return <span className="text-muted-foreground font-mono text-sm">{i + 1}</span>;
  };

  return (
    <div className="min-h-screen">
      <AppNavbar />
      <main className="pt-32 pb-20 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <span className="text-xs font-bold tracking-[0.3em] uppercase text-accent">// Global Ranks</span>
            <h1 className="mt-2 font-display font-black text-3xl sm:text-5xl">
              The <span className="text-gradient-neon">Leaderboard</span>
            </h1>
          </div>

          <div className="glass-panel neon-border rounded-2xl overflow-hidden">
            <div className="grid grid-cols-12 gap-2 px-4 sm:px-6 py-3 text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border">
              <div className="col-span-1">#</div>
              <div className="col-span-5 sm:col-span-6">Pilot</div>
              <div className="col-span-2 text-right">Lvl</div>
              <div className="col-span-2 text-right">Matches</div>
              <div className="col-span-2 text-right">XP</div>
            </div>
            {rows.length === 0 && (
              <div className="p-10 text-center text-muted-foreground">No rankings yet — be the first.</div>
            )}
            {rows.map((r, i) => (
              <div
                key={r.id}
                className={`grid grid-cols-12 gap-2 px-4 sm:px-6 py-3.5 items-center border-b border-border/50 last:border-0 transition-colors ${
                  user?.id === r.id ? "bg-primary/10" : "hover:bg-muted/30"
                }`}
              >
                <div className="col-span-1 flex items-center">{medal(i)}</div>
                <div className="col-span-5 sm:col-span-6 truncate">
                  <div className="font-display font-bold text-sm sm:text-base truncate">
                    {r.display_name || r.username}
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">@{r.username}</div>
                </div>
                <div className="col-span-2 text-right font-mono text-sm text-primary">{r.level}</div>
                <div className="col-span-2 text-right font-mono text-sm text-muted-foreground">{r.matches_played}</div>
                <div className="col-span-2 text-right font-mono text-sm text-accent">{r.total_xp}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Leaderboard;
