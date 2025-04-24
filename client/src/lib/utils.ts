import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Function to format dates consistently across the application
export function formatDate(date: string | Date, formatString: string = "yyyy-MM-dd"): string {
  if (!date) return "";
  
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return format(dateObj, formatString);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
}

// Function to format time consistently
export function formatTime(time: string): string {
  if (!time) return "";
  
  try {
    // Handle different time formats
    if (time.includes(":")) {
      const [hours, minutes] = time.split(":");
      const parsedHours = parseInt(hours, 10);
      const period = parsedHours >= 12 ? "PM" : "AM";
      const displayHours = parsedHours > 12 ? parsedHours - 12 : parsedHours === 0 ? 12 : parsedHours;
      return `${displayHours}:${minutes} ${period}`;
    }
    
    return time;
  } catch (error) {
    console.error("Error formatting time:", error);
    return time;
  }
}

// Helper to get current date in YYYY-MM-DD format
export function getCurrentDate(): string {
  return format(new Date(), "yyyy-MM-dd");
}

// Helper to get current time in HH:MM format
export function getCurrentTime(): string {
  return format(new Date(), "HH:mm");
}

// Function to generate initial from name
export function getInitials(firstName: string, lastName: string): string {
  return (firstName ? firstName[0] : "") + (lastName ? lastName[0] : "");
}

// Function to generate random color based on string
export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 50%)`;
}

// Function to capitalize first letter of a string
export function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Function to calculate attendance percentage
export function calculateAttendancePercentage(
  present: number,
  total: number
): number {
  if (total === 0) return 0;
  return Math.round((present / total) * 100);
}

// Generate random student ID
export function generateStudentId(): string {
  const prefix = "ST";
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${randomNum}`;
}

// Get status variant classes
export function getStatusClass(status: string): string {
  switch (status.toLowerCase()) {
    case "present":
      return "status-present";
    case "absent":
      return "status-absent";
    case "late":
      return "status-late";
    case "excused":
      return "status-excused";
    default:
      return "status-excused";
  }
}
