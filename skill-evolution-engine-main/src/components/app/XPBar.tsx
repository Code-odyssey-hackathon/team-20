import { xpForLevel } from "@/lib/tracks";

export function XPBar({ level, xp }: { level: number; xp: number }) {
  const need = xpForLevel(level);
  const pct = Math.min(100, (xp / need) * 100);
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="font-display text-sm font-medium">Level {level}</span>
        <span className="text-xs text-muted-foreground">{xp} / {need} XP</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60 transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
