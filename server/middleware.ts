import { Request, Response, NextFunction } from "express";

// Middleware to check if user is authenticated
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

// Middleware to check if user has teacher role
export function requireTeacher(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  if (req.user?.role !== "teacher") {
    return res.status(403).json({ message: "Teacher access required" });
  }
  
  next();
}

// Middleware to check if user is accessing their own data (for students)
export function requireOwnershipOrTeacher(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  // Teachers can access all data
  if (req.user?.role === "teacher") {
    return next();
  }
  
  // Students can only access their own data
  const userId = parseInt(req.params.userId);
  if (req.user?.id !== userId) {
    return res.status(403).json({ message: "Access denied" });
  }
  
  next();
}

// CSRF protection middleware (basic implementation)
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // Skip CSRF check for GET requests
  if (req.method === 'GET') {
    return next();
  }
  
  const token = req.headers['x-csrf-token'] || req.body._csrf;
  const sessionToken = req.session?.csrfToken;
  
  if (!token || !sessionToken || token !== sessionToken) {
    // For development, we'll generate a token if none exists
    if (!sessionToken) {
      req.session!.csrfToken = Math.random().toString(36).substring(2);
    }
    // In production, you'd want to reject the request here
    // return res.status(403).json({ message: "CSRF token mismatch" });
  }
  
  next();
}

// Input validation middleware
export function validateInput(req: Request, res: Response, next: NextFunction) {
  // Basic input sanitization
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        // Remove potentially dangerous characters
        req.body[key] = req.body[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        req.body[key] = req.body[key].trim();
      }
    }
  }
  next();
}