import { Gamepad2 } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="relative border-t border-border/50 mt-20">
      <div className="mx-auto max-w-7xl px-6 py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-primary" />
            <span className="font-display font-black text-lg tracking-widest text-gradient-neon">FUNCODE</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">
            Where gaming meets code. The competitive coding universe.
          </p>
        </div>
        {[
          { h: "Play", l: ["Coding Duel", "Debug Royale", "MCQ Blitz", "Tournaments"] },
          { h: "Community", l: ["Leaderboard", "Clans", "Discord", "Blog"] },
          { h: "Company", l: ["About", "Careers", "Press", "Contact"] },
        ].map((c) => (
          <div key={c.h}>
            <h4 className="font-display font-bold text-sm text-foreground mb-3 tracking-wider">{c.h}</h4>
            <ul className="space-y-2">
              {c.l.map((i) => (
                <li key={i}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{i}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border/50 py-6 px-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} FUNCODE. Play responsibly. Code ruthlessly.
      </div>
    </footer>
  );
};
