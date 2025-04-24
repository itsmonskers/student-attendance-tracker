import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import { Plus, Pencil, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Class } from "@shared/schema";

export default function Classes() {
  const [isAddClassDialogOpen, setIsAddClassDialogOpen] = useState(false);
  const [className, setClassName] = useState("");
  const [classDescription, setClassDescription] = useState("");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Fetch classes
  const { data: classes, isLoading: classesLoading } = useQuery<Class[]>({
    queryKey: ["/api/classes"],
  });
  
  // Fetch students
  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ["/api/students"],
  });
  
  // Create class mutation
  const createClassMutation = useMutation({
    mutationFn: async (classData: { name: string; description: string }) => {
      return apiRequest("POST", "/api/classes", classData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/classes"] });
      setIsAddClassDialogOpen(false);
      setClassName("");
      setClassDescription("");
      toast({
        title: "Class Created",
        description: "The class has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create class: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    },
  });
  
  // Group students by class
  const studentsByClass = students
    ? students.reduce((acc, student) => {
        if (!acc[student.className]) {
          acc[student.className] = [];
        }
        acc[student.className].push(student);
        return acc;
      }, {} as Record<string, any[]>)
    : {};
  
  // Handle class creation
  const handleCreateClass = () => {
    if (!className.trim()) {
      toast({
        title: "Error",
        description: "Class name is required",
        variant: "destructive",
      });
      return;
    }
    
    createClassMutation.mutate({
      name: className,
      description: classDescription,
    });
  };
  
  return (
    <section>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-medium text-neutral-500">Classes Management</h2>
          <Button
            onClick={() => setIsAddClassDialogOpen(true)}
            className="bg-primary hover:bg-primary-dark text-white"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Class
          </Button>
        </div>
        
        {/* Classes List */}
        {classesLoading ? (
          <div className="text-center py-8">Loading classes...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {classes?.map((cls) => (
              <Card key={cls.id} className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{cls.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-500 mb-4">
                    {cls.description || "No description provided"}
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="text-sm">
                      <span className="font-medium">
                        {studentsByClass[cls.name]?.length || 0}
                      </span>{" "}
                      students
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Pencil className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button size="sm" variant="outline" className="text-destructive">
                        <Trash className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {classes?.length === 0 && (
              <div className="col-span-3 text-center py-8 bg-white rounded-lg shadow-sm">
                <p className="text-lg text-neutral-500">No classes found</p>
                <p className="text-sm text-neutral-400 mt-1">
                  Create your first class to get started
                </p>
                <Button
                  onClick={() => setIsAddClassDialogOpen(true)}
                  className="mt-4"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Class
                </Button>
              </div>
            )}
          </div>
        )}
        
        {/* Class Details Tabs */}
        {classes && classes.length > 0 && (
          <Tabs defaultValue={classes[0]?.name} className="mt-6">
            <TabsList className="mb-4 flex flex-wrap">
              {classes.map((cls) => (
                <TabsTrigger key={cls.id} value={cls.name}>
                  {cls.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {classes.map((cls) => (
              <TabsContent key={cls.id} value={cls.name}>
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle>Students in {cls.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {studentsLoading ? (
                      <div className="text-center py-4">Loading students...</div>
                    ) : (
                      <DataTable
                        data={studentsByClass[cls.name] || []}
                        columns={[
                          {
                            header: "ID",
                            accessorKey: "studentId",
                          },
                          {
                            header: "First Name",
                            accessorKey: "firstName",
                          },
                          {
                            header: "Last Name",
                            accessorKey: "lastName",
                          },
                          {
                            header: "Email",
                            accessorKey: "email",
                          },
                          {
                            header: "Phone",
                            accessorKey: "phoneNumber",
                          },
                        ]}
                        searchable
                        searchPlaceholder="Search students..."
                        pagination
                        pageSize={10}
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
      
      {/* Add Class Dialog */}
      <Dialog open={isAddClassDialogOpen} onOpenChange={setIsAddClassDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Class</DialogTitle>
            <DialogDescription>
              Create a new class for your students.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="class-name">Class Name</Label>
              <Input
                id="class-name"
                placeholder="e.g. Class 10-A"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="class-description">Description (Optional)</Label>
              <Textarea
                id="class-description"
                placeholder="Enter a description for this class"
                value={classDescription}
                onChange={(e) => setClassDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddClassDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateClass}
              disabled={createClassMutation.isPending}
            >
              {createClassMutation.isPending ? "Creating..." : "Create Class"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
