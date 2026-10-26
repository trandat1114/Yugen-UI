import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import { cookies } from "next/headers";
import { BRAND_COOKIE, isBrand, isTheme, SYSTEM_THEME_SCRIPT, THEME_COOKIE } from "../appearance";
import { SiteHeader } from "../components/SiteHeader";
import content from "../content";
import { Providers } from "./providers";
import "./globals.css";

// Self-hosted at build time (no request to Google from the browser); becomes Yugen's base font in globals.css.
const sans = Noto_Sans({ subsets: ["latin", "vietnamese"], variable: "--font-noto-sans", display: "swap" });

export const metadata: Metadata = {
  title: { default: content.appName, template: `%s · ${content.appName}` },
  description: content.description,
  icons: { icon: "/favicon.svg" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Reading cookies makes pages render per request: the price of a server that knows the theme.
  const store = await cookies();
  const theme = store.get(THEME_COOKIE)?.value;
  const brand = store.get(BRAND_COOKIE)?.value;
  const savedTheme = isTheme(theme) ? theme : undefined;

  return (
    // suppressHydrationWarning: on a first visit the script below changes data-theme before React hydrates (this
    // element only, one level deep).
    <html lang={content.lang} data-theme={savedTheme ?? "light"} data-brand={isBrand(brand) ? brand : "sakura"} className={sans.variable} suppressHydrationWarning>
      <head>{!savedTheme && <script dangerouslySetInnerHTML={{ __html: SYSTEM_THEME_SCRIPT }} />}</head>
      <body>
        <Providers theme={savedTheme} brand={isBrand(brand) ? brand : "sakura"}>
          <SiteHeader />
          <main id="content" className="mx-auto w-full max-w-5xl px-4 py-10">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
