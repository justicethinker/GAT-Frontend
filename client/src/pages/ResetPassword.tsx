import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { buildUrl } from "@/lib/api";
import { Eye, EyeOff, Loader2, KeyRound, MailCheck } from "lucide-react";

// --- SCHEMAS ---

// Step 1: Email Only
const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

// Step 2: OTP + New Password + Confirm
const resetSchema = z.object({
  otp: z.string().min(6, "OTP must be 6 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type EmailInput = z.infer<typeof emailSchema>;
type ResetInput = z.infer<typeof resetSchema>;

// --- COMPONENT ---

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // State
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  // Toggle Visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Forms
  const emailForm = useForm<EmailInput>({ resolver: zodResolver(emailSchema) });
  const resetForm = useForm<ResetInput>({ resolver: zodResolver(resetSchema) });

  // --- HANDLERS ---

  const onSendOTP = async (data: EmailInput) => {
    setIsLoading(true);
    try {
      const res = await fetch(buildUrl("/auth/otp-resend"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to send verification code");

      setUserEmail(data.email);
      setStep(2);
      toast({ title: "Code Sent", description: "Check your email inbox." });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Could not send OTP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onResetSubmit = async (data: ResetInput) => {
    setIsLoading(true);
    try {
      const res = await fetch(buildUrl("/auth/reset-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          otp: data.otp,
          newPassword: data.password,
        }),
      });

      const responseBody = await res.json();

      if (!res.ok) {
        throw new Error(responseBody.detail || "Failed to reset password");
      }

      toast({
        title: "Success",
        description: "Password reset! You can now login.",
        className: "bg-emerald-600 text-white border-emerald-700",
      });
      setLocation("/login");
    } catch (error: any) {
      toast({
        title: "Reset Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Background decorative effects
  const BackgroundEffects = () => (
    <>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[80px] pointer-events-none" />
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#080D14] to-[#0C1E2A] flex items-center justify-center p-4 relative overflow-hidden">
      <BackgroundEffects />
      <Card className="w-full max-w-md bg-gray-900/80 backdrop-blur-sm border-gray-800 shadow-2xl relative z-10">
        <CardHeader className="space-y-2 pb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              {step === 1 ? (
                <MailCheck className="text-emerald-400 w-7 h-7" />
              ) : (
                <KeyRound className="text-emerald-400 w-7 h-7" />
              )}
            </div>
          </div>
          <CardTitle className="text-2xl sm:text-3xl text-center text-white font-bold">
            {step === 1 ? "Reset Password" : "Secure Account"}
          </CardTitle>
          <CardDescription className="text-center text-gray-400">
            {step === 1
              ? "Enter your email to receive a verification code"
              : `Enter the code sent to ${userEmail}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* STEP 1: REQUEST OTP */}
          {step === 1 && (
            <form onSubmit={emailForm.handleSubmit(onSendOTP)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300 text-sm font-medium ml-1">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="trader@example.com"
                  className="h-11 bg-gray-800 border-gray-700 text-white focus:border-emerald-500 transition-all"
                  {...emailForm.register("email")}
                />
                {emailForm.formState.errors.email && (
                  <p className="text-xs text-red-400 ml-1">{emailForm.formState.errors.email.message}</p>
                )}
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-lg hover:-translate-y-0.5"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Verification Code"}
              </Button>
              <div className="pt-2 text-center text-sm text-gray-400">
                Remember your password?{' '}
                <Link href="/login" className="text-emerald-400 hover:underline">
                  Sign in
                </Link>
              </div>
            </form>
          )}

          {/* STEP 2: VERIFY & CHANGE */}
          {step === 2 && (
            <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-gray-300 text-sm font-medium ml-1">
                  Verification Code (OTP)
                </Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  inputMode="numeric"
                  className="h-11 bg-gray-800 border-gray-700 text-white text-center font-mono text-lg tracking-widest focus:border-emerald-500 transition-all"
                  {...resetForm.register("otp")}
                />
                {resetForm.formState.errors.otp && (
                  <p className="text-xs text-red-400 ml-1">{resetForm.formState.errors.otp.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pass" className="text-gray-300 text-sm font-medium ml-1">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="pass"
                    type={showPassword ? "text" : "password"}
                    className="h-11 bg-gray-800 border-gray-700 text-white pr-10 focus:border-emerald-500"
                    placeholder="••••••••"
                    {...resetForm.register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {resetForm.formState.errors.password && (
                  <p className="text-xs text-red-400 ml-1">{resetForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="conf" className="text-gray-300 text-sm font-medium ml-1">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="conf"
                    type={showConfirm ? "text" : "password"}
                    className="h-11 bg-gray-800 border-gray-700 text-white pr-10 focus:border-emerald-500"
                    placeholder="••••••••"
                    {...resetForm.register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-white"
                  >
                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {resetForm.formState.errors.confirmPassword && (
                  <p className="text-xs text-red-400 ml-1">{resetForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-lg hover:-translate-y-0.5"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reset Password"}
              </Button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-sm text-emerald-400 hover:underline pt-2"
              >
                Change email address
              </button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}