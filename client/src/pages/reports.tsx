import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatDate } from "@/lib/utils";
import { Download, Printer } from "lucide-react";

const COLORS = ["#4caf50", "#ff9800", "#f44336"];

export default function Reports() {
  const [dateRange, setDateRange] = useState({
    startDate: (() => {
      const date = new Date();
      date.setDate(date.getDate() - 30);
      return date.toISOString().split('T')[0];
    })(),
    endDate: new Date().toISOString().split('T')[0],
  });
  
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedTab, setSelectedTab] = useState("attendance-by-date");
  
  // Fetch classes
  const { data: classes } = useQuery({
    queryKey: ["/api/classes"],
  });
  
  // Fetch attendance stats based on date range and class
  const { data: attendanceStats, isLoading: statsLoading } = useQuery({
    queryKey: [
      "/api/reports/attendance", 
      { startDate: dateRange.startDate, endDate: dateRange.endDate, className: selectedClass }
    ],
    queryFn: async () => {
      const url = `/api/reports/attendance?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}${
        selectedClass ? `&className=${selectedClass}` : ""
      }`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch attendance statistics");
      return res.json();
    },
    enabled: !!dateRange.startDate && !!dateRange.endDate,
  });
  
  // Fetch all students to calculate overall statistics
  const { data: students } = useQuery({
    queryKey: ["/api/students"],
    select: (data) => {
      // Filter by class if selected
      if (selectedClass) {
        return data.filter((student) => student.className === selectedClass);
      }
      return data;
    },
  });
  
  // Prepare data for charts
  const barChartData = attendanceStats?.map((day) => ({
    date: formatDate(day.date, "MMM dd"),
    Present: day.present,
    Late: day.late,
    Absent: day.absent,
  })) || [];
  
  // Calculate summary statistics
  const summaryStats = {
    totalStudents: students?.length || 0,
    totalDays: attendanceStats?.length || 0,
    averagePresent: 0,
    averageLate: 0,
    averageAbsent: 0,
  };
  
  if (attendanceStats && attendanceStats.length > 0) {
    const totalPresent = attendanceStats.reduce((sum, day) => sum + day.present, 0);
    const totalLate = attendanceStats.reduce((sum, day) => sum + day.late, 0);
    const totalAbsent = attendanceStats.reduce((sum, day) => sum + day.absent, 0);
    
    summaryStats.averagePresent = Math.round(totalPresent / attendanceStats.length);
    summaryStats.averageLate = Math.round(totalLate / attendanceStats.length);
    summaryStats.averageAbsent = Math.round(totalAbsent / attendanceStats.length);
  }
  
  // Pie chart data
  const pieChartData = [
    { name: "Present", value: summaryStats.averagePresent },
    { name: "Late", value: summaryStats.averageLate },
    { name: "Absent", value: summaryStats.averageAbsent },
  ];
  
  // Export report as CSV
  const exportReport = () => {
    if (!attendanceStats || attendanceStats.length === 0) {
      alert("No data to export");
      return;
    }
    
    const headers = ["Date", "Present", "Late", "Absent", "Total"];
    
    const rows = attendanceStats.map((day) => [
      day.date,
      day.present,
      day.late,
      day.absent,
      day.present + day.late + day.absent,
    ]);
    
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((row) => row.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_report_${dateRange.startDate}_to_${dateRange.endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <section>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-medium text-neutral-500">Reports</h2>
          <div className="flex space-x-2">
            <Button
              className="bg-success hover:bg-green-600 text-white"
              onClick={exportReport}
            >
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
            <Button className="bg-primary hover:bg-primary-dark text-white">
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
          </div>
        </div>
        
        {/* Report Filters */}
        <Card className="mb-4 shadow-sm">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="start-date" className="block text-sm font-medium text-neutral-500 mb-1">
                  Start Date
                </Label>
                <Input
                  type="date"
                  id="start-date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                  max={dateRange.endDate}
                />
              </div>
              <div>
                <Label htmlFor="end-date" className="block text-sm font-medium text-neutral-500 mb-1">
                  End Date
                </Label>
                <Input
                  type="date"
                  id="end-date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                  min={dateRange.startDate}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <Label htmlFor="class-filter" className="block text-sm font-medium text-neutral-500 mb-1">
                  Class
                </Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger id="class-filter">
                    <SelectValue placeholder="All Classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Classes</SelectItem>
                    {classes?.map((cls: any) => (
                      <SelectItem key={cls.id} value={cls.name}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Report Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-neutral-400">Total Students</p>
                <p className="text-3xl font-bold text-primary mt-2">
                  {summaryStats.totalStudents}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-neutral-400">Avg. Present</p>
                <p className="text-3xl font-bold text-success mt-2">
                  {statsLoading ? "..." : summaryStats.averagePresent}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-neutral-400">Avg. Late</p>
                <p className="text-3xl font-bold text-warning mt-2">
                  {statsLoading ? "..." : summaryStats.averageLate}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-neutral-400">Avg. Absent</p>
                <p className="text-3xl font-bold text-destructive mt-2">
                  {statsLoading ? "..." : summaryStats.averageAbsent}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Report Charts */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="attendance-by-date">Attendance by Date</TabsTrigger>
            <TabsTrigger value="attendance-summary">Attendance Summary</TabsTrigger>
          </TabsList>
          
          <TabsContent value="attendance-by-date">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Daily Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  {statsLoading ? (
                    <div className="h-full flex items-center justify-center">
                      Loading data...
                    </div>
                  ) : barChartData.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      No data available for the selected date range
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={barChartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          angle={-45} 
                          textAnchor="end" 
                          height={70} 
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Present" stackId="a" fill="#4caf50" />
                        <Bar dataKey="Late" stackId="a" fill="#ff9800" />
                        <Bar dataKey="Absent" stackId="a" fill="#f44336" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="attendance-summary">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Attendance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-[300px]">
                    {statsLoading ? (
                      <div className="h-full flex items-center justify-center">
                        Loading data...
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {pieChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} students`, null]} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="flex items-center">
                          <span className="h-3 w-3 rounded-full bg-success mr-2"></span>
                          Present
                        </p>
                        <p className="font-medium">
                          {statsLoading ? "..." : summaryStats.averagePresent} students
                        </p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="flex items-center">
                          <span className="h-3 w-3 rounded-full bg-warning mr-2"></span>
                          Late
                        </p>
                        <p className="font-medium">
                          {statsLoading ? "..." : summaryStats.averageLate} students
                        </p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="flex items-center">
                          <span className="h-3 w-3 rounded-full bg-destructive mr-2"></span>
                          Absent
                        </p>
                        <p className="font-medium">
                          {statsLoading ? "..." : summaryStats.averageAbsent} students
                        </p>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <p className="text-sm text-neutral-500">
                        Report period: {formatDate(dateRange.startDate, "MMMM dd, yyyy")} to{" "}
                        {formatDate(dateRange.endDate, "MMMM dd, yyyy")}
                      </p>
                      <p className="text-sm text-neutral-500 mt-1">
                        Total days: {summaryStats.totalDays}
                      </p>
                      {selectedClass && (
                        <p className="text-sm text-neutral-500 mt-1">
                          Class: {selectedClass}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
