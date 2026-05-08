import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { Track } from "@/lib/tracks";

interface Props {
  track: Track;
  onSelect?: () => void;
  active?: boolean;
}

export function TrackCard({ track, onSelect, active }: Props) {
  const isPython = track.id === "python";
  return (
    <motion.button
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      onClick={onSelect}
      data-track={isPython ? "pythoria" : "yantra"}
      className={`group relative w-full overflow-hidden rounded-2xl border border-border/60 p-7 text-left transition-all
        ${active ? (isPython ? "glow-pythoria" : "glow-yantra") : "hover:border-border"}`}
      style={{ background: "var(--gradient-surface)" }}
    >
      <div
        className="pointer-events-none absolute -right-20 -top-20 size-60 rounded-full opacity-30 blur-3xl"
        style={{ background: isPython ? "var(--gradient-pythoria)" : "var(--gradient-yantra)" }}
      />
      <div className="relative z-10">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{track.codename}</div>
        <h3 className={`mt-2 font-display text-3xl font-semibold ${isPython ? "text-gradient-pythoria" : "text-gradient-yantra"}`}>
          {track.name}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{track.language} · {track.tagline}</p>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-foreground/80">"{track.feeling}"</p>
        <div className="mt-6 flex items-center gap-2 text-sm font-medium opacity-80 transition-opacity group-hover:opacity-100">
          Enter <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </motion.button>
  );
}
