"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/utils/hooks/useAuth";
import { useToast } from "@/lib/utils/useToast";
import {
  Shield,
  LayoutDashboard,
  Map as MapIcon,
  HardHat,
  Snowflake,
  UserCheck,
  FileText,
  Target,
  CalendarDays,
  ScrollText,
  Users,
  Settings,
  HelpCircle,
  LogOut
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Map Management", href: "/admin/map-management", icon: MapIcon },
  { name: "Trip Inspection", href: "/admin/trip-inspection", icon: HardHat },
  { name: "Snow Removal", href: "/admin/snow-removal", icon: Snowflake },
  { name: "Check-In Requests", href: "/admin/check-in-requests", icon: UserCheck, badge: 2 },
  { name: "Reports", href: "/admin/reports", icon: FileText },
  { name: "Targets", href: "/admin/targets", icon: Target },
  { name: "Attendance", href: "/admin/attendance", icon: CalendarDays },
  { name: "Audit Log", href: "/admin/audit-log", icon: ScrollText },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Settings", href: "/admin/settings", icon: Settings },
  { name: "Help & Support", href: "/admin/help", icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({ message: "Logged out successfully", variant: "success" });
    } catch (err) {
      toast({ message: "Logout failed", variant: "error" });
    }
  };

  return (
    <>
      <div id="mobile-overlay" className="fixed inset-0 z-50 bg-black/50 hidden lg:hidden"></div>

      <aside id="sidebar"
        className="bg-sidebar-background border-r border-sidebar-border flex-col flex-shrink-0 transition-all duration-300 w-60 hidden lg:flex">
        {/* Logo */}
        <div className="p-4 flex items-center gap-3 border-b border-sidebar-border h-14">
          <div
            className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 text-primary-foreground shadow-glow-primary">
            <Shield className="h-5 w-5" />
          </div>
          <div className="overflow-hidden sidebar-text">
            <h1 className="text-sm font-bold text-sidebar-foreground truncate">Trip Ledge</h1>
            <p className="text-[10px] text-sidebar-foreground/60">Admin Console</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${isActive
                  ? "bg-primary text-primary-foreground font-semibold shadow-md gradient-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
              >
                <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-primary-foreground" : "text-sidebar-foreground/40"}`} />
                <span className="sidebar-text truncate">{item.name}</span>
                {item.badge && (
                  <span className="sidebar-text ml-auto bg-destructive text-destructive-foreground text-[10px] h-5 min-w-[1.25rem] px-1 rounded-full flex items-center justify-center font-bold">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-2 border-t border-sidebar-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-destructive hover:text-destructive-foreground transition-all duration-200 w-full text-left font-medium group"
          >
            <LogOut className="h-4 w-4 flex-shrink-0 opacity-60 group-hover:opacity-100" />
            <span className="sidebar-text">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
