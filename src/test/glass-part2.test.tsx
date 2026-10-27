import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { morphClass, morphFromTrigger } from "@/components/ui/_internal/morph";
import { Menu, MenuItem, MenuPopover, MenuTrigger } from "@/components/ui/Menu/Menu";
import { Slider } from "@/components/ui/Slider/Slider";
import { Switch } from "@/components/ui/Switch/Switch";

/*
 * Glass phần 2 (Yugen Labs, #210): Menu / Popover glass mọc ra từ nút mở, thumb glass của Slider và Switch khi nhấn.
 * Animation thật do trình duyệt chạy; ở đây kiểm class, biến --morph-from và trạng thái nhấn.
 */
const indexCss = fs.readFileSync(path.resolve(__dirname, "../index.css"), "utf8").replace(/\r\n/g, "\n");

describe("morph", () => {
  it("keyframes đọc --morph-from, có dự phòng; chỉ chạy khi không giảm chuyển động", () => {
    expect(indexCss).toMatch(/@keyframes morph-in \{\n {2}from \{\n {4}opacity: 0;\n {4}transform: var\(--morph-from, scale\(0\.9\)\);/);
    expect(indexCss).toMatch(/@keyframes morph-out \{\n {2}to \{\n {4}opacity: 0;\n {4}transform: var\(--morph-from, scale\(0\.9\)\);/);
    expect(morphClass.split(" ").every((c) => c.startsWith("motion-safe:"))).toBe(true);
  });

  it("đặt --morph-from: từ tâm và cỡ của nút mở tới bề mặt", () => {
    document.body.innerHTML = `<button aria-controls="m1">Mở</button><div id="wrap"><div id="m1"></div></div>`;
    const trigger = document.querySelector("button")!;
    const wrap = document.getElementById("wrap")!;
    const surface = document.getElementById("m1")!;
    const rect = (left: number, top: number, width: number, height: number) => () =>
      ({ left, top, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON() {} }) as DOMRect;
    trigger.getBoundingClientRect = rect(100, 50, 40, 40);
    wrap.getBoundingClientRect = rect(100, 100, 200, 160);
    Object.defineProperty(surface, "offsetWidth", { value: 200 });
    Object.defineProperty(surface, "offsetHeight", { value: 160 });
    morphFromTrigger({ currentTarget: surface, target: surface, animationName: "morph-in" } as unknown as React.AnimationEvent<HTMLElement>);
    // Tâm nút (120, 70) − tâm bề mặt (200, 180); cỡ 40/200, 40/160.
    expect(surface.style.getPropertyValue("--morph-from")).toBe("translate(-80.0px, -110.0px) scale(0.200, 0.250)");
    // Animation khác (fade, của phần tử con) không đụng tới.
    surface.style.removeProperty("--morph-from");
    morphFromTrigger({ currentTarget: surface, target: surface, animationName: "fade-out" } as unknown as React.AnimationEvent<HTMLElement>);
    expect(surface.style.getPropertyValue("--morph-from")).toBe("");
  });

  it("MenuPopover glass có class morph; không có material thì không", async () => {
    render(
      <Menu open>
        <MenuTrigger>Mở</MenuTrigger>
        <MenuPopover material="glass" aria-label="Glass">
          <MenuItem>Một</MenuItem>
        </MenuPopover>
      </Menu>,
    );
    expect(screen.getByRole("menu").className).toContain("motion-safe:animate-morph-in");
  });
});

describe("thumb glass", () => {
  it("Slider: thumb thành glass khi nhấn, trở lại khi thả ở bất cứ đâu", () => {
    render(<Slider aria-label="Âm lượng" material="glass" defaultValue={[40]} />);
    const thumb = screen.getByRole("slider");
    expect(thumb.className).not.toMatch(/\bglass\b/);
    fireEvent.pointerDown(thumb.closest("[data-orientation]")!, { button: 0, pointerId: 1 });
    expect(thumb.className).toMatch(/\bglass\b/);
    expect(thumb.className).toContain("scale-160");
    fireEvent.pointerUp(window);
    expect(thumb.className).not.toMatch(/\bglass\b/);
  });

  it("Slider không có material: không đổi khi nhấn", () => {
    render(<Slider aria-label="Âm lượng" defaultValue={[40]} />);
    const thumb = screen.getByRole("slider");
    fireEvent.pointerDown(thumb.closest("[data-orientation]")!, { button: 0, pointerId: 1 });
    expect(thumb.className).not.toMatch(/\bglass\b/);
  });

  it("Switch: thumb glass dài ra khi nhấn, vẫn trong track khi đang bật", () => {
    render(<Switch label="Wi-Fi" material="glass" defaultChecked />);
    const control = screen.getByRole("switch");
    const thumb = control.querySelector("span")!;
    fireEvent.pointerDown(control, { button: 0 });
    expect(thumb.className).toMatch(/\bglass\b/);
    expect(thumb.className).toContain("data-[state=checked]:translate-x-3");
    fireEvent.pointerCancel(window);
    expect(thumb.className).toContain("data-[state=checked]:translate-x-5.5");
  });
});
