import type { YugenMessagesInput, YugenTheme } from "@/components/ui";
import type { CustomerStatus, MockLabels, OrderStatus, Plan } from "../api";

/** Every string in the app. One file per language; `content/index.ts` picks the one the app uses. */
export interface Content {
  lang: "en" | "vi";
  /** Built-in strings of Yugen components: messagesEn for English, empty = Vietnamese defaults. Kept in the language
   * file so `create --lang vi` (which deletes en.ts) drops the English set from the bundle. */
  messages?: YugenMessagesInput;
  /** Locale for dates, numbers and sorting names. */
  locale: string;
  /** Currency of the amounts in the mock data (ISO 4217). */
  currency: string;
  appName: string;
  /** Document title of a page: "Orders · Sakura Admin". */
  pageTitle: (page: string) => string;
  nav: {
    label: string;
    customers: string;
    orders: string;
    settings: string;
    account: string;
    signOut: string;
    signedOut: string;
    skip: string;
    open: string;
  };
  common: {
    all: string;
    clearFilters: string;
    edit: string;
    delete: string;
    cancel: string;
    close: string;
    loadFailed: string;
    loadFailedBody: string;
    /** Body of the toast when an optimistic change is undone. */
    rolledBack: string;
    tryAgain: string;
  };
  list: {
    /** "1–10 of 120". */
    range: (from: string, to: string, total: string) => string;
    rowsPerPage: string;
  };
  statuses: Record<CustomerStatus, string>;
  plans: Record<Plan, string>;
  orderStatuses: Record<OrderStatus, string>;
  customers: {
    title: string;
    description: string;
    add: string;
    search: string;
    searchPlaceholder: string;
    columns: {
      name: string;
      email: string;
      company: string;
      status: string;
      plan: string;
      phone: string;
      orders: string;
      spent: string;
      createdAt: string;
      actions: string;
    };
    actionsFor: (name: string) => string;
    bulk: { label: string; selected: (count: number) => string; export: string; delete: string; clear: string };
    noMatch: string;
    noMatchBody: string;
    emptyTitle: string;
    emptyBody: string;
    saved: (name: string) => string;
    saveFailed: (name: string) => string;
    created: (name: string) => string;
    createFailed: (name: string) => string;
    deleted: (count: number, name: string) => string;
    deleteFailed: (count: number, name: string) => string;
    exported: (count: number) => string;
    /** Start of the CSV file name. */
    file: string;
  };
  customer: { title: string; back: string; details: string; notFound: string; notFoundBody: string };
  orders: {
    title: string;
    description: string;
    search: string;
    searchPlaceholder: string;
    columns: { id: string; customer: string; date: string; status: string; items: string; total: string };
    ofCustomer: string;
    ofCustomerDescription: string;
    noMatch: string;
    empty: string;
  };
  form: {
    createTitle: string;
    editTitle: string;
    lead: string;
    name: string;
    email: string;
    company: string;
    phone: string;
    phoneHint: string;
    status: string;
    plan: string;
    save: string;
    create: string;
    /** Validation messages: say how to fix it. */
    errors: {
      nameShort: string;
      nameLong: string;
      emailRequired: string;
      emailInvalid: string;
      companyLong: string;
      phoneInvalid: string;
      passwordRequired: string;
    };
  };
  remove: {
    title: (count: number, name: string) => string;
    body: (count: number) => string;
    confirm: (count: number) => string;
  };
  settings: {
    title: string;
    description: string;
    appearance: string;
    theme: string;
    themes: Record<YugenTheme, string>;
    brand: string;
    mockTitle: string;
    mockDescription: string;
    latency: string;
    randomErrors: string;
    randomErrorsHint: (percent: number) => string;
    reset: string;
    account: string;
    accountDescription: string;
    screens: string;
  };
  signIn: {
    title: string;
    lead: string;
    /** Lead when the visitor was sent here from a page that needs a session. */
    leadNext: string;
    signedInAs: (name: string) => string;
    open: string;
    demoTitle: string;
    demoEmail: string;
    demoPassword: string;
    useDemo: string;
    password: string;
    forgot: string;
    submit: string;
    wrong: string;
  };
  verify: {
    title: string;
    lead: (email: string) => string;
    leadNoEmail: string;
    demoTitle: string;
    code: string;
    incomplete: (length: number) => string;
    expired: string;
    wrong: string;
    submit: string;
    resend: string;
    resent: string;
    otherAccount: string;
    signInAgain: string;
  };
  forgot: {
    title: string;
    lead: string;
    submit: string;
    sentTitle: string;
    sentBody: (email: string) => string;
    back: string;
  };
  notFound: { title: string; body: string; action: string };
  /** Names, companies and phone numbers of the generated data. */
  mock: MockLabels;
}
