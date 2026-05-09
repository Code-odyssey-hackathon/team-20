import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, FastForward, Volume2, VolumeX } from "lucide-react";
import { beep, primeAudio } from "@/lib/beep";

export interface NarratorScene {
  /** A single line/sentence. Will be revealed word-by-word with a beep per word. */
  text: string;
  /** Optional bullets shown after the text finishes (e.g. teaching points). */
  bullets?: string[];
}

export interface NarratorDialogProps {
  open: boolean;
  /** Character speaking (e.g. "Sage Mentor"). */
  character?: string;
  /** Emoji or unicode glyph used as a quick avatar. */
  avatar?: string;
  /** Title shown above the speech (e.g. "Act I — Whispering Variables"). */
  title?: string;
  /** Subtle tag (e.g. "Story Time · Python"). */
  eyebrow?: string;
  scenes: NarratorScene[];
  /** Called when the player skips the entire dialog or completes the last scene. */
  onClose: () => void;
  /** Override beep frequency (default 520). */
  beepFrequency?: number;
  /** Milliseconds between words. Default 110. */
  wordIntervalMs?: number;
}

export function NarratorDialog({
  open,
  character = "The Mentor",
  avatar = "🧙",
  title,
  eyebrow,
  scenes,
  onClose,
  beepFrequency = 520,
  wordIntervalMs = 110,
}: NarratorDialogProps) {
  const [sceneIdx, setSceneIdx] = useState(0);
  const [wordIdx, setWordIdx] = useState(0);
  const [muted, setMuted] = useState(false);
  const timerRef = useRef<number | null>(null);

  const scene = scenes[sceneIdx];
  const words = useMemo(() => (scene?.text ?? "").split(/\s+/).filter(Boolean), [scene]);
  const finishedScene = wordIdx >= words.length;
  const isLastScene = sceneIdx >= scenes.length - 1;

  // reset when re-opened
  useEffect(() => {
    if (open) {
      setSceneIdx(0);
      setWordIdx(0);
      primeAudio();
    }
  }, [open]);

  // word-by-word reveal with per-word beep
  useEffect(() => {
    if (!open || !scene) return;
    if (wordIdx >= words.length) return;
    timerRef.current = window.setTimeout(() => {
      if (!muted) {
        // Slight pitch wobble per word so it feels alive but stays consistent
        const wobble = (wordIdx % 4) * 18;
        beep({ frequency: beepFrequency + wobble, duration: 0.04, volume: 0.07 });
      }
      setWordIdx((i) => i + 1);
    }, wordIntervalMs);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [open, scene, wordIdx, words.length, wordIntervalMs, beepFrequency, muted]);

  const fastForwardScene = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setWordIdx(words.length);
  };

  const nextScene = () => {
    if (isLastScene) {
      onClose();
      return;
    }
    setSceneIdx((i) => i + 1);
    setWordIdx(0);
  };

  const skipAll = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    onClose();
  };

  if (!scene) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) skipAll(); }}>
      <DialogContent
        className="max-w-2xl border-2 border-primary/40 bg-gradient-to-br from-background via-background to-primary/5 p-0 overflow-hidden"
      >
        <div className="relative">
          {/* glowing top stripe */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-60" />

          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="size-14 rounded-2xl bg-primary/15 border border-primary/40 grid place-items-center text-3xl shadow-[0_0_30px_-6px_hsl(var(--primary)/0.6)]">
                  <span aria-hidden>{avatar}</span>
                </div>
                <div>
                  {eyebrow && (
                    <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-accent">
                      {eyebrow}
                    </div>
                  )}
                  <div className="font-display font-bold text-lg leading-tight">{character}</div>
                  {title && (
                    <div className="text-xs text-muted-foreground">{title}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMuted((m) => !m)}
                  aria-label={muted ? "Unmute beeps" : "Mute beeps"}
                  className="h-8 w-8"
                >
                  {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                <Badge variant="outline" className="text-[10px]">
                  {sceneIdx + 1}/{scenes.length}
                </Badge>
              </div>
            </div>

            {/* speech bubble */}
            <div
              className="relative rounded-2xl border border-border/70 bg-black/40 p-4 sm:p-5 min-h-[120px] cursor-pointer"
              onClick={fastForwardScene}
              title="Click to reveal full line"
            >
              <p className="text-base sm:text-lg leading-relaxed text-foreground/95 font-medium">
                {words.slice(0, wordIdx).join(" ")}
                {!finishedScene && (
                  <span className="ml-1 inline-block w-2 h-5 align-middle bg-accent animate-pulse" aria-hidden />
                )}
              </p>

              {finishedScene && scene.bullets && scene.bullets.length > 0 && (
                <ul className="mt-4 space-y-1.5 text-sm text-foreground/85 animate-fade-in">
                  {scene.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1 size-1.5 rounded-full bg-accent shrink-0" />
                      <span className="font-mono text-xs sm:text-[13px] leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-5 flex items-center justify-between gap-2 flex-wrap">
              <Button variant="ghost" size="sm" onClick={skipAll} className="text-muted-foreground">
                <FastForward className="w-4 h-4 mr-1" /> Skip story
              </Button>
              <Button
                variant="hero"
                size="sm"
                onClick={finishedScene ? nextScene : fastForwardScene}
              >
                {finishedScene ? (isLastScene ? "Begin" : "Next") : "Reveal"}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
