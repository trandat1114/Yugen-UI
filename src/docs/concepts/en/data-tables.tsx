import type { ReactNode } from "react";
import { DocSection, DoDont } from "../../blocks";
import { CodeBlock } from "../../CodeBlock";
import { CustomerDirectoryDemo, type DataTableText } from "../demos/data-tables";

function C({ children }: { children: ReactNode }) {
  return <code className="rounded-small bg-background-4 px-1 font-mono text-caption1">{children}</code>;
}

function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="flex max-w-3xl list-disc flex-col gap-1 ps-5 text-body2 text-foreground-2">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

function SimpleTable({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    // tabIndex: a wide table scrolls horizontally with the keyboard (axe scrollable-region-focusable).
    <div tabIndex={0} className="overflow-x-auto rounded-xlarge border border-stroke-2 bg-background-1">
      <table className="w-full border-collapse text-start text-body1">
        <thead>
          <tr className="border-b border-stroke-2 bg-background-3 text-caption1 font-semibold text-foreground-2">
            {head.map((h) => (
              <th key={h} scope="col" className="px-4 py-2 text-start">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-stroke-3 align-top last:border-b-0">
              {row.map((cell, j) => (
                <td key={j} className={j === 0 ? "px-4 py-3 font-semibold text-foreground-1" : "px-4 py-3 text-foreground-2"}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const TEXT: DataTableText = {
  locale: "en-US",
  grid: "Customers",
  picker: "Customer columns",
  count: (n) => (n === 1 ? "1 customer" : `${n} customers`),
  selected: (n) => `${n} selected`,
  density: "Density",
  comfortable: "Comfortable",
  compact: "Compact",
  bodyText: "16px text",
  state: "Data state",
  states: { data: "Data", loading: "Loading", empty: "Empty", error: "Error" },
  columns: {
    name: "Customer",
    code: "Code",
    phone: "Phone",
    email: "Email",
    address: "Address",
    province: "Province",
    tier: "Tier",
    orders: "Orders",
    balance: "Balance",
    updated: "Updated",
  },
  tiers: { gold: "Gold", silver: "Silver", bronze: "Bronze" },
  none: "Not provided",
  emptyTitle: "No customers match",
  emptyDescription: "Try another province or clear the filters.",
  clearFilters: "Clear filters",
  errorTitle: "Couldn't load customers",
  errorDescription: "The server didn't answer. Your columns and selection are kept.",
  retry: "Retry",
  measure: (grid, need) =>
    grid === 0
      ? `The visible columns need ${need.toLocaleString("en-US")}px.`
      : `Grid ${grid.toLocaleString("en-US")}px wide, visible columns need ${need.toLocaleString("en-US")}px: ${
          grid >= need ? "no horizontal scrolling" : "the grid scrolls horizontally, the page doesn't"
        }.`,
};

const RECIPE_CODE = `<DataGrid
  aria-label="Customers"
  items={customers}
  columns={columns}
  getRowId={(c) => c.id}
  hiddenColumns={hiddenColumns}
  columnOrder={columnOrder}
  sortable
  selectionMode="multiselect"
  size="small"                       // compact: 34px rows
  className="text-body2"             // keep a 16px type size; rows grow when cells wrap
  height="28rem"                     // loading, empty and error stay in the same box
  loading={status === "loading"}
  empty={status === "error" ? <LoadError onRetry={reload} /> : <NoResults />}
/>`;

const COLUMNS_CODE = `const columns = [
  // Primary identifier: pinned (needs a width), always shown, wraps instead of truncating.
  createColumn<Customer>({
    columnId: "name",
    label: "Customer",
    renderCell: (c) => <span className="min-w-0 py-1 font-semibold wrap-break-word">{c.name}</span>,
    width: 240,
    sticky: "start",
    hideable: false,
  }),
  // Codes, phone numbers, dates: fixed width, one line.
  createColumn<Customer>({ columnId: "code", label: "Code", renderCell: (c) => c.id, width: 120 }),
  // Long text: a minimum width, shares the remaining space, wraps.
  createColumn<Customer>({
    columnId: "address",
    label: "Address",
    renderCell: (c) => <span className="min-w-0 py-1 wrap-break-word">{c.address}</span>,
    minWidth: 300,
  }),
  // Amounts: fixed width, end-aligned, formatted for the locale.
  createColumn<Customer>({
    columnId: "balance",
    label: "Balance",
    renderCell: (c) => vnd.format(c.balance),
    compare: (a, b) => a.balance - b.balance,
    width: 168,
    align: "end",
  }),
];`;

const PICKER_CODE = `<DataGridColumnPicker
  compact                                  // icon + hidden count; "Customer columns" stays the name
  mode="auto"                              // menu from 768px, bottom sheet below
  resettable={{ hiddenColumns: ["phone"] }} // "Reset columns" brings back the default view
  columns={columns}
  hiddenColumns={hiddenColumns}
  onHiddenColumnsChange={(_, d) => setHiddenColumns(d.hiddenColumns)}
  columnOrder={columnOrder}
  onColumnOrderChange={(_, d) => setColumnOrder(d.columnOrder)}
>
  Customer columns
</DataGridColumnPicker>`;

const TABLE_CODE = `<Table sortable size="small" className="text-body2">
  <TableHeader>
    <TableRow>
      <TableHeaderCell>Customer</TableHeaderCell>
      <TableHeaderCell align="end" sortDirection="descending" onClick={sortByBalance}>
        Balance
      </TableHeaderCell>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell className="wrap-break-word">Công ty TNHH Thương mại và Dịch vụ Hoàng Gia Phát</TableCell>
      <TableCell align="end">₫1,275,900,000</TableCell>
    </TableRow>
  </TableBody>
</Table>`;

const SHELL_CODE = `// src/pages.tsx (vite-saas): one entry opts in, the other pages keep the 72rem column.
{
  id: "customers",
  icon: <ContactCard20Regular />,
  section: "manage",
  layout: { width: "fluid", density: "compact" },
  Page: lazy(LOADERS.customers),
}

// src/layout.ts: page padding and section gaps per density.
const SPACING = {
  default: "gap-4 p-4 @3xl:p-6",
  compact: "gap-3 px-3 py-3 @3xl:px-5 @3xl:py-4",
  comfortable: "gap-6 p-5 @3xl:p-8",
};`;

export default function Page() {
  return (
    <>
      <DocSection
        id="example"
        title="Example: customer directory"
        description="Ten columns, long Vietnamese names and addresses, empty cells, a pinned name column and the compact column picker. Change the density, the text size and the data state; the line under the grid shows its measured width."
      >
        <div className="flex flex-col gap-4">
          <CustomerDirectoryDemo text={TEXT} />
          <CodeBlock code={RECIPE_CODE} />
        </div>
      </DocSection>

      <DocSection
        id="density"
        title="Comfortable or compact"
        description="Density sets the row height and padding. It doesn't set the text size."
      >
        <div className="flex flex-col gap-4">
          <SimpleTable
            head={["Aspect", "Comfortable", "Compact"]}
            rows={[
              ["DataGrid / Table", <><C>size="medium"</C>: 44px rows</>, <><C>size="small"</C>: 34px rows</>],
              [
                "Choose for",
                "Tables read row by row, touch screens, rows with avatars or two-line cells, up to about 6 columns.",
                "Tables people scan and compare with mouse and keyboard: billing, directories, back-office lists with 8–15 columns.",
              ],
              [
                "Text",
                "body1 (14px). className=\"text-body2\" for 16px.",
                "The same. Compact doesn't shrink the text; rows grow when a cell wraps.",
              ],
            ]}
          />
          <Bullets
            items={[
              <>
                An app with a 16px type size passes <C>className=&quot;text-body2&quot;</C> to DataGrid or Table and keeps it at both
                densities.
              </>,
              <>
                For a whole screen, <C>YugenProvider density=&quot;compact&quot;</C> gives controls size small and tightens spacing
                (Theming › Default props & density). A <C>size</C> on the grid still wins.
              </>,
              "On touch-first screens keep 44px rows: a 34px row is a small target for a finger.",
            ]}
          />
        </div>
      </DocSection>

      <DocSection
        id="columns"
        title="Column widths & long text"
        description="Give every column one width rule, so the layout is predictable and doesn't shift when the data changes."
      >
        <div className="flex flex-col gap-4">
          <Bullets
            items={[
              <>
                <strong className="font-semibold">Fixed <C>width</C></strong> for codes, phone numbers, statuses, amounts and dates: their
                length is known, and the column doesn&apos;t move when the user sorts.
              </>,
              <>
                <strong className="font-semibold"><C>minWidth</C></strong> for names, addresses and email: these columns share the
                remaining space and wrap when it runs out. <C>maxWidth</C> caps a column the user resizes.
              </>,
              <>
                Wrap instead of truncating. A plain string from <C>renderCell</C> is cut with &quot;…&quot;; return an element with{" "}
                <C>min-w-0 py-1 wrap-break-word</C> (<C>wrap-anywhere</C> for email) and the row grows. Data hidden behind a tooltip is
                hidden from touch and keyboard users.
              </>,
              <>
                <C>virtualized</C> needs rows of equal height: keep cells on one line there and show the full value in a details view.
              </>,
              "Empty cells show “—” with text for screen readers (“Not provided”), not a blank cell.",
              "Keep header labels short enough to fit the column: a truncated header hides what the column is.",
            ]}
          />
          <CodeBlock code={COLUMNS_CODE} />
        </div>
      </DocSection>

      <DocSection id="alignment" title="Numbers & identifiers">
        <div className="flex flex-col gap-4">
          <Bullets
            items={[
              <>
                Numbers, amounts and counts: <C>align: &quot;end&quot;</C> so the digits line up. DataGrid and Table already use{" "}
                <C>tabular-nums</C>. Format with <C>Intl.NumberFormat</C> for the locale (1.275.900.000 ₫ in vi-VN).
              </>,
              "Identifiers (customer codes, invoice numbers, phone numbers): start-aligned, fixed width, on one line.",
              "Dates: a short format of the locale (dd/mm/yyyy in vi-VN) in a fixed-width column.",
              <>
                Table: <C>TableHeaderCell align=&quot;end&quot;</C> and <C>TableCell align=&quot;end&quot;</C>. On a sortable header the
                sort button is aligned too.
              </>,
            ]}
          />
          <CodeBlock code={TABLE_CODE} />
        </div>
      </DocSection>

      <DocSection
        id="scrolling"
        title="Horizontal scrolling & pinned columns"
        description="When the columns are wider than the screen, the grid scrolls inside its own box. The page doesn't scroll sideways."
      >
        <Bullets
          items={[
            "The DataGrid header is always sticky. Give the grid a height (height, or a class) for result sets longer than the screen, so the header and the page layout stay put.",
            <>
              Pin the primary identifier with <C>sticky: &quot;start&quot;</C> on the first column; a pinned column needs a{" "}
              <C>width</C>. With <C>selectionMode</C> the checkbox column is pinned too.
            </>,
            "Keep pinned columns under about 40% of the grid width. Below 640px the demo unpins the name and narrows it, so there is room left to scroll.",
            <>
              Turn on <C>virtualized</C> for more than a few hundred rows.
            </>,
            "Table has no sticky header or pinned column. Use DataGrid when the result set is longer or wider than one screen.",
          ]}
        />
      </DocSection>

      <DocSection
        id="states"
        title="Loading, empty, error"
        description="All three states show in the same box as the rows, so the page doesn't jump."
      >
        <Bullets
          items={[
            "A fixed height keeps the box the same size for rows, skeleton, empty state and error.",
            <>
              <C>loading</C> shows a skeleton after 300ms and keeps it at least 500ms (Wait UX). The header and the column picker stay
              usable.
            </>,
            <>
              <C>empty</C> takes your own content: &quot;No customers match&quot; with a way out (Clear filters). For a failed request,
              pass the error with Retry in the same slot and empty <C>items</C>, instead of replacing the grid.
            </>,
            "Keep the columns, sort and selection when a reload fails, so Retry brings the user back to where they were.",
          ]}
        />
      </DocSection>

      <DocSection id="viewports" title="Viewports">
        <div className="flex flex-col gap-4">
          <SimpleTable
            head={["Width", "What to expect", "Guidance"]}
            rows={[
              [
                "2560px",
                "The demo's default columns need 1,588px (1,732px with Phone). In a fluid page every column fits; Email and Address take the extra space.",
                "Use a fluid page width for data pages (vite-saas: width \"fluid\"), not max-w-6xl.",
              ],
              [
                "1440px",
                "With a sidebar the content is about 1,150px: the grid scrolls about 440px, the name stays pinned.",
                "Hide secondary columns by default (resettable restores them) rather than shrinking every column.",
              ],
              [
                "1024px / 768px",
                "The sidebar becomes a rail or a drawer; the grid scrolls. The column picker is still a menu from 768px.",
                "Use compact density and the compact picker so the toolbar fits on one line.",
              ],
              [
                "390px / 320px",
                "The column picker opens as a bottom sheet with 44px rows. The demo unpins the name column below 640px.",
                "Keep the page free of horizontal scrolling. For read-mostly screens, consider a List of the same records.",
              ],
            ]}
          />
          <CodeBlock code={PICKER_CODE} />
        </div>
      </DocSection>

      <DocSection
        id="shell"
        title="Page width & density in an app"
        description="A data page uses the whole content area. A centered max-w-6xl column leaves more than 1,000px empty on a 2560px screen."
      >
        <div className="flex flex-col gap-4">
          <Bullets
            items={[
              <>
                The <C>vite-saas</C> template sets the layout per page: <C>width: &quot;fluid&quot;</C> drops the 72rem column,{" "}
                <C>density: &quot;compact&quot;</C> wraps the page in <C>YugenProvider density=&quot;compact&quot;</C> with the app&apos;s
                theme and brand. Pages without <C>layout</C> stay as they were.
              </>,
              "Compact pages use 12px padding (20px from a 48rem content area) and 12px between sections; the default is 16 / 24px and 16px. Both are classes in one map, not global CSS.",
              "Menus and sheets opened from a compact page are compact too: the nested provider passes the density to portals.",
              "The shell itself doesn't change: the sidebar becomes a rail or a drawer below the AppShell breakpoint, and the header keeps its height.",
            ]}
          />
          <CodeBlock code={SHELL_CODE} />
        </div>
      </DocSection>

      <DocSection id="a11y" title="Keyboard, sort & selection">
        <Bullets
          items={[
            "The grid is one tab stop. The arrow keys move cell by cell; Home / End, Ctrl + Home / End and PageUp / PageDown jump. Focus shows as a 2px outline; when the focused column is hidden, focus moves to the next one.",
            <>
              Name every grid (<C>aria-label</C>) and every column picker after its table, so two tables on a page don&apos;t both have a
              &quot;Columns&quot; button.
            </>,
            <>
              Sorting: Enter or Space on a header with <C>compare</C>. The header has <C>aria-sort</C>, and the direction is read with the
              column name; the arrow is not the only signal.
            </>,
            <>
              Selection: Space selects the focused row, Shift + arrows or Shift + click selects a range, Ctrl + A selects all. Rows have{" "}
              <C>aria-selected</C>; show the count in a <C>role=&quot;status&quot;</C> line.
            </>,
            "One interactive element per cell at most. Put row actions in a single menu button.",
            "In the column picker, required columns take focus and are read as “Always shown”; in the bottom sheet, the reorder handle works with Space and the arrow keys.",
          ]}
        />
      </DocSection>

      <DocSection id="rules" title="Do and don't">
        <DoDont
          dos={[
            "Give each column one width rule: fixed for codes, numbers and dates, a minimum for long text.",
            "Wrap long names and addresses; keep identifiers on one line.",
            "Pin the primary identifier and give the grid a fixed height for large result sets.",
            "Show loading, empty and error in the same box, with Retry for errors.",
          ]}
          donts={[
            "Don't put data only in a tooltip because the table is dense.",
            "Don't shrink the text to make compact rows: change the row height instead.",
            "Don't let a wide table widen the page; let the grid scroll.",
            "Don't pin more than about 40% of the width on narrow screens.",
          ]}
        />
      </DocSection>
    </>
  );
}
