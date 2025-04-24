import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/data-table";
import { AvatarWithText } from "@/components/ui/avatar-with-text";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus, Trash, Pencil, Eye, UserSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Student } from "@shared/schema";
import StudentForm from "@/components/student-form";

export default function Students() {
  const [, setLocation] = useLocation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [classFilter, setClassFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Fetch students
  const { data: students, isLoading } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });
  
  // Fetch classes for filter dropdown
  const { data: classes } = useQuery({
    queryKey: ["/api/classes"],
  });
  
  // Delete student mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/students/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      toast({
        title: "Student deleted",
        description: "The student has been deleted successfully.",
      });
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
  const handleDeleteStudent = (student: Student) => {
    if (confirm(`Are you sure you want to delete ${student.firstName} ${student.lastName}?`)) {
      deleteMutation.mutate(student.id);
      // Also invalidate dashboard stats and activities after deletion
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
    }
  };
  
  // Calculate attendance percentage for each student
  // This would come from an API in a real implementation
  const calculateAttendancePercentage = (student: Student) => {
    // This is a mock calculation for demo purposes
    return Math.floor(Math.random() * (100 - 75) + 75);
  };
  
  // Filter students based on class and status
  const filteredStudents = students ? students.filter(student => {
    let matches = true;
    
    if (classFilter && student.className !== classFilter) {
      matches = false;
    }
    
    if (statusFilter) {
      const isActive = student.active !== false;
      if ((statusFilter === 'active' && !isActive) || (statusFilter === 'inactive' && isActive)) {
        matches = false;
      }
    }
    
    return matches;
  }) : [];
  
  return (
    <section>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-medium text-neutral-500">Students Management</h2>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-primary hover:bg-primary-dark text-white"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Student
          </Button>
        </div>
        
        {/* Filters */}
        <Card className="mb-4 shadow-sm">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search students..."
                    className="w-full pl-10 pr-4 py-2"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {Array.isArray(classes) && classes.map((cls: any) => (
                    <SelectItem key={cls.id} value={cls.name}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        {/* Students Table */}
        <DataTable
          data={filteredStudents || []}
          columns={[
            {
              header: "ID",
              accessorKey: "studentId",
              enableSorting: true,
            },
            {
              header: "Student Name",
              accessorKey: "name",
              cell: (row) => (
                <AvatarWithText
                  firstName={row.firstName}
                  lastName={row.lastName}
                  subtitle={row.email}
                />
              ),
              enableSorting: true,
            },
            {
              header: "Class",
              accessorKey: "className",
              cell: (row) => (
                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-light bg-opacity-10 text-primary">
                  {row.className}
                </span>
              ),
              enableSorting: true,
            },
            {
              header: "Contact Info",
              accessorKey: "phoneNumber",
              cell: (row) => (
                <div>
                  <div className="text-sm">{row.phoneNumber || "No phone"}</div>
                  <div className="text-xs text-neutral-400">
                    Parent: {row.parentName || "Not provided"}
                  </div>
                </div>
              ),
            },
            {
              header: "Attendance %",
              accessorKey: "attendance",
              cell: (row) => {
                const percentage = calculateAttendancePercentage(row);
                return (
                  <div className="flex items-center">
                    <div className="w-16 bg-neutral-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${
                          percentage >= 90
                            ? "bg-success"
                            : percentage >= 75
                            ? "bg-warning"
                            : "bg-destructive"
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="ml-2">{percentage}%</span>
                  </div>
                );
              },
              enableSorting: true,
            },
            {
              header: "Actions",
              accessorKey: "actions",
              cell: (row) => (
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStudent(row);
                      setIsViewDialogOpen(true);
                    }}
                    className="text-primary hover:text-primary-dark"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocation(`/students/${row.id}`);
                    }}
                    className="text-primary hover:text-primary-dark"
                  >
                    <UserSquare className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStudent(row);
                      setIsEditDialogOpen(true);
                    }}
                    className="text-secondary hover:text-secondary-dark"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteStudent(row);
                    }}
                    className="text-destructive hover:text-red-600"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ),
            },
          ]}
          searchable
          searchPlaceholder="Search students..."
          pagination
          pageSize={10}
        />
      </div>
      
      {/* Create Student Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogTitle>Add New Student</DialogTitle>
          <StudentForm 
            onSubmitSuccess={() => {
              setIsCreateDialogOpen(false);
              queryClient.invalidateQueries({ queryKey: ["/api/students"] });
            }}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Student Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogTitle>Edit Student</DialogTitle>
          <StudentForm 
            student={selectedStudent!}
            onSubmitSuccess={() => {
              setIsEditDialogOpen(false);
              queryClient.invalidateQueries({ queryKey: ["/api/students"] });
            }}
            onCancel={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* View Student Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogTitle>Student Details</DialogTitle>
          {selectedStudent && (
            <div className="py-4">
              <div className="flex justify-center mb-4">
                <AvatarWithText
                  firstName={selectedStudent.firstName}
                  lastName={selectedStudent.lastName}
                  subtitle={selectedStudent.className}
                  avatarClassName="h-16 w-16 text-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm font-medium text-neutral-500">Student ID</p>
                  <p className="text-sm text-neutral-900">{selectedStudent.studentId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-500">Email</p>
                  <p className="text-sm text-neutral-900">{selectedStudent.email || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-500">Phone</p>
                  <p className="text-sm text-neutral-900">{selectedStudent.phoneNumber || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-500">Parent/Guardian</p>
                  <p className="text-sm text-neutral-900">{selectedStudent.parentName || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-500">Parent Phone</p>
                  <p className="text-sm text-neutral-900">{selectedStudent.parentPhone || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-500">Status</p>
                  <p className="text-sm text-neutral-900">{selectedStudent.active !== false ? "Active" : "Inactive"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-neutral-500">Address</p>
                  <p className="text-sm text-neutral-900">{selectedStudent.address || "Not provided"}</p>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    setLocation(`/students/${selectedStudent.id}`);
                  }}
                  className="text-primary"
                >
                  <UserSquare className="mr-2 h-4 w-4" /> View Profile
                </Button>
                <Button
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    setIsEditDialogOpen(true);
                  }}
                >
                  Edit
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
