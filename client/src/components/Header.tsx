import { Link, useLocation } from "wouter";
import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  Menu, X, Bell, User, LogOut, LayoutDashboard, 
  ArrowRightLeft, TrendingUp, Wallet, Settings, 
  ChevronDown, ShieldAlert, LineChart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { notifySuccess } from '@/lib/notify';
import { buildUrl } from "@/lib/api";

// ──────────────────────────────────────────────────────────────
// 1. TYPES & FETCHER
// ──────────────────────────────────────────────────────────────

interface UserInfo {
  email: string;
  username?: string;
  isAdmin?: boolean;
}

interface Notification {
  id: number;
  action: string;
  details: string | null;
  created_at: string;
  read?: boolean;
}

const authenticatedFetcher = async <T,>(context: { queryKey: readonly unknown[] }): Promise<T> => {
  const [path] = context.queryKey as string[];
  const token = sessionStorage.getItem("token");
  // Use buildUrl to ensure requests go to the backend server
  const res = await fetch(buildUrl(path), {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
  });
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json() as T;
};

// ──────────────────────────────────────────────────────────────
// 2. MAIN COMPONENT
// ──────────────────────────────────────────────────────────────

export function Header() {
  const [location] = useLocation();
  const queryClient = useQueryClient();
  
  // State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  
  // Refs for click-outside
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  // Check Admin Status (Sync with Session Storage for immediate UI feedback)
  const isSessionAdmin = sessionStorage.getItem("isAdmin") === "true";

  // --- QUERIES ---
  const { data: userInfo } = useQuery<UserInfo>({
    queryKey: ["/auth/user-info"],
    queryFn: authenticatedFetcher,
    retry: false,
  });

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/dash/notification"],
    queryFn: authenticatedFetcher,
    retry: false,
  });

  // --- EFFECTS ---
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setNotifMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // --- ACTIONS ---
  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    queryClient.clear();
    // Give user a small confirmation before redirect
    notifySuccess({ title: 'Signed out', description: 'You have been securely signed out.' });
    setTimeout(() => (window.location.href = "/"), 300);
  };

  const getInitials = (email?: string) => {
    if (!email) return "U";
    return email.substring(0, 2).toUpperCase();
  };

  // Consolidate admin check
  const isAdmin = isSessionAdmin || userInfo?.isAdmin;

  const navLinks = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/arbitrage", label: "Arbitrage", icon: ArrowRightLeft },
    { path: "/futures", label: "Futures", icon: TrendingUp },
    { path: "/forex", label: "Forex", icon: LineChart }, // Changed icon to match domain
    { path: "/wallet", label: "Wallet", icon: Wallet },
  ];

  return (
    <header className="glass bg-card/85 backdrop-blur-xl border-b border-border sticky top-0 z-50">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* LEFT: Logo & Mobile Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white hover:bg-secondary rounded-md transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <Link href="/dashboard" className="flex items-center space-x-2 group cursor-pointer">
              <div className="w-9 h-9 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors shadow-lg glow-primary">
                <LayoutDashboard className="text-primary w-5 h-5" />
              </div>
              <div className="hidden sm:block">
                <span className="text-white font-grotesk font-700 text-lg tracking-tight leading-none block">
                  GAT
                </span>
                <span className="text-[9px] font-grotesk font-600 text-primary tracking-wider uppercase block">
                  Auto Trading
                </span>
              </div>
            </Link>
          </div>

          {/* CENTER: Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link key={path} href={path}>
                <span className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer font-grotesk",
                  location === path
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-secondary"
                )}>
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </span>
              </Link>
            ))}
          </nav>

          {/* RIGHT: Actions */}
          <div className="flex items-center space-x-3">
            
            {/* Admin Button (Only visible to Admins) */}
            {isAdmin && (
              <Link href="/admin">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="hidden md:flex bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20 hover:text-red-300 gap-2 h-9 font-grotesk"
                >
                  <ShieldAlert className="w-4 h-4" />
                  Admin
                </Button>
              </Link>
            )}

            {/* Notifications */}
            <div className="relative" ref={notifMenuRef}>
              <button
                onClick={() => setNotifMenuOpen(!notifMenuOpen)}
                className={cn(
                  "p-2.5 rounded-full transition-colors relative",
                  notifMenuOpen ? "bg-secondary text-white" : "text-slate-400 hover:text-white hover:bg-secondary"
                )}
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-2 right-2.5 w-2 h-2 bg-primary rounded-full border border-card animate-pulse shadow-[0_0_10px_rgba(47,211,193,0.5)]"></span>
                )}
              </button>

              {notifMenuOpen && (
                <div className="absolute right-0 mt-3 w-80 glass bg-card rounded-xl shadow-2xl border border-border overflow-hidden animate-in fade-in slide-in-from-top-2 ring-1 ring-black/5">
                  <div className="p-3 border-b border-border bg-background/50 flex justify-between items-center font-grotesk">
                    <h3 className="text-sm font-semibold text-white">Notifications</h3>
                    <span className="text-[10px] text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full font-bold">{notifications.length} New</span>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-sm">
                      No new notifications
                    </div>
                  ) : (
                    <div className="max-h-[300px] overflow-y-auto">
                      {notifications.map((notif) => (
                        <div key={notif.id} className="p-3 border-b border-border/50 hover:bg-secondary/40 transition-colors last:border-0">
                          <p className="text-slate-200 text-sm font-medium">{notif.action}</p>
                          {notif.details && <p className="text-slate-400 text-xs mt-0.5 line-clamp-2">{notif.details}</p>}
                          <p className="text-slate-550 text-[10px] mt-1.5 flex items-center gap-1 font-mono">
                            <span className="w-1 h-1 rounded-full bg-primary"/>
                            {new Date(notif.created_at).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 p-1 pr-2 rounded-full border border-border hover:bg-secondary hover:border-border/80 transition-all"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary/80 to-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xs shadow-lg glow-primary font-grotesk">
                  {getInitials(userInfo?.email)}
                </div>
                <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-200", userMenuOpen && "rotate-180")} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-3 w-56 glass bg-card rounded-xl shadow-2xl border border-border overflow-hidden animate-in fade-in slide-in-from-top-2 ring-1 ring-black/5 font-grotesk">
                  <div className="p-4 border-b border-border bg-background/50">
                    <p className="text-sm font-medium text-white truncate">{userInfo?.email || "User"}</p>
                    <p className="text-xs text-primary mt-1.5 flex items-center gap-1.5 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"/>
                      {isAdmin ? "Administrator" : "Standard Plan"}
                    </p>
                  </div>
                  <div className="p-1.5 space-y-0.5 text-sm">
                    <Link href="/profile">
                      <div className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-secondary rounded-lg cursor-pointer transition-colors">
                        <User className="w-4 h-4 text-primary" /> Profile
                      </div>
                    </Link>
                    <Link href="/settings">
                      <div className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-secondary rounded-lg cursor-pointer transition-colors">
                        <Settings className="w-4 h-4 text-primary" /> Settings
                      </div>
                    </Link>
                    
                    {/* Admin Link in Dropdown (Visible on Mobile/Desktop) */}
                    {isAdmin && (
                      <Link href="/admin">
                        <div className="flex items-center gap-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg cursor-pointer transition-colors">
                          <ShieldAlert className="w-4 h-4" /> Admin Panel
                        </div>
                      </Link>
                    )}

                    <div className="h-px bg-border my-1 mx-2" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white hover:bg-secondary rounded-lg transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 text-red-400" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="lg:hidden glass bg-card/95 backdrop-blur-xl border-b border-border animate-in slide-in-from-top-5 duration-200 absolute w-full z-40">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link key={path} href={path}>
                <span className={cn(
                  "flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium transition-colors cursor-pointer font-grotesk",
                  location === path
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-slate-300 hover:bg-secondary hover:text-white"
                )}>
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </span>
              </Link>
            ))}
            
            {isAdmin && (
              <Link href="/admin">
                <span className="flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium transition-colors cursor-pointer bg-red-500/10 text-red-400 mt-2 font-grotesk">
                  <ShieldAlert className="w-5 h-5" />
                  <span>Admin Dashboard</span>
                </span>
              </Link>
            )}
          </div>
          
          <div className="border-t border-border p-4 bg-background/50 font-grotesk">
             <div className="flex items-center gap-3 mb-4 px-2">
               <div className="w-10 h-10 bg-primary/20 border border-primary/30 rounded-full flex items-center justify-center text-primary font-bold shadow-lg">
                 {getInitials(userInfo?.email)}
               </div>
               <div>
                   <p className="text-white font-medium text-sm">{userInfo?.email}</p>
                   <p className="text-primary text-xs font-semibold flex items-center gap-1 mt-0.5">
                     <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"/>
                     Logged in
                   </p>
               </div>
             </div>
             <div className="grid grid-cols-2 gap-2 text-sm">
               <Link href="/profile">
                   <Button variant="outline" className="w-full border-border text-slate-300 hover:text-white hover:bg-secondary">
                       Profile
                   </Button>
               </Link>
               <Button onClick={handleLogout} variant="outline" className="w-full border-red-950/30 text-red-400 hover:bg-red-950/30 hover:text-red-300">
                   Logout
               </Button>
             </div>
          </div>
        </div>
      )}
    </header>
  );
}