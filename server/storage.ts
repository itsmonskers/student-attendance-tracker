import session from "express-session";
import createMemoryStore from "memorystore";
import { 
  User, InsertUser,
  Student, InsertStudent, 
  Class, InsertClass, 
  Attendance, InsertAttendance,
  Activity, InsertActivity,
  users, students, classes, attendance, activities
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(userData: InsertUser): Promise<User>;

  // Student methods
  getStudents(): Promise<Student[]>;
  getStudent(id: number): Promise<Student | undefined>;
  getStudentByStudentId(studentId: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: number, student: Partial<Student>): Promise<Student | undefined>;
  deleteStudent(id: number): Promise<boolean>;
  
  // Class methods
  getClasses(): Promise<Class[]>;
  getClass(id: number): Promise<Class | undefined>;
  createClass(classData: InsertClass): Promise<Class>;
  
  // Attendance methods
  getAttendance(filters?: { date?: string; studentId?: number; className?: string }): Promise<(Attendance & { student: Student })[]>;
  getAttendanceForStudent(studentId: number): Promise<Attendance[]>;
  getAttendanceForDate(date: string): Promise<Attendance[]>;
  getAttendanceForClass(className: string, date?: string): Promise<(Attendance & { student: Student })[]>;
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
  updateAttendance(id: number, attendanceData: Partial<Attendance>): Promise<Attendance | undefined>;
  
  // Activity methods
  getActivities(limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Dashboard stats
  getDashboardStats(): Promise<{ 
    totalStudents: number; 
    presentToday: number; 
    absentToday: number; 
    lateToday: number;
  }>;
  
  // Reports
  getAttendanceStats(startDate: string, endDate: string, className?: string): Promise<{
    date: string;
    present: number;
    absent: number;
    late: number;
  }[]>;
  
  // Session store for auth
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private students: Map<number, Student>;
  private classes: Map<number, Class>;
  private attendance: Map<number, Attendance>;
  private activities: Map<number, Activity>;
  
  private userIdCounter: number;
  private studentIdCounter: number;
  private classIdCounter: number;
  private attendanceIdCounter: number;
  private activityIdCounter: number;
  
  public sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.students = new Map();
    this.classes = new Map();
    this.attendance = new Map();
    this.activities = new Map();
    
    this.userIdCounter = 1;
    this.studentIdCounter = 1;
    this.classIdCounter = 1;
    this.attendanceIdCounter = 1;
    this.activityIdCounter = 1;
    
    // Initialize session store
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Add some default classes
    this.seedClasses();
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      user => user.username === username
    );
  }
  
  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...userData, id };
    this.users.set(id, user);
    
    // Log activity
    await this.createActivity({
      message: `New user ${user.username} was created.`,
      type: 'user',
    });
    
    return user;
  }
  
  private seedClasses() {
    const defaultClasses = [
      { name: "Class 10-A", description: "Secondary School - Section A" },
      { name: "Class 10-B", description: "Secondary School - Section B" },
      { name: "Class 11-A", description: "Higher Secondary - Section A" },
      { name: "Class 11-B", description: "Higher Secondary - Section B" },
      { name: "Class 12-A", description: "Higher Secondary - Final Year" },
    ];
    
    defaultClasses.forEach(cls => {
      this.createClass(cls);
    });
  }

  // Student methods
  async getStudents(): Promise<Student[]> {
    return Array.from(this.students.values());
  }

  async getStudent(id: number): Promise<Student | undefined> {
    return this.students.get(id);
  }

  async getStudentByStudentId(studentId: string): Promise<Student | undefined> {
    return Array.from(this.students.values()).find(
      student => student.studentId === studentId
    );
  }

  async createStudent(studentData: InsertStudent): Promise<Student> {
    const id = this.studentIdCounter++;
    const student: Student = { ...studentData, id };
    this.students.set(id, student);
    
    // Log activity
    await this.createActivity({
      message: `New student ${student.firstName} ${student.lastName} was added to ${student.className}.`,
      type: 'student',
    });
    
    return student;
  }

  async updateStudent(id: number, studentData: Partial<Student>): Promise<Student | undefined> {
    const existingStudent = this.students.get(id);
    if (!existingStudent) {
      return undefined;
    }

    const updatedStudent = { ...existingStudent, ...studentData };
    this.students.set(id, updatedStudent);
    
    // Log activity
    await this.createActivity({
      message: `Student ${updatedStudent.firstName} ${updatedStudent.lastName} details were updated.`,
      type: 'student',
    });
    
    return updatedStudent;
  }

  async deleteStudent(id: number): Promise<boolean> {
    const student = this.students.get(id);
    if (!student) {
      return false;
    }
    
    const result = this.students.delete(id);
    
    // Log activity if successful
    if (result) {
      await this.createActivity({
        message: `Student ${student.firstName} ${student.lastName} was removed.`,
        type: 'student',
      });
    }
    
    return result;
  }

  // Class methods
  async getClasses(): Promise<Class[]> {
    return Array.from(this.classes.values());
  }

  async getClass(id: number): Promise<Class | undefined> {
    return this.classes.get(id);
  }

  async createClass(classData: InsertClass): Promise<Class> {
    const id = this.classIdCounter++;
    const newClass: Class = { ...classData, id };
    this.classes.set(id, newClass);
    
    // Log activity
    await this.createActivity({
      message: `New class ${newClass.name} was created.`,
      type: 'class',
    });
    
    return newClass;
  }

  // Attendance methods
  async getAttendance(filters?: { date?: string; studentId?: number; className?: string }): Promise<(Attendance & { student: Student })[]> {
    let records = Array.from(this.attendance.values());
    
    if (filters?.date) {
      records = records.filter(record => record.date === filters.date);
    }
    
    if (filters?.studentId) {
      records = records.filter(record => record.studentId === filters.studentId);
    }
    
    const result = [];
    
    for (const record of records) {
      const student = this.students.get(record.studentId);
      if (student) {
        if (filters?.className && student.className !== filters.className) {
          continue;
        }
        result.push({ ...record, student });
      }
    }
    
    return result;
  }

  async getAttendanceForStudent(studentId: number): Promise<Attendance[]> {
    return Array.from(this.attendance.values()).filter(
      record => record.studentId === studentId
    );
  }

  async getAttendanceForDate(date: string): Promise<Attendance[]> {
    return Array.from(this.attendance.values()).filter(
      record => record.date === date
    );
  }

  async getAttendanceForClass(className: string, date?: string): Promise<(Attendance & { student: Student })[]> {
    const studentIds = new Set(
      Array.from(this.students.values())
        .filter(student => student.className === className)
        .map(student => student.id)
    );
    
    let records = Array.from(this.attendance.values()).filter(
      record => studentIds.has(record.studentId)
    );
    
    if (date) {
      records = records.filter(record => record.date === date);
    }
    
    const result = [];
    
    for (const record of records) {
      const student = this.students.get(record.studentId);
      if (student) {
        result.push({ ...record, student });
      }
    }
    
    return result;
  }

  async createAttendance(attendanceData: InsertAttendance): Promise<Attendance> {
    const id = this.attendanceIdCounter++;
    const record: Attendance = { ...attendanceData, id };
    this.attendance.set(id, record);
    
    // Get student name for activity log
    const student = this.students.get(record.studentId);
    if (student) {
      // Log activity
      await this.createActivity({
        message: `${student.firstName} ${student.lastName} was marked ${record.status}.`,
        type: 'attendance',
      });
    }
    
    return record;
  }

  async updateAttendance(id: number, attendanceData: Partial<Attendance>): Promise<Attendance | undefined> {
    const existingRecord = this.attendance.get(id);
    if (!existingRecord) {
      return undefined;
    }

    const updatedRecord = { ...existingRecord, ...attendanceData };
    this.attendance.set(id, updatedRecord);
    
    // Get student name for activity log
    const student = this.students.get(updatedRecord.studentId);
    if (student) {
      // Log activity
      await this.createActivity({
        message: `Attendance for ${student.firstName} ${student.lastName} was updated to ${updatedRecord.status}.`,
        type: 'attendance',
      });
    }
    
    return updatedRecord;
  }

  // Activity methods
  async getActivities(limit?: number): Promise<Activity[]> {
    let activities = Array.from(this.activities.values());
    
    // Sort by timestamp (newest first)
    activities.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
    
    if (limit) {
      activities = activities.slice(0, limit);
    }
    
    return activities;
  }

  async createActivity(activityData: InsertActivity): Promise<Activity> {
    const id = this.activityIdCounter++;
    const activity: Activity = { 
      ...activityData, 
      id, 
      timestamp: new Date().toISOString() 
    };
    
    this.activities.set(id, activity);
    return activity;
  }

  // Dashboard stats
  async getDashboardStats(): Promise<{ 
    totalStudents: number; 
    presentToday: number; 
    absentToday: number; 
    lateToday: number;
  }> {
    const totalStudents = this.students.size;
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    const todayAttendance = Array.from(this.attendance.values()).filter(
      record => record.date === today
    );
    
    const presentToday = todayAttendance.filter(record => record.status === 'present').length;
    const absentToday = todayAttendance.filter(record => record.status === 'absent').length;
    const lateToday = todayAttendance.filter(record => record.status === 'late').length;
    
    return {
      totalStudents,
      presentToday,
      absentToday,
      lateToday
    };
  }

  // Reports
  async getAttendanceStats(startDate: string, endDate: string, className?: string): Promise<{
    date: string;
    present: number;
    absent: number;
    late: number;
  }[]> {
    // Helper function to get date range
    const getDatesInRange = (start: string, end: string) => {
      const dates = [];
      const currentDate = new Date(start);
      const endDateObj = new Date(end);
      
      while (currentDate <= endDateObj) {
        dates.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return dates;
    };
    
    const dateRange = getDatesInRange(startDate, endDate);
    const result = [];
    
    // Filter students by class if needed
    let studentIds: number[] = [];
    if (className) {
      studentIds = Array.from(this.students.values())
        .filter(student => student.className === className)
        .map(student => student.id);
    } else {
      studentIds = Array.from(this.students.values()).map(student => student.id);
    }
    
    for (const date of dateRange) {
      let records = Array.from(this.attendance.values()).filter(
        record => record.date === date && studentIds.includes(record.studentId)
      );
      
      const present = records.filter(record => record.status === 'present').length;
      const absent = records.filter(record => record.status === 'absent').length;
      const late = records.filter(record => record.status === 'late').length;
      
      result.push({
        date,
        present,
        absent,
        late
      });
    }
    
    return result;
  }
}

export const storage = new MemStorage();
