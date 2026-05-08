import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/app/Header";
import { TrackCard } from "@/components/app/TrackCard";
import { TRACKS, type TrackKind } from "@/lib/tracks";

const KEY = "saptapath:active-track";

export function setActiveTrack(t: TrackKind) {
  if (typeof window !== "undefined") localStorage.setItem(KEY, t);
}
export function getActiveTrack(): TrackKind | null {
  if (typeof window === "undefined") return null;
  return (localStorage.getItem(KEY) as TrackKind | null);
}

export const Route = createFileRoute("/_authenticated/tracks")({
  head: () => ({ meta: [{ title: "Choose your track — Saptapath" }] }),
  component: Tracks,
});

function Tracks() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl px-6 pt-16 pb-24">
        <div className="mb-12 text-center">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Step 1</div>
          <h1 className="mt-2 font-display text-4xl font-semibold">Choose your path</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
            Each track is its own world. You can switch later — your progress in each is tracked independently.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {(["python", "cpp"] as const).map((id) => (
            <TrackCard
              key={id}
              track={TRACKS[id]}
              onSelect={() => { setActiveTrack(id); navigate({ to: "/dashboard" }); }}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
