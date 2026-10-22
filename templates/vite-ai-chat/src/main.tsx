import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { YugenProvider } from "yugen-ui";
import AiAssistantBlock from "./blocks/ai-assistant";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <YugenProvider applyToDocument withToaster theme="light" brand="sakura">
      <main className="mx-auto flex min-h-dvh max-w-6xl flex-col gap-6 bg-shell p-6">
        <AiAssistantBlock />
      </main>
    </YugenProvider>
  </StrictMode>,
);
