import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/app/Header";
import { TRACKS } from "@/lib/tracks";
import { Sparkles, Cpu, GitBranch, Activity } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Saptapath — Your AI Coding Mentor for Python & C++" },
      { name: "description", content: "Adaptive AI-generated challenges, engineering progression, and mastery tracking. Walk the Saptapath in Python or engineer at scale in Project Yantra." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 -z-10 opacity-60"
            style={{ background: "radial-gradient(ellipse 80% 50% at 50% -10%, oklch(0.30 0.12 60 / 0.4), transparent 60%), radial-gradient(ellipse 60% 40% at 80% 30%, oklch(0.30 0.14 230 / 0.35), transparent 60%)" }}
          />
          <div className="mx-auto max-w-6xl px-6 pt-24 pb-20 text-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1 text-xs text-muted-foreground"
            >
              <Sparkles className="size-3.5 text-primary" />
              An intelligent mentor — not another exercise bank
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.05 }}
              className="mx-auto mt-6 max-w-3xl font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl"
            >
              Walk the <span className="text-gradient-pythoria">Saptapath</span>.<br />
              Engineer in <span className="text-gradient-yantra">Yantra</span>.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.15 }}
              className="mx-auto mt-6 max-w-2xl text-balance text-base leading-relaxed text-muted-foreground"
            >
              An adaptive AI coding platform for Python and C++. Every challenge is generated for your level, your weak topics, your pace.
              Learn the way intelligent mentors teach — one system at a time.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }}
              className="mt-8 flex justify-center gap-3"
            >
              <Link to="/signup"><Button size="lg" className="px-6">Begin your path</Button></Link>
              <Link to="/login"><Button size="lg" variant="outline" className="px-6">Sign in</Button></Link>
            </motion.div>
          </div>
        </section>

        {/* Tracks preview */}
        <section className="mx-auto max-w-6xl px-6 pb-20">
          <div className="grid gap-6 md:grid-cols-2">
            {(["python", "cpp"] as const).map((id) => {
              const t = TRACKS[id];
              const isPy = id === "python";
              return (
                <div key={id} className="relative overflow-hidden rounded-2xl border border-border/60 p-8" style={{ background: "var(--gradient-surface)" }}>
                  <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full opacity-30 blur-3xl" style={{ background: isPy ? "var(--gradient-pythoria)" : "var(--gradient-yantra)" }} />
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{t.codename}</div>
                  <h3 className={`mt-2 font-display text-3xl font-semibold ${isPy ? "text-gradient-pythoria" : "text-gradient-yantra"}`}>{t.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{t.tagline}</p>
                  <ul className="mt-6 space-y-2 text-sm">
                    {t.centers.slice(0, 3).map((c) => (
                      <li key={c.name} className="flex justify-between text-foreground/80">
                        <span>{c.name}</span>
                        <span className="font-mono text-xs text-muted-foreground">L{c.levelStart}–{c.levelEnd}</span>
                      </li>
                    ))}
                    <li className="text-xs text-muted-foreground">+ {t.centers.length - 3} more {t.centers.length - 3 === 1 ? "center" : "centers"}</li>
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* Pillars */}
        <section className="mx-auto max-w-6xl px-6 pb-32">
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { icon: Sparkles, title: "Adaptive AI", body: "Every question is generated from your level, weak concepts, and recent history." },
              { icon: Activity, title: "Visible mastery", body: "Topic-level scores update with every submission. Weak areas surface automatically." },
              { icon: GitBranch, title: "Progression-driven", body: "100 levels per track. Beginner syntax to system-level architecture." },
            ].map((f) => (
              <div key={f.title} className="rounded-xl glass p-6">
                <f.icon className="size-5 text-primary" />
                <h4 className="mt-4 font-display text-lg font-semibold">{f.title}</h4>
                <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <footer className="border-t border-border/40 py-8 text-center text-xs text-muted-foreground">
        <Cpu className="mx-auto mb-2 size-4 opacity-60" />
        Saptapath · Built for engineers in the making.
      </footer>
    </div>
  );
}
