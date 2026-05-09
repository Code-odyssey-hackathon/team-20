import { useEffect, useState } from "react";
import { AppNavbar } from "@/components/funcode/AppNavbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Coins, Loader2, Check, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

interface ShopItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  price: number;
  kind: string;
}

const Shop = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<ShopItem[]>([]);
  const [owned, setOwned] = useState<Set<string>>(new Set());
  const [coins, setCoins] = useState(0);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);

  const refresh = async () => {
    if (!user) return;
    const [{ data: shop }, { data: inv }, { data: prof }] = await Promise.all([
      supabase.from("shop_items").select("*").order("price"),
      supabase.from("user_inventory").select("item_id").eq("user_id", user.id),
      supabase.from("profiles").select("coins").eq("id", user.id).maybeSingle(),
    ]);
    setItems((shop ?? []) as ShopItem[]);
    setOwned(new Set((inv ?? []).map((r: any) => r.item_id)));
    setCoins(prof?.coins ?? 0);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, [user]);

  const buy = async (item: ShopItem) => {
    if (coins < item.price) {
      toast.error("Not enough coins");
      return;
    }
    setBuying(item.id);
    const { data, error } = await supabase.rpc("purchase_item", { p_item_id: item.id });
    setBuying(null);
    if (error) return toast.error(error.message);
    const res = data as any;
    if (!res?.ok) return toast.error(res?.error ?? "Purchase failed");
    toast.success(`Acquired ${item.name}!`);
    refresh();
  };

  const kindColor = (kind: string) =>
    kind === "booster"
      ? "from-primary/20 to-accent/10 border-primary/40"
      : kind === "cosmetic"
      ? "from-accent/20 to-secondary/10 border-accent/40"
      : "from-[hsl(var(--neon-mint))]/20 to-primary/10 border-[hsl(var(--neon-mint))]/40";

  return (
    <div className="min-h-screen">
      <AppNavbar />
      <main className="pt-32 pb-20 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold tracking-[0.3em] uppercase text-accent">// Coin Shop</span>
              <h1 className="mt-2 font-display font-black text-3xl sm:text-5xl">
                <span className="text-gradient-neon">Spend Your Coins</span>
              </h1>
              <p className="mt-3 text-muted-foreground max-w-xl">
                Earn coins from every Story Time trial — every correct solve drops coins into your wallet.
                Spend them here on hints, boosters, themes, and avatar frames.
              </p>
            </div>
            <div className="rounded-2xl border border-primary/40 px-5 py-3 glass-panel flex items-center gap-2">
              <Coins className="w-5 h-5 text-yellow-400" />
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Balance</div>
                <div className="font-display font-black text-2xl text-gradient-neon">₹{coins}</div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid place-items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((item) => {
                const isOwned = owned.has(item.id);
                const canAfford = coins >= item.price;
                return (
                  <div
                    key={item.id}
                    className={`relative rounded-3xl border p-6 glass-panel bg-gradient-to-br ${kindColor(item.kind)} transition-transform hover:scale-[1.02]`}
                  >
                    <div className="text-5xl mb-3">{item.icon}</div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{item.kind}</div>
                    <h3 className="font-display font-black text-xl mt-1">{item.name}</h3>
                    <p className="text-sm text-muted-foreground mt-2 min-h-[40px]">{item.description}</p>
                    <div className="mt-5 flex items-center justify-between">
                      <div className="flex items-center gap-1 font-display font-black text-lg">
                        <Coins className="w-4 h-4 text-yellow-400" /> ₹{item.price}
                      </div>
                      {isOwned ? (
                        <Button variant="ghostNeon" size="sm" disabled>
                          <Check className="w-4 h-4 mr-1" /> Owned
                        </Button>
                      ) : (
                        <Button
                          variant="hero"
                          size="sm"
                          disabled={!canAfford || buying === item.id}
                          onClick={() => buy(item)}
                        >
                          {buying === item.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <ShoppingBag className="w-4 h-4 mr-1" /> Buy
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Shop;
