import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { YugenProvider } from "yugen-ui";
import StatsBlock from "./blocks/stats";
import AnalyticsBlock from "./blocks/analytics";
import TransactionsBlock from "./blocks/transactions";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <YugenProvider applyToDocument withToaster theme="light" brand="sakura">
      <main className="mx-auto flex min-h-dvh max-w-6xl flex-col gap-XXL bg-shell p-XXL">
        <StatsBlock />
        <AnalyticsBlock />
        <TransactionsBlock />
      </main>
    </YugenProvider>
  </StrictMode>,
);
