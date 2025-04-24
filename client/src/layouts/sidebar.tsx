import { Link } from "wouter";
import {
  BarChart3,
  BookOpen,
  CheckSquare,
  Settings,
  UserSquare2,
  LayoutDashboard
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/students", icon: UserSquare2, label: "Students" },
  { href: "/attendance", icon: CheckSquare, label: "Attendance" },
  { href: "/reports", icon: BarChart3, label: "Reports" },
  { href: "/classes", icon: BookOpen, label: "Classes" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

interface SidebarProps {
  isOpen: boolean;
  currentPath: string;
}

export default function Sidebar({ isOpen, currentPath }: SidebarProps) {
  // Normalize currentPath
  const normalizedPath = currentPath === "/" ? "/dashboard" : currentPath;

  return (
    <aside 
      className={cn(
        "bg-white w-64 shadow-md transition-all duration-300 overflow-y-auto",
        isOpen 
          ? "block absolute inset-y-0 left-0 z-40 lg:relative lg:block" 
          : "hidden lg:block"
      )}
    >
      <nav className="mt-5 px-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group flex items-center px-2 py-2 text-base font-medium rounded-md mb-1",
              normalizedPath === item.href
                ? "bg-primary-light text-white"
                : "text-neutral-500 hover:bg-primary-light hover:text-white"
            )}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
