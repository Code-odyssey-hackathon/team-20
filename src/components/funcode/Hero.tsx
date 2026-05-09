import { Button } from "@/components/ui/button";
import { ArrowRight, Swords, Code2 } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24">
      {/* Background image */}
      <div className="absolute inset-0 -z-10">
        <img
          src={heroBg}
          alt="Cyberpunk gaming arena with neon lights"
          width={1920}
          height={1080}
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
        <div className="absolute inset-0 grid-bg" />
      </div>

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-10 w-72 h-72 rounded-full bg-secondary/30 blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 rounded-full bg-accent/20 blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[40rem] h-[40rem] rounded-full bg-primary/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        <div className="inline-flex items-center gap-2 glass-panel neon-border rounded-full px-4 py-1.5 mb-8 animate-fade-in-up">
          <span className="w-2 h-2 rounded-full bg-accent animate-glow-pulse" />
          <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
            Multiplayer · Live · Ranked
          </span>
        </div>

        <h1 className="font-display font-black text-5xl sm:text-7xl md:text-8xl leading-[0.95] tracking-tight animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <span className="block text-foreground text-shadow-neon">PLAY. CODE.</span>
          <span
            className="block text-gradient-neon bg-[length:200%_auto] animate-gradient-shift"
            style={{ backgroundImage: "var(--gradient-text)" }}
          >
            CONQUER.
          </span>
        </h1>

        <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.25s" }}>
          The next-gen arena where elite developers battle in real-time coding duels,
          debug under fire, and climb the ranks. Where gaming meets code.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <Button variant="hero" size="xl" className="group">
            <Swords className="w-5 h-5" />
            Start Playing
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button variant="ghostNeon" size="xl">
            <Code2 className="w-5 h-5" />
            Explore Games
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-3 gap-6 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.55s" }}>
          {[
            { v: "120K+", l: "Active Players" },
            { v: "8M+", l: "Battles Fought" },
            { v: "15+", l: "Languages" },
          ].map((s) => (
            <div key={s.l} className="glass-panel rounded-xl p-4">
              <div className="font-display font-bold text-2xl md:text-3xl text-gradient-neon">{s.v}</div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
