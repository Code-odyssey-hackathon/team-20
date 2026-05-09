// Tiny Web Audio beep generator for the per-word narrator effect.
// One AudioContext is lazily created and reused to avoid mobile-autoplay issues.

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor: typeof AudioContext | undefined =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

export interface BeepOptions {
  /** Hz. Default 520. */
  frequency?: number;
  /** seconds. Default 0.045. */
  duration?: number;
  /** 0..1. Default 0.08 (gentle). */
  volume?: number;
  /** "sine" | "square" | "triangle" | "sawtooth". Default "square" for retro. */
  type?: OscillatorType;
}

export function beep(opts: BeepOptions = {}): void {
  const ac = getCtx();
  if (!ac) return;
  const { frequency = 520, duration = 0.045, volume = 0.08, type = "square" } = opts;

  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = frequency;

  const t = ac.currentTime;
  // tiny envelope so it doesn't click
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(volume, t + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

  osc.connect(gain).connect(ac.destination);
  osc.start(t);
  osc.stop(t + duration + 0.02);
}

/** "Unlock" the audio context inside a user gesture (touch/click handler). */
export function primeAudio(): void {
  getCtx();
}
