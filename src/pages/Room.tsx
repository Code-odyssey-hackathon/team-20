import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AppNavbar } from "@/components/funcode/AppNavbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getGame } from "@/lib/games";
import { generateGameQuestions } from "@/lib/gemini";
import { Copy, Crown, Loader2, Play, Users } from "lucide-react";
import { toast } from "sonner";

interface Room {
  id: string;
  code: string;
  host_id: string;
  topic_id: string;
  game_type: string;
  party_size: number;
  status: string;
  questions: any;
}

interface Member {
  user_id: string;
  score: number;
  correct_count: number;
  finished: boolean;
  username?: string;
  display_name?: string | null;
}

const Room = () => {
  const { id } = useParams();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [topicName, setTopicName] = useState("");
  const [starting, setStarting] = useState(false);

  // Initial load
  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data: r } = await supabase.from("rooms").select("*").eq("id", id).maybeSingle();
      if (!r) {
        toast.error("Room not found");
        nav("/dashboard");
        return;
      }
      setRoom(r as any);
      const { data: t } = await supabase.from("topics").select("name").eq("id", r.topic_id).maybeSingle();
      setTopicName((t as any)?.name ?? "");
      await loadMembers(r.id);
    })();
  }, [id]);

  const loadMembers = async (roomId: string) => {
    const { data } = await supabase
      .from("room_members")
      .select("user_id, score, correct_count, finished")
      .eq("room_id", roomId);
    const list = (data as any[]) ?? [];
    if (list.length) {
      const ids = list.map((m) => m.user_id);
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, username, display_name")
        .in("id", ids);
      const profMap = new Map((profs ?? []).map((p: any) => [p.id, p]));
      setMembers(
        list.map((m) => ({
          ...m,
          username: profMap.get(m.user_id)?.username,
          display_name: profMap.get(m.user_id)?.display_name,
        })),
      );
    } else setMembers([]);
  };

  // Realtime
  useEffect(() => {
    if (!id) return;
    const ch = supabase
      .channel(`room:${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "room_members", filter: `room_id=eq.${id}` }, () =>
        loadMembers(id),
      )
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "rooms", filter: `id=eq.${id}` }, (p) => {
        const r = p.new as any;
        setRoom((prev) => (prev ? { ...prev, ...r } : r));
        if (r.status === "playing" && r.questions) {
          nav(`/play/${room?.topic_id}/${r.game_type}?room=${id}`, { replace: true });
        }
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, room?.topic_id]);

  const isHost = !!user && room?.host_id === user.id;
  const game = room ? getGame(room.game_type) : null;
  const difficulty = params.get("difficulty") ?? "mixed";

  const copyCode = () => {
    if (!room) return;
    navigator.clipboard.writeText(room.code);
    toast.success("Code copied");
  };

  const startMatch = async () => {
    if (!room || !game) return;
    if (members.length < room.party_size) {
      toast.error(`Waiting for ${room.party_size - members.length} more player${room.party_size - members.length > 1 ? "s" : ""} to join.`);
      return;
    }
    setStarting(true);
    try {
      // (Eco Action removed — all remaining games use AI generation.)

      const { data: topic } = await supabase.from("topics").select("name").eq("id", room.topic_id).maybeSingle();
      let qs: any[] = [];
      try {
        const data = await generateGameQuestions(
          (topic as any).name,
          game.id,
          difficulty === "mixed" ? "medium" : difficulty,
          game.questionCount
        );
        qs = data?.questions ?? [];
      } catch (err: any) {
        console.error("Gemini API Error", err);
        throw new Error(err.message || "AI returned an error");
      }
      if (qs.length === 0) throw new Error("AI returned no questions");

      await supabase
        .from("rooms")
        .update({ questions: qs, status: "playing", started_at: new Date().toISOString() })
        .eq("id", room.id);

      nav(`/play/${room.topic_id}/${game.id}?room=${room.id}`);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to start");
    } finally {
      setStarting(false);
    }
  };

  if (!room || !game) {
    return (
      <div className="min-h-screen">
        <AppNavbar />
        <main className="pt-40 grid place-items-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  const Icon = game.icon;
  const filled = members.length;

  return (
    <div className="min-h-screen">
      <AppNavbar />
      <main className="pt-32 pb-20 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <span className="text-xs font-bold tracking-[0.3em] uppercase text-accent">// Lobby</span>
          <h1 className="mt-2 font-display font-black text-3xl sm:text-4xl">
            <span className="text-gradient-neon">{topicName}</span> · {game.name}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
            {/* Code */}
            <div className="glass-panel neon-border rounded-3xl p-6">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Room Code</div>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-mono font-black text-4xl sm:text-5xl tracking-[0.3em] text-gradient-neon">
                  {room.code}
                </span>
                <Button variant="ghostNeon" size="sm" onClick={copyCode}>
                  <Copy className="w-3.5 h-3.5 mr-1" /> Copy
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Share this with your party. Up to {room.party_size} players.
              </p>
            </div>

            {/* Status */}
            <div className="glass-panel neon-border rounded-3xl p-6">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Mode</div>
              <div className="mt-2 flex items-center gap-3">
                <Icon className={`w-7 h-7 ${game.accent}`} />
                <div>
                  <div className="font-display font-black text-xl">
                    {game.name}
                    {game.premium && <Crown className="inline w-4 h-4 text-primary ml-1.5 -mt-0.5" />}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {game.questionCount} questions · {game.timePerQ}s each
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Members */}
          <div className="glass-panel neon-border rounded-3xl p-6 mt-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <h2 className="font-display font-black text-lg">
                  Players ({filled}/{room.party_size})
                </h2>
              </div>
              {room.status === "playing" && (
                <span className="text-xs uppercase tracking-widest text-accent animate-pulse">Live</span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Array.from({ length: room.party_size }).map((_, i) => {
                const m = members[i];
                return (
                  <div
                    key={i}
                    className={`p-4 rounded-xl border ${
                      m ? "border-primary/50 bg-primary/5" : "border-dashed border-border"
                    }`}
                  >
                    {m ? (
                      <>
                        <div className="font-display font-black truncate">
                          {m.display_name ?? m.username ?? "Player"}
                          {m.user_id === room.host_id && (
                            <Crown className="inline w-3.5 h-3.5 text-primary ml-1 -mt-0.5" />
                          )}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {room.status === "playing" || room.status === "ended"
                            ? `Score ${m.score}${m.finished ? " ✓" : ""}`
                            : "Ready"}
                        </div>
                      </>
                    ) : (
                      <div className="text-xs text-muted-foreground">Waiting…</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Controls */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            {isHost && room.status === "lobby" && (
              <Button
                variant="hero"
                className="flex-1"
                disabled={starting || filled < room.party_size}
                onClick={startMatch}
              >
                {starting ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Play className="w-4 h-4 mr-1.5" />}
                {filled < room.party_size
                  ? `Waiting for ${room.party_size - filled} more…`
                  : "Start Match"}
              </Button>
            )}
            {!isHost && room.status === "lobby" && (
              <div className="flex-1 text-center text-sm text-muted-foreground glass-panel rounded-xl py-3">
                {filled < room.party_size
                  ? `Lobby filling… ${filled}/${room.party_size}`
                  : "Waiting for host to start…"}
              </div>
            )}
            {room.status === "playing" && (
              <Button
                variant="hero"
                className="flex-1"
                onClick={() => nav(`/play/${room.topic_id}/${room.game_type}?room=${room.id}`)}
              >
                Enter Match
              </Button>
            )}
            <Button variant="ghost" onClick={() => nav("/dashboard")}>
              Leave
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Room;
