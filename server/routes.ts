import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertStudentSchema, 
  insertClassSchema, 
  insertAttendanceSchema,
  studentFormSchema,
  attendanceFormSchema,
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Student routes
  app.get("/api/students", async (req: Request, res: Response) => {
    try {
      const students = await storage.getStudents();
      return res.json(students);
    } catch (error) {
      console.error("Failed to get students:", error);
      return res.status(500).json({ message: "Failed to retrieve students" });
    }
  });

  app.get("/api/students/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid student ID" });
      }
      
      const student = await storage.getStudent(id);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      return res.json(student);
    } catch (error) {
      console.error("Failed to get student:", error);
      return res.status(500).json({ message: "Failed to retrieve student" });
    }
  });

  app.post("/api/students", async (req: Request, res: Response) => {
    try {
      const validatedData = studentFormSchema.safeParse(req.body);
      
      if (!validatedData.success) {
        const errorMessage = fromZodError(validatedData.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      // Check if student ID is already in use
      const existingStudent = await storage.getStudentByStudentId(validatedData.data.studentId);
      if (existingStudent) {
        return res.status(400).json({ message: "Student ID already exists" });
      }
      
      const newStudent = await storage.createStudent(validatedData.data);
      return res.status(201).json(newStudent);
    } catch (error) {
      console.error("Failed to create student:", error);
      return res.status(500).json({ message: "Failed to create student" });
    }
  });

  app.put("/api/students/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid student ID" });
      }
      
      const existingStudent = await storage.getStudent(id);
      if (!existingStudent) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      const validatedData = studentFormSchema.safeParse(req.body);
      
      if (!validatedData.success) {
        const errorMessage = fromZodError(validatedData.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      // Check if updated student ID conflicts with another student
      if (validatedData.data.studentId !== existingStudent.studentId) {
        const studentWithSameId = await storage.getStudentByStudentId(validatedData.data.studentId);
        if (studentWithSameId && studentWithSameId.id !== id) {
          return res.status(400).json({ message: "Student ID already exists" });
        }
      }
      
      const updatedStudent = await storage.updateStudent(id, validatedData.data);
      return res.json(updatedStudent);
    } catch (error) {
      console.error("Failed to update student:", error);
      return res.status(500).json({ message: "Failed to update student" });
    }
  });

  app.delete("/api/students/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid student ID" });
      }
      
      const success = await storage.deleteStudent(id);
      if (!success) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      return res.status(204).send();
    } catch (error) {
      console.error("Failed to delete student:", error);
      return res.status(500).json({ message: "Failed to delete student" });
    }
  });

  // Class routes
  app.get("/api/classes", async (req: Request, res: Response) => {
    try {
      const classes = await storage.getClasses();
      return res.json(classes);
    } catch (error) {
      console.error("Failed to get classes:", error);
      return res.status(500).json({ message: "Failed to retrieve classes" });
    }
  });

  app.post("/api/classes", async (req: Request, res: Response) => {
    try {
      const validatedData = insertClassSchema.safeParse(req.body);
      
      if (!validatedData.success) {
        const errorMessage = fromZodError(validatedData.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      const newClass = await storage.createClass(validatedData.data);
      return res.status(201).json(newClass);
    } catch (error) {
      console.error("Failed to create class:", error);
      return res.status(500).json({ message: "Failed to create class" });
    }
  });

  // Attendance routes
  app.get("/api/attendance", async (req: Request, res: Response) => {
    try {
      const { date, studentId, className } = req.query;
      
      const filters: { date?: string; studentId?: number; className?: string } = {};
      
      if (date && typeof date === 'string') {
        filters.date = date;
      }
      
      if (studentId && typeof studentId === 'string') {
        const id = parseInt(studentId);
        if (!isNaN(id)) {
          filters.studentId = id;
        }
      }
      
      if (className && typeof className === 'string') {
        filters.className = className;
      }
      
      const attendance = await storage.getAttendance(filters);
      return res.json(attendance);
    } catch (error) {
      console.error("Failed to get attendance:", error);
      return res.status(500).json({ message: "Failed to retrieve attendance records" });
    }
  });

  app.post("/api/attendance", async (req: Request, res: Response) => {
    try {
      const validatedData = attendanceFormSchema.safeParse(req.body);
      
      if (!validatedData.success) {
        const errorMessage = fromZodError(validatedData.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      // Check if student exists
      const student = await storage.getStudent(validatedData.data.studentId);
      if (!student) {
        return res.status(400).json({ message: "Student not found" });
      }
      
      const newAttendance = await storage.createAttendance(validatedData.data);
      return res.status(201).json(newAttendance);
    } catch (error) {
      console.error("Failed to create attendance record:", error);
      return res.status(500).json({ message: "Failed to create attendance record" });
    }
  });

  app.put("/api/attendance/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid attendance ID" });
      }
      
      // Validate only the fields that are being updated
      const validatedData = attendanceFormSchema.partial().safeParse(req.body);
      
      if (!validatedData.success) {
        const errorMessage = fromZodError(validatedData.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      const updatedAttendance = await storage.updateAttendance(id, validatedData.data);
      if (!updatedAttendance) {
        return res.status(404).json({ message: "Attendance record not found" });
      }
      
      return res.json(updatedAttendance);
    } catch (error) {
      console.error("Failed to update attendance record:", error);
      return res.status(500).json({ message: "Failed to update attendance record" });
    }
  });

  // Activity routes
  app.get("/api/activities", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const activities = await storage.getActivities(limit);
      return res.json(activities);
    } catch (error) {
      console.error("Failed to get activities:", error);
      return res.status(500).json({ message: "Failed to retrieve activities" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req: Request, res: Response) => {
    try {
      const stats = await storage.getDashboardStats();
      return res.json(stats);
    } catch (error) {
      console.error("Failed to get dashboard stats:", error);
      return res.status(500).json({ message: "Failed to retrieve dashboard statistics" });
    }
  });

  // Reports
  app.get("/api/reports/attendance", async (req: Request, res: Response) => {
    try {
      const { startDate, endDate, className } = req.query;
      
      if (!startDate || !endDate || typeof startDate !== 'string' || typeof endDate !== 'string') {
        return res.status(400).json({ message: "Start date and end date are required" });
      }
      
      const classNameFilter = className && typeof className === 'string' ? className : undefined;
      
      const stats = await storage.getAttendanceStats(startDate, endDate, classNameFilter);
      return res.json(stats);
    } catch (error) {
      console.error("Failed to get attendance stats:", error);
      return res.status(500).json({ message: "Failed to generate attendance report" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
