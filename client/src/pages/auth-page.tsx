import { useState } from "react";
import { Redirect } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, School, KeyRound, UserPlus, LogIn } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const registerSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("login");

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onLoginSubmit = (values: LoginValues) => {
    loginMutation.mutate(values);
  };

  const onRegisterSubmit = (values: RegisterValues) => {
    const { confirmPassword, ...userData } = values;
    registerMutation.mutate(userData);
  };

  // Redirect if the user is already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Left side - Auth Form */}
      <div className="flex flex-col justify-center w-full max-w-md p-8 sm:p-12 bg-white">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary">Student Attendance</h1>
          <p className="text-slate-500 mt-2">Sign in to access your account</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LogIn className="mr-2 h-5 w-5" />
                  Welcome Back
                </CardTitle>
                <CardDescription>Enter your credentials to sign in</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="username" 
                              {...field} 
                              autoComplete="username" 
                              disabled={loginMutation.isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="••••••••" 
                              {...field} 
                              autoComplete="current-password"
                              disabled={loginMutation.isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Signing in..." : "Sign In"}
                    </Button>
                    {loginMutation.isError && (
                      <p className="text-sm text-destructive text-center">
                        {loginMutation.error?.message || "Login failed. Please try again."}
                      </p>
                    )}
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="justify-center">
                <p className="text-sm text-slate-500">
                  Don't have an account?{" "}
                  <Button 
                    variant="link" 
                    className="p-0" 
                    onClick={() => setActiveTab("register")}
                  >
                    Register
                  </Button>
                </p>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Create Account
                </CardTitle>
                <CardDescription>Register a new administrator account</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="username" 
                              {...field} 
                              autoComplete="username" 
                              disabled={registerMutation.isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="••••••••" 
                              {...field} 
                              autoComplete="new-password"
                              disabled={registerMutation.isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="••••••••" 
                              {...field} 
                              autoComplete="new-password"
                              disabled={registerMutation.isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                    </Button>
                    {registerMutation.isError && (
                      <p className="text-sm text-destructive text-center">
                        {registerMutation.error?.message || "Registration failed. Please try again."}
                      </p>
                    )}
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="justify-center">
                <p className="text-sm text-slate-500">
                  Already have an account?{" "}
                  <Button 
                    variant="link" 
                    className="p-0" 
                    onClick={() => setActiveTab("login")}
                  >
                    Sign In
                  </Button>
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Right side - Hero Section */}
      <div className="hidden lg:flex lg:flex-1 flex-col justify-center p-12 bg-primary bg-opacity-95 text-white">
        <div className="max-w-xl">
          <div className="mb-6 inline-block p-4 bg-primary-light rounded-lg">
            <School className="h-12 w-12" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Student Attendance Manager</h1>
          <p className="text-xl opacity-90 mb-6">
            Streamline attendance tracking, monitor student performance, and generate insightful reports with our comprehensive attendance management system.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <div className="flex items-start">
              <div className="mr-4 mt-1 p-2 bg-primary-light rounded-full">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Student Management</h3>
                <p className="opacity-80">Easily manage student records and personal information</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="mr-4 mt-1 p-2 bg-primary-light rounded-full">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Secure Access</h3>
                <p className="opacity-80">Role-based permissions and encrypted data protection</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}