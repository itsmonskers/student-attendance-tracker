import { formatDate, formatTime } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  UserPlus,
  ClipboardCheck,
  AlertTriangle,
  FileText,
  Clock,
  Edit
} from "lucide-react";

interface Activity {
  id: number;
  message: string;
  type: string;
  timestamp: string;
}

interface RecentActivityProps {
  activities: Activity[];
  isLoading: boolean;
}

export default function RecentActivity({ activities, isLoading }: RecentActivityProps) {
  // Helper function to get icon based on activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "student":
        return (
          <div className="rounded-full bg-primary-light bg-opacity-20 p-2 mr-3">
            <UserPlus className="h-4 w-4 text-primary" />
          </div>
        );
      case "attendance":
        return (
          <div className="rounded-full bg-success bg-opacity-20 p-2 mr-3">
            <ClipboardCheck className="h-4 w-4 text-success" />
          </div>
        );
      case "report":
        return (
          <div className="rounded-full bg-warning bg-opacity-20 p-2 mr-3">
            <FileText className="h-4 w-4 text-warning" />
          </div>
        );
      case "alert":
        return (
          <div className="rounded-full bg-destructive bg-opacity-20 p-2 mr-3">
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </div>
        );
      default:
        return (
          <div className="rounded-full bg-neutral-200 p-2 mr-3">
            <Edit className="h-4 w-4 text-neutral-500" />
          </div>
        );
    }
  };

  // Format timestamp function
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return `Today, ${formatTime(date.toTimeString().split(" ")[0].slice(0, 5))}`;
    } else if (diffInDays === 1) {
      return `Yesterday, ${formatTime(date.toTimeString().split(" ")[0].slice(0, 5))}`;
    } else {
      return formatDate(date, "MMM dd") + ", " + formatTime(date.toTimeString().split(" ")[0].slice(0, 5));
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <h3 className="text-lg font-medium text-neutral-500">Recent Activity</h3>
        <a href="/reports" className="text-primary text-sm hover:underline">View All</a>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="flex items-center">
              <Clock className="animate-spin h-4 w-4 mr-2 text-primary" />
              <span className="text-neutral-500">Loading activities...</span>
            </div>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-6 text-neutral-500">
            <p>No recent activities</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start">
                {getActivityIcon(activity.type)}
                <div>
                  <p className="text-sm text-neutral-500">
                    {activity.message}
                  </p>
                  <p className="text-xs text-neutral-400">{formatTimestamp(activity.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {!isLoading && activities.length === 0 && (
          <div className="border-t mt-4 pt-4">
            <p className="text-xs text-neutral-500 text-center">
              Activities will appear here as you use the system
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
