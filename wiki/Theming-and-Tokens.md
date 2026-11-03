# Theming and Tokens

*Tiếng Việt: [Theming-and-Tokens-vi](Theming-and-Tokens-vi).*

## Theme, brand, text direction

```tsx
<YugenProvider applyToDocument theme="dark" brand="sakura" dir="rtl">…</YugenProvider>
```

| Prop | Values |
|---|---|
| `theme` | `light` · `dark` · `high-contrast` |
| `brand` | `sakura` (default) · `web` (Fluent Blue) · `teams` · a custom brand |
| `dir` | `ltr` · `rtl` |

Providers can be nested (for example a dark region inside a light page). Portals (Dialog, Menu…) follow the nearest provider
through `usePortalThemeProps()`.

## Create your own brand

1. Open the [Theme Designer](https://trandat1114.github.io/Yugen-UI/#/theme-designer) and pick the key color (step 80).
2. Check the contrast cells (≥ 4.5:1), adjust *vibrancy* / *hue torsion* if needed.
3. **Export**:
   - **CSS** → paste the `[data-brand="my-brand"] { --brand-10 … --brand-160 }` block into your CSS.
   - **W3C Design Tokens (DTCG)** → Style Dictionary 4, Figma Variables, Penpot.
   - **Tokens Studio** → the Tokens Studio for Figma plugin (`global` / `light` / `dark` sets).
4. Set `brand="my-brand"` on `YugenProvider`.

In code: `generateBrandRamp("#0F6CBD")`, `rampToCss()`, `rampToDesignTokens()`, `rampToTokensStudio()`, all exported from `yugen-ui`.

## Use tokens in your own CSS

```css
.my-panel {
  background: var(--colorNeutralBackground1);
  color: var(--colorNeutralForeground2);
  padding: var(--spacingL);
  border-radius: var(--borderRadiusMedium);
  box-shadow: var(--shadow4);
}
```

Only need the CSS variables? `import "yugen-ui/tokens.css"`.

## Color rules (summary)

- Neutral colors for surfaces / text; **brand only for** CTAs, selected states, focus, links; semantic colors only for status.
- Don't cover large areas with brand color; gradients only for hero sections / illustrations, never on controls.
- Text ≥ 4.5:1, UI elements ≥ 3:1; never use color as the only signal.

Full rules: Design.md §4 and the [Color](https://trandat1114.github.io/Yugen-UI/#/foundations/color) page.
