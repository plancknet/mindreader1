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

// Guest routes - allow access without authentication
const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

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
            <Route path="/auth" element={<Auth />} />
            {/* Premium routes require authentication */}
            <Route path="/premium" element={<ProtectedRoute><Premium /></ProtectedRoute>} />
            <Route path="/premium/success" element={<ProtectedRoute><PremiumSuccess /></ProtectedRoute>} />
            {/* Game routes allow guest mode */}
            <Route path="/" element={<GuestRoute><ConnectMind /></GuestRoute>} />
            <Route path="/instructions" element={<GuestRoute><Instructions /></GuestRoute>} />
            <Route path="/select-theme" element={<GuestRoute><SelectTheme /></GuestRoute>} />
            <Route path="/start-prompt" element={<GuestRoute><StartPrompt /></GuestRoute>} />
            <Route path="/gameplay" element={<GuestRoute><GamePlay /></GuestRoute>} />
            <Route path="/result" element={<GuestRoute><Result /></GuestRoute>} />
            <Route path="/detector" element={<GuestRoute><Index /></GuestRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
