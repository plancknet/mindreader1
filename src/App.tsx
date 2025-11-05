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
import Premium from "./pages/Premium";
import PremiumSuccess from "./pages/PremiumSuccess";
import ConnectMind from "./pages/MindReader/ConnectMind";
import SelectTheme from "./pages/MindReader/SelectTheme";
import StartPrompt from "./pages/MindReader/StartPrompt";
import GamePlay from "./pages/MindReader/GamePlay";
import Result from "./pages/MindReader/Result";
import Instructions from "./pages/MindReader/Instructions";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if in guest mode
    const isGuest = sessionStorage.getItem('guestMode') === 'true';
    if (isGuest) {
      setLoading(false);
      return;
    }

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

  const isGuest = sessionStorage.getItem('guestMode') === 'true';
  if (!session && !isGuest) {
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
            <Route path="/auth" element={<Auth />} />
            <Route path="/premium" element={<ProtectedRoute><Premium /></ProtectedRoute>} />
            <Route path="/premium/success" element={<ProtectedRoute><PremiumSuccess /></ProtectedRoute>} />
            <Route path="/" element={<ProtectedRoute><ConnectMind /></ProtectedRoute>} />
            <Route path="/instructions" element={<ProtectedRoute><Instructions /></ProtectedRoute>} />
            <Route path="/select-theme" element={<ProtectedRoute><SelectTheme /></ProtectedRoute>} />
            <Route path="/start-prompt" element={<ProtectedRoute><StartPrompt /></ProtectedRoute>} />
            <Route path="/gameplay" element={<ProtectedRoute><GamePlay /></ProtectedRoute>} />
            <Route path="/result" element={<ProtectedRoute><Result /></ProtectedRoute>} />
            <Route path="/detector" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
