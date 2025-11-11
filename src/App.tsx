import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import CompleteSignup from "./pages/CompleteSignup";
import Premium from "./pages/Premium";
import PremiumSuccess from "./pages/PremiumSuccess";
import GameSelector from "./pages/GameSelector";
import ConnectMind from "./pages/MindReader/ConnectMind";
import SelectTheme from "./pages/MindReader/SelectTheme";
import StartPrompt from "./pages/MindReader/StartPrompt";
import GamePlay from "./pages/MindReader/GamePlay";
import Result from "./pages/MindReader/Result";
import Instructions from "./pages/MindReader/Instructions";
import MysteryWord from "./pages/MysteryWord/Index";
import MysteryWordInstructions from "./pages/MysteryWord/Instructions";
import MentalConversation from "./pages/MentalConversation/Index";
import MentalConversationInstructions from "./pages/MentalConversation/Instructions";
import MyEmojis from "./pages/MyEmojis/Index";
import MyEmojisInstructions from "./pages/MyEmojis/Instructions";
import Welcome from "./pages/Welcome";

const queryClient = new QueryClient();

// Protected routes - require authentication (no guest mode allowed)
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setLoading(false);
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/game-selector" replace />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/complete-signup" element={<CompleteSignup />} />
            <Route path="/welcome" element={<ProtectedRoute><Welcome /></ProtectedRoute>} />
            {/* Premium routes require authentication */}
            <Route path="/premium" element={<ProtectedRoute><Premium /></ProtectedRoute>} />
            <Route path="/premium/success" element={<ProtectedRoute><PremiumSuccess /></ProtectedRoute>} />
            {/* Game selector */}
            <Route path="/game-selector" element={<ProtectedRoute><GameSelector /></ProtectedRoute>} />
            {/* Mind Reader game routes */}
            <Route path="/connect-mind" element={<ProtectedRoute><ConnectMind /></ProtectedRoute>} />
            <Route path="/mind-reader/instructions" element={<ProtectedRoute><Instructions /></ProtectedRoute>} />
            <Route path="/select-theme" element={<ProtectedRoute><SelectTheme /></ProtectedRoute>} />
            <Route path="/start-prompt" element={<ProtectedRoute><StartPrompt /></ProtectedRoute>} />
            <Route path="/gameplay" element={<ProtectedRoute><GamePlay /></ProtectedRoute>} />
            <Route path="/result" element={<ProtectedRoute><Result /></ProtectedRoute>} />
            {/* Mystery Word game */}
            <Route path="/mystery-word" element={<ProtectedRoute><MysteryWord /></ProtectedRoute>} />
            <Route path="/mystery-word/instructions" element={<ProtectedRoute><MysteryWordInstructions /></ProtectedRoute>} />
            {/* Mental Conversation game */}
            <Route path="/mental-conversation" element={<ProtectedRoute><MentalConversation /></ProtectedRoute>} />
            <Route path="/mental-conversation/instructions" element={<ProtectedRoute><MentalConversationInstructions /></ProtectedRoute>} />
            {/* My Emojis game */}
            <Route path="/my-emojis" element={<ProtectedRoute><MyEmojis /></ProtectedRoute>} />
            <Route path="/my-emojis/instructions" element={<ProtectedRoute><MyEmojisInstructions /></ProtectedRoute>} />
            <Route path="/detector" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
