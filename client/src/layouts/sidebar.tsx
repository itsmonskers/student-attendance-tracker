import { Link } from "wouter";
import {
  BarChart3,
  BookOpen,
  CheckSquare,
  Settings,
  UserSquare2,
  LayoutDashboard,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const teacherNavItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/students", icon: UserSquare2, label: "Students" },
  { href: "/attendance", icon: CheckSquare, label: "Attendance" },
  { href: "/reports", icon: BarChart3, label: "Reports" },
  { href: "/classes", icon: BookOpen, label: "Classes" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

const studentNavItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "My Dashboard" },
  { href: "/attendance", icon: CheckSquare, label: "My Attendance" },
  { href: "/classes", icon: BookOpen, label: "My Classes" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

interface SidebarProps {
  isOpen: boolean;
  currentPath: string;
}

export default function Sidebar({ isOpen, currentPath }: SidebarProps) {
  // Normalize currentPath
  const normalizedPath = currentPath === "/" ? "/dashboard" : currentPath;
  const { logoutMutation, user } = useAuth();
  const { toast } = useToast();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        toast({
          title: "Logged out successfully",
          description: "You have been logged out of the system",
        });
      },
      onError: (error) => {
        toast({
          title: "Logout failed",
          description: error.message || "Failed to log out",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <aside 
      className={cn(
        "bg-white w-64 shadow-md transition-all duration-300 overflow-y-auto flex flex-col h-full",
        isOpen 
          ? "block absolute inset-y-0 left-0 z-40 lg:relative lg:block" 
          : "hidden lg:block"
      )}
    >
      {user && (
        <div className="p-4 border-b">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-primary-light flex items-center justify-center text-white font-semibold text-sm">
              {user.fullName 
                ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
                : user.username.substring(0, 2).toUpperCase()}
            </div>
            <div className="ml-3">
              <p className="font-medium">{user.fullName || user.username}</p>
              <p className="text-xs text-neutral-500">{user.role === "student" ? "Student" : "Teacher"}</p>
            </div>
          </div>
        </div>
      )}
      
      <nav className="mt-5 px-2 flex-grow">
        {(user?.role === "student" ? studentNavItems : teacherNavItems).map((item) => (
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
      
      <div className="p-4 border-t mt-auto">
        <Button 
          variant="ghost" 
          className="w-full text-left flex items-center text-destructive hover:text-destructive hover:bg-red-50"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="mr-3 h-5 w-5" />
          {logoutMutation.isPending ? "Logging out..." : "Logout"}
        </Button>
      </div>
    </aside>
  );
}
