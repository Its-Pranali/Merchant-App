import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Sun,
  Moon,
  User,
  LogOut,
  UserCog,
  Menu,
} from "lucide-react";
import { UserRole } from "@/lib/types";

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user, switchRole, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  if (!user) return null;

  const handleRoleSwitch = (role: UserRole) => {
    switchRole(role);
  };

  return (
    <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30">
      <div className="flex justify-end h-16 items-center gap-4 px-4">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        {/* Search - Hidden on mobile */}
        {/* <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search applications..."
              className="pl-9 h-9"
              disabled
            />
          </div>
        </div> */}

        {/* Spacer for mobile */}
        <div className="flex-1 md:hidden" />

        {/* Role Switcher - Hidden on mobile, moved to user menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 hidden md:flex">
              <UserCog className="h-4 w-4" />
              <Badge variant="secondary">{user.role}</Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleRoleSwitch("AGENT")}>
              <span>Agent</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRoleSwitch("APPROVER")}>
              <span>Approver</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRoleSwitch("MONITOR")}>
              <span>Monitor</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
                <Badge variant="secondary" className="w-fit mt-1">
                  {user.role}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Mobile Role Switcher */}
            <div className="md:hidden">
              <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleRoleSwitch("AGENT")}>
                <UserCog className="mr-2 h-4 w-4" />
                <span>Agent</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleRoleSwitch("APPROVER")}>
                <UserCog className="mr-2 h-4 w-4" />
                <span>Approver</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleRoleSwitch("MONITOR")}>
                <UserCog className="mr-2 h-4 w-4" />
                <span>Monitor</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </div>
            <Link to="/pages/profilePage">
              <DropdownMenuItem>

                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>


              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/loginPage" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}