export type TrackKind = "python" | "cpp";

export interface Center {
  name: string;
  subtitle: string;
  levelStart: number;
  levelEnd: number;
  topics: string[];
  vibe: string;
}

export interface Track {
  id: TrackKind;
  name: string;
  codename: string;
  language: string;
  tagline: string;
  feeling: string;
  centers: Center[];
}

export const TRACKS: Record<TrackKind, Track> = {
  python: {
    id: "python",
    name: "Pythoria",
    codename: "The Saptapath",
    language: "Python",
    tagline: "Restore the ancient computational civilization.",
    feeling: "I can build intelligent computational systems.",
    centers: [
      {
        name: "Gateway Grove",
        subtitle: "Awakening dormant systems",
        levelStart: 1, levelEnd: 20,
        topics: ["print", "variables", "data types", "input", "arithmetic", "strings", "booleans", "type conversion", "conditions", "loops", "nested loops", "problem solving"],
        vibe: "Glowing inscriptions in a quiet observatory grove.",
      },
      {
        name: "Library of Arya",
        subtitle: "Workflows of the archives",
        levelStart: 21, levelEnd: 35,
        topics: ["lists", "tuples", "sets", "string methods", "slicing", "iteration patterns"],
        vibe: "Vaulted halls of routing systems and scrolling indexes.",
      },
      {
        name: "Water Observatory",
        subtitle: "Modular intelligence",
        levelStart: 36, levelEnd: 50,
        topics: ["functions", "parameters", "return values", "scope", "modular programming"],
        vibe: "Reflective basins flowing through reusable rituals.",
      },
      {
        name: "Celestial Tower",
        subtitle: "Simulations of the sky",
        levelStart: 51, levelEnd: 80,
        topics: ["dictionaries", "nested structures", "comprehensions", "recursion", "simulations", "matrices", "randomness", "debugging"],
        vibe: "Star-charted matrices and predictive engines.",
      },
      {
        name: "Garden of Memory",
        subtitle: "Designing intelligent entities",
        levelStart: 81, levelEnd: 100,
        topics: ["OOP", "classes", "inheritance", "modular systems", "mini projects", "architecture"],
        vibe: "Living architectures rooted in adaptive memory.",
      },
    ],
  },
  cpp: {
    id: "cpp",
    name: "Project Yantra",
    codename: "Yantra Systems Lab",
    language: "C++",
    tagline: "Engineer the systems that run the future.",
    feeling: "I can engineer scalable software systems.",
    centers: [
      {
        name: "Control Systems",
        subtitle: "Industrial logic & automation",
        levelStart: 1, levelEnd: 20,
        topics: ["cout", "cin", "variables", "arithmetic", "I/O", "conditions", "loops", "nested loops", "arrays", "strings"],
        vibe: "Lit consoles managing factory floors.",
      },
      {
        name: "Memory & Engineering",
        subtitle: "Inside the machine",
        levelStart: 21, levelEnd: 50,
        topics: ["functions", "parameters", "scope", "modular programming", "pointers", "references", "memory addresses", "dereferencing", "dynamic memory", "new/delete", "debugging", "memory leaks"],
        vibe: "Schematics, oscilloscopes, raw silicon.",
      },
      {
        name: "Software Architecture",
        subtitle: "Scale & systems",
        levelStart: 51, levelEnd: 100,
        topics: ["classes", "objects", "constructors", "encapsulation", "inheritance", "polymorphism", "STL", "vectors", "maps", "algorithms", "mini projects", "architecture"],
        vibe: "Coordinated robotics frameworks at planetary scale.",
      },
    ],
  },
};

export function centerForLevel(track: TrackKind, level: number): Center {
  const t = TRACKS[track];
  return t.centers.find(c => level >= c.levelStart && level <= c.levelEnd) ?? t.centers[t.centers.length - 1];
}

export function difficultyLabel(level: number): string {
  if (level <= 20) return "Beginner";
  if (level <= 50) return "Intermediate";
  if (level <= 80) return "Advanced";
  return "System-level";
}

export function xpForLevel(level: number): number {
  return 80 + level * 20;
}
