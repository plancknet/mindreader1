import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "@fontsource/sora/400.css";
import "@fontsource/sora/600.css";
import "@fontsource/sora/700.css";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import { ensureFreshAssets } from "./versioning/ensureFreshAssets";
import { supabase } from "./integrations/supabase/client";
import { applyDesignClasses } from "./hooks/useGlobalDesign";

const preloadGlobalDesign = async () => {
  try {
    const { data } = await supabase
      .from("app_settings")
      .select("design_variant, theme_mode")
      .limit(1)
      .maybeSingle();
    applyDesignClasses(
      (data?.design_variant as "classic" | "noir") ?? "classic",
      (data?.theme_mode as "light" | "dark") ?? "light",
    );
  } catch {
    applyDesignClasses("classic", "light");
  }
};

const container = document.getElementById("root")!;
const mount = () => createRoot(container).render(<App />);

Promise.all([ensureFreshAssets(), preloadGlobalDesign()]).then(([ready]) => {
  if (ready) {
    mount();
  }
});
