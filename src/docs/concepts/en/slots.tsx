import type { ReactNode } from "react";
import {
  Add20Regular,
  ArrowRight16Regular,
  Copy20Regular,
  Delete20Regular,
  Document20Regular,
  Edit20Regular,
  Folder20Regular,
  MoreHorizontal20Regular,
  Search20Regular,
  Share20Regular,
} from "@fluentui/react-icons";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Dropdown,
  DropdownOption,
  Field,
  Input,
  Kbd,
  ListItem,
  List,
  Menu,
  MenuDivider,
  MenuItem,
  MenuPopover,
  MenuTrigger,
  Popover,
  PopoverSurface,
  PopoverTrigger,
  Radio,
  RadioGroup,
} from "@/components/ui";
import { DocSection, DoDont } from "../../blocks";
import { CodeBlock } from "../../CodeBlock";
import { docsPath } from "../../router";

function P({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl text-body2 text-foreground-2">{children}</p>;
}

function C({ children }: { children: ReactNode }) {
  return <code className="rounded-small bg-background-4 px-1 font-mono text-caption1">{children}</code>;
}

function Demo({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-3 rounded-2xlarge border border-stroke-2 bg-background-1 p-6">{children}</div>;
}

function SimpleTable({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-xlarge border border-stroke-2 bg-background-1">
      <table className="w-full border-collapse text-start text-body1">
        <thead>
          <tr className="border-b border-stroke-2 bg-background-3 text-caption1 font-semibold text-foreground-2">
            {head.map((h) => (
              <th key={h} className="px-4 py-2 text-start">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-stroke-3 align-top last:border-b-0">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-foreground-2">
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

const AS_CHILD_CODE = `import { ArrowRight16Regular, Share20Regular } from "@fluentui/react-icons";
import { Button, Popover, PopoverSurface, PopoverTrigger } from "@/components/ui";

{/* Button renders as <a> but keeps its style, ref and events */}
<Button asChild appearance="primary">
  <a href="#/concepts/theming">
    Read about Theming
    <ArrowRight16Regular className="rtl:-scale-x-100" />
  </a>
</Button>

{/* The Radix trigger merges open behavior and aria-* into your Button */}
<Popover>
  <PopoverTrigger asChild>
    <Button icon={<Share20Regular />}>Share</Button>
  </PopoverTrigger>
  <PopoverSurface>Link copied.</PopoverSurface>
</Popover>`;

const NODE_PROPS_CODE = `<Button icon={<Add20Regular />}>New</Button>
<Button icon={<ArrowRight16Regular className="rtl:-scale-x-100" />} iconPosition="after">Continue</Button>
<Button appearance="subtle" icon={<MoreHorizontal20Regular />} aria-label="More" />

<Input
  aria-label="Search files"
  placeholder="Search files"
  contentBefore={<Search20Regular />}
  contentAfter={<Kbd>/</Kbd>}
  rootClassName="w-64"
/>

<Badge icon={<Document20Regular />}>12</Badge>

<Menu>
  <MenuTrigger asChild>
    <Button>Actions</Button>
  </MenuTrigger>
  <MenuPopover>
    <MenuItem icon={<Edit20Regular />} secondaryContent="Ctrl+E">Edit</MenuItem>
    <MenuItem icon={<Copy20Regular />} secondaryContent="Ctrl+D">Duplicate</MenuItem>
    <MenuDivider />
    <MenuItem icon={<Delete20Regular />}>Delete</MenuItem>
  </MenuPopover>
</Menu>`;

const LIST_CODE = `<List className="w-full max-w-md">
  <ListItem
    media={<Avatar name="Olivia Bennett" color="colorful" />}
    title="Olivia Bennett"
    description="Edited Q3 plan"
    actions={<Button size="small" appearance="subtle" icon={<MoreHorizontal20Regular />} aria-label="More actions" />}
  />
</List>

<Dropdown placeholder="Choose a folder" aria-label="Folder">
  <DropdownOption value="docs" media={<Folder20Regular />}>Documents</DropdownOption>
  <DropdownOption value="design" media={<Folder20Regular />}>Design</DropdownOption>
</Dropdown>`;

const CARD_CODE = `import { Avatar, Badge, Button, Card, CardContent, CardFooter, CardHeader } from "@/components/ui";

<Card className="w-full max-w-sm">
  <CardHeader
    image={<Avatar name="Sakura team" color="brand" />}
    header="Sakura team"
    description="Updated 5 minutes ago"
    action={<Button appearance="subtle" icon={<MoreHorizontal20Regular />} aria-label="More actions" />}
  />
  <CardContent>The draft of the new home page is ready for feedback.</CardContent>
  {/* Put any element between the parts; you decide the order */}
  <div className="flex gap-1">
    <Badge appearance="tint" color="brand">Design</Badge>
    <Badge appearance="tint" color="informative">Draft</Badge>
  </div>
  <CardFooter>
    <Button appearance="primary">Open</Button>
    <Button>Dismiss</Button>
  </CardFooter>
</Card>`;

const RENDER_PROP_CODE = `{/* 1. Element: Field clones it and sets id, aria-describedby, aria-invalid, required, disabled */}
<Field label="Project name" hint="Shown in the title bar." required>
  <Input placeholder="Yugen Docs" />
</Field>

{/* 2. Render-prop: you decide where the props go */}
<Field label="Access" hint="You can change this later in Settings.">
  {(props) => (
    <RadioGroup {...props} defaultValue="team" layout="horizontal">
      <Radio value="private" label="Private" />
      <Radio value="team" label="Team" />
    </RadioGroup>
  )}
</Field>`;

export default function Page() {
  return (
    <>
      <DocSection
        id="overview"
        title="Slots in Yugen"
        description="Each Fluent v9 slot concept has a Yugen counterpart. All of them are plain React with no extra API."
      >
        <SimpleTable
          head={["Fluent v9", "Yugen UI", "Examples"]}
          rows={[
            [<><C>root</C> slot, <C>as</C> prop</>, <C key="a">asChild</C>, "Button, Link, BreadcrumbButton, NavItem; every Radix *Trigger"],
            [<><C>icon</C> slot</>, <C key="a">icon</C>, "Button, ToggleButton, Badge, MenuItem, TabsTrigger, AccordionHeader"],
            [<><C>contentBefore</C> / <C>contentAfter</C> slots</>, "Same name", "Input, SearchBox"],
            [<><C>media</C> slot</>, <C key="a">media</C>, "ListItem, DropdownOption, TableCellLayout, TagPicker option"],
            [<><C>action</C> / <C>actions</C> slots</>, "Same name", "CardHeader action, MessageBar actions, ListItem actions, TreeItemLayout actions"],
            ["Sub-components (CardHeader, DialogBody…)", "Compound components", "Card*, Dialog*, Drawer*, Table*, Menu*"],
            [<>Slot that takes a render function</>, "Render-prop children", <>Field: <C>{"(props) => <Control {...props} />"}</C></>],
            [<>className of a child slot</>, <><C>rootClassName</C>, <C>listboxClassName</C>…</>, "Input, Slider, InfoLabel, Dropdown, Combobox, Select"],
          ]}
        />
      </DocSection>

      <DocSection
        id="as-child"
        title="asChild: change the root element"
        description="asChild uses the Radix Slot. The component does not render its own element; it merges className, ref, events and aria-* into the single child element you pass."
      >
        <div className="flex flex-col gap-4">
          <Demo>
            <Button asChild appearance="primary">
              <a href={docsPath("/concepts/theming")}>
                Read about Theming
                <ArrowRight16Regular className="rtl:-scale-x-100" />
              </a>
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button icon={<Share20Regular />}>Share</Button>
              </PopoverTrigger>
              <PopoverSurface>Link copied.</PopoverSurface>
            </Popover>
          </Demo>
          <CodeBlock code={AS_CHILD_CODE} />
          <ul className="flex max-w-3xl list-disc flex-col gap-1 ps-5 text-body2 text-foreground-2">
            <li>The child must be <strong className="font-semibold">one</strong> element that forwards its ref and spreads props onto the DOM.</li>
            <li>
              With <C>{"<Button asChild>"}</C>, the <C>icon</C> prop is ignored (Button only renders its children). Put the icon inside the
              child element, as in the example above.
            </li>
            <li>
              Use asChild to wrap router links: <C>{"<BreadcrumbButton asChild><RouterLink to=\"/\">…</RouterLink></BreadcrumbButton>"}</C>.
            </li>
          </ul>
        </div>
      </DocSection>

      <DocSection
        id="node-props"
        title="ReactNode props: icon, contentBefore, media, actions"
        description="Instead of slot objects, secondary areas take a ReactNode directly. The component handles alignment, spacing and icon size."
      >
        <div className="flex flex-col gap-4">
          <Demo>
            <Button icon={<Add20Regular />}>New</Button>
            <Button icon={<ArrowRight16Regular className="rtl:-scale-x-100" />} iconPosition="after">
              Continue
            </Button>
            <Button appearance="subtle" icon={<MoreHorizontal20Regular />} aria-label="More" />
            <Input aria-label="Search files" placeholder="Search files" contentBefore={<Search20Regular />} contentAfter={<Kbd>/</Kbd>} rootClassName="w-64" />
            <Badge icon={<Document20Regular />}>12</Badge>
            <Menu>
              <MenuTrigger asChild>
                <Button>Actions</Button>
              </MenuTrigger>
              <MenuPopover>
                <MenuItem icon={<Edit20Regular />} secondaryContent="Ctrl+E">
                  Edit
                </MenuItem>
                <MenuItem icon={<Copy20Regular />} secondaryContent="Ctrl+D">
                  Duplicate
                </MenuItem>
                <MenuDivider />
                <MenuItem icon={<Delete20Regular />}>Delete</MenuItem>
              </MenuPopover>
            </Menu>
          </Demo>
          <CodeBlock code={NODE_PROPS_CODE} />
          <Demo>
            <List className="w-full max-w-md">
              <ListItem
                media={<Avatar name="Olivia Bennett" color="colorful" />}
                title="Olivia Bennett"
                description="Edited Q3 plan"
                actions={<Button size="small" appearance="subtle" icon={<MoreHorizontal20Regular />} aria-label="More actions" />}
              />
            </List>
            <Dropdown placeholder="Choose a folder" aria-label="Folder">
              <DropdownOption value="docs" media={<Folder20Regular />}>
                Documents
              </DropdownOption>
              <DropdownOption value="design" media={<Folder20Regular />}>
                Design
              </DropdownOption>
            </Dropdown>
          </Demo>
          <CodeBlock code={LIST_CODE} />
          <P>
            The component sets the icon size with <C>[&_svg]:size-*</C> (small 16, medium 20, large 24), so pass a size 20 Fluent icon and
            let the component scale it. A decorative icon needs no <C>aria-label</C>; an icon-only button must have one.
          </P>
        </div>
      </DocSection>

      <DocSection
        id="compound"
        title="Compound components"
        description="Card, Dialog, Drawer, Table and Menu are split into small parts. Leave out the parts you don't need, reorder them or put your own elements between them."
      >
        <div className="flex flex-col gap-4">
          <Demo>
            <Card className="w-full max-w-sm">
              <CardHeader
                image={<Avatar name="Sakura team" color="brand" />}
                header="Sakura team"
                description="Updated 5 minutes ago"
                action={<Button appearance="subtle" icon={<MoreHorizontal20Regular />} aria-label="More actions" />}
              />
              <CardContent>The draft of the new home page is ready for feedback.</CardContent>
              <div className="flex gap-1">
                <Badge appearance="tint" color="brand">
                  Design
                </Badge>
                <Badge appearance="tint" color="informative">
                  Draft
                </Badge>
              </div>
              <CardFooter>
                <Button appearance="primary">Open</Button>
                <Button>Dismiss</Button>
              </CardFooter>
            </Card>
          </Demo>
          <CodeBlock code={CARD_CODE} />
          <SimpleTable
            head={["Component family", "Parts"]}
            rows={[
              ["Card", "Card · CardHeader (image, header, description, action) · CardPreview · CardContent · CardFooter"],
              ["Dialog", "Dialog · DialogTrigger · DialogSurface (modalType) · DialogTitle (action) · DialogDescription · DialogContent · DialogActions · DialogClose"],
              ["Drawer", "Drawer / OverlayDrawer / InlineDrawer · DrawerSurface · DrawerHeader · DrawerHeaderTitle (action) · DrawerBody · DrawerFooter"],
              ["Table", "Table · TableHeader · TableHeaderCell · TableBody · TableRow · TableCell · TableCellLayout · TableCellActions · TableSelectionCell"],
              ["Menu", "Menu · MenuTrigger · MenuPopover · MenuItem · MenuItemCheckbox · MenuItemRadio · MenuGroupHeader · MenuDivider · MenuSub…"],
            ]}
          />
        </div>
      </DocSection>

      <DocSection
        id="render-prop"
        title="Render-props in Field"
        description="Field connects the label, hint and validation to the control. Pass an element when the control takes the id directly; pass a function when you need to decide where the props go."
      >
        <div className="flex flex-col gap-4">
          <Demo>
            <div className="flex w-full max-w-md flex-col gap-4">
              <Field label="Project name" hint="Shown in the title bar." required>
                <Input placeholder="Yugen Docs" />
              </Field>
              <Field label="Access" hint="You can change this later in Settings.">
                {(props) => (
                  <RadioGroup {...props} defaultValue="team" layout="horizontal">
                    <Radio value="private" label="Private" />
                    <Radio value="team" label="Team" />
                  </RadioGroup>
                )}
              </Field>
            </div>
          </Demo>
          <CodeBlock code={RENDER_PROP_CODE} />
          <SimpleTable
            head={["Prop passed by Field", "Value"]}
            rows={[
              [<C key="a">id</C>, <>The Field&apos;s <C>id</C> prop or a generated id (<C>useId</C>). The label points to it with <C>htmlFor</C>.</>],
              [<C key="a">aria-describedby</C>, <>The ids of validationMessage and hint (when present).</>],
              [<C key="a">aria-invalid</C>, <><C>true</C> when <C>validationState=&quot;error&quot;</C>.</>],
              [<C key="a">required, disabled</C>, "Taken from the Field props of the same name."],
            ]}
          />
          <P>
            With an element, props set directly on the control <strong className="font-semibold">win</strong> over the Field props (Field
            merges in the order <C>{"{ ...fieldProps, ...child.props }"}</C>). Note that <C>{"<label for>"}</C> cannot name a{" "}
            <C>role=&quot;radiogroup&quot;</C>. For choice groups, see how to label a group on{" "}
            <a className="text-link underline hover:text-link-hover" href={docsPath("/concepts/component-labelling")}>
              Labelling components
            </a>
            .
          </P>
        </div>
      </DocSection>

      <DocSection
        id="class-targets"
        title="rootClassName & className"
        description="Components with several DOM layers let you target the right one. The general rule: className goes on the main visible part, rootClassName on the outer wrapper."
      >
        <div className="flex flex-col gap-4">
          <SimpleTable
            head={["Component", "className", "Extra prop"]}
            rows={[
              ["Input, SearchBox", "The input frame (border, background, focus bar)", <><C>rootClassName</C>: the outer block with label and hint; set width / margin here</>],
              ["Slider", "Radix root (rail and thumb)", <><C>rootClassName</C>: the outer block with label and value</>],
              ["InfoLabel", "The label element", <><C>rootClassName</C>: the span around the label and the (i) button</>],
              ["Select", "The outer frame (set width here)", <><C>selectClassName</C>: the {"<select>"} element itself</>],
              ["Textarea", "The outer frame (set width here)", <><C>textareaClassName</C>: the {"<textarea>"} element itself</>],
              ["ProgressBar", "The progress bar", <><C>rootClassName</C>: the outer block when there is a label / description</>],
              ["Dropdown, Combobox, TagPicker", "Trigger / input", <><C>listboxClassName</C>: the listbox surface in the portal</>],
              ["PopoverSurface, MenuPopover, TooltipContent", "The floating surface in the portal", "—"],
            ]}
          />
          <CodeBlock
            code={`<Input rootClassName="w-72" className="bg-background-2" placeholder="Gray frame, 288px wide block" />
<Slider rootClassName="max-w-xs" label="Volume" defaultValue={[40]} />
<Select className="w-48" selectClassName="font-semibold">…</Select>
<Dropdown className="w-56" listboxClassName="max-h-60">…</Dropdown>`}
          />
          <DoDont
            dos={[
              "Use asChild to change the root element (a link, a router link) instead of adding a wrapper.",
              "Pass a size 20 Fluent icon to the icon / media prop and let the component scale it.",
              "Use the Field render-prop when the control does not take the id on its root element.",
            ]}
            donts={[
              "Passing more than one child to an asChild element.",
              "Setting width in the className of an Input that has a label. Use rootClassName.",
              "Copying a component's inner markup to add an icon. Use the existing prop.",
            ]}
          />
        </div>
      </DocSection>
    </>
  );
}
