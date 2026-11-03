// @vitest-environment node
/** Render phía server thật (không có window / document): không hook nào được đọc API trình duyệt khi render. */
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  useClipboard,
  useControllableState,
  useDebouncedValue,
  useDisclosure,
  useElementSize,
  useHotkeys,
  useIntersection,
  useLocalStorage,
  useMediaQuery,
} from "./Hooks";

function Probe() {
  const [count] = useControllableState({ defaultValue: 3 });
  const { open } = useDisclosure({ defaultOpen: true });
  const wide = useMediaQuery("(min-width: 768px)", { defaultValue: true });
  const [stored] = useLocalStorage("ssr-key", "ban-dau");
  const { copied } = useClipboard();
  const debounced = useDebouncedValue("giá trị", 100);
  const { isIntersecting } = useIntersection();
  const { width, height } = useElementSize();
  useHotkeys({ "mod+k": () => {} });
  return (
    <p>
      {[count, open, wide, stored, copied, debounced, isIntersecting, width, height].map(String).join("|")}
    </p>
  );
}

describe("hooks trên server", () => {
  it("môi trường không có window / document", () => {
    expect(typeof window).toBe("undefined");
    expect(typeof document).toBe("undefined");
  });

  it("render không lỗi và trả giá trị khởi đầu", () => {
    expect(renderToString(<Probe />)).toContain("3|true|true|ban-dau|false|giá trị|false|0|0");
  });
});
