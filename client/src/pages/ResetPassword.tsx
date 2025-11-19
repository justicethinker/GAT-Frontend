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

  if (!otpSent) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-900 border-gray-800">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-emerald-600 rounded-lg flex items-center justify-center">
                <i className="ri-lock-password-line text-white text-3xl"></i>
              </div>
            </div>
            <CardTitle className="text-2xl text-center text-white">Reset Password</CardTitle>
            <CardDescription className="text-center text-gray-400">
              Enter your email to receive a verification code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitEmail(onSendOTP)} className="space-y-4">
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
                  {...registerEmail("email")}
                />
                {emailErrors.email && (
                  <p className="text-sm text-red-400">{emailErrors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                data-testid="button-send-otp"
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isLoading ? "Sending..." : "Send Verification Code"}
              </Button>

              <div className="text-center text-sm text-gray-400">
                Remember your password?{" "}
                <Link
                  href="/login"
                  data-testid="link-login"
                  className="text-emerald-400 hover:text-emerald-300"
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
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-emerald-600 rounded-lg flex items-center justify-center">
              <i className="ri-lock-password-line text-white text-3xl"></i>
            </div>
          </div>
          <CardTitle className="text-2xl text-center text-white">Enter Verification Code</CardTitle>
          <CardDescription className="text-center text-gray-400">
            Check your email for the verification code
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp" className="text-gray-300">
                Verification Code
              </Label>
              <Input
                id="otp"
                data-testid="input-otp"
                type="text"
                placeholder="Enter OTP"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                {...register("otp")}
              />
              {errors.otp && (
                <p className="text-sm text-red-400">{errors.otp.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                New Password
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

            <Button
              type="submit"
              data-testid="button-submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>

            <button
              type="button"
              onClick={() => setOtpSent(false)}
              className="w-full text-sm text-emerald-400 hover:text-emerald-300"
            >
              Use a different email
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
