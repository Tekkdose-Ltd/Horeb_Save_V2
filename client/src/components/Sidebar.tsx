import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  Receipt, 
  Settings, 
  LogOut,
  Bell
} from "lucide-react";
import { HorebSaveLogoSmall } from "@/components/HorebSaveLogo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className = "" }: SidebarProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const { data: notifications } = useQuery({
    queryKey: ["/notifications"],
    retry: false,
  });

  const unreadCount = Array.isArray(notifications)
    ? notifications.filter((n: any) => !n.isRead).length
    : 0;

  const userName = user
    ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || "User"
    : "User";

  const userEmail = user?.email || "user@example.com";

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
  };

  const navItems = [
    { 
      href: "/dashboard", 
      label: "Dashboard", 
      icon: LayoutDashboard,
      active: location === "/dashboard" || location === "/"
    },
    { 
      href: "/groups", 
      label: "My Groups", 
      icon: Users,
      active: location === "/groups" || location.startsWith("/groups/")
    },
    { 
      href: "/transactions", 
      label: "Transactions", 
      icon: Receipt,
      active: location === "/transactions"
    },
    { 
      href: "/notifications", 
      label: "Notifications", 
      icon: Bell,
      active: location === "/notifications",
      badge: unreadCount
    },
    { 
      href: "/profile", 
      label: "Settings", 
      icon: Settings,
      active: location === "/profile"
    },
  ];

  return (
    <aside className={`bg-card border-r border-border h-screen sticky top-0 flex p-4 bg-white-50 rounded-xl mx-4 my-6 flex-col ${className}`}>
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link href="/" className="flex items-center space-x-3">
          <HorebSaveLogoSmall className="w-10 h-10" />
          <div>
            <h1 className="text-xl font-bold text-foreground">Horeb Save</h1>
            {/* <p className="text-xs text-muted-foreground">Save Together, Grow Together</p> */}
          </div>
        </Link>
      </div>

      {/* User Profile */}
      <div className="p-2  bg-zinc-200 rounded-lg border-border">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user?.profileImageUrl || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1  min-w-0">
            <p className="font-semibold text-sm text-foreground truncate">
              {userName}
            </p>
            {/* <p className="text-xs text-muted-foreground truncate">
              {userEmail}
            </p> */}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
            >
              <Button
                variant={item.active ? "secondary" : "ghost"}
                className={`w-full justify-start ${
                  item.active 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="ml-auto bg-accent text-accent-foreground rounded-full px-2 py-0.5 text-xs font-medium">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted"
          onClick={logout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
