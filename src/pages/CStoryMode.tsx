import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AppNavbar } from "@/components/funcode/AppNavbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Send, Bot, Map as MapIcon, BookOpen, Play, X } from "lucide-react";
import { generateStoryChallenge, type StoryChallenge, evaluateCodeSubmission } from "@/lib/gemini";
import { C_ACTS, C_TREASURE_HUNT_PROLOGUE, getLevelBeat, getStoryProgressSummary } from "@/lib/c_story";
import { NarratorDialog } from "@/components/funcode/NarratorDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function CStoryMode() {
  const { user } = useAuth();
  const nav = useNavigate();
  const SOLVED_KEY = "cStoryMode:solved";
  
  const readSolved = () => {
    try { return parseInt(localStorage.getItem(SOLVED_KEY) ?? "0", 10) || 0; } catch { return 0; }
  };

  const [solved, setSolved] = useState<number>(readSolved());
  const currentLevel = Math.min(solved + 1, 100);
  const actIndex = Math.floor((currentLevel - 1) / 10);
  const currentAct = C_ACTS[Math.min(actIndex, 9)];

  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [challenge, setChallenge] = useState<StoryChallenge | null>(null);
  const [code, setCode] = useState("");
  const [liveFeedback, setLiveFeedback] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Cinematic & Map Overlays
  const [showPrologue, setShowPrologue] = useState(solved === 0);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [visualLevel, setVisualLevel] = useState(currentLevel);

  // Fetch challenge on mount or level change
  useEffect(() => {
    const fetchChallenge = async () => {
      setLoading(true);
      setChallenge(null);
      const beat = getLevelBeat(currentLevel);
      const data = await generateStoryChallenge(currentAct.title, currentLevel, beat, currentAct.topics);
      setChallenge(data);
      setCode(data.starterCode);
      setLoading(false);
    };
    if (!showPrologue && currentLevel === visualLevel) {
      fetchChallenge();
    }
  }, [currentLevel, visualLevel, currentAct, showPrologue]);

  // No more live typing feedback to save API quota.
  // We will evaluate the code only when the user clicks Submit.
  const submitCode = async () => {
    if (!code.trim() || !challenge) return;
    setEvaluating(true);
    
    // Call Gemini to evaluate the code
    const evaluation = await evaluateCodeSubmission(challenge.task, code, challenge.expectedOutput);
    
    if (!evaluation.passed) {
      // Show feedback and stop
      setLiveFeedback(evaluation.feedback);
      setEvaluating(false);
      return;
    }
    
    // If passed, clear feedback and level up
    setLiveFeedback("Great job! The ancient code holds true.");
    
    const nextLevel = Math.min(currentLevel + 1, 100);
    
    // Level Up Animation Sequence
    setIsMapOpen(true); // Open the map overlay
    
    // Reward XP in Supabase
    if (user) {
      (async () => {
        const xpReward = 100;
        const { data: profile } = await supabase.from("profiles").select("total_xp").eq("id", user.id).single();
        if (profile) {
          const newXp = (profile.total_xp || 0) + xpReward;
          const newLevel = Math.floor(newXp / 500) + 1;
          await supabase.from("profiles").update({ total_xp: newXp, level: newLevel }).eq("id", user.id);
          
          // Also record a match for the dashboard history
          await supabase.from("matches").insert({
            user_id: user.id,
            score: 1,
            correct_count: 1,
            total_questions: 1,
            xp_earned: xpReward,
            topic_id: null, // C Story Mode specific
          });
        }
      })();
    }
    
    // Wait for map to render, then trigger movement
    setTimeout(() => {
      toast.success(nextLevel === 100 ? "The Prime Compiler is revealed!" : "Challenge cleared! The path opens...");
      setVisualLevel(nextLevel); // This triggers the CSS transition of the player marker
      
      // Wait for the marker to move, then close map and load next level
      setTimeout(() => {
        setIsMapOpen(false);
        setSolved(nextLevel - 1);
        localStorage.setItem(SOLVED_KEY, (nextLevel - 1).toString());
        setEvaluating(false);
      }, 3000);
    }, 800);
  };

  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Map Generation Logic (Clustered by Act for Terrain Matching)
  const pathPoints = Array.from({ length: 100 }).map((_, i) => {
    const actIdx = Math.floor(i / 10);
    const levelInAct = i % 10;

    const actProgress = actIdx / 9; // 0 to 1
    const subProgress = levelInAct / 9; // 0 to 1

    // Y percentage: Acts are spaced out across 75% of the height, 
    // and levels within an act are grouped tightly in a 10% band.
    const yPercent = 95 - (actProgress * 75) - (subProgress * 10); 
    
    // X percentage: Sine wave curve that sweeps across the map
    const curveProgress = actProgress + (subProgress * 0.1);
    const xPercent = 50 + Math.sin(curveProgress * Math.PI * 3.5) * 35;

    return { xPercent, yPercent };
  });

  const renderCheckpoints = () => {
    return (
      <>
        {/* Winding SVG Path */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" preserveAspectRatio="none">
          <polyline 
            points={pathPoints.map(p => `${p.xPercent}%, ${p.yPercent}%`).join(" ")} 
            fill="none" 
            stroke="rgba(255, 255, 255, 0.4)" 
            strokeWidth="3" 
            strokeDasharray="6, 6" 
          />
        </svg>

        {Array.from({ length: 100 }).map((_, i) => {
          const levelNum = i + 1;
          const { xPercent, yPercent } = pathPoints[i];
          const actIdx = Math.floor(i / 10);

          const isCompleted = levelNum < visualLevel;
          const isCurrent = levelNum === visualLevel;

          return (
            <div 
              key={levelNum}
              className={`absolute w-3 h-3 md:w-4 md:h-4 -ml-1.5 -mt-1.5 md:-ml-2 md:-mt-2 rounded-full border-[2px] transition-all duration-[2000ms] ease-in-out ${isCurrent ? 'active-checkpoint z-50 bg-primary border-white scale-[2] shadow-[0_0_20px_hsl(var(--primary))]' : isCompleted ? 'bg-primary/80 border-white/50' : 'bg-black/50 border-white/20 backdrop-blur-md'}`}
              style={{ 
                top: `${yPercent}%`, 
                left: `${xPercent}%`,
              }}
              title={`Level ${levelNum}`}
            >
              {isCurrent && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <Badge variant="default" className="shadow-2xl animate-bounce text-sm px-3 py-1 bg-white text-black border-none">You are here</Badge>
                </div>
              )}
              {/* Display Act Title above the first level of each Act */}
              {levelNum % 10 === 1 && (
                <div className="absolute top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] md:text-xs font-bold text-white shadow-lg uppercase tracking-widest bg-black/70 px-3 py-1 rounded-full backdrop-blur-md border border-white/10 text-center">
                  <div className="text-primary/90 text-[9px] mb-0.5 leading-none">Act {actIdx + 1}</div>
                  {C_ACTS[actIdx].title}
                </div>
              )}
            </div>
          );
        })}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <AppNavbar />
      
      <main className="flex-1 pt-24 pb-12 px-4 max-w-[1600px] mx-auto w-full flex flex-col gap-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-4 rounded-2xl shrink-0">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Project Kailasa</div>
            <h1 className="font-display font-black text-2xl text-primary">C Story Mode</h1>
            <div className="text-sm text-foreground/80 font-medium">Act {currentAct.id}: {currentAct.title} (Level {currentLevel}/100)</div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsMapOpen(true)}>
              <MapIcon className="w-4 h-4 mr-2" /> View Map
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary"><BookOpen className="w-4 h-4 mr-2" /> Storyline</Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>The Lost Compiler of Kailasa</DialogTitle>
                </DialogHeader>
                <div className="mt-4 space-y-4 text-sm leading-relaxed text-foreground/80">
                  <p className="italic text-primary">{C_TREASURE_HUNT_PROLOGUE}</p>
                  <h3 className="font-bold text-foreground mt-6">Your Journey So Far:</h3>
                  <p>{getStoryProgressSummary(currentLevel)}</p>
                  <div className="mt-6 border-l-2 border-border pl-4 space-y-4">
                    {C_ACTS.map((act) => (
                      <div key={act.id} className={act.id > actIndex + 1 ? "opacity-30" : ""}>
                        <div className="font-bold">Act {act.id}: {act.title}</div>
                        <div className="text-xs text-muted-foreground">{act.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Story Narrative & Code Editor */}
        {loading ? (
            <div className="flex-1 glass-panel flex flex-col items-center justify-center p-20 text-center rounded-2xl min-h-[500px]">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <h2 className="text-xl font-display font-bold">Consulting the Ancient Texts...</h2>
              <p className="text-muted-foreground mt-2">Generating your next challenge.</p>
            </div>
        ) : challenge ? (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* Narrative Panel (Left Side) */}
            <div className="glass-panel p-6 border-primary/30 bg-primary/5 relative overflow-hidden rounded-2xl flex flex-col">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary font-bold mb-3">
                <Play className="w-3 h-3" /> <span>Story Continuation</span>
              </div>
              <p className="text-lg leading-relaxed text-foreground/90 font-medium">
                {getLevelBeat(currentLevel)}
              </p>
              <div className="mt-6 pt-6 border-t border-border/50 flex-1">
                <h3 className="font-display font-bold text-xl mb-4">{challenge.task}</h3>
                <div className="flex flex-col gap-2">
                  <div className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Expected Output:</div>
                  <div className="bg-black/60 border border-border p-3 rounded-xl font-mono text-primary text-sm whitespace-pre-wrap">
                    {challenge.expectedOutput}
                  </div>
                </div>
              </div>
            </div>

            {/* Code Editor (Right Side) */}
            <div className="flex flex-col gap-3 min-h-[500px]">
              <div className="flex justify-between items-end">
                <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">C Compiler</div>
                {challenge.hints.length > 0 && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Bot className="w-3 h-3" /> Hints available below
                  </div>
                )}
              </div>
              
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="font-mono text-base bg-[#0a0a0c] border-border text-foreground flex-1 p-6 resize-none rounded-2xl shadow-inner"
                spellCheck={false}
              />

              {/* AI Insights / Compilation Feedback */}
              <div className="rounded-2xl border border-border/60 bg-black/40 p-5 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-4 h-4 text-primary" />
                  <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">AI Compilation Insights</span>
                  {evaluating && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground ml-2" />}
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed min-h-[1.25rem]">
                  {liveFeedback || challenge.hints[0] || "Click 'Run' to evaluate your code..."}
                </p>
              </div>

              <div className="flex justify-end mt-2">
                <Button variant="default" size="lg" className="w-full sm:w-auto px-8 text-base shadow-[0_0_30px_-5px_hsl(var(--primary))]" onClick={submitCode} disabled={evaluating || !code.trim()}>
                  {evaluating ? (<><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Compiling...</>) :
                                  (<><Send className="w-5 h-5 mr-2" /> Run & Unlock Next Level</>)}
                </Button>
              </div>
            </div>
          </div>
        ) : null}

      </main>

      {/* Prologue Cinematic */}
      <NarratorDialog
        open={showPrologue}
        eyebrow="The Lost Compiler of Kailasa"
        character="Professor Varma"
        avatar="🗺️"
        title="Prologue"
        scenes={[{ text: C_TREASURE_HUNT_PROLOGUE }]}
        onClose={() => setShowPrologue(false)}
      />

      {/* Full Screen Map Overlay */}
      {isMapOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col backdrop-blur-md animate-fade-in">
          <div className="p-4 flex justify-between items-center bg-black/50 border-b border-white/10 absolute top-0 left-0 right-0 z-20 backdrop-blur-md">
            <div>
              <h2 className="font-display font-bold text-xl text-white">Treasure Map</h2>
              <p className="text-xs text-white/60">The Path to the Prime Compiler</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => !evaluating && setIsMapOpen(false)} disabled={evaluating}>
              <X className="w-6 h-6 text-white" />
            </Button>
          </div>
          
          <div className="flex-1 w-full h-full p-4 pt-24 pb-12 flex items-center justify-center relative">
            {/* The actual realistic map background, fitted to screen, now much wider */}
            <div 
              className="relative w-full h-full max-w-[1400px] mx-auto border border-white/20 shadow-2xl rounded-[2rem] overflow-hidden bg-black"
              style={{ 
                backgroundImage: "url('/treasure_map.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center bottom'
              }}
            >
              {/* Dark gradient overlays for readability at top and bottom */}
              <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

              {/* Glowing Temple Goal at top */}
              <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center pointer-events-none z-10">
                <div className="font-display font-black text-3xl md:text-5xl text-white drop-shadow-[0_0_20px_rgba(255,255,255,1)]">The Prime Compiler</div>
              </div>

              {/* Checkpoints */}
              <div className="absolute inset-0">
                {renderCheckpoints()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
