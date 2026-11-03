import type { ComponentDocEn } from "../../types";

// English text for src/docs/registry/form-controls.tsx.
export const en: Record<string, ComponentDocEn> = {
  passwordinput: {
    description:
      'An Input with `type="password"` and a show / hide button (a toggle button with `aria-pressed`; clicking it keeps focus in the field). When Caps Lock is on while typing, a note appears under the field and is read through a live region. `strength` adds a four-step meter (Weak, Fair, Good, Strong) with a text label, so it doesn\'t rely on color; `getPasswordStrength` scores by length and character variety, or pass your own scoring function. Takes every Input prop and works inside `<Field>`; built-in strings change through `messages.passwordInput`.',
    examples: [
      { title: "Strength meter", description: "strength uses getPasswordStrength; the level is announced when it changes." },
      {
        title: "Your own scoring",
        description: "Return 0–4 from your own rules; capsLockWarning={false} turns the Caps Lock note off.",
      },
      { title: "Size, appearance & disabled", description: "As on Input; defaultVisible shows the password from the start." },
    ],
    dos: [
      'Set `autoComplete`: "current-password" to sign in, "new-password" to create one, so password managers can fill and suggest.',
      "Put the password rules in the Field `hint`, before people start typing.",
      "Check the real strength on the server; the meter is a quick hint.",
    ],
    donts: [
      "Don't block pasting into a password field. People using a password manager need it.",
      "Don't rely on the meter's color alone; keep the text label.",
    ],
    props: {
      "visible / defaultVisible": "Whether the password shows as text (controlled / uncontrolled).",
      onVisibleChange: "Called when the show / hide button is pressed.",
      capsLockWarning: "Shows a note when Caps Lock is on while typing.",
      strength: "Strength meter: true uses getPasswordStrength, or pass a function that returns 0–4.",
      getPasswordStrength: "0 empty · 1 weak · 2 fair · 3 good · 4 strong, by length and character variety.",
      "value / defaultValue / onChange": "As on Input.",
      "label / hint / validationState / validationMessage": "As on Input; or wrap it in <Field>.",
      "size / appearance / contentBefore / contentAfter": "As on Input; contentAfter sits after the show / hide button.",
      rootClassName: "Class for the outer wrapper (field, meter, note).",
      ref: "Points to the <input> element.",
    },
  },

  formattedinput: {
    description:
      '`format="phone"` adds spaces, brackets and dashes from a mask (`#` is one digit; by default from the `locale` region: en-US "(###) ###-####", vi-VN "#### ### ###"). `format="card"` groups 4-4-4-4, American Express 4-6-5. `format="currency"` formats with Intl from `locale` and `currency`, limits the decimals to the currency\'s own and pads them when you leave the field. Typing, pasting or deleting in the middle keeps the caret in place; Backspace right after a separator deletes the digit before it. `value` / `onValueChange` are the raw value (digits, or a decimal like "1234.5"); with `name`, the form submits the raw value through a hidden input. Takes every Input prop.',
    examples: [
      { title: "Currency", description: "Follows the YugenProvider locale; JPY has no decimals." },
      { title: "Card number", description: 'inputMode numeric and autoComplete "cc-number" are built in.' },
      { title: "Custom mask & country code", description: "The country code goes in contentBefore, not in the value." },
      { title: "Form submit", description: "With name, FormData holds the raw value, not the formatted text." },
    ],
    dos: [
      "Store and send the raw value; the formatting is only there to make it easier to read.",
      "Put the country code in `contentBefore` with a fixed mask when the form only takes numbers from one country.",
      "Check the length / validity (Luhn for card numbers, for example) on submit and show errors through `<Field>`.",
    ],
    donts: [
      "Don't use FormattedInput for counts that go up and down. Use SpinButton.",
      "Don't put digits in the fixed part of a mask; fixed characters are only separators.",
    ],
    props: {
      format: "Kind of formatting.",
      "value / defaultValue": 'Raw value: digits (phone, card) or a decimal like "1234.5" (currency).',
      onValueChange: "Called when the raw value changes; details.formatted is the text on screen.",
      mask: "Mask for phone / card: # is one digit. Defaults by locale (phone) / card type (card).",
      currency: "ISO 4217 currency code for currency.",
      locale: "Locale for currency and the default phone mask.",
      name: "Form field name; the form submits the raw value through a hidden input.",
      "label / hint / validationState / validationMessage / size / appearance / contentBefore / contentAfter / rootClassName": "As on Input.",
      ref: "Points to the visible input.",
      "getPhoneMask(locale) / getCardMask(digits) / applyMask(raw, mask)": "Default masks and the mask function, usable outside the component.",
    },
    defaults: { locale: "YugenProvider locale" },
  },

  monthpicker: {
    description:
      'The popover shows a grid of the 12 months of a year (MonthPicker) or 12 years (YearPicker). The keyboard works like the day calendar: arrows move, Home / End go to the start / end of the row, PageUp / PageDown go to the previous / next year (or 12 years), Enter picks; opening the popover focuses the selected cell. The value is a `Date`: the 1st of the month, or January 1 of the year. minDate / maxDate dim cells out of range. Shown in the YugenProvider `locale` ("November 2026" in en-US); change it with `formatDate`.',
    examples: [
      { title: "YearPicker", description: "maxDate is this year; clearable adds a clear button." },
      { title: "Report month, size & disabled", description: "Same sizes and states as DatePicker." },
    ],
    dos: [
      "Use MonthPicker when the day doesn't matter (card expiry, reporting period, pay month).",
      "Set minDate / maxDate instead of checking after selection.",
    ],
    donts: [
      "Don't use YearPicker for a birth year across many decades if typing is faster; a number field may fit better.",
      "Don't read the day (getDate) of the value; it is always the 1st.",
    ],
    props: {
      "value / defaultValue": "Selected month (the 1st) or year (January 1).",
      onValueChange: "Called when a value is picked or cleared; null when cleared.",
      "minDate / maxDate": "Earliest and latest month / year that can be picked.",
      formatDate: "Display format; defaults to month + year (MonthPicker) or year (YearPicker) in the locale.",
      placeholder: "Text when nothing is selected.",
      clearable: "Shows a clear button when there is a value.",
      size: "Height 24 / 32 / 40px.",
      "disabled / required / id / aria-*": "Passed by Field when wrapped in <Field>.",
    },
  },

  datetimepicker: {
    description:
      'The calendar is the DatePicker Calendar and the time field is a TimePicker (type "9", "930", "9:30 PM" freely or pick from a list `timeIncrement` minutes apart). Picking a date keeps the selected time (00:00 by default); a time picked before any date is used when a date is picked. The Done button closes the popover; the value updates as soon as you pick. Shows a numeric date and a time in the `locale` (12- or 24-hour from the locale or `hourCycle`). minDate / maxDate limit the date part.',
    examples: [{ title: "24- / 12-hour", description: "hourCycle overrides the cycle from the locale." }],
    dos: [
      "Use it when the exact moment matters (appointments, deadlines with a time).",
      "Name the time zone in the hint when people are in different places.",
    ],
    donts: [
      "Don't use DateTimePicker when only the date matters. Use DatePicker.",
      "Don't set a tiny time step (1 minute); the list gets too long, and other times can still be typed.",
    ],
    props: {
      "value / defaultValue": "Selected date and time.",
      onValueChange: "Called when the date or time changes, or the value is cleared.",
      timeIncrement: "Step between times in the list (minutes).",
      hourCycle: "24-hour or 12-hour.",
      "minDate / maxDate": "Earliest / latest date (date part only).",
      formatDate: "Display format; defaults to a numeric date + time in the locale.",
      placeholder: "Text when nothing is selected.",
      clearable: "Shows a clear button when there is a value.",
      size: "Height 24 / 32 / 40px.",
      "disabled / required / id / aria-*": "Passed by Field when wrapped in <Field>.",
    },
    defaults: { hourCycle: "from locale" },
  },

  colorpicker: {
    description:
      'Drag or use the arrow keys on the color area (left / right: saturation, up / down: brightness, Shift ×10); the hue and opacity bars are sliders with full keyboard support. The inputs switch between HEX, RGB and HSL; typing applies as soon as the value is valid, and up / down arrows step each channel. The button that picks a color from the screen only shows when the browser has the EyeDropper API (Chrome, Edge). `swatches` shows preset colors with SwatchPicker, and the one matching the current color is marked. The value is hex ("#rrggbb", or "#rrggbbaa" with `alpha` below 100% opacity); `onValueChange` also gets rgb / hsl / hsv. The color tracks always run left → right, RTL included. Put it in a Popover for a color field.',
    examples: [
      { title: "Opacity (alpha)", description: "Adds an opacity bar and input; the value becomes 8-digit hex." },
      { title: "In a Popover", description: "A button showing the current color opens the ColorPicker." },
    ],
    dos: [
      "Add `swatches` with your brand colors for quick, consistent picks.",
      "Show the color code next to the button that opens the picker, not just a swatch.",
      "Check contrast when a color people pick is used for text.",
    ],
    donts: [
      "Don't use ColorPicker for a few fixed colors. Use SwatchPicker.",
      "Don't turn on `alpha` where the color can't be transparent.",
    ],
    props: {
      "value / defaultValue": "Selected color: hex, rgb() or hsl(). defaultValue is black by default.",
      onValueChange: "value is hex; data holds hex, rgb, hsl and hsv.",
      alpha: "Shows the opacity bar and input.",
      swatches: "Preset colors, shown with SwatchPicker.",
      defaultFormat: "Initial format of the inputs.",
      eyeDropper: "Button that picks a color from the screen, where the browser supports it.",
      disabled: "Disables the whole picker.",
      ref: "Points to the outer element.",
      "parseColor(input)": "Reads hex, rgb() and hsl() into { r, g, b, a }.",
    },
  },
};
