import { AvatarGroup, AvatarGroupItem, Badge, Card, Persona } from "@/components/ui";

export const meta = { title: "Đang trực tuyến", description: "Persona có trạng thái hiện diện và AvatarGroup gọn khi đông người", order: 17 };

const MEMBERS = ["Lê Minh", "Phạm Hà", "Ngô Vy", "Đỗ Quân", "Vũ An", "Hồ Linh"];

export default function OnlineTeamBlock() {
  return (
    <Card className="max-w-md gap-4 rounded-xlarge p-5">
      <Persona name="Trần Lan" secondaryText="Thiết kế sản phẩm · đang trình bày" presence="available" size="large" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <AvatarGroup layout="stack" size={32} maxAvatars={5} overflowLabel="Xem tất cả thành viên">
          {MEMBERS.map((name) => (
            <AvatarGroupItem key={name} name={name} />
          ))}
        </AvatarGroup>
        <Badge appearance="tint" color="success">
          {MEMBERS.length} đang trực tuyến
        </Badge>
      </div>
    </Card>
  );
}
