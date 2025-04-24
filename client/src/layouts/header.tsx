import { useState, useRef, useEffect } from "react";
import { Bell, ChevronDown, Menu, LogOut, Settings as SettingsIcon, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface HeaderProps {
  title: string;
  toggleSidebar: () => void;
}

export default function Header({ title, toggleSidebar }: HeaderProps) {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

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
    <header className="bg-primary text-white shadow-md z-10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar}
              className="lg:hidden text-white hover:bg-primary-dark hover:text-white"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
            <h1 className="text-xl font-medium">{title}</h1>
          </div>
          {user && (
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-primary-dark hover:text-white relative"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-destructive text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    3
                  </span>
                </Button>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2 text-white hover:bg-primary-dark hover:text-white"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary-dark flex items-center justify-center">
                      {user.fullName 
                        ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
                        : user.username.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="hidden md:inline">{user.fullName || user.username}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="cursor-pointer flex items-center gap-2"
                    onClick={() => setLocation("/settings")}
                  >
                    <SettingsIcon className="h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer text-destructive flex items-center gap-2"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{logoutMutation.isPending ? "Logging out..." : "Logout"}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
