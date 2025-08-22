import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard } from "lucide-react";
import { UserRole } from "@/lib/types";

export function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>("AGENT");
  const { login, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = () => {
    login(selectedRole);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
            <CreditCard className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">UPI QR Merchant</CardTitle>
          <CardDescription>
            Select your role to continue to the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Role</label>
            <Select value={selectedRole} onValueChange={(value: UserRole) => setSelectedRole(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AGENT">Agent - Create & manage applications</SelectItem>
                <SelectItem value="APPROVER">Approver - Review & approve applications</SelectItem>
                <SelectItem value="MONITOR">Monitor - View analytics & reports</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleLogin} className="w-full" size="lg">
            Continue
          </Button>

          <div className="text-xs text-muted-foreground text-center">
            This is a demo application. Role switching is available in the topbar.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}