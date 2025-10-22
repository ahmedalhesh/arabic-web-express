import { Badge } from "@/components/ui/badge";
import type { License } from "@shared/schema";

interface StatusBadgeProps {
  status: License["status"];
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusStyle = () => {
    switch (status) {
      case "صالح":
        return "bg-success/10 text-success border-success/20";
      case "منتهي":
        return "bg-warning/10 text-warning border-warning/20";
      case "موقوف":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "غير مفعّل":
        return "bg-muted text-muted-foreground border-border";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <Badge
      variant="outline"
      className={`${getStatusStyle()} text-xs font-medium`}
      data-testid={`badge-status-${status}`}
    >
      {status}
    </Badge>
  );
}
