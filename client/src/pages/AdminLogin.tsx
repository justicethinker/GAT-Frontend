import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query"; // Import QueryClient
import { buildUrl } from "@/lib/api";
import { loginSchema, type LoginInput } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2, ShieldAlert } from "lucide-react";
import { notifySuccess, notifyError } from "@/lib/notify";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient(); // Initialize QueryClient
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [adminId, setAdminId] = useState("");
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    // 1. Basic Validation
    if (!adminId.trim()) {
      toast({
        title: "Validation Error",
        description: "Admin ID is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // 2. Prepare Payload
      const formData = new URLSearchParams();
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("adminId", adminId.trim());

      // 3. Authenticate
      const res = await fetch(buildUrl("/auth/token"), {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.detail || "Authentication failed");
      }

      // 4. Verification & Storage
      if (responseData.access_token) {
        // Double check: Did the server actually grant admin rights?
        if (!responseData.isAdmin) {
          throw new Error("This account does not have administrator privileges.");
        }

        // Store credentials
        sessionStorage.setItem("token", responseData.access_token);
        sessionStorage.setItem("isAdmin", "true");

        // CRITICAL FIX: Invalidate queries so the 'RequireAdmin' guard 
        // in App.tsx re-fetches the user status immediately.
        await queryClient.invalidateQueries({ queryKey: ["/auth/user-info"] });

        notifySuccess({ title: "Admin access granted", description: "Welcome to the control panel." });

        // Navigate immediately (awaiting invalidation above ensures data is fresh)
        setLocation("/admin");
      }
    } catch (error: any) {
      console.error("Admin Login Error:", error);
        notifyError({ title: "Admin sign in failed", description: error.message || "Invalid credentials or Admin ID" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-red-900/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-slate-800/10 rounded-full blur-[80px] pointer-events-none"></div>

      <Card className="w-full max-w-md bg-gray-900/90 backdrop-blur-sm border-red-900/30 shadow-2xl relative z-10">
        <CardHeader className="space-y-2 pb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <ShieldAlert className="text-red-500 w-7 h-7" />
            </div>
          </div>
          <CardTitle className="text-2xl sm:text-3xl text-center text-white font-bold">
            Admin Portal
          </CardTitle>
          <CardDescription className="text-center text-gray-400">
            Restricted access. Authorized personnel only.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300 text-sm font-medium ml-1">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="admin@gat.com"
                className="h-11 bg-gray-800 border-gray-700 text-white placeholder:text-gray-600 focus:border-red-500 focus:ring-red-500/20 transition-all"
                {...register("email")}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-xs text-red-400 ml-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300 text-sm font-medium ml-1">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="h-11 bg-gray-800 border-gray-700 text-white placeholder:text-gray-600 focus:border-red-500 focus:ring-red-500/20 transition-all pr-10"
                  {...register("password")}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-200 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-400 ml-1">{errors.password.message}</p>
              )}
            </div>

            {/* Admin ID Field */}
            <div className="space-y-2">
              <Label htmlFor="adminId" className="text-gray-300 text-sm font-medium ml-1">
                Security Key (Admin ID)
              </Label>
              <Input
                id="adminId"
                type="password"
                autoComplete="off"
                placeholder="Enter security key"
                className="h-11 bg-gray-800 border-gray-700 text-white placeholder:text-gray-600 focus:border-red-500 focus:ring-red-500/20 transition-all font-mono tracking-wider"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-bold text-base transition-all shadow-[0_4px_14px_0_rgba(220,38,38,0.39)] hover:shadow-[0_6px_20px_rgba(220,38,38,0.23)] hover:-translate-y-0.5 active:translate-y-0"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </div>
              ) : "Authenticate"}
            </Button>

            <div className="pt-2 text-center text-sm text-gray-400">
              Not an admin?{" "}
              <Link
                href="/login"
                className="text-red-400 hover:text-red-300 font-medium hover:underline underline-offset-4"
              >
                Return to User Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}