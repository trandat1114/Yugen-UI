import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App";
import en from "./content/en";

describe("store checkout", () => {
  it("checks each step, declines the test card, then places the order", async () => {
    const user = userEvent.setup();
    render(<App embedded content={en} defaultAppearance={{ theme: "light", brand: "sakura" }} initialRoute={{ name: "checkout" }} />);
    const next = () => user.click(screen.getByRole("button", { name: "Next" }));

    await screen.findByRole("textbox", { name: /Full name/ });
    await next();
    expect(await screen.findByText(en.checkout.fix)).toBeTruthy();
    expect(screen.getByText(en.checkout.errors.nameShort)).toBeTruthy();

    await user.type(screen.getByRole("textbox", { name: /Full name/ }), "Mai Tran");
    // After a failed Next, a message goes away as soon as the field is fixed (no blur needed).
    expect(screen.queryByText(en.checkout.errors.nameShort)).toBeNull();
    await user.type(screen.getByRole("textbox", { name: /Email/ }), "mai@example.com");
    await user.type(screen.getByRole("textbox", { name: /^Address/ }), "12 Hang Bac");
    await user.type(screen.getByRole("textbox", { name: /City/ }), "Hanoi");
    await next();

    await screen.findByText(en.checkout.shippingMethod);
    await user.click(screen.getByRole("radio", { name: /Express/ }));
    await next();

    await screen.findByText(en.checkout.demoTitle);
    await user.type(screen.getByRole("textbox", { name: /Name on card/ }), "Mai Tran");
    await user.type(screen.getByRole("textbox", { name: /Card number/ }), "4000 0000 0000 0002");
    await user.type(screen.getByRole("textbox", { name: /Expiry/ }), "12/39");
    await user.type(screen.getByRole("textbox", { name: /Security code/ }), "123");
    await next();

    await screen.findByText(en.checkout.review);
    expect(screen.getByText("Express · 1 to 2 working days")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: en.checkout.placeOrder }));
    expect(await screen.findByText(en.checkout.declined, {}, { timeout: 3000 })).toBeTruthy();

    // Pay on delivery instead.
    await user.click(screen.getByRole("button", { name: `${en.checkout.edit}: ${en.checkout.paymentMethod}` }));
    await user.click(await screen.findByRole("radio", { name: /Pay on delivery/ }));
    await next();
    await screen.findByText(en.checkout.review);
    await user.click(screen.getByRole("button", { name: en.checkout.placeOrder }));

    expect(await screen.findByText(en.order.title, {}, { timeout: 3000 })).toBeTruthy();
    expect(screen.getByText(en.order.thanks("Mai"))).toBeTruthy();
    expect(screen.getByText(en.order.payOnDelivery)).toBeTruthy();
    // Demo cart: $18 + 2 × $22 = $62, express $12.
    expect(screen.getByText("$74.00")).toBeTruthy();
    expect(screen.getByRole("button", { name: en.nav.cart(0) })).toBeTruthy();
  }, 20_000);
});
