import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return fallback || (
      <Card className="m-8">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Shield className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground">Access Restricted</h3>
          <p className="text-sm text-muted-foreground mt-2">
            You don't have permission to view this page.
          </p>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}