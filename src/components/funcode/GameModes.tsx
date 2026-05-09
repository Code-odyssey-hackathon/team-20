import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

const modes = [
  {
    tag: "1v1",
    title: "Coding Duel",
    desc: "Solve algorithmic problems faster than your opponent. First to pass all hidden tests wins.",
    accent: "from-neon-cyan/40 to-transparent",
    languages: ["C++", "Python", "JS", "Java"],
  },
  {
    tag: "Squad",
    title: "Debug Royale",
    desc: "Drop into a broken codebase. Last team with working code standing claims the crown.",
    accent: "from-neon-pink/40 to-transparent",
    languages: ["TypeScript", "Go", "Rust"],
  },
  {
    tag: "Ranked",
    title: "MCQ Blitz",
    desc: "60 seconds. Twelve questions. Power-ups, eliminations, and a single survivor.",
    accent: "from-neon-purple/40 to-transparent",
    languages: ["DSA", "OS", "DBMS", "AI/ML"],
  },
];

export const GameModes = () => {
  return (
    <section id="arena" className="relative py-32 px-6">
      <div className="absolute inset-0 grid-bg -z-10 opacity-50" />
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div>
            <span className="text-xs font-bold tracking-[0.3em] uppercase text-accent">// Game Modes</span>
            <h2 className="mt-3 font-display font-black text-4xl md:text-6xl">
              Choose Your <span className="text-gradient-neon">Battle</span>
            </h2>
          </div>
          <p className="text-muted-foreground max-w-md">
            Solo, duo, squad or full tournament — every mode is ranked, replayed, and rewarded.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {modes.map((m) => (
            <article
              key={m.title}
              className="group relative overflow-hidden rounded-3xl glass-panel neon-border p-8 min-h-[420px] flex flex-col justify-between transition-transform duration-500 hover:-translate-y-2"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${m.accent} opacity-60 group-hover:opacity-100 transition-opacity`} />
              {/* Scanline */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-x-0 h-32 bg-gradient-to-b from-transparent via-primary/10 to-transparent animate-scan" />
              </div>

              <div className="relative">
                <span className="inline-block text-[10px] font-bold tracking-[0.25em] uppercase px-3 py-1 rounded-full border border-primary/40 text-primary bg-primary/5">
                  {m.tag}
                </span>
                <h3 className="mt-6 font-display font-black text-3xl md:text-4xl">{m.title}</h3>
                <p className="mt-4 text-muted-foreground leading-relaxed">{m.desc}</p>
              </div>

              <div className="relative mt-8 flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {m.languages.map((l) => (
                    <span key={l} className="text-xs px-2.5 py-1 rounded-md bg-muted/60 border border-border text-muted-foreground">
                      {l}
                    </span>
                  ))}
                </div>
                <Button variant="ghostNeon" size="icon" className="rounded-full">
                  <ArrowUpRight className="w-5 h-5" />
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
