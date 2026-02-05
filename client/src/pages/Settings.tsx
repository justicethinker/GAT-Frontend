import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLocation } from 'wouter';
import { buildUrl } from '@/lib/api';
import { Header } from '@/components/Header';
import { useTheme } from '@/hooks/useTheme'; // Ensure this hook exists or mock it
import { useToast } from '@/hooks/use-toast'; // Shadcn toast hook
import {
  User as UserIcon, Bell, Shield, Palette, CreditCard, LogOut,
  Sun, Moon, Monitor, Check, Mail, AtSign, KeyRound, Loader2
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utils ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface UserProfile {
  id: string;
  email: string;
  username: string;
  role: string;
  isVerified?: boolean;
}

// --- Validation Schemas ---
const passwordSchema = z.object({
  oldPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

// --- Constants ---
const NAV_ITEMS = [
  { name: 'Account', icon: UserIcon },
  { name: 'Notifications', icon: Bell },
  { name: 'Privacy & Safety', icon: Shield },
  { name: 'Appearance', icon: Palette },
  { name: 'Billing', icon: CreditCard },
] as const;

type TabName = typeof NAV_ITEMS[number]['name'];

// ──────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────────────────────
export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabName>('Account');
  const [, setLocation] = useLocation();

  const { data: user, isLoading } = useQuery<UserProfile>({
    queryKey: ['/auth/user-info'],
  });

  const handleLogout = async () => {
    try {
      // 1. Attempt server-side logout (optional, depending on backend)
      await fetch(buildUrl('/auth/logout'), { method: 'POST' }).catch(() => {}); 
      
      // 2. Clear Client State
      sessionStorage.clear();
      localStorage.removeItem('token');
      localStorage.removeItem('isAdmin');
      
      // 3. Hard Redirect to clear memory/React state
      window.location.href = '/';
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-teal-500/30">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-8 lg:px-8 lg:py-12">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* SIDEBAR NAVIGATION */}
          <aside className="lg:col-span-3">
            <nav className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-2 lg:p-3 sticky top-24 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible no-scrollbar">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.name)}
                  className={cn(
                    "flex-shrink-0 lg:w-full flex items-center gap-3 px-4 lg:px-5 py-3 rounded-xl font-medium transition-all whitespace-nowrap text-sm lg:text-base",
                    activeTab === item.name
                      ? "bg-teal-600 text-white shadow-lg shadow-teal-900/20"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </button>
              ))}

              <div className="w-px h-8 bg-slate-800 lg:w-full lg:h-px lg:my-2 mx-2 lg:mx-0 flex-shrink-0" />

              <button
                onClick={handleLogout}
                className="flex-shrink-0 lg:w-full flex items-center gap-3 px-4 lg:px-5 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition text-sm lg:text-base whitespace-nowrap font-medium"
              >
                <LogOut className="w-5 h-5" />
                Log Out
              </button>
            </nav>
          </aside>

          {/* CONTENT AREA */}
          <main className="lg:col-span-9">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 sm:p-10 min-h-[600px] shadow-xl">
              {isLoading ? (
                <div className="flex items-center justify-center h-full text-slate-500">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {activeTab === 'Account' && <AccountTab user={user} />}
                  {activeTab === 'Notifications' && <ComingSoonTab title="Notifications" icon={Bell} />}
                  {activeTab === 'Privacy & Safety' && <ComingSoonTab title="Privacy & Safety" icon={Shield} />}
                  {activeTab === 'Appearance' && <AppearanceTab theme={theme} setTheme={setTheme} />}
                  {activeTab === 'Billing' && <ComingSoonTab title="Billing" icon={CreditCard} />}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// TAB: ACCOUNT SETTINGS
// ──────────────────────────────────────────────────────────────
function AccountTab({ user }: { user?: UserProfile }) {
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema)
  });

  const mutation = useMutation({
    mutationFn: async (data: PasswordFormValues) => {
      const res = await fetch(buildUrl('/auth/reset-password'), { // Updated to match likely route
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || err.message || 'Failed to update password');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Password updated successfully." });
      reset();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Account Settings</h2>
          <p className="text-slate-400 text-sm mt-1">Manage your personal information and security.</p>
        </div>
        {user?.isVerified && (
          <span className="px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 text-xs font-bold border border-teal-500/20 uppercase tracking-wider">
            Verified
          </span>
        )}
      </div>

      {/* User Details (Read Only) */}
      <div className="grid gap-6 p-6 bg-slate-950/30 rounded-xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 border border-slate-700">
            <Mail className="w-6 h-6 text-slate-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Email Address</p>
            <p className="text-lg font-medium text-white">{user?.email || '—'}</p>
          </div>
        </div>

        <div className="h-px bg-slate-800 w-full" />

        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 border border-slate-700">
            <AtSign className="w-6 h-6 text-slate-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Username</p>
            <p className="text-lg font-medium text-white">@{user?.username || '—'}</p>
          </div>
        </div>
      </div>

      {/* Password Form */}
      <div className="pt-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-teal-500/10 rounded-lg">
            <KeyRound className="w-5 h-5 text-teal-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Change Password</h3>
        </div>

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-5 max-w-lg">
          <div>
            <label className="text-sm font-medium text-slate-400 mb-2 block">Current Password</label>
            <input
              type="password"
              {...register('oldPassword')}
              className={cn(
                "w-full px-4 py-3 bg-slate-950 border rounded-xl focus:outline-none focus:ring-2 transition text-sm",
                errors.oldPassword 
                  ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" 
                  : "border-slate-800 focus:border-teal-500 focus:ring-teal-500/20"
              )}
            />
            {errors.oldPassword && <p className="text-red-400 text-xs mt-1.5">{errors.oldPassword.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-sm font-medium text-slate-400 mb-2 block">New Password</label>
              <input
                type="password"
                {...register('newPassword')}
                className={cn(
                  "w-full px-4 py-3 bg-slate-950 border rounded-xl focus:outline-none focus:ring-2 transition text-sm",
                  errors.newPassword 
                    ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" 
                    : "border-slate-800 focus:border-teal-500 focus:ring-teal-500/20"
                )}
              />
              {errors.newPassword && <p className="text-red-400 text-xs mt-1.5">{errors.newPassword.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-slate-400 mb-2 block">Confirm Password</label>
              <input
                type="password"
                {...register('confirmPassword')}
                className={cn(
                  "w-full px-4 py-3 bg-slate-950 border rounded-xl focus:outline-none focus:ring-2 transition text-sm",
                  errors.confirmPassword 
                    ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" 
                    : "border-slate-800 focus:border-teal-500 focus:ring-teal-500/20"
                )}
              />
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1.5">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 bg-teal-600 hover:bg-teal-500 text-white font-bold py-3.5 rounded-xl transition mt-2 shadow-lg shadow-teal-900/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {isSubmitting ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// TAB: APPEARANCE
// ──────────────────────────────────────────────────────────────
function AppearanceTab({ theme, setTheme }: { theme: 'light' | 'dark' | 'system'; setTheme: (t: any) => void }) {
  const themes = [
    { value: 'light', icon: Sun, label: 'Light Mode', desc: 'Classic bright look' },
    { value: 'dark', icon: Moon, label: 'Dark Mode', desc: 'Easy on the eyes' },
    { value: 'system', icon: Monitor, label: 'System Default', desc: 'Syncs with OS' },
  ] as const;

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-800 pb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Appearance</h2>
        <p className="text-slate-400">Customize how TradePro looks on your device.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {themes.map(({ value, icon: Icon, label, desc }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={cn(
              "relative group p-6 rounded-2xl border-2 text-left transition-all duration-200",
              theme === value
                ? "border-teal-500 bg-teal-500/5"
                : "border-slate-800 hover:border-slate-600 bg-slate-900"
            )}
          >
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors",
              theme === value ? "bg-teal-500 text-white" : "bg-slate-800 text-slate-400 group-hover:text-white group-hover:bg-slate-700"
            )}>
              <Icon className="w-6 h-6" />
            </div>
            
            <p className={cn("font-bold text-lg mb-1", theme === value ? "text-white" : "text-slate-200")}>
              {label}
            </p>
            <p className="text-sm text-slate-500 group-hover:text-slate-400">{desc}</p>
            
            {theme === value && (
              <div className="absolute top-4 right-4 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center shadow-lg shadow-teal-500/20">
                <Check className="w-3.5 h-3.5 text-white" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// TAB: COMING SOON
// ──────────────────────────────────────────────────────────────
function ComingSoonTab({ title, icon: Icon }: { title: string, icon: any }) {
  return (
    <div className="h-[400px] flex flex-col items-center justify-center text-center">
      <div className="bg-slate-800/30 border border-dashed border-slate-700 rounded-3xl w-24 h-24 flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-slate-600" />
      </div>
      <h3 className="text-2xl font-bold mb-2 text-white">{title}</h3>
      <p className="text-slate-500 max-w-sm mx-auto leading-relaxed">
        This module is currently under active development. 
        <br />Check back in future updates!
      </p>
    </div>
  );
}