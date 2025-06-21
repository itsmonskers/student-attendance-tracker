import { useAuth } from "@/hooks/use-auth";
import Dashboard from "@/pages/dashboard";
import StudentDashboard from "@/pages/student-dashboard";
import { Loader2 } from "lucide-react";

export default function RoleBasedDashboard() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  // Show student dashboard for students, teacher dashboard for teachers and admins
  if (user?.role === "student") {
    return <StudentDashboard />;
  }

  // Default to teacher dashboard for teachers and admins
  return <Dashboard />;
}