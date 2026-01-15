import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      // Prepare form data for OAuth2 standard (x-www-form-urlencoded)
      const formData = new URLSearchParams();
      formData.append("email", data.email);
      formData.append("password", data.password);

      // Using direct fetch to control headers/body explicitly
      const res = await fetch("/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.detail || responseData.message || "Login failed");
      }

      // Success: Store tokens and role
      if (responseData.access_token) {
        sessionStorage.setItem("token", responseData.access_token);
        
        // Store admin status if present (matches routes.ts logic)
        if (responseData.isAdmin) {
          sessionStorage.setItem("isAdmin", "true");
        } else {
          sessionStorage.removeItem("isAdmin");
        }

        toast({
          title: "Welcome back",
          description: "Logged in successfully!",
          className: "bg-emerald-600 text-white border-emerald-700",
        });

        // Small delay to ensure storage is set before routing
        setTimeout(() => setLocation("/dashboard"), 100);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Access Denied",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[80px] pointer-events-none"></div>

      <Card className="w-full max-w-md bg-gray-900/80 backdrop-blur-sm border-gray-800 shadow-2xl relative z-10">
        <CardHeader className="space-y-2 pb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <i className="ri-dashboard-line text-emerald-400 text-2xl"></i>
            </div>
          </div>
          <CardTitle className="text-2xl sm:text-3xl text-center text-white font-bold">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-center text-gray-400">
            Sign in to access your TradePro dashboard
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
                autoComplete="username"
                placeholder="trader@example.com"
                className="h-11 bg-gray-800 border-gray-700 text-white placeholder:text-gray-600 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-red-400 ml-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <Label htmlFor="password" className="text-gray-300 text-sm font-medium">
                  Password
                </Label>
                <Link href="/reset-password" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="h-11 bg-gray-800 border-gray-700 text-white placeholder:text-gray-600 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all pr-10"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {errors.password && (
                <p className="text-xs text-red-400 ml-1">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base transition-all shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] hover:-translate-y-0.5 active:translate-y-0"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : "Sign In"}
            </Button>

            <div className="pt-2 text-center text-sm text-gray-400">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-emerald-400 hover:text-emerald-300 font-medium hover:underline underline-offset-4"
              >
                Create Account
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}