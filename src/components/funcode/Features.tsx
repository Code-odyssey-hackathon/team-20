import { Bot, Code2, Bug, Brain, Trophy, Mic, Users, Radio, Zap, Shield } from "lucide-react";

const features = [
  { icon: Code2, title: "Coding Battles", desc: "Real-time multiplayer code duels with live compiler.", color: "from-neon-cyan to-neon-purple" },
  { icon: Bug, title: "Debugging Arena", desc: "Race opponents to squash bugs under pressure.", color: "from-neon-pink to-neon-purple" },
  { icon: Brain, title: "MCQ Wars", desc: "Lightning quiz battles with power-ups & bonuses.", color: "from-neon-mint to-neon-cyan" },
  { icon: Trophy, title: "Tournaments", desc: "Daily, weekly & seasonal championship brackets.", color: "from-neon-pink to-neon-cyan" },
  { icon: Bot, title: "AI Opponents", desc: "Train against adaptive AI that scales with your skill.", color: "from-neon-purple to-neon-pink" },
  { icon: Mic, title: "Voice Chat", desc: "Coordinate with your squad in low-latency voice rooms.", color: "from-neon-cyan to-neon-mint" },
  { icon: Users, title: "Team Clans", desc: "Build guilds, declare wars, share rewards.", color: "from-neon-purple to-neon-cyan" },
  { icon: Radio, title: "Live Spectator", desc: "Watch top matches with real-time stats overlay.", color: "from-neon-pink to-neon-mint" },
  { icon: Zap, title: "XP & Rewards", desc: "Level up, unlock skins, claim daily rewards.", color: "from-neon-mint to-neon-purple" },
  { icon: Shield, title: "Anti-Cheat AI", desc: "Fair play guaranteed by ML-powered monitoring.", color: "from-neon-cyan to-neon-pink" },
];

export const Features = () => {
  return (
    <section id="games" className="relative py-32 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <span className="text-xs font-bold tracking-[0.3em] uppercase text-primary">// Arsenal</span>
          <h2 className="mt-3 font-display font-black text-4xl md:text-6xl text-gradient-neon">
            Built For Champions
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Every system engineered for competitive intensity. Real-time, ranked, ruthless.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="group relative glass-panel neon-border rounded-2xl p-6 transition-all duration-500 hover:-translate-y-2 hover:glow-purple"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} p-[1px] mb-4`}>
                  <div className="w-full h-full rounded-xl bg-card flex items-center justify-center">
                    <Icon className="w-6 h-6 text-foreground" />
                  </div>
                </div>
                <h3 className="font-display font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                  {f.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                     style={{ background: "radial-gradient(circle at top right, hsl(var(--accent) / 0.15), transparent 60%)" }} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
