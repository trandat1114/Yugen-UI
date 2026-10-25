import * as React from "react";
import { YugenProvider, type YugenBrand, type YugenTheme } from "@/components/ui";
import content from "./content";
import { Welcome, type Appearance } from "./Welcome";

/** Cùng khoá với script chống nháy trong index.html. */
const STORAGE_KEY = "yugen-starter-appearance";

function initialAppearance(): Appearance {
  // Script trong index.html đã đặt data-theme / data-brand trước khi React chạy — đọc lại cho khớp.
  const root = document.documentElement;
  return {
    theme: (root.getAttribute("data-theme") as YugenTheme | null) ?? "light",
    brand: (root.getAttribute("data-brand") as YugenBrand | null) ?? "sakura",
  };
}

export default function App() {
  const [appearance, setAppearance] = React.useState(initialAppearance);

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appearance));
    } catch {
      /* storage bị chặn */
    }
  }, [appearance]);

  return (
    <YugenProvider applyToDocument withToaster theme={appearance.theme} brand={appearance.brand} messages={content.messages}>
      {/* Bắt đầu ứng dụng của bạn ở đây — thay <Welcome /> bằng component của bạn. */}
      <Welcome appearance={appearance} onAppearanceChange={(patch) => setAppearance((a) => ({ ...a, ...patch }))} />
    </YugenProvider>
  );
}
