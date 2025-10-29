import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ConnectMind from "./pages/MindReader/ConnectMind";
import SelectTheme from "./pages/MindReader/SelectTheme";
import GamePlay from "./pages/MindReader/GamePlay";
import Result from "./pages/MindReader/Result";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ConnectMind />} />
          <Route path="/select-theme" element={<SelectTheme />} />
          <Route path="/gameplay" element={<GamePlay />} />
          <Route path="/result" element={<Result />} />
          <Route path="/detector" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
