import { describe, expect, it } from "vitest";
import en from "./content/en";
import vi from "./content/vi";
import { formatPrice } from "./Pricing";
import { headTags, structuredData } from "./seo";
import { EMPTY_SIGN_UP, validateSignUp } from "./signUp";

describe("landing template", () => {
  it("sign-up: one message per invalid field, none when the form is complete", () => {
    expect(Object.keys(validateSignUp(EMPTY_SIGN_UP, en.signUp.errors))).toEqual(["name", "email", "teamSize", "consent"]);
    expect(validateSignUp({ ...EMPTY_SIGN_UP, email: "  " }, en.signUp.errors).email).toBe(en.signUp.errors.emailRequired);
    expect(validateSignUp({ ...EMPTY_SIGN_UP, email: "mai@" }, en.signUp.errors).email).toBe(en.signUp.errors.email);
    expect(validateSignUp({ name: " Mai ", email: " mai@example.com ", teamSize: "0", consent: true }, en.signUp.errors)).toEqual({});
  });

  it("prices in the content's currency and locale", () => {
    expect(formatPrice(en, 8)).toBe("$8");
    expect(formatPrice(en, 6.4)).toBe("$6.40");
    expect(formatPrice(en, 6.4 * 12)).toBe("$76.80");
    expect(formatPrice(vi, 159000).replace(/\s/g, " ")).toBe("159.000 ₫");
  });

  it("both languages have the same plans, features and questions", () => {
    expect(vi.pricing.plans.map((p) => [p.id, p.features.length, !!p.featured])).toEqual(
      en.pricing.plans.map((p) => [p.id, p.features.length, !!p.featured]),
    );
    expect(vi.features.items.map((i) => i.icon)).toEqual(en.features.items.map((i) => i.icon));
    expect(vi.faq.items).toHaveLength(en.faq.items.length);
    expect(vi.signUp.form.teamSizes).toHaveLength(en.signUp.form.teamSizes.length);
  });

  it("SEO: escaped head tags and a SoftwareApplication with one offer per plan", () => {
    const html = headTags({ ...en, product: { ...en.product, title: `A "quoted" <title>` } }, "https://notes.example/");
    expect(html).toContain("<title>A &quot;quoted&quot; &lt;title&gt;</title>");
    expect(html).toContain('<link rel="canonical" href="https://notes.example/" />');
    expect(html).toContain('<meta property="og:locale" content="en_US" />');
    const ld = structuredData(vi, "https://notes.example/");
    expect(ld["@type"]).toBe("SoftwareApplication");
    expect(ld.offers.map((o) => [o.price, o.priceCurrency])).toEqual([
      [0, "VND"],
      [159000, "VND"],
      [299000, "VND"],
    ]);
    const json = html.match(/<script type="application\/ld\+json">(.*)<\/script>/)?.[1];
    expect(JSON.parse(json ?? "null").offers).toHaveLength(en.pricing.plans.length);
  });
});
