import type { YugenMessagesInput, YugenTheme } from "@/components/ui";
import type { Sort } from "../filters";
import type { Currency } from "../money";
import type { Category, ColorId, ProductId, ShippingId } from "../products";

/** Text of one product. */
export interface ProductText {
  name: string;
  /** One line under the name in the grid. */
  blurb: string;
  description: string;
  details: string[];
}

/** Every string in the app. One file per language; `content/index.ts` picks the one the app uses. */
export interface Content {
  lang: "en" | "vi";
  /** Built-in strings of Yugen components: messagesEn for English, empty = Vietnamese defaults. Kept in the language
   * file so `create --lang vi` (which deletes en.ts) drops the English set from the bundle. */
  messages?: YugenMessagesInput;
  /** Locale for numbers, prices, dates and country names. */
  locale: string;
  /** Currency of the prices shown (catalog prices are converted in `money.ts`). */
  currency: Currency;
  /** Country selected at checkout (ISO 3166). */
  defaultCountry: string;
  /** Countries offered at checkout. Their names come from Intl.DisplayNames. */
  countries: string[];
  appName: string;
  /** Document title of a page: "Checkout · Sakura Goods". */
  pageTitle: (page: string) => string;
  nav: {
    skip: string;
    categories: string;
    /** Name of the cart button: "Cart, 3 items". */
    cart: (count: number) => string;
    appearance: string;
    theme: string;
    themes: Record<YugenTheme, string>;
    brand: string;
  };
  footer: string;
  categories: Record<Category, string>;
  colors: Record<ColorId, string>;
  products: Record<ProductId, ProductText>;
  shop: {
    title: string;
    lead: string;
    filters: string;
    category: string;
    allCategories: string;
    price: string;
    /** "$10 – $40". */
    priceRange: (min: string, max: string) => string;
    sort: string;
    sorts: Record<Sort, string>;
    results: (count: number) => string;
    clear: string;
    emptyTitle: string;
    emptyBody: string;
    reviews: (count: string) => string;
    from: (price: string) => string;
  };
  product: {
    back: string;
    gallery: (name: string) => string;
    /** Alt text of the three pictures. */
    views: {
      front: (name: string, color: string) => string;
      detail: (name: string, color: string) => string;
      colors: (name: string) => string;
    };
    color: string;
    size: string;
    quantity: string;
    add: string;
    buyNow: string;
    added: string;
    addedBody: (quantity: number, name: string) => string;
    viewCart: string;
    details: string;
    shipping: (amount: string) => string;
    notFoundTitle: string;
    notFoundBody: string;
  };
  cart: {
    title: string;
    items: (count: number) => string;
    close: string;
    emptyTitle: string;
    emptyBody: string;
    browse: string;
    quantityOf: (name: string) => string;
    remove: (name: string) => string;
    removed: (name: string) => string;
    undo: string;
    subtotal: string;
    note: string;
    checkout: string;
  };
  checkout: {
    title: string;
    back: string;
    steps: { address: string; shipping: string; payment: string; review: string };
    /** Under the step error when fields need fixing. */
    fix: string;
    contact: string;
    name: string;
    email: string;
    phone: string;
    phoneHint: string;
    deliverTo: string;
    line1: string;
    line2: string;
    city: string;
    postalCode: string;
    country: string;
    shippingMethod: string;
    methods: Record<ShippingId, { name: string; detail: string }>;
    free: string;
    freeFrom: (amount: string) => string;
    paymentMethod: string;
    card: string;
    cardDetail: string;
    cod: string;
    codDetail: string;
    demoTitle: string;
    demoBody: string;
    cardName: string;
    cardNumber: string;
    cardHint: string;
    expiry: string;
    expiryHint: string;
    cvc: string;
    review: string;
    edit: string;
    cardEnding: (last4: string) => string;
    placeOrder: string;
    declined: string;
    summary: string;
    subtotal: string;
    shipping: string;
    total: string;
    emptyTitle: string;
    emptyBody: string;
    /** Validation messages: say how to fix it. */
    errors: {
      nameShort: string;
      emailRequired: string;
      emailInvalid: string;
      phoneInvalid: string;
      line1Required: string;
      cityRequired: string;
      postalInvalid: string;
      countryRequired: string;
      shippingRequired: string;
      cardNameRequired: string;
      cardNumberInvalid: string;
      expiryInvalid: string;
      cvcInvalid: string;
    };
  };
  order: {
    title: string;
    thanks: (name: string) => string;
    lead: (email: string) => string;
    number: string;
    placed: string;
    items: string;
    delivery: string;
    /** "Arrives Mon, Nov 2 – Wed, Nov 4". */
    arrives: (from: string, to: string) => string;
    pickup: (day: string) => string;
    payment: string;
    paidCard: (last4: string) => string;
    payOnDelivery: string;
    demo: string;
    continue: string;
    notFoundTitle: string;
    notFoundBody: string;
  };
  notFound: { title: string; body: string; action: string };
}
