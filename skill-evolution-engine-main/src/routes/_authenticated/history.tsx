import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/app/Header";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/app/AuthProvider";
import { getActiveTrack } from "./tracks";
import type { TrackKind } from "@/lib/tracks";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({ meta: [{ title: "History — Saptapath" }] }),
  component: History,
});

interface Row {
  id: string; created_at: string; level: number; topics: string[]; verdict: string | null;
  prompt: { task?: string } | null; xp_awarded: number;
}

function History() {
  const { user } = useAuth();
  const [track, setTrack] = useState<TrackKind | null>(null);
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => { setTrack(getActiveTrack()); }, []);
  useEffect(() => {
    if (!track || !user) return;
    (async () => {
      const { data } = await supabase.from("question_history")
        .select("id,created_at,level,topics,verdict,prompt,xp_awarded")
        .eq("user_id", user.id).eq("track", track)
        .order("created_at", { ascending: false }).limit(50);
      setRows((data ?? []) as unknown as Row[]);
    })();
  }, [track, user]);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-5xl px-6 pt-12 pb-24">
        <h1 className="font-display text-3xl font-semibold">History</h1>
        <p className="mt-1 text-sm text-muted-foreground">Every challenge you've attempted in this track.</p>
        <div className="mt-8 space-y-3">
          {rows.length === 0 && <div className="rounded-xl border border-border/60 p-8 text-center text-sm text-muted-foreground">No attempts yet.</div>}
          {rows.map(r => (
            <div key={r.id} className="rounded-xl border border-border/60 p-4" style={{ background: "var(--gradient-surface)" }}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-mono">L{r.level}</span> · {new Date(r.created_at).toLocaleString()}
                  </div>
                  <p className="mt-1 truncate text-sm font-medium">{r.prompt?.task ?? "Challenge"}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {r.topics.slice(0, 5).map(t => <Badge key={t} variant="outline" className="text-[10px] capitalize">{t}</Badge>)}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xs font-mono ${r.verdict === "correct" ? "text-success" : r.verdict === "partial" ? "text-warning" : r.verdict === "incorrect" ? "text-destructive" : "text-muted-foreground"}`}>
                    {r.verdict ?? "no submission"}
                  </div>
                  {r.xp_awarded > 0 && <div className="mt-1 text-xs text-primary">+{r.xp_awarded} XP</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
