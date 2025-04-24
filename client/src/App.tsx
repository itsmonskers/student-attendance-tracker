import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Layout from "@/layouts/layout";
import Dashboard from "@/pages/dashboard";
import Students from "@/pages/students";
import Attendance from "@/pages/attendance";
import Reports from "@/pages/reports";
import Classes from "@/pages/classes";
import Settings from "@/pages/settings";
import StudentProfile from "@/pages/student-profile";
import AuthPage from "@/pages/auth-page";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      
      <ProtectedRoute path="/" component={() => (
        <Layout>
          <Dashboard />
        </Layout>
      )} />
      
      <ProtectedRoute path="/dashboard" component={() => (
        <Layout>
          <Dashboard />
        </Layout>
      )} />
      
      <ProtectedRoute path="/students" component={() => (
        <Layout>
          <Students />
        </Layout>
      )} />
      
      <ProtectedRoute path="/students/:id" component={() => (
        <Layout>
          <StudentProfile />
        </Layout>
      )} />
      
      <ProtectedRoute path="/attendance" component={() => (
        <Layout>
          <Attendance />
        </Layout>
      )} />
      
      <ProtectedRoute path="/reports" component={() => (
        <Layout>
          <Reports />
        </Layout>
      )} />
      
      <ProtectedRoute path="/classes" component={() => (
        <Layout>
          <Classes />
        </Layout>
      )} />
      
      <ProtectedRoute path="/settings" component={() => (
        <Layout>
          <Settings />
        </Layout>
      )} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
