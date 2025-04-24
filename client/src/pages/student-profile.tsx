import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Student } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  UserSquare2, 
  Mail, 
  Phone, 
  Map, 
  Calendar, 
  Clock, 
  AlertCircle,
  Pencil, 
  Trash,
  ArrowLeft
} from "lucide-react";
import StudentForm from "@/components/student-form";

export default function StudentProfile() {
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const studentId = parseInt(params.id);
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Fetch student details
  const { data: student, isLoading } = useQuery<Student>({
    queryKey: ["/api/students", studentId],
    queryFn: async () => {
      const res = await fetch(`/api/students/${studentId}`);
      if (!res.ok) {
        if (res.status === 404) {
          setLocation('/students');
          throw new Error("Student not found");
        }
        throw new Error("Failed to fetch student");
      }
      return res.json();
    },
  });
  
  // Fetch student's attendance records
  const { data: attendance, isLoading: attendanceLoading } = useQuery({
    queryKey: ["/api/attendance", { studentId }],
    queryFn: async () => {
      const res = await fetch(`/api/attendance?studentId=${studentId}`);
      if (!res.ok) throw new Error("Failed to fetch attendance records");
      return res.json();
    },
    enabled: !!studentId,
  });
  
  // Delete student mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", `/api/students/${studentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      toast({
        title: "Student deleted",
        description: "The student has been deleted successfully.",
      });
      setLocation('/students');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete student: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    },
  });
  
  // Handle delete student
  const handleDeleteStudent = () => {
    if (student && confirm(`Are you sure you want to delete ${student.firstName} ${student.lastName}?`)) {
      deleteMutation.mutate();
    }
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading student profile...</div>;
  }
  
  if (!student) {
    return <div className="flex justify-center items-center h-64">Student not found</div>;
  }
  
  return (
    <section>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setLocation('/students')}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-2xl font-medium text-neutral-500">Student Profile</h2>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline"
              onClick={() => setIsEditDialogOpen(true)}
              className="text-secondary"
            >
              <Pencil className="mr-2 h-4 w-4" /> Edit Student
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteStudent}
            >
              <Trash className="mr-2 h-4 w-4" /> Delete Student
            </Button>
          </div>
        </div>
        
        {/* Student Profile Header */}
        <Card className="mb-6 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row">
              <div className="flex justify-center md:justify-start items-center mb-4 md:mb-0 md:mr-6">
                <div className="bg-primary bg-opacity-10 rounded-full h-24 w-24 flex items-center justify-center text-2xl font-semibold text-primary">
                  {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex flex-col md:flex-row justify-between mb-2">
                  <div>
                    <h3 className="text-2xl font-bold mb-1">{student.firstName} {student.lastName}</h3>
                    <div className="flex items-center text-neutral-500 mb-2">
                      <Badge className="bg-primary-light text-primary mr-2">
                        {student.className}
                      </Badge>
                      <span className="text-sm">ID: {student.studentId}</span>
                    </div>
                  </div>
                  <div className="mt-2 md:mt-0">
                    <Badge className={student.active !== false ? "bg-success" : "bg-neutral-400"}>
                      {student.active !== false ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-neutral-400 mr-2" />
                    <span>{student.email || "No email provided"}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-neutral-400 mr-2" />
                    <span>{student.phoneNumber || "No phone provided"}</span>
                  </div>
                  <div className="flex items-center">
                    <Map className="h-4 w-4 text-neutral-400 mr-2" />
                    <span className="truncate">{student.address || "No address provided"}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="attendance">Attendance Records</TabsTrigger>
            <TabsTrigger value="parent-info">Parent Information</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card className="shadow-sm h-full">
                  <CardHeader>
                    <CardTitle>Student Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-neutral-500">Full Name</p>
                          <p className="text-neutral-900">{student.firstName} {student.lastName}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-500">Student ID</p>
                          <p className="text-neutral-900">{student.studentId}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-neutral-500">Class</p>
                          <p className="text-neutral-900">{student.className}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-500">Status</p>
                          <p className="text-neutral-900">
                            {student.active !== false ? "Active" : "Inactive"}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-neutral-500">Email Address</p>
                        <p className="text-neutral-900">{student.email || "No email provided"}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-neutral-500">Phone Number</p>
                        <p className="text-neutral-900">{student.phoneNumber || "No phone provided"}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-neutral-500">Address</p>
                        <p className="text-neutral-900">{student.address || "No address provided"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card className="shadow-sm h-full">
                  <CardHeader>
                    <CardTitle>Recent Attendance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {attendanceLoading ? (
                      <div className="py-8 text-center text-neutral-500">Loading attendance data...</div>
                    ) : !attendance || attendance.length === 0 ? (
                      <div className="py-8 text-center text-neutral-500 space-y-2">
                        <AlertCircle className="h-10 w-10 mx-auto text-neutral-400" />
                        <p>No attendance records found</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {attendance.slice(0, 5).map((record: any) => (
                          <div key={record.id} className="flex justify-between items-center border-b border-neutral-100 pb-2">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 text-neutral-500 mr-2" />
                              <span className="text-sm">{formatDate(record.date)}</span>
                            </div>
                            <Badge className={
                              record.status === 'present' 
                                ? 'bg-success' 
                                : record.status === 'late' 
                                  ? 'bg-warning' 
                                  : 'bg-destructive'
                            }>
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </Badge>
                          </div>
                        ))}
                        
                        <div className="text-center mt-2">
                          <Button 
                            variant="link" 
                            className="text-primary text-sm" 
                            onClick={() => setActiveTab("attendance")}
                          >
                            View all attendance records
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* Attendance Records Tab */}
          <TabsContent value="attendance">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Attendance History</CardTitle>
                <CardDescription>
                  Complete attendance record for {student.firstName} {student.lastName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {attendanceLoading ? (
                  <div className="py-8 text-center text-neutral-500">Loading attendance data...</div>
                ) : !attendance || attendance.length === 0 ? (
                  <div className="py-8 text-center text-neutral-500 space-y-2">
                    <AlertCircle className="h-10 w-10 mx-auto text-neutral-400" />
                    <p>No attendance records found</p>
                  </div>
                ) : (
                  <div className="border rounded-md">
                    <div className="grid grid-cols-4 gap-4 p-4 font-medium border-b">
                      <div>Date</div>
                      <div>Status</div>
                      <div>Time</div>
                      <div>Notes</div>
                    </div>
                    {attendance.map((record: any) => (
                      <div key={record.id} className="grid grid-cols-4 gap-4 p-4 border-b last:border-0">
                        <div className="text-sm">{formatDate(record.date)}</div>
                        <div>
                          <Badge className={
                            record.status === 'present' 
                              ? 'bg-success' 
                              : record.status === 'late' 
                                ? 'bg-warning' 
                                : 'bg-destructive'
                          }>
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="text-sm flex items-center">
                          <Clock className="h-3 w-3 text-neutral-500 mr-1" />
                          {record.time ? formatDate(record.time, 'h:mm a') : 'N/A'}
                        </div>
                        <div className="text-sm text-neutral-500">{record.notes || 'No notes'}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Parent Information Tab */}
          <TabsContent value="parent-info">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Parent/Guardian Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-medium mb-4">Contact Details</h4>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-neutral-500">Parent/Guardian Name</p>
                          <p className="text-neutral-900">{student.parentName || "Not provided"}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-500">Parent/Guardian Phone</p>
                          <p className="text-neutral-900">{student.parentPhone || "Not provided"}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-medium mb-4">Emergency Contact</h4>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-neutral-500">Same as Parent/Guardian</p>
                          <div className="flex items-center mt-1">
                            <div className={`h-3 w-3 rounded-full ${student.parentPhone ? 'bg-success' : 'bg-neutral-300'} mr-2`}></div>
                            <p className="text-sm text-neutral-500">
                              {student.parentPhone 
                                ? "Parent contact information available" 
                                : "No emergency contact available"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-neutral-200">
                    <div className="bg-neutral-50 p-4 rounded-md">
                      <p className="text-sm text-neutral-500">
                        <strong>Note:</strong> To update parent/guardian information, please edit the student profile.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Edit Student Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogTitle>Edit Student</DialogTitle>
          <StudentForm 
            student={student}
            onSubmitSuccess={() => {
              setIsEditDialogOpen(false);
              queryClient.invalidateQueries({ queryKey: ["/api/students"] });
              queryClient.invalidateQueries({ queryKey: ["/api/students", studentId] });
            }}
            onCancel={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </section>
  );
}