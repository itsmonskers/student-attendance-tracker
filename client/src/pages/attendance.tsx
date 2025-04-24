import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/data-table";
import { AvatarWithText } from "@/components/ui/avatar-with-text";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { getStatusClass, formatDate, getCurrentDate } from "@/lib/utils";
import { Save, Download, Printer, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Attendance() {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const [viewType, setViewType] = useState("daily");
  const [searchQuery, setSearchQuery] = useState("");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Fetch classes
  const { data: classes, isLoading: classesLoading } = useQuery({
    queryKey: ["/api/classes"],
  });
  
  // Fetch attendance data based on filters
  const { data: attendanceData, isLoading: attendanceLoading } = useQuery({
    queryKey: ["/api/attendance", { date: selectedDate, className: selectedClass }],
    queryFn: async () => {
      const url = `/api/attendance?date=${selectedDate}${selectedClass ? `&className=${selectedClass}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch attendance data");
      return res.json();
    },
    enabled: !!selectedDate, // Only fetch when date is selected
  });
  
  // Fetch students in the selected class who don't have attendance records for the selected date
  const { data: studentsInClass, isLoading: studentsLoading } = useQuery({
    queryKey: ["/api/students"],
    select: (students) => {
      if (!selectedClass) return [];
      
      // Filter students by class
      const filteredStudents = students.filter(
        (student) => student.className === selectedClass
      );
      
      // If no attendance data yet, return all students in the class
      if (!attendanceData || attendanceData.length === 0) {
        return filteredStudents;
      }
      
      // Filter out students who already have attendance records
      const studentIdsWithAttendance = new Set(
        attendanceData.map((record) => record.student.id)
      );
      
      return filteredStudents.filter(
        (student) => !studentIdsWithAttendance.has(student.id)
      );
    },
    enabled: !!selectedClass,
  });
  
  // Mutation to create or update attendance record
  const attendanceMutation = useMutation({
    mutationFn: async ({ 
      id, 
      studentId, 
      status, 
      notes, 
      time = getCurrentDate() 
    }: { 
      id?: number; 
      studentId: number; 
      status: string; 
      notes?: string; 
      time?: string; 
    }) => {
      if (id) {
        // Update existing record
        return apiRequest("PUT", `/api/attendance/${id}`, { status, notes });
      } else {
        // Create new record
        return apiRequest("POST", "/api/attendance", {
          studentId,
          date: selectedDate,
          status,
          time,
          notes,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/attendance", { date: selectedDate, className: selectedClass }] 
      });
      toast({
        title: "Attendance Updated",
        description: "The attendance record has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update attendance: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    },
  });
  
  // Combine attendance data with missing students
  const completeAttendanceData = [
    ...(attendanceData || []),
    ...(studentsInClass || []).map((student) => ({
      id: undefined, // No attendance record ID yet
      student,
      status: "absent", // Default status
      time: "",
      notes: "",
      date: selectedDate,
    })),
  ];
  
  // Filter by search query
  const filteredData = completeAttendanceData.filter((record) => {
    if (!searchQuery) return true;
    
    const student = "student" in record ? record.student : record;
    const searchString = `${student.firstName} ${student.lastName} ${student.studentId}`.toLowerCase();
    return searchString.includes(searchQuery.toLowerCase());
  });
  
  // Handle status change
  const handleStatusChange = (
    record: any,
    newStatus: string,
    notes?: string
  ) => {
    const student = "student" in record ? record.student : record;
    
    attendanceMutation.mutate({
      id: record.id,
      studentId: student.id,
      status: newStatus,
      notes: notes || record.notes,
    });
  };
  
  // Handle notes change
  const handleNotesChange = (record: any, notes: string) => {
    if (record.id) {
      attendanceMutation.mutate({
        id: record.id,
        studentId: record.student.id,
        status: record.status,
        notes,
      });
    }
  };
  
  // Export attendance data as CSV
  const exportAsCSV = () => {
    if (!attendanceData || attendanceData.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no attendance records to export.",
        variant: "destructive",
      });
      return;
    }
    
    const headers = [
      "Student ID",
      "Name",
      "Class",
      "Date",
      "Status",
      "Time",
      "Notes",
    ];
    
    const rows = attendanceData.map((record) => [
      record.student.studentId,
      `${record.student.firstName} ${record.student.lastName}`,
      record.student.className,
      record.date,
      record.status,
      record.time || "--:-- --",
      record.notes || "",
    ]);
    
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((row) => row.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <section>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-medium text-neutral-500">Attendance Tracking</h2>
          <div className="flex space-x-2">
            <Button 
              className="bg-success hover:bg-green-600 text-white"
              onClick={exportAsCSV}
            >
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
            <Button className="bg-primary hover:bg-primary-dark text-white">
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
          </div>
        </div>
        
        {/* Filters */}
        <Card className="mb-4 shadow-sm">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="class" className="block text-sm font-medium text-neutral-500 mb-1">
                  Class
                </Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger id="class">
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classesLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading...
                      </SelectItem>
                    ) : (
                      classes?.map((cls: any) => (
                        <SelectItem key={cls.id} value={cls.name}>
                          {cls.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date" className="block text-sm font-medium text-neutral-500 mb-1">
                  Date
                </Label>
                <Input
                  type="date"
                  id="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="view" className="block text-sm font-medium text-neutral-500 mb-1">
                  View
                </Label>
                <Select value={viewType} onValueChange={setViewType}>
                  <SelectTrigger id="view">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="search" className="block text-sm font-medium text-neutral-500 mb-1">
                  Search
                </Label>
                <div className="relative">
                  <Input
                    id="search"
                    type="text"
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-neutral-400" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Attendance Table */}
        <DataTable
          data={filteredData}
          columns={[
            {
              header: "ID",
              accessorKey: "studentId",
              cell: (row) => {
                const student = "student" in row ? row.student : row;
                return <span>{student.studentId}</span>;
              },
            },
            {
              header: "Student Name",
              accessorKey: "name",
              cell: (row) => {
                const student = "student" in row ? row.student : row;
                return (
                  <AvatarWithText
                    firstName={student.firstName}
                    lastName={student.lastName}
                    subtitle={student.className}
                  />
                );
              },
            },
            {
              header: "Status",
              accessorKey: "status",
              cell: (row) => (
                <span className={getStatusClass(row.status || "absent")}>
                  {row.status ? row.status.charAt(0).toUpperCase() + row.status.slice(1) : "Absent"}
                </span>
              ),
            },
            {
              header: "Time",
              accessorKey: "time",
              cell: (row) => <span>{row.time || "--:-- --"}</span>,
            },
            {
              header: "Notes",
              accessorKey: "notes",
              cell: (row) => (
                <Input
                  type="text"
                  placeholder="Add note..."
                  value={row.notes || ""}
                  onChange={(e) => {
                    // Update notes in memory
                    row.notes = e.target.value;
                  }}
                  onBlur={(e) => handleNotesChange(row, e.target.value)}
                  className="border border-neutral-200 rounded-md px-3 py-1 text-sm"
                />
              ),
            },
            {
              header: "Actions",
              accessorKey: "actions",
              cell: (row) => {
                const student = "student" in row ? row.student : row;
                return (
                  <div className="flex space-x-3">
                    <Select
                      value={row.status || "absent"}
                      onValueChange={(value) => handleStatusChange(row, value)}
                    >
                      <SelectTrigger className="border border-neutral-200 rounded-md px-3 py-1 text-sm bg-white h-8 w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="present">Present</SelectItem>
                        <SelectItem value="late">Late</SelectItem>
                        <SelectItem value="absent">Absent</SelectItem>
                        <SelectItem value="excused">Excused</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-primary hover:text-primary-dark"
                      onClick={() => {
                        const status = row.status || "absent";
                        const notes = row.notes || "";
                        handleStatusChange(row, status, notes);
                      }}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                );
              },
            },
          ]}
          searchable={false}
          pagination
          pageSize={10}
        />
      </div>
    </section>
  );
}
