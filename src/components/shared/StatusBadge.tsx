import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { RoomStatus } from "@/types";

interface StatusBadgeProps {
  status: RoomStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const isOccupied = status === "occupied";
  return (
    <Badge
      className={cn(
        "capitalize font-semibold text-xs px-2.5 py-1",
        isOccupied
          ? "bg-red-100 text-red-700 border-red-200 hover:bg-red-100"
          : "bg-green-100 text-green-700 border-green-200 hover:bg-green-100",
        className
      )}
      variant="outline"
    >
      <span
        className={cn(
          "inline-block w-1.5 h-1.5 rounded-full mr-1.5",
          isOccupied ? "bg-red-500" : "bg-green-500"
        )}
      />
      {status}
    </Badge>
  );
}
