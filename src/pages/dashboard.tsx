import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

export function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on role
  switch (user.role) {
    case "AGENT":
      return <Navigate to="/applications" replace />;
    case "APPROVER":
      return <Navigate to="/review" replace />;
    case "MONITOR":
      return <Navigate to="/monitor/overview" replace />;
    
    default:
      return <Navigate to="/applications" replace />;
  }
}