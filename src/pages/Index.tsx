import { Navbar } from "@/components/funcode/Navbar";
import { Hero } from "@/components/funcode/Hero";
import { Features } from "@/components/funcode/Features";
import { GameModes } from "@/components/funcode/GameModes";
import { CTA } from "@/components/funcode/CTA";
import { Footer } from "@/components/funcode/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <GameModes />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
