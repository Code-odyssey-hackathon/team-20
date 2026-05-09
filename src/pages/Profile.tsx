import { useEffect, useState } from "react";
import { AppNavbar } from "@/components/funcode/AppNavbar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { z } from "zod";
import { Loader2 } from "lucide-react";

const schema = z.object({
  display_name: z.string().trim().min(1).max(40),
  bio: z.string().trim().max(280).optional().or(z.literal("")),
});

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setUsername(data.username);
          setDisplayName(data.display_name ?? "");
          setBio(data.bio ?? "");
          setXp(data.total_xp);
          setLevel(data.level);
        }
        setLoading(false);
      });
  }, [user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const parsed = schema.safeParse({ display_name: displayName, bio });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: parsed.data.display_name, bio: parsed.data.bio || null })
      .eq("id", user.id);
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Profile updated");
  };

  return (
    <div className="min-h-screen">
      <AppNavbar />
      <main className="pt-32 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <span className="text-xs font-bold tracking-[0.3em] uppercase text-primary">// Pilot Profile</span>
            <h1 className="mt-2 font-display font-black text-3xl sm:text-5xl text-gradient-neon">Your Identity</h1>
          </div>

          <div className="glass-panel neon-border rounded-2xl p-6 mb-6 grid grid-cols-3 gap-4">
            <Stat label="Level" value={level} />
            <Stat label="Total XP" value={xp.toLocaleString()} />
            <Stat label="Callsign" value={`@${username || "—"}`} small />
          </div>

          {loading ? (
            <div className="grid place-items-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <form onSubmit={save} className="glass-panel neon-border rounded-2xl p-6 space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="dn">Display name</Label>
                <Input id="dn" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={40} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} maxLength={280} rows={4} />
                <div className="text-[11px] text-muted-foreground text-right">{bio.length}/280</div>
              </div>
              <Button type="submit" variant="hero" disabled={busy}>
                {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save
              </Button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

const Stat = ({ label, value, small }: { label: string; value: React.ReactNode; small?: boolean }) => (
  <div className="rounded-xl border border-border p-4">
    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
    <div className={`font-display font-black mt-1 text-gradient-neon ${small ? "text-lg truncate" : "text-2xl"}`}>
      {value}
    </div>
  </div>
);

export default Profile;
