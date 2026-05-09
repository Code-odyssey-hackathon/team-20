import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";

export const CTA = () => {
  return (
    <section id="tournaments" className="relative py-32 px-6">
      <div className="mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-3xl glass-panel neon-border p-12 md:p-20 text-center">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-secondary/40 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-accent/40 blur-3xl" />

          <div className="relative">
            <Rocket className="w-12 h-12 mx-auto text-primary animate-glow-pulse" />
            <h2 className="mt-6 font-display font-black text-4xl md:text-6xl text-gradient-neon">
              Enter The Arena
            </h2>
            <p className="mt-5 text-muted-foreground max-w-xl mx-auto text-lg">
              Join 120,000+ developers already battling for glory. Free to play, brutal to master.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="hero" size="xl">Create Free Account</Button>
              <Button variant="ghostNeon" size="xl">Watch Live Matches</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
