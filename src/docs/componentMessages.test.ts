import { describe, expect, it } from "vitest";
import namespaces from "virtual:yugen-messages";
import { ALL_MESSAGE_NAMESPACES, messageNamespacesFor } from "./componentMessages";
import { COMPONENTS_META } from "./registry";

const MODULES = import.meta.glob<Record<string, Record<string, unknown>>>(["../components/ui/*/messages.ts", "../components/ui/*/messages.en.ts"], {
  eager: true,
});

describe("bảng Messages trên trang component (#156)", () => {
  it("mọi namespace hiện trên ít nhất một trang", () => {
    const shown = new Set(COMPONENTS_META.flatMap((m) => messageNamespacesFor(m.slug)));
    expect(ALL_MESSAGE_NAMESPACES.filter((ns) => !shown.has(ns))).toEqual([]);
  });

  it("ghép theo tên trang, rồi theo thư mục", () => {
    expect(messageNamespacesFor("toast")).toEqual(["toast"]);
    expect(messageNamespacesFor("barchart")).toEqual(["chart"]);
    expect(messageNamespacesFor("asynccontent").sort()).toEqual(["asyncContent", "errorState"]);
    expect(messageNamespacesFor("optimistic")).toEqual(["optimisticList"]);
    expect(messageNamespacesFor("button")).toEqual([]);
  });

  it("dữ liệu đọc tĩnh khớp object thật: đủ khoá, chuỗi literal đúng giá trị", () => {
    const all: Record<string, Record<string, unknown>> = Object.assign({}, ...Object.values(MODULES));
    const runtime = new Map<string, { vi: Record<string, unknown>; en: Record<string, unknown> }>();
    for (const [name, value] of Object.entries(all)) {
      const ns = name.match(/^(\w+?)Messages$/)?.[1];
      if (ns) runtime.set(ns, { vi: value, en: all[`${ns}MessagesEn`] });
    }
    expect(namespaces.map((n) => n.namespace).sort()).toEqual([...runtime.keys()].sort());
    for (const ns of namespaces) {
      const { vi, en } = runtime.get(ns.namespace)!;
      expect(ns.keys.map((k) => k.key).sort(), ns.namespace).toEqual(Object.keys(vi).sort());
      for (const k of ns.keys) {
        if (typeof vi[k.key] === "string") expect(JSON.parse(k.vi), `${ns.namespace}.${k.key}`).toBe(vi[k.key]);
        if (typeof en[k.key] === "string") expect(JSON.parse(k.en), `${ns.namespace}.${k.key} (en)`).toBe(en[k.key]);
      }
    }
  });
});
