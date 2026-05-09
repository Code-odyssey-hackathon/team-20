import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type Tier = "free" | "pro" | "elite";

export const useTier = () => {
  const { user } = useAuth();
  const [tier, setTier] = useState<Tier>("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    supabase
      .from("profiles")
      .select("tier")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setTier(((data?.tier as Tier) ?? "free"));
        setLoading(false);
      });
  }, [user]);

  const isPro = tier === "pro" || tier === "elite";
  const isElite = tier === "elite";
  return { tier, isPro, isElite, loading, refresh: () => setLoading(true) };
};
