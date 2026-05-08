import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "./AuthProvider";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon } from "lucide-react";

export function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="size-7 rounded-md bg-gradient-to-br from-pythoria to-yantra glow-pythoria" />
          <span className="font-display text-lg font-semibold tracking-tight">Saptapath</span>
        </Link>
        <nav className="flex items-center gap-2">
          {user ? (
            <>
              <Link to="/dashboard"><Button variant="ghost" size="sm">Dashboard</Button></Link>
              <Link to="/tracks"><Button variant="ghost" size="sm">Tracks</Button></Link>
              <Link to="/history"><Button variant="ghost" size="sm">History</Button></Link>
              <div className="ml-2 hidden items-center gap-2 rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground sm:flex">
                <UserIcon className="size-3.5" /> {user.email}
              </div>
              <Button variant="ghost" size="icon" onClick={async () => { await signOut(); navigate({ to: "/" }); }}>
                <LogOut className="size-4" />
              </Button>
            </>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
              <Link to="/signup"><Button size="sm">Get started</Button></Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
