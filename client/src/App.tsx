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

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/students" component={Students} />
        <Route path="/students/:id" component={StudentProfile} />
        <Route path="/attendance" component={Attendance} />
        <Route path="/reports" component={Reports} />
        <Route path="/classes" component={Classes} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
