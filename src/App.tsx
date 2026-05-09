import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Auth from "./pages/Auth.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Topics from "./pages/Topics.tsx";
import GameSelect from "./pages/GameSelect.tsx";
import Lobby from "./pages/Lobby.tsx";
import Room from "./pages/Room.tsx";
import Play from "./pages/Play.tsx";

import StoryMap from "./pages/StoryMap.tsx";
import StoryLevel from "./pages/StoryLevel.tsx";
import CStoryMode from "./pages/CStoryMode.tsx";
import Shop from "./pages/Shop.tsx";
import Leaderboard from "./pages/Leaderboard.tsx";
import Profile from "./pages/Profile.tsx";
import Pricing from "./pages/Pricing.tsx";
import { ProtectedRoute } from "./components/funcode/ProtectedRoute.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/topics" element={<ProtectedRoute><Topics /></ProtectedRoute>} />
          <Route path="/games/:slug" element={<ProtectedRoute><GameSelect /></ProtectedRoute>} />
          <Route path="/lobby/:slug/:gameType" element={<ProtectedRoute><Lobby /></ProtectedRoute>} />
          <Route path="/room/:id" element={<ProtectedRoute><Room /></ProtectedRoute>} />
          
          <Route path="/story" element={<ProtectedRoute><StoryMap /></ProtectedRoute>} />
          <Route path="/story/c/play" element={<ProtectedRoute><CStoryMode /></ProtectedRoute>} />
          <Route path="/story/:track" element={<ProtectedRoute><StoryLevel /></ProtectedRoute>} />
          <Route path="/shop" element={<ProtectedRoute><Shop /></ProtectedRoute>} />
          <Route path="/play/:topic/:gameType" element={<ProtectedRoute><Play /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
