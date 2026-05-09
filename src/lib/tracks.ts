export type TrackKind = "python" | "cpp" | "c" | "java";

export interface Center {
  name: string;
  subtitle: string;
  levelStart: number;
  levelEnd: number;
  topics: string[];
  vibe: string;
}

export interface Act {
  id: number;
  name: string;
  power: string;            // e.g. "The Power of Strings"
  topics: string[];
  intro: string;            // narrator script for entering this act
  briefBullets: string[];   // 3-5 quick teaching points
}

export interface Track {
  id: TrackKind;
  name: string;
  codename: string;
  language: string;
  tagline: string;
  feeling: string;
  accent: "cyan" | "amber" | "violet" | "emerald";
  emoji: string;
  centers: Center[];
  /** New: 6 acts × 10 questions = 60. Same story spine, different topics per language. */
  acts: Act[];
  /** Opening cinematic shown the first time the player enters the track. */
  openingScript: string[];
  /** Final-boss unlock cinematic shown after act 6 is cleared (60 questions solved). */
  finalBossScript: string[];
}

const PY_ACTS: Act[] = [
  { id: 1, name: "Act I — Whispering Variables", power: "Power of Variables & I/O",
    topics: ["print", "variables", "data types", "input", "arithmetic"],
    intro: "You wake in the Gateway Grove. The runes here teach the first power — naming the world. Bind values to names, read from the void, write to the stars.",
    briefBullets: ["Use = to bind a value to a name", "input() reads a line as a string", "int(), float(), str() convert types", "print(a, b) writes to the console"] },
  { id: 2, name: "Act II — The Glyph of Strings", power: "Power of Strings",
    topics: ["strings", "slicing", "f-strings", "string methods"],
    intro: "Glyphs of text shimmer on the obelisks. Slice them, format them, bend their letters to your will.",
    briefBullets: ["s[0:3] takes the first three chars", "f'{name} = {x}' formats inline", ".upper() .lower() .split() are common methods", "len(s) returns length"] },
  { id: 3, name: "Act III — Forest of Lists", power: "Power of Lists & Tuples",
    topics: ["lists", "tuples", "indexing", "iteration"],
    intro: "Roots intertwine into ordered chains. Each leaf is an element, each branch an index.",
    briefBullets: ["lists are mutable: lst.append(x)", "tuples are immutable: (1,2,3)", "for item in lst: …", "lst[-1] is the last element"] },
  { id: 4, name: "Act IV — Vault of Dictionaries", power: "Power of Dicts & Sets",
    topics: ["dictionaries", "sets", "comprehensions"],
    intro: "Keys carved in obsidian unlock vaulted values. Sets bind unique relics; comprehensions forge collections in a single breath.",
    briefBullets: ["d[key] = value", "set() removes duplicates", "[x*x for x in range(5)]", "d.items() for key,value loops"] },
  { id: 5, name: "Act V — Forge of Functions", power: "Power of Functions",
    topics: ["functions", "parameters", "return", "scope", "recursion"],
    intro: "Reusable rituals. Wrap your spells in def, return the result, summon them again and again.",
    briefBullets: ["def name(params): …", "return ends the function", "default args: def f(x=0)", "recursion: function calls itself"] },
  { id: 6, name: "Act VI — Garden of Classes", power: "Power of OOP",
    topics: ["classes", "objects", "inheritance", "modules"],
    intro: "Living architectures. Define a class, breathe instances into existence, inherit ancient blueprints.",
    briefBullets: ["class Hero: def __init__(self, name): …", "self refers to the instance", "class Mage(Hero): inherits", "import to reuse modules"] },
];

const CPP_ACTS: Act[] = [
  { id: 1, name: "Act I — Console Awakens", power: "Power of Variables & I/O",
    topics: ["cout", "cin", "variables", "data types", "arithmetic"],
    intro: "The control console sparks to life. Declare your types, read with cin, write with cout.",
    briefBullets: ["int x = 5; double y = 2.5;", "cin >> x; reads input", "cout << x << endl;", "Always #include <iostream>"] },
  { id: 2, name: "Act II — String Circuits", power: "Power of Strings",
    topics: ["string", "concatenation", "string methods", "char arrays"],
    intro: "Wires hum with text. Manipulate std::string, concatenate signals, find substrings.",
    briefBullets: ["#include <string>", "string s = \"hi\"; s += \" there\";", "s.length(), s.substr(0,2)", "s.find(\"x\") returns position"] },
  { id: 3, name: "Act III — Array Foundry", power: "Power of Arrays & Vectors",
    topics: ["arrays", "vectors", "iteration", "indexing"],
    intro: "Forge contiguous memory. Fixed arrays for speed, vectors for flexibility.",
    briefBullets: ["int a[5] = {1,2,3,4,5};", "vector<int> v; v.push_back(1);", "for (int x : v) { … }", "v.size() not sizeof"] },
  { id: 4, name: "Act IV — Loop Reactor", power: "Power of Loops & Conditions",
    topics: ["if", "else", "for", "while", "switch"],
    intro: "Logic gates ignite. Branch with if, iterate with for and while, switch on signals.",
    briefBullets: ["for (int i=0; i<n; i++)", "while (cond) { … }", "switch(x){ case 1: … break; }", "Use && || ! for logic"] },
  { id: 5, name: "Act V — Pointer Sanctum", power: "Power of Pointers & Functions",
    topics: ["functions", "pointers", "references", "dynamic memory"],
    intro: "The deepest crypt of memory. Take addresses, dereference them, pass by reference.",
    briefBullets: ["int* p = &x; *p = 7;", "void f(int& r) modifies caller", "new int[10] / delete[]", "nullptr is the safe null"] },
  { id: 6, name: "Act VI — Architecture Citadel", power: "Power of Classes & OOP",
    topics: ["classes", "constructors", "inheritance", "polymorphism"],
    intro: "Build the citadel. Encapsulate state, inherit blueprints, override behavior with virtual.",
    briefBullets: ["class Hero { public: Hero(); };", "private: hides state", "class Mage: public Hero {…};", "virtual + override for polymorphism"] },
];

const C_ACTS: Act[] = [
  { id: 1, name: "Act I — printf Awakening", power: "Power of Variables & I/O",
    topics: ["printf", "scanf", "variables", "data types"],
    intro: "An old terminal blinks. Declare ints, floats, chars. Read with scanf, write with printf.",
    briefBullets: ["int x; float y; char c;", "scanf(\"%d\", &x);", "printf(\"%d\\n\", x);", "Don't forget the address-of &"] },
  { id: 2, name: "Act II — Char Array Glyphs", power: "Power of Strings",
    topics: ["char arrays", "string.h", "strlen", "strcpy", "strcmp"],
    intro: "C strings are char arrays ending in \\0. Master string.h to read and compare them.",
    briefBullets: ["char s[20] = \"hi\";", "strlen(s), strcpy(a,b)", "strcmp returns 0 if equal", "Always leave room for \\0"] },
  { id: 3, name: "Act III — Array Foundry", power: "Power of Arrays",
    topics: ["arrays", "iteration", "2D arrays", "indexing"],
    intro: "Static rows of memory. Index from 0, iterate with for, beware of bounds.",
    briefBullets: ["int a[5] = {1,2,3,4,5};", "for(int i=0;i<5;i++)", "int g[3][3]; g[1][2] = 9;", "C does NOT bounds-check"] },
  { id: 4, name: "Act IV — Loop Reactor", power: "Power of Loops & Conditions",
    topics: ["if", "else", "for", "while", "do-while"],
    intro: "Branch and repeat. The reactor pulses while conditions hold.",
    briefBullets: ["if(x>0) {…} else {…}", "for(init; cond; step)", "while / do…while(cond);", "break and continue"] },
  { id: 5, name: "Act V — Pointer Sanctum", power: "Power of Pointers",
    topics: ["pointers", "address-of", "dereference", "pointer arithmetic"],
    intro: "Raw addresses. Take them with &, follow them with *, walk arrays with p++.",
    briefBullets: ["int* p = &x;", "*p reads/writes the value", "p+1 advances by sizeof(*p)", "NULL means no target"] },
  { id: 6, name: "Act VI — Function & Struct Citadel", power: "Power of Functions & Structs",
    topics: ["functions", "structs", "typedef", "header files"],
    intro: "Group state into structs, behavior into functions. The citadel of structured C.",
    briefBullets: ["int add(int a, int b){ return a+b; }", "struct Point { int x, y; };", "typedef struct Point Point;", "Pass struct* for efficiency"] },
];

const JAVA_ACTS: Act[] = [
  { id: 1, name: "Act I — JVM Awakens", power: "Power of Variables & I/O",
    topics: ["System.out", "Scanner", "primitives", "casting"],
    intro: "The JVM hums to life. Primitives are typed; Scanner reads from System.in.",
    briefBullets: ["int x = 5; double y = 1.5;", "Scanner sc = new Scanner(System.in);", "System.out.println(x);", "(int) y casts a double"] },
  { id: 2, name: "Act II — String Forge", power: "Power of Strings",
    topics: ["String", "StringBuilder", "string methods"],
    intro: "Strings are immutable in Java. Build them with StringBuilder when speed matters.",
    briefBullets: ["String s = \"hi\"; s.length()", "s.charAt(0), s.substring(0,2)", "s.equals(t) — never == for content", "StringBuilder sb = new StringBuilder();"] },
  { id: 3, name: "Act III — Array Foundry", power: "Power of Arrays",
    topics: ["arrays", "for-each", "Arrays.sort", "2D arrays"],
    intro: "Fixed-length arrays. Use Arrays utilities for the heavy lifting.",
    briefBullets: ["int[] a = {1,2,3};", "for (int x : a) { … }", "Arrays.sort(a);", "int[][] g = new int[3][3];"] },
  { id: 4, name: "Act IV — Control Loops", power: "Power of Loops & Conditions",
    topics: ["if", "else", "for", "while", "switch"],
    intro: "Branch and iterate the JVM way.",
    briefBullets: ["if (x > 0) {…} else {…}", "for (int i=0;i<n;i++)", "while / do-while", "switch(x) { case 1 -> … }"] },
  { id: 5, name: "Act V — Method Sanctum", power: "Power of Methods",
    topics: ["methods", "parameters", "return types", "static", "overloading"],
    intro: "Methods are the rituals of Java. Static for utilities, instance for behavior.",
    briefBullets: ["public static int add(int a,int b)", "void returns nothing", "Same name, different params = overloading", "Call: ClassName.method(...)"] },
  { id: 6, name: "Act VI — Class Citadel", power: "Power of OOP",
    topics: ["classes", "objects", "inheritance", "interfaces", "polymorphism"],
    intro: "Encapsulate, extend, implement. The citadel of object-oriented Java.",
    briefBullets: ["class Hero { private String name; … }", "class Mage extends Hero {…}", "interface Castable { void cast(); }", "@Override marks overrides"] },
];

export const TRACKS: Record<TrackKind, Track> = {
  c: {
    id: "c", name: "Project Vyana", codename: "Vyana Core Lab", language: "C",
    tagline: "Bend raw memory to your will.", feeling: "I can think like the machine.",
    accent: "violet", emoji: "🜔", centers: [],
    acts: C_ACTS,
    openingScript: [
      "Welcome, Coder. The world has gone silent — the machines have forgotten how to think.",
      "You are the chosen one. To revive them, you must gain the ancient powers: variables, strings, arrays, pointers, functions and structs.",
      "Each Act will grant you one Power. Solve ten trials per Act. Six Acts. Sixty trials.",
      "Then — and only then — you may face the Final Boss: the Segfault Wraith.",
    ],
    finalBossScript: [
      "Sixty trials cleared. Six Powers awakened.",
      "You now wield Variables, Strings, Arrays, Loops, Pointers and Structs.",
      "The Segfault Wraith stirs in the void. Use everything you have learned. Compile your fate.",
    ],
  },
  cpp: {
    id: "cpp", name: "Project Yantra", codename: "Yantra Systems Lab", language: "C++",
    tagline: "Engineer the systems that run the future.", feeling: "I can engineer scalable software systems.",
    accent: "cyan", emoji: "⚙",
    centers: [
      { name: "Control Systems", subtitle: "Industrial logic & automation", levelStart: 1, levelEnd: 20,
        topics: ["cout", "cin", "variables", "arithmetic", "I/O", "conditions", "loops", "nested loops", "arrays", "strings"],
        vibe: "Lit consoles managing factory floors." },
      { name: "Memory & Engineering", subtitle: "Inside the machine", levelStart: 21, levelEnd: 50,
        topics: ["functions", "parameters", "scope", "modular programming", "pointers", "references", "memory addresses", "dereferencing", "dynamic memory", "new/delete", "debugging", "memory leaks"],
        vibe: "Schematics, oscilloscopes, raw silicon." },
      { name: "Software Architecture", subtitle: "Scale & systems", levelStart: 51, levelEnd: 100,
        topics: ["classes", "objects", "constructors", "encapsulation", "inheritance", "polymorphism", "STL", "vectors", "maps", "algorithms", "mini projects", "architecture"],
        vibe: "Coordinated robotics frameworks at planetary scale." },
    ],
    acts: CPP_ACTS,
    openingScript: [
      "Welcome, Coder. The Yantra systems have fallen dark.",
      "You are the engineer fated to restore them. Six Powers await: Variables, Strings, Arrays, Loops, Pointers and Classes.",
      "Each Act tests you with ten trials. Clear all sixty to unlock the Final Boss.",
      "The Null Pointer Sovereign waits at the end. Earn your way to it.",
    ],
    finalBossScript: [
      "Every Power is yours. Every Act conquered.",
      "Variables, Strings, Vectors, Loops, Pointers, Classes — all bow to you.",
      "The Null Pointer Sovereign rises. Use everything. Defeat it.",
    ],
  },
  python: {
    id: "python", name: "Pythoria", codename: "The Saptapath", language: "Python",
    tagline: "Restore the ancient computational civilization.", feeling: "I can build intelligent computational systems.",
    accent: "amber", emoji: "🜂",
    centers: [
      { name: "Gateway Grove", subtitle: "Awakening dormant systems", levelStart: 1, levelEnd: 20,
        topics: ["print", "variables", "data types", "input", "arithmetic", "strings", "booleans", "type conversion", "conditions", "loops", "nested loops", "problem solving"],
        vibe: "Glowing inscriptions in a quiet observatory grove." },
      { name: "Library of Arya", subtitle: "Workflows of the archives", levelStart: 21, levelEnd: 35,
        topics: ["lists", "tuples", "sets", "string methods", "slicing", "iteration patterns"],
        vibe: "Vaulted halls of routing systems and scrolling indexes." },
      { name: "Water Observatory", subtitle: "Modular intelligence", levelStart: 36, levelEnd: 50,
        topics: ["functions", "parameters", "return values", "scope", "modular programming"],
        vibe: "Reflective basins flowing through reusable rituals." },
      { name: "Celestial Tower", subtitle: "Simulations of the sky", levelStart: 51, levelEnd: 80,
        topics: ["dictionaries", "nested structures", "comprehensions", "recursion", "simulations", "matrices", "randomness", "debugging"],
        vibe: "Star-charted matrices and predictive engines." },
      { name: "Garden of Memory", subtitle: "Designing intelligent entities", levelStart: 81, levelEnd: 100,
        topics: ["OOP", "classes", "inheritance", "modular systems", "mini projects", "architecture"],
        vibe: "Living architectures rooted in adaptive memory." },
    ],
    acts: PY_ACTS,
    openingScript: [
      "Welcome, Coder. The realm of Pythoria has lost its voice.",
      "You alone can restore it by gathering six Powers: Variables, Strings, Lists, Dicts, Functions and Classes.",
      "Each Act holds ten trials. Sixty in all. Solve them, and the Powers are yours.",
      "Only then will the Recursion Hydra dare to face you.",
    ],
    finalBossScript: [
      "Sixty trials. Six Powers. The Saptapath is complete.",
      "Variables, Strings, Lists, Dicts, Functions, Classes — your full arsenal.",
      "The Recursion Hydra emerges from the deep. Strike with everything you know.",
    ],
  },
  java: {
    id: "java", name: "Project Surya", codename: "Surya JVM Forge", language: "Java",
    tagline: "Forge enterprise-grade architectures.", feeling: "I can design and ship robust systems.",
    accent: "emerald", emoji: "☀",
    centers: [],
    acts: JAVA_ACTS,
    openingScript: [
      "Welcome, Coder. The JVM has gone cold.",
      "Reignite it. Six Powers await: Variables, Strings, Arrays, Loops, Methods and Classes.",
      "Each Act has ten trials. All sixty must fall before the Final Boss reveals itself.",
      "The NullPointerException Wyrm slumbers. Train. Then strike.",
    ],
    finalBossScript: [
      "Sixty trials cleared. Six Powers ignited.",
      "Strings, Arrays, Loops, Methods, Classes, Inheritance — all in your hands.",
      "The NullPointerException Wyrm rises. End it.",
    ],
  },
};

export const ALL_TRACK_IDS: TrackKind[] = ["c", "cpp", "python", "java"];

export function centerForLevel(track: TrackKind, level: number): Center {
  const t = TRACKS[track];
  if (!t.centers.length) {
    return { name: t.name, subtitle: t.tagline, levelStart: 1, levelEnd: 100, topics: [], vibe: t.feeling };
  }
  return t.centers.find((c) => level >= c.levelStart && level <= c.levelEnd) ?? t.centers[t.centers.length - 1];
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

export function starterCodeFor(track: TrackKind): string {
  if (track === "python") return "# Your solution here\n";
  if (track === "java")
    return "// Your solution here\npublic class Main {\n  public static void main(String[] args) {\n    \n  }\n}\n";
  if (track === "c")
    return "// Your solution here\n#include <stdio.h>\n\nint main(void) {\n  \n  return 0;\n}\n";
  return "// Your solution here\n#include <iostream>\nusing namespace std;\n\nint main() {\n  \n  return 0;\n}\n";
}

/** Act helpers. 10 questions per act, 6 acts → 60 total before Final Boss. */
export const QUESTIONS_PER_ACT = 10;
export const TOTAL_ACTS = 6;
export const FINAL_BOSS_THRESHOLD = QUESTIONS_PER_ACT * TOTAL_ACTS;

export function actForSolved(solved: number): number {
  // 0-9 solved → entering Act 1, 10-19 → Act 2, ... 50-59 → Act 6, 60+ → Final boss
  return Math.min(TOTAL_ACTS, Math.floor(solved / QUESTIONS_PER_ACT) + 1);
}

export function getAct(track: TrackKind, actId: number): Act | undefined {
  return TRACKS[track].acts.find((a) => a.id === actId);
}
