import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppNavbar } from "@/components/funcode/AppNavbar";
import { Button } from "@/components/ui/button";
import { TIERS } from "@/lib/games";
import { useTier } from "@/hooks/useTier";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Check, Crown, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

const Pricing = () => {
  const { tier, refresh } = useTier();
  const { user } = useAuth();
  const nav = useNavigate();
  const [busy, setBusy] = useState<string | null>(null);

  const upgrade = async (next: "free" | "pro" | "elite") => {
    if (!user) {
      nav("/auth");
      return;
    }
    setBusy(next);
    try {
      // Mock upgrade — payments coming soon
      const { error } = await supabase.from("profiles").update({ tier: next }).eq("id", user.id);
      if (error) throw error;
      toast.success(`Switched to ${next.toUpperCase()} (demo mode)`);
      refresh();
      window.location.reload();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="min-h-screen">
      <AppNavbar />
      <main className="pt-32 pb-24 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <span className="text-xs font-bold tracking-[0.4em] uppercase text-accent">// Subscriptions</span>
            <h1 className="mt-3 font-display font-black text-4xl sm:text-6xl">
              Pick Your <span className="text-gradient-neon">Power Level</span>
            </h1>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Unlock premium games, faster matchmaking, and exclusive nameplates. Cancel anytime.
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-primary border border-primary/40 rounded-full px-3 py-1">
              <Sparkles className="w-3.5 h-3.5" />
              Demo mode — payments arriving soon. Switch tiers freely to preview.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TIERS.map((t) => {
              const isCurrent = tier === t.id;
              const featured = t.id === "pro";
              return (
                <div
                  key={t.id}
                  className={`relative glass-panel neon-border rounded-3xl p-7 flex flex-col ${
                    featured ? "scale-[1.02] shadow-[var(--shadow-elevated)]" : ""
                  }`}
                >
                  {"badge" in t && t.badge && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-primary text-primary-foreground">
                      {t.badge}
                    </span>
                  )}
                  <div className={`flex items-center gap-2 ${t.color}`}>
                    {t.id !== "free" && <Crown className="w-5 h-5" />}
                    <h3 className="font-display font-black text-2xl">{t.name}</h3>
                  </div>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="font-display font-black text-5xl text-gradient-neon">{t.price}</span>
                    <span className="text-sm text-muted-foreground">{t.period}</span>
                  </div>
                  <ul className="mt-6 space-y-2.5 flex-1">
                    {t.perks.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-[hsl(var(--neon-mint))] shrink-0 mt-0.5" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={isCurrent ? "ghost" : featured ? "hero" : "ghostNeon"}
                    className="w-full mt-7"
                    disabled={isCurrent || busy === t.id}
                    onClick={() => upgrade(t.id as any)}
                  >
                    {busy === t.id ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : null}
                    {isCurrent ? "Current Plan" : t.cta}
                  </Button>
                </div>
              );
            })}
          </div>

          <div className="glass-panel neon-border rounded-3xl p-8 mt-12 text-center">
            <h2 className="font-display font-black text-2xl">Real payments coming online soon</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto text-sm">
              Stripe checkout, recurring billing, invoices, and team plans. For now, all upgrades are free in demo
              mode so you can experience every premium game.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Pricing;
