import { useQuery } from "@tanstack/react-query";
import { UserSquare2, CheckSquare, Clock, XCircle } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import RecentActivity from "@/components/recent-activity";
import AttendanceChart from "@/components/attendance-chart";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ["/api/activities?limit=4"],
  });

  // Get weekly attendance data for the chart
  const { data: attendanceData, isLoading: attendanceLoading } = useQuery({
    queryKey: ["/api/reports/attendance"],
    queryFn: async () => {
      const today = new Date();
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(today.getDate() - 5);
      
      const startDate = fiveDaysAgo.toISOString().split('T')[0];
      const endDate = today.toISOString().split('T')[0];
      
      const res = await fetch(`/api/reports/attendance?startDate=${startDate}&endDate=${endDate}`);
      if (!res.ok) throw new Error("Failed to fetch attendance report");
      return res.json();
    },
  });

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-medium text-neutral-500 mb-4">Dashboard</h2>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Students"
            value={statsLoading ? "..." : stats?.totalStudents || 0}
            icon={<UserSquare2 className="text-primary text-xl" />}
            iconClassName="bg-primary-light"
          />
          
          <StatCard
            title="Present Today"
            value={statsLoading ? "..." : stats?.presentToday || 0}
            icon={<CheckSquare className="text-success text-xl" />}
            iconClassName="bg-success"
          />
          
          <StatCard
            title="Absent Today"
            value={statsLoading ? "..." : stats?.absentToday || 0}
            icon={<XCircle className="text-destructive text-xl" />}
            iconClassName="bg-destructive"
          />
          
          <StatCard
            title="Late Today"
            value={statsLoading ? "..." : stats?.lateToday || 0}
            icon={<Clock className="text-warning text-xl" />}
            iconClassName="bg-warning"
          />
        </div>
        
        {/* Recent Activity and Attendance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivity activities={activitiesLoading ? [] : activities || []} isLoading={activitiesLoading} />
          <AttendanceChart data={attendanceLoading ? [] : attendanceData || []} isLoading={attendanceLoading} />
        </div>
      </div>
    </section>
  );
}
