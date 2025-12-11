import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useState, useEffect, useRef } from "react";
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
import { ChooseCard as MixDeCartasChoose } from "./pages/MindReader/MixDeCartas/ChooseCard";
import { Reveal as MixDeCartasReveal } from "./pages/MindReader/MixDeCartas/Reveal";
import MixDeCartasInstructions from "./pages/MixDeCartasInstructions";
import PontaCarta from "./pages/PontaCarta";
import Result from "./pages/MindReader/Result";
import Instructions from "./pages/MindReader/Instructions";
import MysteryWord from "./pages/MysteryWord/Index";
import MysteryWordInstructions from "./pages/MysteryWord/Instructions";
import MentalConversation from "./pages/MentalConversation/Index";
import MentalConversationInstructions from "./pages/MentalConversation/Instructions";
import MyEmojis from "./pages/MyEmojis/Index";
import MyEmojisInstructions from "./pages/MyEmojis/Instructions";
import Welcome from "./pages/Welcome";
import AdminPanel from "./pages/AdminPanel";
import Landing from "./pages/Landing";
import LandingSignup from "./pages/LandingSignup";
import InfluencerCouponSetup from "./pages/InfluencerCouponSetup";
import InfluencerDashboard from "./pages/InfluencerDashboard";
import CartaMental from "./pages/CartaMental";
import CartaMentalInstructions from "./pages/CartaMentalInstructions";
import RaspaCarta from "./pages/RaspaCarta";
import RaspaCartaInstructions from "./pages/RaspaCartaInstructions";
import SuasPalavras from "./pages/SuasPalavras";
import SuasPalavrasInstructions from "./pages/SuasPalavrasInstructions";
import PapoReto from "./pages/PapoReto";
import EuJaSabia from "./pages/EuJaSabia";
import EuJaSabia2 from "./pages/EuJaSabia2";
import PontaCartaInstructions from "./pages/PontaCartaInstructions";
import CartaPensada from "./pages/CartaPensada";
import CartaPensadaInstructions from "./pages/CartaPensadaInstructions";
import OiSumida from "./pages/OiSumida";

const queryClient = new QueryClient();

// Protected routes - require authentication (no guest mode allowed)
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const lastLoginUpdateRef = useRef<string | null>(null);

  const recordLastLogin = async (userId: string) => {
    if (lastLoginUpdateRef.current === userId) return;
    lastLoginUpdateRef.current = userId;
    try {
      await supabase
        .from('users')
        .update({ last_accessed_at: new Date().toISOString() })
        .eq('user_id', userId);
    } catch (error) {
      console.error('Erro ao atualizar último acesso', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setLoading(false);
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') && session?.user) {
        void recordLastLogin(session.user.id);
      }
    });

    // Check for existing session and record access
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session?.user) {
        void recordLastLogin(session.user.id);
      }
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

const PostLoginRedirect = () => {
  const [targetPath, setTargetPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkWelcomeStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setTargetPath('/auth');
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('users')
          .select('has_seen_welcome, subscription_tier, subscription_status, plan_confirmed, coupon_generated')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          setTargetPath('/premium');
          return;
        }

        const tier = (data?.subscription_tier as 'FREE' | 'STANDARD' | 'INFLUENCER' | null) ?? 'FREE';
        const status = data?.subscription_status ?? 'inactive';
        const planConfirmed = Boolean(data?.plan_confirmed);

        if (tier === 'STANDARD') {
          if (!planConfirmed) {
            setTargetPath('/premium');
            return;
          }
          if (!data?.has_seen_welcome) {
            setTargetPath('/welcome');
            return;
          }
          const hasCameraPermission = await navigator.mediaDevices
            ?.getUserMedia({ video: true })
            .then(() => true)
            .catch(() => false);
          if (!hasCameraPermission) {
            setTargetPath('/connect-mind');
            return;
          }
          setTargetPath('/game-selector');
          return;
        }

        if (tier === 'INFLUENCER') {
          if (!planConfirmed || status !== 'active') {
            setTargetPath('/premium');
            return;
          }
          if (!data?.coupon_generated) {
            setTargetPath('/influencer/coupon');
            return;
          }
          if (!data?.has_seen_welcome) {
            setTargetPath('/welcome');
            return;
          }
          const hasCameraPermission = await navigator.mediaDevices
            ?.getUserMedia({ video: true })
            .then(() => true)
            .catch(() => false);
          if (!hasCameraPermission) {
            setTargetPath('/connect-mind');
            return;
          }
          setTargetPath('/game-selector');
          return;
        }

        setTargetPath('/premium');
      } catch (error) {
        console.error('Error checking welcome status:', error);
        setTargetPath('/welcome');
      } finally {
        setLoading(false);
      }
    };

    checkWelcomeStatus();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!targetPath) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <Navigate to={targetPath} replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ProtectedRoute><PostLoginRedirect /></ProtectedRoute>} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/landing-signup" element={<LandingSignup />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/complete-signup" element={<CompleteSignup />} />
            <Route path="/welcome" element={<ProtectedRoute><Welcome /></ProtectedRoute>} />
            {/* Admin panel */}
            <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
            {/* Premium routes require authentication */}
            <Route path="/premium" element={<ProtectedRoute><Premium /></ProtectedRoute>} />
            <Route path="/premium/success" element={<ProtectedRoute><PremiumSuccess /></ProtectedRoute>} />
            <Route path="/influencer/coupon" element={<ProtectedRoute><InfluencerCouponSetup /></ProtectedRoute>} />
            <Route path="/influencer/dashboard" element={<ProtectedRoute><InfluencerDashboard /></ProtectedRoute>} />
            {/* Game selector */}
            <Route path="/game-selector" element={<ProtectedRoute><GameSelector /></ProtectedRoute>} />
            {/* Mind Reader game routes */}
            <Route path="/connect-mind" element={<ProtectedRoute><ConnectMind /></ProtectedRoute>} />
            <Route path="/mind-reader/instructions" element={<ProtectedRoute><Instructions /></ProtectedRoute>} />
            <Route path="/mind-reader/mix-de-cartas" element={<ProtectedRoute><MixDeCartasChoose /></ProtectedRoute>} />
            <Route path="/mind-reader/mix-de-cartas/reveal" element={<ProtectedRoute><MixDeCartasReveal /></ProtectedRoute>} />
            <Route path="/mix-de-cartas/instrucoes" element={<ProtectedRoute><MixDeCartasInstructions /></ProtectedRoute>} />
            <Route path="/ponta-da-carta" element={<ProtectedRoute><PontaCarta /></ProtectedRoute>} />
            <Route path="/ponta-da-carta/instrucoes" element={<ProtectedRoute><PontaCartaInstructions /></ProtectedRoute>} />
            <Route path="/carta-mental" element={<ProtectedRoute><CartaMental /></ProtectedRoute>} />
            <Route path="/carta-mental/instrucoes" element={<ProtectedRoute><CartaMentalInstructions /></ProtectedRoute>} />
            <Route path="/raspa-carta" element={<ProtectedRoute><RaspaCarta /></ProtectedRoute>} />
            <Route path="/raspa-carta/instrucoes" element={<ProtectedRoute><RaspaCartaInstructions /></ProtectedRoute>} />
            <Route path="/suas-palavras" element={<ProtectedRoute><SuasPalavras /></ProtectedRoute>} />
            <Route path="/suas-palavras/instrucoes" element={<ProtectedRoute><SuasPalavrasInstructions /></ProtectedRoute>} />
            <Route path="/carta-pensada" element={<ProtectedRoute><CartaPensada /></ProtectedRoute>} />
            <Route path="/carta-pensada/instrucoes" element={<ProtectedRoute><CartaPensadaInstructions /></ProtectedRoute>} />
            <Route path="/papo-reto" element={<ProtectedRoute><PapoReto /></ProtectedRoute>} />
            <Route path="/eu-ja-sabia" element={<ProtectedRoute><EuJaSabia /></ProtectedRoute>} />
            <Route path="/eu-ja-sabia-2" element={<ProtectedRoute><EuJaSabia2 /></ProtectedRoute>} />
            <Route path="/oi-sumida" element={<ProtectedRoute><OiSumida /></ProtectedRoute>} />
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
