import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PatientGender } from "@/types";

interface GenderBadgeProps {
  gender: PatientGender;
  className?: string;
}

export function GenderBadge({ gender, className }: GenderBadgeProps) {
  if (!gender) return <span className="text-muted-foreground text-sm">—</span>;

  const isMale = gender === "male";
  return (
    <Badge
      className={cn(
        "capitalize font-semibold text-xs px-2.5 py-1",
        isMale
          ? "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100"
          : "bg-pink-100 text-pink-700 border-pink-200 hover:bg-pink-100",
        className
      )}
      variant="outline"
    >
      {gender}
    </Badge>
  );
}
