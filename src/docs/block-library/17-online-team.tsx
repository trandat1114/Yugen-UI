import { AvatarGroup, AvatarGroupItem, Badge, Card, Persona } from "@/components/ui";

export const meta = { title: "Who's online", description: "Persona with presence and an AvatarGroup that compacts large groups", order: 17 };

const MEMBERS = ["Alex Chen", "Maria Garcia", "Sam Lee", "Priya Patel", "Jordan Kim", "Taylor Nguyen"];

export default function OnlineTeamBlock() {
  return (
    <Card className="max-w-md gap-4 rounded-xlarge p-5">
      <Persona name="Hana Sato" secondaryText="Product design · presenting" presence="available" size="large" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <AvatarGroup layout="stack" size={32} maxAvatars={5} overflowLabel="View all members">
          {MEMBERS.map((name) => (
            <AvatarGroupItem key={name} name={name} />
          ))}
        </AvatarGroup>
        <Badge appearance="tint" color="success">
          {MEMBERS.length} online
        </Badge>
      </div>
    </Card>
  );
}
