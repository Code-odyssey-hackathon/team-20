export const C_TREASURE_HUNT_PROLOGUE = `
The ancient civilization of Kailasa left behind a legendary artifact: The Prime Compiler. 
It is said that whoever wields it can rewrite reality itself. You, an aspiring code-archaeologist, 
have found the first fragment of a map leading to the forgotten temple. 
Your journey will take you through treacherous jungles, cryptic vaults, and mechanical guardians.
To survive, you must master the ancient language of C.
`;

export interface CStoryAct {
  id: number;
  title: string;
  description: string;
  topics: string[];
}

export const C_ACTS: CStoryAct[] = [
  { id: 1, title: "The Expedition Begins", description: "Decode the initial map fragments.", topics: ["printf", "scanf", "variables", "basic types"] },
  { id: 2, title: "The Whispering Jungle", description: "Navigate the logic gates of the forest.", topics: ["if", "else", "switch", "booleans"] },
  { id: 3, title: "The River of Iteration", description: "Cross the repeating currents.", topics: ["for loops", "while loops", "do-while"] },
  { id: 4, title: "The Array of Stones", description: "Step on the correct sequences.", topics: ["1D arrays", "indexing", "array traversal"] },
  { id: 5, title: "The Glyph Wall", description: "Translate the ancient texts.", topics: ["char arrays", "strings", "string.h"] },
  { id: 6, title: "The Multi-Dimensional Maze", description: "Find the path through the grid.", topics: ["2D arrays", "nested loops"] },
  { id: 7, title: "The Bridge of Pointers", description: "Direct memory access is required.", topics: ["pointers", "address-of", "dereferencing"] },
  { id: 8, title: "The Ritual of Functions", description: "Invoke the reusable spells.", topics: ["functions", "parameters", "return values"] },
  { id: 9, title: "The Vault of Structs", description: "Organize the keys to the inner sanctum.", topics: ["structs", "typedef", "data grouping"] },
  { id: 10, title: "The Prime Compiler", description: "Face the ultimate guardian.", topics: ["dynamic memory", "file I/O", "pointers to pointers", "comprehensive"] },
];

// Generate 100 level beats procedurally or with a structured pattern to save space
export function getLevelBeat(levelNum: number): string {
  const actIndex = Math.floor((levelNum - 1) / 10);
  const levelInAct = ((levelNum - 1) % 10) + 1;
  const act = C_ACTS[actIndex];
  
  if (!act) return "You step further into the unknown. A new challenge awaits.";

  const storyProgression = [
    "You arrive at the threshold.",
    "A minor obstacle blocks the path.",
    "You find an ancient mechanism.",
    "The mechanism activates, revealing a puzzle.",
    "You decipher the first half of the lock.",
    "A trap is triggered! Quick, disable it.",
    "The trap yields a clue to the main door.",
    "You approach the guardian of this sector.",
    "The guardian demands a complex sequence.",
    "You defeat the guardian and unlock the path to the next area."
  ];

  if (levelNum === 100) {
    return `Act ${act.id}: ${act.title}. You strike the final blow against the ultimate guardian. The massive doors of the inner sanctum groan open, revealing the glowing core of the Prime Compiler. The ancient treasure is finally yours! You must use all your knowledge of ${act.topics.join(", ")} to claim it.`;
  }

  return `Act ${act.id}: ${act.title}. ${storyProgression[levelInAct - 1]} You must use your knowledge of ${act.topics.join(", ")} to proceed.`;
}

export function getStoryProgressSummary(levelNum: number): string {
  if (levelNum === 1) return "You have just arrived at the jungle's edge.";
  const completedActs = Math.floor((levelNum - 1) / 10);
  let summary = "You started your expedition to find the Prime Compiler. ";
  for (let i = 0; i < completedActs; i++) {
    summary += `You conquered ${C_ACTS[i].title}. `;
  }
  summary += `Now, you are navigating ${C_ACTS[completedActs].title}, facing level ${((levelNum - 1) % 10) + 1} out of 10.`;
  return summary;
}
