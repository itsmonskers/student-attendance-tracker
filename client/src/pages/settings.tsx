import { useState } from "react";
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
  Mail, 
  Smartphone, 
  Users, 
  Database, 
  Shield, 
  Clock 
} from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");
  
  // General settings
  const [schoolName, setSchoolName] = useState("My School");
  const [adminEmail, setAdminEmail] = useState("admin@example.com");
  const [timeZone, setTimeZone] = useState("UTC");
  const [dateFormat, setDateFormat] = useState("yyyy-MM-dd");
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [absenceAlert, setAbsenceAlert] = useState(true);
  const [dailySummary, setDailySummary] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState(true);

  // Attendance settings
  const [markLateAfter, setMarkLateAfter] = useState("15");
  const [autoMarkAbsent, setAutoMarkAbsent] = useState(true);
  const [requireNotes, setRequireNotes] = useState(false);
  const [allowExcused, setAllowExcused] = useState(true);

  // Save settings
  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your settings have been saved successfully.",
    });
  };

  return (
    <section>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-medium text-neutral-500">Settings</h2>
          <Button 
            onClick={handleSaveSettings}
            className="bg-primary hover:bg-primary-dark text-white"
          >
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="users">Users & Permissions</TabsTrigger>
            <TabsTrigger value="backup">Backup & Export</TabsTrigger>
          </TabsList>
          
          {/* General Settings */}
          <TabsContent value="general">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure basic information and system settings
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
                  <Label htmlFor="admin-email">Administrator Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="time-zone">Time Zone</Label>
                    <Select value={timeZone} onValueChange={setTimeZone}>
                      <SelectTrigger id="time-zone">
                        <SelectValue placeholder="Select time zone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC (Coordinated Universal Time)</SelectItem>
                        <SelectItem value="EST">EST (Eastern Standard Time)</SelectItem>
                        <SelectItem value="CST">CST (Central Standard Time)</SelectItem>
                        <SelectItem value="PST">PST (Pacific Standard Time)</SelectItem>
                        <SelectItem value="IST">IST (Indian Standard Time)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date-format">Date Format</Label>
                    <Select value={dateFormat} onValueChange={setDateFormat}>
                      <SelectTrigger id="date-format">
                        <SelectValue placeholder="Select date format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yyyy-MM-dd">YYYY-MM-DD</SelectItem>
                        <SelectItem value="MM/dd/yyyy">MM/DD/YYYY</SelectItem>
                        <SelectItem value="dd/MM/yyyy">DD/MM/YYYY</SelectItem>
                        <SelectItem value="MMMM d, yyyy">Month D, YYYY</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSaveSettings}>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure how and when to receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="rounded-full bg-primary-light bg-opacity-20 p-2">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-700">Email Notifications</p>
                      <p className="text-sm text-neutral-500">Receive system notifications via email</p>
                    </div>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="rounded-full bg-destructive bg-opacity-20 p-2">
                      <Bell className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-700">Absence Alerts</p>
                      <p className="text-sm text-neutral-500">Get notified when students are absent</p>
                    </div>
                  </div>
                  <Switch
                    checked={absenceAlert}
                    onCheckedChange={setAbsenceAlert}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="rounded-full bg-success bg-opacity-20 p-2">
                      <Clock className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-700">Daily Summary</p>
                      <p className="text-sm text-neutral-500">Receive daily attendance summaries</p>
                    </div>
                  </div>
                  <Switch
                    checked={dailySummary}
                    onCheckedChange={setDailySummary}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="rounded-full bg-warning bg-opacity-20 p-2">
                      <Smartphone className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-700">Weekly Reports</p>
                      <p className="text-sm text-neutral-500">Get weekly attendance reports</p>
                    </div>
                  </div>
                  <Switch
                    checked={weeklyReport}
                    onCheckedChange={setWeeklyReport}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSaveSettings}>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Attendance Settings */}
          <TabsContent value="attendance">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Attendance Settings</CardTitle>
                <CardDescription>
                  Configure how attendance is tracked and recorded
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mark-late">Mark Students Late After (minutes)</Label>
                  <Input
                    id="mark-late"
                    type="number"
                    min="0"
                    max="60"
                    value={markLateAfter}
                    onChange={(e) => setMarkLateAfter(e.target.value)}
                  />
                  <p className="text-sm text-neutral-500">
                    Students arriving after this many minutes will be marked late
                  </p>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-neutral-700">Auto-Mark Absent</p>
                    <p className="text-sm text-neutral-500">
                      Automatically mark students absent if not present
                    </p>
                  </div>
                  <Switch
                    checked={autoMarkAbsent}
                    onCheckedChange={setAutoMarkAbsent}
                  />
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-neutral-700">Require Notes for Absences</p>
                    <p className="text-sm text-neutral-500">
                      Make notes mandatory when marking a student absent
                    </p>
                  </div>
                  <Switch
                    checked={requireNotes}
                    onCheckedChange={setRequireNotes}
                  />
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-neutral-700">Allow Excused Absences</p>
                    <p className="text-sm text-neutral-500">
                      Enable the "excused" attendance status option
                    </p>
                  </div>
                  <Switch
                    checked={allowExcused}
                    onCheckedChange={setAllowExcused}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSaveSettings}>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Users & Permissions */}
          <TabsContent value="users">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Users & Permissions</CardTitle>
                <CardDescription>
                  Manage access control and user permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-neutral-200 p-6 flex items-center justify-center">
                  <div className="text-center">
                    <Users className="mx-auto h-12 w-12 text-neutral-400" />
                    <h3 className="mt-2 text-lg font-medium">User Management</h3>
                    <p className="mt-1 text-sm text-neutral-500">
                      User management functionality will be available in a future update.
                    </p>
                    <Button className="mt-4" variant="outline" disabled>
                      Manage Users
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Backup & Export */}
          <TabsContent value="backup">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Data Backup</CardTitle>
                  <CardDescription>
                    Create backups of your attendance data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center py-6 text-center">
                    <Database className="h-12 w-12 text-primary mb-4" />
                    <p className="text-sm text-neutral-500 mb-4">
                      Create a backup of all your attendance and student data
                    </p>
                    <Button>Create Backup</Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Export Data</CardTitle>
                  <CardDescription>
                    Export your data in various formats
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-md border border-neutral-200 p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium">Students Data</p>
                      <p className="text-sm text-neutral-500">Export all student records</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">CSV</Button>
                      <Button size="sm" variant="outline">PDF</Button>
                    </div>
                  </div>
                  
                  <div className="rounded-md border border-neutral-200 p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium">Attendance Records</p>
                      <p className="text-sm text-neutral-500">Export all attendance data</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">CSV</Button>
                      <Button size="sm" variant="outline">PDF</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
