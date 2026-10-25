import { useState } from "react";
import { ChevronDown16Regular, PersonAdd20Regular } from "@fluentui/react-icons";
import { Avatar, Button, Card, Input, Menu, MenuItemRadio, MenuPopover, MenuRadioGroup, MenuTrigger } from "@/components/ui";
import type { Role } from "../content/types";
import type { PageProps } from "../pages";

export default function TeamPage({ t }: PageProps) {
  const c = t.team;
  const [members, setMembers] = useState(c.members);

  const setRole = (email: string, role: Role) => setMembers((list) => list.map((m) => (m.email === email ? { ...m, role } : m)));

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Card size="large" className="gap-4 rounded-xlarge p-5">
        <div>
          <h3 className="text-subtitle1 font-semibold">{c.title}</h3>
          <p className="mt-0.5 text-body1 text-foreground-3">{c.description}</p>
        </div>

        <div className="flex gap-2">
          <Input aria-label="Email" placeholder={c.emailPlaceholder} rootClassName="flex-1" />
          <Button appearance="primary" icon={<PersonAdd20Regular />}>
            {c.invite}
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
                    {c.roles[m.role]}
                  </Button>
                </MenuTrigger>
                <MenuPopover align="end">
                  <MenuRadioGroup value={m.role} onValueChange={(role) => setRole(m.email, role as Role)}>
                    {(Object.keys(c.roles) as Role[]).map((r) => (
                      <MenuItemRadio key={r} value={r}>
                        {c.roles[r]}
                      </MenuItemRadio>
                    ))}
                  </MenuRadioGroup>
                </MenuPopover>
              </Menu>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
