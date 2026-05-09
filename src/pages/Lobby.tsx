import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AppNavbar } from "@/components/funcode/AppNavbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getGame, PARTY_SIZES } from "@/lib/games";
import { ArrowLeft, Copy, Crown, Gamepad2, Loader2, LogIn, Play, Users } from "lucide-react";
import { toast } from "sonner";

const genCode = () => {
  const c = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => c[Math.floor(Math.random() * c.length)]).join("");
};

const Lobby = () => {
  const { slug, gameType } = useParams();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const difficulty = params.get("difficulty") ?? "mixed";
  const game = gameType ? getGame(gameType) : null;

  const [topic, setTopic] = useState<{ id: string; name: string } | null>(null);
  const [partySize, setPartySize] = useState<number>(1);
  const [joinCode, setJoinCode] = useState("");
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!slug) return;
    supabase
      .from("topics")
      .select("id, name")
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data }) => setTopic(data as any));
  }, [slug]);

  const startSolo = () => {
    nav(`/play/${slug}/${gameType}?difficulty=${difficulty}&solo=1`);
  };

  const createRoom = async () => {
    if (!user || !topic || !game) return;
    setCreating(true);
    try {
      const code = genCode();
      const { data: room, error } = await supabase
        .from("rooms")
        .insert({
          code,
          host_id: user.id,
          topic_id: topic.id,
          game_type: game.id,
          party_size: partySize,
          status: "lobby",
        })
        .select()
        .single();
      if (error) throw error;
      await supabase.from("room_members").insert({ room_id: room.id, user_id: user.id });
      nav(`/room/${room.id}?difficulty=${difficulty}`);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to create room");
    } finally {
      setCreating(false);
    }
  };

  const joinRoom = async () => {
    const code = joinCode.trim().toUpperCase();
    if (code.length !== 6) {
      toast.error("Enter a 6-character code");
      return;
    }
    if (!user) return;
    setJoining(true);
    try {
      const { data: room, error } = await supabase
        .from("rooms")
        .select("id, status, party_size")
        .eq("code", code)
        .maybeSingle();
      if (error || !room) throw new Error("Room not found");
      if (room.status === "ended") throw new Error("Room already ended");
      if (room.status === "playing") throw new Error("Match already in progress");
      const { count } = await supabase
        .from("room_members")
        .select("user_id", { count: "exact", head: true })
        .eq("room_id", room.id);
      const { data: existing } = await supabase
        .from("room_members")
        .select("user_id")
        .eq("room_id", room.id)
        .eq("user_id", user.id)
        .maybeSingle();
      if (!existing && (count ?? 0) >= room.party_size) {
        throw new Error("Room is full");
      }
      if (!existing) {
        const { error: joinErr } = await supabase
          .from("room_members")
          .insert({ room_id: room.id, user_id: user.id });
        if (joinErr && !joinErr.message.includes("duplicate")) throw joinErr;
      }
      nav(`/room/${room.id}`);
    } catch (e: any) {
      toast.error(e?.message ?? "Could not join");
    } finally {
      setJoining(false);
    }
  };

  if (!game) {
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

  return (
    <div className="min-h-screen">
      <AppNavbar />
      <main className="pt-32 pb-20 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <button
            onClick={() => nav(`/games/${slug}`)}
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-primary mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Game Modes
          </button>

          <div className="glass-panel neon-border rounded-3xl p-6 sm:p-8 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl p-[1px]" style={{ background: "var(--gradient-neon)" }}>
                <div className="w-full h-full rounded-xl bg-card flex items-center justify-center">
                  <Icon className={`w-7 h-7 ${game.accent}`} />
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">{topic?.name ?? "..."}</div>
                <h1 className="font-display font-black text-2xl sm:text-3xl">
                  {game.name} {game.premium && <Crown className="inline w-5 h-5 text-primary -mt-1" />}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">{game.description}</p>
              </div>
            </div>
          </div>

          {/* Party size */}
          <div className="glass-panel neon-border rounded-3xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-primary" />
              <h2 className="font-display font-black text-lg">Party Size</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PARTY_SIZES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPartySize(p.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    partySize === p.id
                      ? "border-primary bg-primary/10 shadow-[var(--glow-cyan)]"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="font-display font-black text-xl">{p.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Create / Solo */}
            <div className="glass-panel neon-border rounded-3xl p-6">
              <h2 className="font-display font-black text-xl flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-primary" />
                {partySize === 1 ? "Start Solo" : "Create Room"}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {partySize === 1
                  ? "Jump straight into a solo run. Score counts toward leaderboard."
                  : `Generates a 6-char join code. Share it with up to ${partySize - 1} friend${partySize > 2 ? "s" : ""}.`}
              </p>
              <Button
                variant="hero"
                className="w-full mt-5"
                disabled={creating}
                onClick={partySize === 1 ? startSolo : createRoom}
              >
                {creating ? (
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-1.5" />
                )}
                {partySize === 1 ? "Start Solo" : "Create Room"}
              </Button>
            </div>

            {/* Join */}
            <div className="glass-panel neon-border rounded-3xl p-6">
              <h2 className="font-display font-black text-xl flex items-center gap-2">
                <LogIn className="w-5 h-5 text-accent" />
                Join Room
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Got a code from your squad? Drop it here.
              </p>
              <div className="flex gap-2 mt-5">
                <Input
                  placeholder="ABCD12"
                  maxLength={6}
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="font-mono tracking-[0.4em] text-center text-lg uppercase"
                />
                <Button variant="ghostNeon" disabled={joining} onClick={joinRoom}>
                  {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : "Join"}
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground mt-3">
                Join works for ANY game type — host's settings are used.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Lobby;
