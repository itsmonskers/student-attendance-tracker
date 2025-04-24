import { useState, useEffect, ReactNode } from "react";
import Header from "@/layouts/header";
import Sidebar from "@/layouts/sidebar";
import { useLocation } from "wouter";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [location] = useLocation();
  
  // Close sidebar on mobile when location changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);
  
  // Get page title based on current route
  const getPageTitle = () => {
    const path = location === "/" ? "/dashboard" : location;
    const title = path.substring(1).charAt(0).toUpperCase() + path.substring(2);
    return title || "Dashboard";
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header 
        title="Student Attendance System" 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        user={{ name: "Admin User" }}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} currentPath={location} />
        <main className="flex-1 overflow-y-auto bg-neutral-100 p-4">
          {children}
        </main>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden bg-white shadow-md border-t border-neutral-200">
        <div className="flex justify-around">
          <a 
            href="/dashboard" 
            className={`flex flex-col items-center py-2 px-3 ${location === "/" || location === "/dashboard" ? "text-primary" : "text-neutral-400 hover:text-primary"}`}
          >
            <i className="fas fa-tachometer-alt text-lg"></i>
            <span className="text-xs mt-1">Dashboard</span>
          </a>
          <a 
            href="/students" 
            className={`flex flex-col items-center py-2 px-3 ${location === "/students" ? "text-primary" : "text-neutral-400 hover:text-primary"}`}
          >
            <i className="fas fa-user-graduate text-lg"></i>
            <span className="text-xs mt-1">Students</span>
          </a>
          <a 
            href="/attendance" 
            className={`flex flex-col items-center py-2 px-3 ${location === "/attendance" ? "text-primary" : "text-neutral-400 hover:text-primary"}`}
          >
            <i className="fas fa-clipboard-check text-lg"></i>
            <span className="text-xs mt-1">Attendance</span>
          </a>
          <a 
            href="/reports" 
            className={`flex flex-col items-center py-2 px-3 ${location === "/reports" ? "text-primary" : "text-neutral-400 hover:text-primary"}`}
          >
            <i className="fas fa-chart-bar text-lg"></i>
            <span className="text-xs mt-1">Reports</span>
          </a>
          <a 
            href="/settings" 
            className={`flex flex-col items-center py-2 px-3 ${location === "/settings" ? "text-primary" : "text-neutral-400 hover:text-primary"}`}
          >
            <i className="fas fa-cog text-lg"></i>
            <span className="text-xs mt-1">Settings</span>
          </a>
        </div>
      </div>
    </div>
  );
}
