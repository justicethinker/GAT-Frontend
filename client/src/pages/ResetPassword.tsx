import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, otpResendSchema, type ResetPasswordInput, type OTPResendInput } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const { toast } = useToast();

  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: emailErrors },
    getValues,
  } = useForm<OTPResendInput>({
    resolver: zodResolver(otpResendSchema),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSendOTP = async (data: OTPResendInput) => {
    setIsLoading(true);
    try {
      await apiRequest("POST", "/auth/otp-resend", data);
      setOtpSent(true);
      setValue("email", data.email);
      toast({
        title: "Success",
        description: "OTP sent to your email!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ResetPasswordInput) => {
    setIsLoading(true);
    try {
      await apiRequest("POST", "/auth/reset-password", data);
      toast({
        title: "Success",
        description: "Password reset successfully! Please sign in.",
      });
      setLocation("/login");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Shared background elements
  const BackgroundEffects = () => (
    <>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[80px] pointer-events-none"></div>
    </>
  );

  if (!otpSent) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
        <BackgroundEffects />
        <Card className="w-full max-w-md bg-gray-900/80 backdrop-blur-sm border-gray-800 shadow-2xl relative z-10">
          <CardHeader className="space-y-2 pb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <i className="ri-lock-password-line text-emerald-400 text-2xl"></i>
              </div>
            </div>
            <CardTitle className="text-2xl sm:text-3xl text-center text-white font-bold">Reset Password</CardTitle>
            <CardDescription className="text-center text-gray-400">
              Enter your email to receive a verification code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitEmail(onSendOTP)} className="space-y-5">
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
                  {...registerEmail("email")}
                />
                {emailErrors.email && (
                  <p className="text-xs text-red-400 ml-1">{emailErrors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                data-testid="button-send-otp"
                disabled={isLoading}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base transition-all shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] hover:-translate-y-0.5 active:translate-y-0"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Sending Code...</span>
                  </div>
                ) : "Send Verification Code"}
              </Button>

              <div className="pt-2 text-center text-sm text-gray-400">
                Remember your password?{" "}
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

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
      <BackgroundEffects />
      <Card className="w-full max-w-md bg-gray-900/80 backdrop-blur-sm border-gray-800 shadow-2xl relative z-10">
        <CardHeader className="space-y-2 pb-6">
          <div className="flex items-center justify-center mb-4">
             <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <i className="ri-shield-keyhole-line text-emerald-400 text-2xl"></i>
            </div>
          </div>
          <CardTitle className="text-2xl sm:text-3xl text-center text-white font-bold">Verify & Reset</CardTitle>
          <CardDescription className="text-center text-gray-400">
            Check your email for the code
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="otp" className="text-gray-300 text-sm font-medium ml-1">
                Verification Code
              </Label>
              <Input
                id="otp"
                data-testid="input-otp"
                type="text"
                placeholder="Enter 6-digit code"
                className="h-11 bg-gray-800 border-gray-700 text-white placeholder:text-gray-600 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all tracking-widest text-center font-mono text-lg"
                {...register("otp")}
              />
              {errors.otp && (
                <p className="text-xs text-red-400 ml-1">{errors.otp.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300 text-sm font-medium ml-1">
                New Password
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
                    <span>Resetting...</span>
                </div>
              ) : "Reset Password"}
            </Button>

            <button
              type="button"
              onClick={() => setOtpSent(false)}
              className="w-full text-sm text-emerald-400 hover:text-emerald-300 font-medium hover:underline underline-offset-4 pt-2"
            >
              Use a different email
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}