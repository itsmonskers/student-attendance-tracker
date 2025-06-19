import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Bell, 
  Save, 
  User,
  Lock,
  Clock,
  Shield,
  Users,
  Database
} from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Determine available tabs based on user role
  const getAvailableTabs = () => {
    if (user?.role === "student") {
      return ["profile", "notifications"];
    } else if (user?.role === "teacher") {
      return ["profile", "notifications", "attendance"];
    } else if (user?.role === "admin") {
      return ["profile", "notifications", "attendance", "users", "system"];
    }
    return ["profile"];
  };

  const availableTabs = getAvailableTabs();
  const [activeTab, setActiveTab] = useState(availableTabs[0] || "profile");
  
  // Profile settings
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Notification settings
  const [teacherAnnouncements, setTeacherAnnouncements] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [absenceAlert, setAbsenceAlert] = useState(true);
  const [dailySummary, setDailySummary] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState(true);

  // Admin/Teacher settings
  const [schoolName, setSchoolName] = useState("My School");
  const [timeZone, setTimeZone] = useState("UTC");
  const [markLateAfter, setMarkLateAfter] = useState("15");
  const [autoMarkAbsent, setAutoMarkAbsent] = useState(true);
  const [requireNotes, setRequireNotes] = useState(false);
  const [allowExcused, setAllowExcused] = useState(true);

  const handleSaveSettings = () => {
    // Handle password change
    if (newPassword && newPassword !== confirmPassword) {
      toast({
        title: "Password Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Settings Saved",
      description: "Your settings have been updated successfully.",
    });
    
    // Clear password fields
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Settings</h1>
        <Button onClick={handleSaveSettings} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          {availableTabs.includes("profile") && (
            <TabsTrigger value="profile">Profile</TabsTrigger>
          )}
          {availableTabs.includes("notifications") && (
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          )}
          {availableTabs.includes("attendance") && (
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
          )}
          {availableTabs.includes("users") && (
            <TabsTrigger value="users">User Management</TabsTrigger>
          )}
          {availableTabs.includes("system") && (
            <TabsTrigger value="system">System</TabsTrigger>
          )}
        </TabsList>
        
        {/* Profile Settings */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Settings
              </CardTitle>
              <CardDescription>
                Manage your personal account settings and password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Username</Label>
                <Input value={user?.username || ""} disabled />
              </div>
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={user?.fullName || ""} disabled />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input value={user?.role === "student" ? "Student" : user?.role === "teacher" ? "Teacher" : "Administrator"} disabled />
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Change Password
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                {user?.role === "student" 
                  ? "Manage how you receive announcements and updates from teachers"
                  : "Configure notification preferences for the system"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {user?.role === "student" ? (
                // Student notifications - limited to teacher announcements
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Teacher Announcements</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications when teachers post announcements
                      </p>
                    </div>
                    <Switch
                      checked={teacherAnnouncements}
                      onCheckedChange={setTeacherAnnouncements}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive email updates about your attendance and announcements
                      </p>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                </div>
              ) : (
                // Teacher/Admin notifications - full options
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive email updates about system activities
                      </p>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Absence Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when students are absent
                      </p>
                    </div>
                    <Switch
                      checked={absenceAlert}
                      onCheckedChange={setAbsenceAlert}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Daily Summary</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive daily attendance summaries
                      </p>
                    </div>
                    <Switch
                      checked={dailySummary}
                      onCheckedChange={setDailySummary}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Weekly Reports</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive weekly attendance reports
                      </p>
                    </div>
                    <Switch
                      checked={weeklyReport}
                      onCheckedChange={setWeeklyReport}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance Settings - Teachers and Admins only */}
        {(user?.role === "teacher" || user?.role === "admin") && (
          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Attendance Settings
                </CardTitle>
                <CardDescription>
                  Configure how attendance tracking works in your system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="late-minutes">Mark as late after (minutes)</Label>
                  <Input
                    id="late-minutes"
                    type="number"
                    value={markLateAfter}
                    onChange={(e) => setMarkLateAfter(e.target.value)}
                    min="1"
                    max="60"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-mark as absent</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically mark students as absent if not marked present
                    </p>
                  </div>
                  <Switch
                    checked={autoMarkAbsent}
                    onCheckedChange={setAutoMarkAbsent}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require notes for absences</Label>
                    <p className="text-sm text-muted-foreground">
                      Require teachers to add notes when marking students absent
                    </p>
                  </div>
                  <Switch
                    checked={requireNotes}
                    onCheckedChange={setRequireNotes}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow excused absences</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable the "excused" status for absences
                    </p>
                  </div>
                  <Switch
                    checked={allowExcused}
                    onCheckedChange={setAllowExcused}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* User Management - Admins only */}
        {user?.role === "admin" && (
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Management
                </CardTitle>
                <CardDescription>
                  Manage users, roles, and permissions across the system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  As an administrator, you have full control over all users in the system. 
                  You can manage students and teachers through their respective pages.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="justify-start h-auto p-4">
                    <div className="text-left">
                      <p className="font-medium">Manage Students</p>
                      <p className="text-sm text-muted-foreground">Add, edit, or remove student accounts</p>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start h-auto p-4">
                    <div className="text-left">
                      <p className="font-medium">Manage Teachers</p>
                      <p className="text-sm text-muted-foreground">Add, edit, or remove teacher accounts</p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* System Settings - Admins only */}
        {user?.role === "admin" && (
          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  System Settings
                </CardTitle>
                <CardDescription>
                  Configure system-wide settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="school-name">School Name</Label>
                  <Input
                    id="school-name"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Default Time Zone</Label>
                  <Select value={timeZone} onValueChange={setTimeZone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}