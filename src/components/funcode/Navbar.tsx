import { Button } from "@/components/ui/button";
import { Gamepad2 } from "lucide-react";
import { Link } from "react-router-dom";

export const Navbar = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <nav className="glass-panel neon-border rounded-2xl px-5 py-3 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2 group">
            <div className="relative">
              <Gamepad2 className="w-7 h-7 text-primary animate-glow-pulse" />
            </div>
            <span className="font-display font-black text-xl tracking-widest text-gradient-neon">
              FUNCODE
            </span>
          </a>
          <ul className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            {["Games", "Arena", "Tournaments", "Leaderboard", "Store"].map((i) => (
              <li key={i}>
                <a href={`#${i.toLowerCase()}`} className="hover:text-primary transition-colors duration-300">
                  {i}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" className="hidden sm:inline-flex text-foreground hover:text-primary hover:bg-primary/10">
                Sign In
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="hero" size="sm">Play Now</Button>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
};
