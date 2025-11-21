import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserSchema, type CreateUserInput } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Register() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
  });

  const onSubmit = async (data: CreateUserInput) => {
    setIsLoading(true);
    try {
      await apiRequest("POST", "/auth/create-user", data);
      toast({
        title: "Success",
        description: "Account created successfully! Please sign in.",
      });
      setLocation("/login");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
       {/* Background Effects matching Login page */}
      <div className="absolute top-0 right-1/2 translate-x-1/2 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[80px] pointer-events-none"></div>

      <Card className="w-full max-w-md bg-gray-900/80 backdrop-blur-sm border-gray-800 shadow-2xl relative z-10">
        <CardHeader className="space-y-2 pb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <i className="ri-dashboard-line text-emerald-400 text-2xl"></i>
            </div>
          </div>
          <CardTitle className="text-2xl sm:text-3xl text-center text-white font-bold">Create Account</CardTitle>
          <CardDescription className="text-center text-gray-400">
            Join TradePro and start trading today
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300 text-sm font-medium ml-1">
                Email Address
              </Label>
              <Input
                id="email"
                data-testid="input-email"
                type="email"
                placeholder="trader@example.com"
                className="h-11 bg-gray-800 border-gray-700 text-white placeholder:text-gray-600 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-red-400 ml-1">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300 text-sm font-medium ml-1">
                Password
              </Label>
              <Input
                id="password"
                data-testid="input-password"
                type="password"
                placeholder="••••••••"
                className="h-11 bg-gray-800 border-gray-700 text-white placeholder:text-gray-600 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-red-400 ml-1">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              data-testid="button-submit"
              disabled={isLoading}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base transition-all shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] hover:-translate-y-0.5 active:translate-y-0"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Creating account...</span>
                </div>
              ) : "Create Account"}
            </Button>

            <div className="pt-2 text-center text-sm text-gray-400">
              Already have an account?{" "}
              <Link
                href="/login"
                data-testid="link-login"
                className="text-emerald-400 hover:text-emerald-300 font-medium hover:underline underline-offset-4"
              >
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}