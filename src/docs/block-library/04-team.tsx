import { useState } from "react";
import { ChevronDown16Regular, PersonAdd20Regular } from "@fluentui/react-icons";
import {
  Avatar,
  Button,
  Card,
  Input,
  Menu,
  MenuItemRadio,
  MenuPopover,
  MenuRadioGroup,
  MenuTrigger,
} from "@/components/ui";

export const meta = { title: "Thành viên nhóm", description: "Mời thành viên và phân quyền bằng Menu", order: 4 };

const ROLES = ["Chủ sở hữu", "Chỉnh sửa", "Chỉ xem"];

const INITIAL = [
  { name: "Nguyễn Minh Anh", email: "anh.nguyen@congty.vn", role: "Chủ sở hữu", presence: "available" as const },
  { name: "Trần Quốc Bảo", email: "bao.tran@congty.vn", role: "Chỉnh sửa", presence: "busy" as const },
  { name: "Lê Thu Hà", email: "ha.le@congty.vn", role: "Chỉ xem", presence: "away" as const },
];

export default function TeamBlock() {
  const [members, setMembers] = useState(INITIAL);

  const setRole = (email: string, role: string) =>
    setMembers((list) => list.map((m) => (m.email === email ? { ...m, role } : m)));

  return (
    <Card size="large" className="gap-4 rounded-xlarge p-5">
      <div>
        <h3 className="text-subtitle1 font-semibold">Thành viên nhóm</h3>
        <p className="mt-0.5 text-body1 text-foreground-3">Mời đồng đội và chọn quyền truy cập.</p>
      </div>

      <div className="flex gap-2">
        <Input aria-label="Email" placeholder="email@congty.vn" rootClassName="flex-1" />
        <Button appearance="primary" icon={<PersonAdd20Regular />}>
          Mời
        </Button>
      </div>

      <ul className="flex flex-col">
        {members.map((m) => (
          <li key={m.email} className="flex items-center gap-3 border-t border-stroke-3 py-2 first:border-t-0">
            <Avatar name={m.name} color="colorful" presence={m.presence} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-body1 font-semibold">{m.name}</p>
              <p className="truncate text-caption1 text-foreground-3">{m.email}</p>
            </div>
            <Menu>
              <MenuTrigger asChild>
                <Button appearance="subtle" size="small" icon={<ChevronDown16Regular />} iconPosition="after">
                  {m.role}
                </Button>
              </MenuTrigger>
              <MenuPopover align="end">
                <MenuRadioGroup value={m.role} onValueChange={(role) => setRole(m.email, role)}>
                  {ROLES.map((r) => (
                    <MenuItemRadio key={r} value={r}>
                      {r}
                    </MenuItemRadio>
                  ))}
                </MenuRadioGroup>
              </MenuPopover>
            </Menu>
          </li>
        ))}
      </ul>
    </Card>
  );
}
