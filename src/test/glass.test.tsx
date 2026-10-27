import fs from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { act, render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Home20Regular } from "@fluentui/react-icons";
import { Button } from "@/components/ui/Button/Button";
import { Menu, MenuItem, MenuPopover, MenuTrigger } from "@/components/ui/Menu/Menu";
import { Tabs, TabsList, TabsTrigger, useScrollMinimize } from "@/components/ui/Tabs/Tabs";
import { Toolbar, ToolbarButton } from "@/components/ui/Toolbar/Toolbar";
import { cn } from "@/lib/cn";

/*
 * Glass (Yugen Labs, #178): tương phản tính thẳng từ tokens.css, fallback trợ năng trong index.css, và class / trạng thái
 * của component. Phần hiển thị thật (blur, media query) do E2E kiểm (e2e/glass.spec.ts).
 */

const root = path.resolve(__dirname, "../..");
const tokens = fs.readFileSync(path.join(root, "src/styles/tokens.css"), "utf8").replace(/\r\n/g, "\n");
const indexCss = fs.readFileSync(path.join(root, "src/index.css"), "utf8").replace(/\r\n/g, "\n");

/** Khai báo trong khối CSS mở đầu đúng bằng `head` (selector + " {"). */
function block(head: string): Record<string, string> {
  const start = tokens.indexOf(`\n${head} {\n`);
  if (start < 0) throw new Error(`Không thấy khối ${head}`);
  const body = tokens.slice(start, tokens.indexOf("\n}", start));
  return Object.fromEntries([...body.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
}

const globals = block(":root");
const themes = {
  light: { ...globals, ...block(':root,\n[data-theme="light"]'), ...block(':root,\n[data-theme="light"],\n[data-brand]') },
  dark: {
    ...globals,
    ...block('[data-theme="dark"]'),
    ...block('[data-theme="dark"],\n[data-theme="dark"] [data-brand],\n[data-brand][data-theme="dark"]'),
  },
};

type Rgba = [number, number, number, number];

function resolve(value: string, scope: Record<string, string>): string {
  return value.replace(/var\((--[\w-]+)\)/g, (_, name: string) => {
    if (!(name in scope)) throw new Error(`Thiếu token ${name}`);
    return resolve(scope[name], scope);
  });
}

function parse(value: string): Rgba {
  const hex = value.match(/^#([0-9a-f]{6})$/i);
  if (hex) return [0, 2, 4].map((i) => parseInt(hex[1].slice(i, i + 2), 16)).concat(1) as Rgba;
  const rgb = value.match(/^rgb\((\d+) (\d+) (\d+) \/ ([\d.]+)\)$/);
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3]), Number(rgb[4])];
  const mix = value.match(/^color-mix\(in srgb, (#[0-9a-f]{6}) (\d+)%, transparent\)$/i);
  if (mix) {
    const [r, g, b] = parse(mix[1]);
    return [r, g, b, Number(mix[2]) / 100];
  }
  throw new Error(`Không đọc được màu ${value}`);
}

const over = ([r, g, b, a]: Rgba, [br, bg, bb]: Rgba): Rgba => [r * a + br * (1 - a), g * a + bg * (1 - a), b * a + bb * (1 - a), 1];

function luminance([r, g, b]: Rgba) {
  const lin = (c: number) => ((c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrast(a: Rgba, b: Rgba) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const WHITE: Rgba = [255, 255, 255, 1];
const BLACK: Rgba = [0, 0, 0, 1];
const BRANDS = ["sakura", "web", "teams"] as const;
const color = (theme: keyof typeof themes, token: string, brand: (typeof BRANDS)[number] = "sakura") =>
  parse(resolve(`var(${token})`, { ...themes[theme], ...block(`[data-brand="${brand}"]`) }));

describe("glass — tương phản tính từ tokens.css", () => {
  it.each(["light", "dark"] as const)("%s: chữ chính, chữ phụ và brand trong glass ≥ 4.5:1 trên nền trắng hay đen hoàn toàn", (theme) => {
    const glass = color(theme, "--colorGlassBackground");
    // Bên trong glass, foreground-3 / -4 dùng màu foreground-2 và brand dùng --colorGlassBrandForeground.
    for (const brand of BRANDS) {
      for (const token of ["--colorNeutralForeground1", "--colorNeutralForeground2", "--colorGlassBrandForeground"]) {
        for (const backdrop of [WHITE, BLACK]) {
          const ratio = contrast(color(theme, token, brand), over(glass, backdrop));
          expect(ratio, `${theme} ${brand} ${token}`).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });

  it("glass-clear trên ảnh trắng có glass-scrim: chữ trắng ≥ 4.5:1", () => {
    const backdrop = over(color("light", "--colorGlassScrim"), WHITE);
    const surface = over(color("light", "--colorGlassClearBackground"), backdrop);
    expect(contrast(color("light", "--colorGlassClearForeground"), surface)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(["light", "dark"] as const)("%s: chữ trên glass-tinted ≥ 4.5:1 ở mọi trạng thái", (theme) => {
    for (const brand of BRANDS) {
      for (const token of ["--colorGlassTinted", "--colorGlassTintedHover", "--colorGlassTintedPressed"]) {
        const surface = over(color(theme, token, brand), WHITE);
        const ratio = contrast(color(theme, "--colorNeutralForegroundOnBrand", brand), surface);
        expect(ratio, `${theme} ${brand} ${token}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it("tương phản cao: glass đặc, không blur", () => {
    const hc = block('[data-theme="high-contrast"]');
    expect(hc["--glassFilter"]).toBe("none");
    expect(hc["--glassLensFilter"]).toBe("none");
    expect(hc["--colorGlassBackground"]).toBe("#000000");
    expect(hc["--colorGlassClearBackground"]).toBe("#000000");
  });
});

describe("glass — fallback trong index.css", () => {
  it("giảm trong suốt / tăng tương phản / không có backdrop-filter → nền đặc; forced colors và glass lồng nhau → không blur", () => {
    expect(indexCss).toMatch(/@media \(prefers-reduced-transparency: reduce\), \(prefers-contrast: more\) \{[^@]*--glassFilter: none;[^@]*--colorGlassBackground: var\(--colorGlassBackgroundSolid\);/);
    expect(indexCss).toMatch(/@supports not \(\(backdrop-filter: blur\(1px\)\) or \(-webkit-backdrop-filter: blur\(1px\)\)\) \{[^@]*--colorGlassBackground: var\(--colorGlassBackgroundSolid\);/);
    expect(indexCss).toMatch(/@media \(forced-colors: active\) \{[^@]*--glassFilter: none;/);
    expect(indexCss).toContain(":is(.glass, .glass-clear, .glass-tinted) :is(.glass, .glass-clear, .glass-tinted) {\n  --glassFilter: none;");
  });
});

describe("glass — component", () => {
  it("cn: glass thay cho bg-* và ngược lại", () => {
    expect(cn("bg-background-1 shadow-16", "glass")).toBe("shadow-16 glass");
    expect(cn("glass", "bg-brand-background")).toBe("bg-brand-background");
    expect(cn("rounded-medium", "rounded-concentric")).toBe("rounded-concentric");
  });

  it("Button glass / glass-prominent", () => {
    render(
      <>
        <Button appearance="glass">Lưu</Button>
        <Button appearance="glass-prominent">Đặt</Button>
      </>,
    );
    expect(screen.getByRole("button", { name: "Lưu" })).toHaveClass("glass");
    expect(screen.getByRole("button", { name: "Đặt" })).toHaveClass("glass-tinted");
  });

  it("Toolbar material: thanh glass bo tròn; không có material thì giữ nguyên", () => {
    const { rerender } = render(
      <Toolbar aria-label="Ảnh" material="glass-clear">
        <ToolbarButton>Chia sẻ</ToolbarButton>
      </Toolbar>,
    );
    expect(screen.getByRole("toolbar")).toHaveClass("glass-clear", "rounded-circular");
    rerender(
      <Toolbar aria-label="Ảnh">
        <ToolbarButton>Chia sẻ</ToolbarButton>
      </Toolbar>,
    );
    expect(screen.getByRole("toolbar")).not.toHaveClass("glass-clear");
  });

  it("TabsList minimized: tab có icon chỉ còn icon nhưng vẫn có tên; tab không icon giữ chữ", () => {
    render(
      <Tabs defaultValue="home">
        <TabsList material="glass" minimized aria-label="Điều hướng">
          <TabsTrigger value="home" icon={<Home20Regular />}>
            Trang chủ
          </TabsTrigger>
          <TabsTrigger value="more">Thêm</TabsTrigger>
        </TabsList>
      </Tabs>,
    );
    expect(screen.getByRole("tablist")).toHaveAttribute("data-minimized");
    const home = screen.getByRole("tab", { name: "Trang chủ" });
    expect(home.querySelector(".inline-grid")).toHaveClass("sr-only");
    expect(screen.getByRole("tab", { name: "Thêm" }).querySelector(".inline-grid")).not.toHaveClass("sr-only");
  });

  it("MenuPopover material", async () => {
    const user = userEvent.setup();
    render(
      <Menu>
        <MenuTrigger asChild>
          <Button>Thêm</Button>
        </MenuTrigger>
        <MenuPopover material="glass">
          <MenuItem>Lưu</MenuItem>
        </MenuPopover>
      </Menu>,
    );
    await user.click(screen.getByRole("button", { name: "Thêm" }));
    expect(screen.getByRole("menu")).toHaveClass("glass");
    expect(screen.getByRole("menu")).not.toHaveClass("bg-background-1");
  });
});

describe("useScrollMinimize", () => {
  it("thu gọn khi cuộn xuống quá ngưỡng, mở lại khi cuộn lên hoặc về gần đầu trang", () => {
    // Chạy ngay và trả 0 (như khung hình đã xong) để hook lên lịch được lần cuộn tiếp theo.
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });
    const scrollTo = (y: number) =>
      act(() => {
        Object.defineProperty(window, "scrollY", { value: y, configurable: true });
        window.dispatchEvent(new Event("scroll"));
      });
    const { result } = renderHook(() => useScrollMinimize({ threshold: 24, topOffset: 48 }));
    expect(result.current).toBe(false);
    scrollTo(100);
    expect(result.current).toBe(true);
    scrollTo(90); // lên 10px: chưa đủ ngưỡng
    expect(result.current).toBe(true);
    scrollTo(60);
    expect(result.current).toBe(false);
    scrollTo(300);
    expect(result.current).toBe(true);
    scrollTo(20); // gần đầu trang
    expect(result.current).toBe(false);
    vi.unstubAllGlobals();
  });
});
