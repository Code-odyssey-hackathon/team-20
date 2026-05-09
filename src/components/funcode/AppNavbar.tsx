import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Gamepad2, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const AppNavbar = () => {
  const { user } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  const links = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/topics", label: "Topics" },
    { to: "/story", label: "Story Time" },
    { to: "/shop", label: "Shop" },
    { to: "/leaderboard", label: "Leaderboard" },
    { to: "/pricing", label: "Pricing" },
    { to: "/profile", label: "Profile" },
  ];

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    nav("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4">
        <nav className="glass-panel neon-border rounded-2xl px-4 sm:px-5 py-3 flex items-center justify-between gap-3">
          <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 shrink-0">
            <Gamepad2 className="w-7 h-7 text-primary animate-pulse" />
            <span className="font-display font-black text-lg sm:text-xl tracking-widest text-gradient-neon">
              FUNCODE
            </span>
          </Link>

          {user && (
            <ul className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
              {links.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className={`transition-colors ${
                      loc.pathname === l.to ? "text-primary" : "hover:text-primary"
                    }`}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="flex items-center gap-2">
            {user ? (
              <Button variant="ghostNeon" size="sm" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-1.5" /> Sign out
              </Button>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="hero" size="sm">
                    Play Now
                  </Button>
                </Link>
              </>
            )}
          </div>
        </nav>

        {user && (
          <ul className="md:hidden mt-3 flex items-center gap-2 overflow-x-auto pb-1 text-xs font-medium">
            {links.map((l) => (
              <li key={l.to} className="shrink-0">
                <Link
                  to={l.to}
                  className={`px-3 py-1.5 rounded-full border transition-colors ${
                    loc.pathname === l.to
                      ? "border-primary text-primary bg-primary/10"
                      : "border-border text-muted-foreground hover:text-primary"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </header>
  );
};
