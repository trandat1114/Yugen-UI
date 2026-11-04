import { useState } from "react";
import { MoreHorizontal20Regular } from "@fluentui/react-icons";
import { useAnnounce } from "@/components/ui/AriaLive/AriaLive";
import { Button } from "@/components/ui/Button/Button";
import { List, ListItem } from "@/components/ui/List/List";
import { Menu, MenuItem, MenuPopover, MenuTrigger } from "@/components/ui/Menu/Menu";
import { arrayMove, Sortable, SortableGroup, SortableHandle, SortableItem } from "@/components/ui/Sortable/Sortable";
import type { ComponentDoc } from "../types";

const TASKS = [
  { id: "login", title: "Sign-in screen", description: "Due Friday" },
  { id: "orders", title: "Order list", description: "Waiting on API" },
  { id: "payment", title: "Payment", description: "High priority" },
  { id: "docs", title: "Release notes", description: "After launch" },
];

const TASKS_CODE = `const TASKS = [
  { id: "login", title: "Sign-in screen", description: "Due Friday" },
  { id: "orders", title: "Order list", description: "Waiting on API" },
  { id: "payment", title: "Payment", description: "High priority" },
  { id: "docs", title: "Release notes", description: "After launch" },
];`;

const taskById = (id: string) => TASKS.find((t) => t.id === id)!;

function TaskList() {
  const [order, setOrder] = useState(() => TASKS.map((t) => t.id));
  return (
    <Sortable asChild value={order} onValueChange={setOrder}>
      <List aria-label="Tasks" appearance="outline" className="w-full max-w-md">
        {order.map((id) => {
          const task = taskById(id);
          return (
            <SortableItem key={id} value={id} label={task.title} asChild>
              <ListItem media={<SortableHandle />} title={task.title} description={task.description} />
            </SortableItem>
          );
        })}
      </List>
    </Sortable>
  );
}

function Priorities() {
  const [order, setOrder] = useState(["Fast", "Cheap", "Durable"]);
  return (
    <Sortable orientation="horizontal" value={order} onValueChange={setOrder} role="list" aria-label="Priority order" className="flex gap-2">
      {order.map((name, i) => (
        <SortableItem
          key={name}
          value={name}
          label={name}
          role="listitem"
          className="flex items-center gap-1 rounded-large border border-stroke-1 bg-background-1 py-1 ps-1 pe-3"
        >
          <SortableHandle />
          <span className="text-caption1 text-foreground-3">{i + 1}</span>
          {name}
        </SortableItem>
      ))}
    </Sortable>
  );
}

const PHOTOS = ["Sakura", "Fuji", "Kyoto", "Nara", "Nikko", "Osaka"];

function Gallery() {
  const [order, setOrder] = useState(PHOTOS);
  return (
    <Sortable orientation="grid" value={order} onValueChange={setOrder} role="list" aria-label="Album photos" className="grid w-full max-w-sm grid-cols-3 gap-2">
      {order.map((name) => (
        <SortableItem
          key={name}
          value={name}
          label={name}
          role="listitem"
          className="relative flex aspect-square items-end rounded-large bg-brand-background-2 p-2 text-caption1 text-brand-foreground-2"
        >
          <SortableHandle className="absolute inset-e-1 top-1" />
          {name}
        </SortableItem>
      ))}
    </Sortable>
  );
}

const CARDS: Record<string, string> = {
  login: "Sign-in screen",
  orders: "Order list",
  payment: "Payment",
  docs: "Release notes",
  search: "Search",
};

const COLUMNS = [
  { id: "todo", title: "To do" },
  { id: "doing", title: "In progress" },
  { id: "done", title: "Done" },
];

const BOARD_CODE = `const CARDS: Record<string, string> = {
  login: "Sign-in screen",
  orders: "Order list",
  payment: "Payment",
  docs: "Release notes",
  search: "Search",
};
const COLUMNS = [
  { id: "todo", title: "To do" },
  { id: "doing", title: "In progress" },
  { id: "done", title: "Done" },
];`;

function Board() {
  const [board, setBoard] = useState<Record<string, string[]>>({
    todo: ["login", "orders", "search"],
    doing: ["payment"],
    done: ["docs"],
  });
  const [saved, setSaved] = useState("");
  return (
    <div className="w-full space-y-2">
      <div className="grid gap-3 sm:grid-cols-3">
        <SortableGroup
          value={board}
          onValueChange={setBoard}
          onSortEnd={({ item, to, canceled }) => {
            if (!canceled) setSaved(`Saved: ${CARDS[item]} in ${COLUMNS.find((c) => c.id === to.list)?.title}.`);
          }}
        >
          {COLUMNS.map((column) => (
            <div key={column.id} className="flex flex-col gap-2 rounded-large bg-background-2 p-2">
              <h3 className="px-1 text-body1 font-semibold">{column.title}</h3>
              <Sortable
                listId={column.id}
                role="list"
                aria-label={column.title}
                className="flex min-h-24 flex-1 flex-col gap-2 rounded-medium transition-colors data-over:bg-background-3"
              >
                {board[column.id].map((id) => (
                  <SortableItem
                    key={id}
                    value={id}
                    label={CARDS[id]}
                    role="listitem"
                    className="flex items-center gap-2 rounded-medium border border-stroke-2 bg-background-1 p-2 text-body1"
                  >
                    <SortableHandle />
                    {CARDS[id]}
                  </SortableItem>
                ))}
              </Sortable>
            </div>
          ))}
        </SortableGroup>
      </div>
      <p className="text-caption1 text-foreground-3">{saved}</p>
    </div>
  );
}

function Playlist() {
  const [songs, setSongs] = useState(["Cherry Blossom", "June Rain", "Night Sea", "Monsoon"]);
  const { announce } = useAnnounce();
  const move = (from: number, to: number) => {
    setSongs(arrayMove(songs, from, to));
    announce(`${songs[from]}: position ${to + 1} of ${songs.length}.`);
  };
  return (
    <Sortable asChild value={songs} onValueChange={setSongs}>
      <List aria-label="Playlist" className="w-full max-w-md">
        {songs.map((song, i) => (
          <SortableItem key={song} value={song} label={song} asChild>
            <ListItem
              media={<SortableHandle />}
              title={song}
              actions={
                <Menu>
                  <MenuTrigger asChild>
                    <Button appearance="subtle" icon={<MoreHorizontal20Regular />} aria-label={`Options for ${song}`} />
                  </MenuTrigger>
                  <MenuPopover align="end">
                    <MenuItem disabled={i === 0} onSelect={() => move(i, 0)}>
                      Move to top
                    </MenuItem>
                    <MenuItem disabled={i === 0} onSelect={() => move(i, i - 1)}>
                      Move up
                    </MenuItem>
                    <MenuItem disabled={i === songs.length - 1} onSelect={() => move(i, i + 1)}>
                      Move down
                    </MenuItem>
                  </MenuPopover>
                </Menu>
              }
            />
          </SortableItem>
        ))}
      </List>
    </Sortable>
  );
}

function PinnedApps() {
  const [apps, setApps] = useState(["Mail", "Calendar", "Files", "Notes"]);
  const [opened, setOpened] = useState("");
  return (
    <div className="space-y-2">
      <Sortable orientation="grid" value={apps} onValueChange={setApps} role="group" aria-label="Pinned apps" className="flex flex-wrap gap-2">
        {apps.map((app) => (
          <SortableItem key={app} value={app} asChild handle shortcuts>
            <Button onClick={() => setOpened(app)}>{app}</Button>
          </SortableItem>
        ))}
      </Sortable>
      <p className="text-caption1 text-foreground-3">{opened && `Opened ${opened}.`}</p>
    </div>
  );
}

export const docs: ComponentDoc[] = [
  {
    slug: "sortable",
    name: "Sortable",
    category: "Tiện ích",
    lead: "Sortable sắp xếp lại danh sách bằng kéo thả hoặc bàn phím; mỗi bước được đọc cho trình đọc màn hình.",
    description:
      "Sortable là danh sách sắp xếp được: SortableItem là từng mục, SortableHandle là tay nắm. Kéo tay nắm bằng chuột, bút hoặc ngón tay; mục đi quá nửa mục bên cạnh thì đổi chỗ, sát mép khung cuộn thì khung tự cuộn. Với bàn phím: focus tay nắm, Space hoặc Enter để nhấc mục lên, phím mũi tên để di chuyển, Space hoặc Enter để thả, Esc để huỷ; mỗi bước được đọc qua useAnnounce. Không kéo được thì bấm tay nắm để nhấc mục, rồi bấm tay nắm của mục khác để đặt vào chỗ đó. `onValueChange` chạy cả trong lúc kéo để giao diện theo kịp; lưu thứ tự trong `onSortEnd`. SortableGroup nối nhiều danh sách (cột Kanban): mục sang được danh sách khác, với bàn phím là phím mũi tên vuông góc với danh sách. Mục đã dùng Space / Enter cho việc khác (nút, menu item, Tag) thì đặt `handle` để cả mục là tay nắm và `shortcuts` để Alt + phím mũi tên di chuyển; DataGridColumnPicker và TagPicker (`reorderable`) làm như vậy. Hướng ngang và lưới theo RTL; khi bật giảm chuyển động, các mục đổi chỗ không trượt. Không phụ thuộc thư viện kéo thả.",
    importCode: `import { Sortable, SortableGroup, SortableItem, SortableHandle, arrayMove } from "@/components/ui";`,
    hero: {
      title: "Danh sách",
      code: `function TaskList() {
  const [order, setOrder] = useState(() => TASKS.map((t) => t.id));
  return (
    <Sortable asChild value={order} onValueChange={setOrder}>
      <List aria-label="Tasks" appearance="outline" className="w-full max-w-md">
        {order.map((id) => {
          const task = TASKS.find((t) => t.id === id)!;
          return (
            <SortableItem key={id} value={id} label={task.title} asChild>
              <ListItem media={<SortableHandle />} title={task.title} description={task.description} />
            </SortableItem>
          );
        })}
      </List>
    </Sortable>
  );
}`,
      setup: TASKS_CODE,
      render: () => <TaskList />,
    },
    examples: [
      {
        title: "Ngang",
        description: "orientation=\"horizontal\": ← → di chuyển, đảo chiều trong RTL.",
        code: `function Priorities() {
  const [order, setOrder] = useState(["Fast", "Cheap", "Durable"]);
  return (
    <Sortable orientation="horizontal" value={order} onValueChange={setOrder} role="list" aria-label="Priority order" className="flex gap-2">
      {order.map((name, i) => (
        <SortableItem
          key={name}
          value={name}
          label={name}
          role="listitem"
          className="flex items-center gap-1 rounded-large border border-stroke-1 bg-background-1 py-1 ps-1 pe-3"
        >
          <SortableHandle />
          <span className="text-caption1 text-foreground-3">{i + 1}</span>
          {name}
        </SortableItem>
      ))}
    </Sortable>
  );
}`,
        render: () => <Priorities />,
      },
      {
        title: "Lưới",
        description: "orientation=\"grid\": mục xuống dòng; ← → sang mục kế bên, ↑ ↓ sang hàng trên / dưới.",
        code: `const PHOTOS = ["Sakura", "Fuji", "Kyoto", "Nara", "Nikko", "Osaka"];

function Gallery() {
  const [order, setOrder] = useState(PHOTOS);
  return (
    <Sortable orientation="grid" value={order} onValueChange={setOrder} role="list" aria-label="Album photos" className="grid w-full max-w-sm grid-cols-3 gap-2">
      {order.map((name) => (
        <SortableItem
          key={name}
          value={name}
          label={name}
          role="listitem"
          className="relative flex aspect-square items-end rounded-large bg-brand-background-2 p-2 text-caption1 text-brand-foreground-2"
        >
          <SortableHandle className="absolute inset-e-1 top-1" />
          {name}
        </SortableItem>
      ))}
    </Sortable>
  );
}`,
        render: () => <Gallery />,
      },
      {
        title: "Kanban: SortableGroup",
        wide: true,
        description:
          "Mỗi cột là một Sortable có `listId`; SortableGroup giữ thứ tự của mọi cột. Với bàn phím, ← → chuyển thẻ sang cột kế bên. Cột đang nhận thẻ có `data-over`. `onSortEnd` chạy một lần khi thả: chỗ để lưu.",
        code: `function Board() {
  const [board, setBoard] = useState<Record<string, string[]>>({
    todo: ["login", "orders", "search"],
    doing: ["payment"],
    done: ["docs"],
  });
  const [saved, setSaved] = useState("");
  return (
    <div className="w-full space-y-2">
      <div className="grid gap-3 sm:grid-cols-3">
        <SortableGroup
          value={board}
          onValueChange={setBoard}
          onSortEnd={({ item, to, canceled }) => {
            if (!canceled) setSaved(\`Saved: \${CARDS[item]} in \${COLUMNS.find((c) => c.id === to.list)?.title}.\`);
          }}
        >
          {COLUMNS.map((column) => (
            <div key={column.id} className="flex flex-col gap-2 rounded-large bg-background-2 p-2">
              <h3 className="px-1 text-body1 font-semibold">{column.title}</h3>
              <Sortable
                listId={column.id}
                role="list"
                aria-label={column.title}
                className="flex min-h-24 flex-1 flex-col gap-2 rounded-medium transition-colors data-over:bg-background-3"
              >
                {board[column.id].map((id) => (
                  <SortableItem
                    key={id}
                    value={id}
                    label={CARDS[id]}
                    role="listitem"
                    className="flex items-center gap-2 rounded-medium border border-stroke-2 bg-background-1 p-2 text-body1"
                  >
                    <SortableHandle />
                    {CARDS[id]}
                  </SortableItem>
                ))}
              </Sortable>
            </div>
          ))}
        </SortableGroup>
      </div>
      <p className="text-caption1 text-foreground-3">{saved}</p>
    </div>
  );
}`,
        setup: BOARD_CODE,
        render: () => <Board />,
      },
      {
        title: "Lệnh Lên / Xuống",
        description:
          "Thêm lệnh trong menu cho người không nhận ra tay nắm. arrayMove trả về mảng mới; useAnnounce đọc vị trí mới như khi kéo.",
        code: `function Playlist() {
  const [songs, setSongs] = useState(["Cherry Blossom", "June Rain", "Night Sea", "Monsoon"]);
  const { announce } = useAnnounce();
  const move = (from: number, to: number) => {
    setSongs(arrayMove(songs, from, to));
    announce(\`\${songs[from]}: position \${to + 1} of \${songs.length}.\`);
  };
  return (
    <Sortable asChild value={songs} onValueChange={setSongs}>
      <List aria-label="Playlist" className="w-full max-w-md">
        {songs.map((song, i) => (
          <SortableItem key={song} value={song} label={song} asChild>
            <ListItem
              media={<SortableHandle />}
              title={song}
              actions={
                <Menu>
                  <MenuTrigger asChild>
                    <Button appearance="subtle" icon={<MoreHorizontal20Regular />} aria-label={\`Options for \${song}\`} />
                  </MenuTrigger>
                  <MenuPopover align="end">
                    <MenuItem disabled={i === 0} onSelect={() => move(i, 0)}>
                      Move to top
                    </MenuItem>
                    <MenuItem disabled={i === 0} onSelect={() => move(i, i - 1)}>
                      Move up
                    </MenuItem>
                    <MenuItem disabled={i === songs.length - 1} onSelect={() => move(i, i + 1)}>
                      Move down
                    </MenuItem>
                  </MenuPopover>
                </Menu>
              }
            />
          </SortableItem>
        ))}
      </List>
    </Sortable>
  );
}`,
        render: () => <Playlist />,
      },
      {
        title: "Cả mục là tay nắm",
        description:
          "Nút đã dùng Space / Enter để mở: `handle` cho kéo cả nút (bấm không kéo vẫn là bấm; trên màn hình cảm ứng thì giữ một lúc rồi kéo), `shortcuts` cho Alt + phím mũi tên di chuyển. Nút xuống dòng khi khung hẹp nên dùng orientation=\"grid\".",
        code: `function PinnedApps() {
  const [apps, setApps] = useState(["Mail", "Calendar", "Files", "Notes"]);
  const [opened, setOpened] = useState("");
  return (
    <div className="space-y-2">
      <Sortable orientation="grid" value={apps} onValueChange={setApps} role="group" aria-label="Pinned apps" className="flex flex-wrap gap-2">
        {apps.map((app) => (
          <SortableItem key={app} value={app} asChild handle shortcuts>
            <Button onClick={() => setOpened(app)}>{app}</Button>
          </SortableItem>
        ))}
      </Sortable>
      <p className="text-caption1 text-foreground-3">{opened && \`Opened \${opened}.\`}</p>
    </div>
  );
}`,
        render: () => <PinnedApps />,
      },
    ],
    dos: [
      "Lưu thứ tự trong onSortEnd; onValueChange chạy cả trong lúc kéo.",
      "Đặt `label` cho SortableItem khi mục có nhiều chữ, để thông báo ngắn gọn.",
      "Thêm lệnh Lên / Xuống khi người dùng có thể không nhận ra tay nắm.",
    ],
    donts: [
      "Không đặt SortableHandle trong mục có role option hay menuitem: các mục này không chứa được nút. Dùng `handle` và `shortcuts`.",
      "Không cho kéo danh sách đã có thứ tự tự động (theo ngày, theo tên).",
      "Không đổi id của mục giữa các lần render: `key` và `value` phải ổn định.",
    ],
    props: [
      { name: "value", type: "string[]", description: "Thứ tự id các mục. Bỏ trống khi nằm trong SortableGroup." },
      { name: "onValueChange", type: "(value: string[]) => void", description: "Gọi mỗi lần thứ tự đổi, kể cả giữa lúc kéo; Esc gọi lại với thứ tự lúc nhấc lên." },
      { name: "onSortStart", type: "(data: { item, from }) => void", description: "Lúc nhấc mục lên." },
      { name: "onSortEnd", type: "(data: { item, from, to, canceled }) => void", description: "Một lần mỗi lần thả, kể cả khi di chuyển bằng phím tắt. `from` / `to` là `{ list, index }`; `canceled` khi Esc. Lưu thứ tự ở đây." },
      { name: "orientation", type: `"vertical" | "horizontal" | "grid"`, defaultValue: `"vertical"`, description: "Hướng của danh sách: phím mũi tên nào di chuyển mục và cách tính chỗ thả khi kéo." },
      { name: "listId", type: "string", description: "Khoá của danh sách trong `value` của SortableGroup." },
      { name: "label", type: "string", description: "Tên danh sách trong thông báo khi mục chuyển danh sách. Mặc định aria-label / aria-labelledby." },
      { name: "disabled", type: "boolean", defaultValue: "false", description: "Không kéo mục trong danh sách và không thả mục khác vào." },
      { name: "asChild", type: "boolean", defaultValue: "false", description: "Gắn vào phần tử con (List, ul, tbody) thay vì render div." },
      { name: "SortableGroup.value", type: "Record<string, string[]>", description: "Thứ tự của mọi danh sách, theo listId." },
      { name: "SortableGroup.onValueChange", type: "(value: Record<string, string[]>) => void", description: "Như onValueChange của Sortable, cho cả nhóm." },
      { name: "SortableGroup.onSortStart / onSortEnd", type: "(data) => void", description: "Như của Sortable; `from.list` / `to.list` cho biết mục ở danh sách nào." },
      { name: "SortableItem.value", type: "string", description: "Id của mục, có trong value của danh sách." },
      { name: "SortableItem.label", type: "string", description: "Tên mục trong thông báo và nhãn tay nắm. Mặc định là chữ trong mục." },
      { name: "SortableItem.disabled", type: "boolean", defaultValue: "false", description: "Không nhấc được; mục vẫn bị đẩy chỗ khi mục khác đi qua." },
      { name: "SortableItem.handle", type: "boolean", defaultValue: "false", description: "Cả mục là tay nắm khi kéo bằng chuột / cảm ứng." },
      { name: "SortableItem.shortcuts", type: "boolean", defaultValue: "false", description: "Alt + phím mũi tên trên mục di chuyển ngay, không cần nhấc lên." },
      { name: "SortableItem.asChild", type: "boolean", defaultValue: "false", description: "Gắn vào phần tử con (ListItem, li, tr, Card) thay vì render div." },
      { name: "SortableHandle.asChild", type: "boolean", defaultValue: "false", description: "Dùng phần tử con làm tay nắm thay cho nút icon mặc định." },
      { name: "arrayMove(array, from, to)", type: "T[]", description: "Mảng mới với phần tử ở `from` chuyển sang `to`." },
    ],
  },
];
