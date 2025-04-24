import { pgTable, text, serial, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

// Student table
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  studentId: text("student_id").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  className: text("class_name").notNull(),
  phoneNumber: text("phone_number"),
  parentName: text("parent_name"),
  parentPhone: text("parent_phone"),
  address: text("address"),
  active: boolean("active").default(true),
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
});

// Class table
export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
});

export const insertClassSchema = createInsertSchema(classes).omit({
  id: true,
});

// Attendance table
export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  date: date("date").notNull(),
  status: text("status").notNull(), // 'present', 'absent', 'late', 'excused'
  time: text("time"),
  notes: text("notes"),
});

export const insertAttendanceSchema = createInsertSchema(attendance).omit({
  id: true,
});

// Activity log table
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),
  type: text("type").notNull(), // 'student', 'attendance', 'report', etc.
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  timestamp: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;

export type Class = typeof classes.$inferSelect;
export type InsertClass = z.infer<typeof insertClassSchema>;

export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

// Extended schemas for forms and validation
export const studentFormSchema = insertStudentSchema.extend({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  studentId: z.string().min(3, { message: "Student ID must be at least 3 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }).or(z.string().length(0)),
  className: z.string().min(1, { message: "Class must be selected" }),
});

export const attendanceFormSchema = insertAttendanceSchema.extend({
  status: z.enum(["present", "absent", "late", "excused"], {
    message: "Status must be one of: present, absent, late, excused",
  }),
  date: z.string().min(1, { message: "Date is required" }),
});
