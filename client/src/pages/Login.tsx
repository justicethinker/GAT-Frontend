import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Login() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
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
      const formData = new URLSearchParams();
      formData.append("email", data.email);
      formData.append("password", data.password);

      const response = await apiRequest("POST", "/api/auth/login", formData.toString());
      
      if (response.access_token) {
        localStorage.setItem("token", response.access_token);
        toast({
          title: "Success",
          description: "Logged in successfully!",
        });
        setLocation("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-emerald-600 rounded-lg flex items-center justify-center">
              <i className="ri-dashboard-line text-white text-3xl"></i>
            </div>
          </div>
          <CardTitle className="text-2xl text-center text-white">Welcome to TradePro</CardTitle>
          <CardDescription className="text-center text-gray-400">
            Sign in to access your trading dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Email
              </Label>
              <Input
                id="email"
                data-testid="input-email"
                type="email"
                placeholder="your@email.com"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                Password
              </Label>
              <Input
                id="password"
                data-testid="input-password"
                type="password"
                placeholder="••••••••"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-end">
              <Link
                href="/reset-password"
                data-testid="link-forgot-password"
                className="text-sm text-emerald-400 hover:text-emerald-300"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              data-testid="button-submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="text-center text-sm text-gray-400">
              Don't have an account?{" "}
              <Link
                href="/register"
                data-testid="link-register"
                className="text-emerald-400 hover:text-emerald-300"
              >
                Register
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
