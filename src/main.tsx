import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ensureFreshAssets } from "./versioning/ensureFreshAssets";

const container = document.getElementById("root")!;
const mount = () => createRoot(container).render(<App />);

ensureFreshAssets().then((ready) => {
  if (ready) {
    mount();
  }
});
