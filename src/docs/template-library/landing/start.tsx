import { StrictMode, startTransition } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";

const container = document.getElementById("root")!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// Attach React to the prerendered HTML (build), or render from scratch (dev). As a transition, hydration works in small
// slices and the page stays responsive meanwhile.
if (container.hasChildNodes()) startTransition(() => void hydrateRoot(container, app));
else createRoot(container).render(app);
