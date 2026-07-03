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

try {
  const variant = localStorage.getItem("design-variant");
  if (variant === "noir") {
    document.documentElement.classList.add("theme-noir");
  }
} catch {}

const container = document.getElementById("root")!;
const mount = () => createRoot(container).render(<App />);

ensureFreshAssets().then((ready) => {
  if (ready) {
    mount();
  }
});
