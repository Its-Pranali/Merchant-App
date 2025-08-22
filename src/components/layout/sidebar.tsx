import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  CreditCard,
  FileText,
  Home,
  ClipboardCheck,
  Monitor,
  UserPlus
} from "lucide-react";

const navigation = {
  AGENT: [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "My Applications", href: "/applications", icon: FileText },
  ],
  APPROVER: [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Review Queue", href: "/review", icon: ClipboardCheck },

  ],
  MONITOR: [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Overview", href: "/monitor/overview", icon: Monitor },
    { name: "All Applications", href: "/monitor/applications", icon: FileText },
    { name: "Registration", href: "/registration", icon: UserPlus },
  ],
};

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const navItems = navigation[user.role] || [];

  const handleNavClick = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <div className="flex flex-col h-full bg-card border-r w-64">
      {/* Logo/Brand */}
      <div className="px-4 border-b">
        {/* <div className="flex items-center justify-center gap-3">
          <img src="https://www.vidyaonline.in/wp-content/uploads/2024/03/cropped-cropped-image-e1711277713347-1.png" className="w-100 text-center dark-logo" />
          <img src="http://reports.vidyaonlineservices.in/vol2-1.png" className="w-100 text-center light-logo" />
        </div> */}

        <div className="flex items-center justify-center gap-3">
          {/* Light Logo (light mode only) */}
          <img
            // src="../dist/assets/images/vol2-1.png"
            src="./dist/assets/images/vol2-1.png"
            className="block dark:hidden w-[71%] h-auto mx-auto"
            alt="Light Logo"
          />

          {/* Dark Logo (dark mode only) */}
          <img
            src="./dist/assets/images/site-logo.png"
            className="hidden dark:block w-[77%] py-1"
            alt="Dark Logo"
          />
        </div>

      </div>
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <CreditCard className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">UPI QR</h2>
            <p className="text-xs text-muted-foreground">Merchant App</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  onClick={handleNavClick}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-colors w-full",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}