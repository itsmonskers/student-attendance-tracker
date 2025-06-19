import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Clock, User, BookOpen, FileText, Activity } from "lucide-react";
import { formatDate, calculateAttendancePercentage } from "@/lib/utils";

interface StudentAttendance {
  id: number;
  date: string;
  status: string;
  time: string | null;
  notes: string | null;
}

interface StudentProfile {
  id: number;
  username: string;
  fullName: string;
  email: string | null;
  studentId: string | null;
  className: string | null;
}

interface StudentAnnouncement {
  id: number;
  message: string;
  type: string;
  timestamp: string;
}

export default function StudentDashboard() {
  const { data: profile, isLoading: profileLoading } = useQuery<StudentProfile>({
    queryKey: ["/api/my-profile"],
  });

  const { data: attendance = [], isLoading: attendanceLoading } = useQuery<StudentAttendance[]>({
    queryKey: ["/api/my-attendance"],
  });

  const { data: announcements = [], isLoading: announcementsLoading } = useQuery<StudentAnnouncement[]>({
    queryKey: ["/api/activities"],
  });

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const recentAttendance = attendance.slice(-7); // Last 7 days
  const attendancePercentage = calculateAttendancePercentage(
    attendance.filter(a => a.status === "present").length,
    attendance.length
  );

  const getStatusBadge = (status: string) => {
    const variants = {
      present: "default",
      absent: "destructive",
      late: "secondary",
      excused: "outline"
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground">
          <User className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Welcome, {profile?.fullName}</h1>
          <p className="text-muted-foreground">
            Student ID: {profile?.studentId} • Class: {profile?.className}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Personal Profile Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Profile</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium">Full Name</p>
                <p className="text-sm text-muted-foreground">{profile?.fullName}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Username</p>
                <p className="text-sm text-muted-foreground">{profile?.username}</p>
              </div>
              {profile?.email && (
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Attendance Overview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendancePercentage}%</div>
            <p className="text-xs text-muted-foreground">
              {attendance.filter(a => a.status === "present").length} of {attendance.length} days present
            </p>
          </CardContent>
        </Card>

        {/* Class Information */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Class</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.className || "Not Assigned"}</div>
            <p className="text-xs text-muted-foreground">Current class enrollment</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Attendance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Attendance
            </CardTitle>
            <CardDescription>Your attendance for the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {attendanceLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : recentAttendance.length > 0 ? (
              <div className="space-y-3">
                {recentAttendance.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{formatDate(record.date)}</p>
                      {record.time && (
                        <p className="text-sm text-muted-foreground">Time: {record.time}</p>
                      )}
                      {record.notes && (
                        <p className="text-sm text-muted-foreground">Note: {record.notes}</p>
                      )}
                    </div>
                    {getStatusBadge(record.status)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No attendance records found</p>
            )}
          </CardContent>
        </Card>

        {/* Announcements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest announcements and updates</CardDescription>
          </CardHeader>
          <CardContent>
            {announcementsLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : announcements.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {announcements.slice(0, 10).map((announcement) => (
                  <div key={announcement.id} className="p-3 border rounded-lg">
                    <p className="text-sm">{announcement.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(announcement.timestamp)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No announcements available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}