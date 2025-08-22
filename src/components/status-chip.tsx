import { Badge } from "@/components/ui/badge";
import { ApplicationStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StatusChipProps {
  status: ApplicationStatus;
  className?: string;
}

const statusConfig = {
  DRAFT: { label: "Draft", variant: "secondary" as const, className: "bg-gray-100 text-gray-800 border-gray-200" },
  SUBMITTED: { label: "Submitted", variant: "default" as const, className: "bg-blue-100 text-blue-800 border-blue-200" },
  DISCREPANCY: { label: "Discrepancy", variant: "destructive" as const, className: "bg-orange-100 text-orange-800 border-orange-200" },
  APPROVED: { label: "Approved", variant: "default" as const, className: "bg-green-100 text-green-800 border-green-200" },
  REJECTED: { label: "Rejected", variant: "destructive" as const, className: "bg-red-100 text-red-800 border-red-200" },
};

export function StatusChip({ status, className }: StatusChipProps) {
  const config = statusConfig[status];
  
  return (
    <Badge 
      variant="outline"
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}