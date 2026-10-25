import * as React from "react";
import { YugenProvider, type YugenTheme } from "@/components/ui";
import { BlogLayout } from "./BlogLayout";
import content from "./content";
import { BrowserRouter } from "./router";

/** Cùng khoá với script chống nháy trong index.html. */
const STORAGE_KEY = "yugen-blog-theme";

function initialTheme(): YugenTheme {
  // Script trong index.html đã đặt data-theme trước khi React chạy — đọc lại cho khớp.
  const t = document.documentElement.getAttribute("data-theme");
  return t === "dark" || t === "high-contrast" ? t : "light";
}

export default function App() {
  const [theme, setTheme] = React.useState(initialTheme);

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ theme }));
    } catch {
      /* storage bị chặn */
    }
  }, [theme]);

  return (
    <YugenProvider
      applyToDocument
      withToaster
      theme={theme}
      brand="sakura"
      messages={content.messages}
      locale={content.locale}
    >
      <BrowserRouter>
        <BlogLayout theme={theme} onThemeChange={setTheme} />
      </BrowserRouter>
    </YugenProvider>
  );
}
