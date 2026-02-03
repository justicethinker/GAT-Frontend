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
  // Use relative path directly
  const res = await fetch(path, {
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
    <header className="bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-50">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* LEFT: Logo & Mobile Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <Link href="/dashboard" className="flex items-center space-x-2 group cursor-pointer">
              <div className="w-9 h-9 bg-emerald-600/10 border border-emerald-500/20 rounded-lg flex items-center justify-center group-hover:bg-emerald-600/20 transition-colors">
                <LayoutDashboard className="text-emerald-500 w-5 h-5" />
              </div>
              <span className="text-white font-bold text-xl tracking-tight hidden sm:block">
                TradePro
              </span>
            </Link>
          </div>

          {/* CENTER: Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link key={path} href={path}>
                <span className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
                  location === path
                    ? "bg-emerald-600/10 text-emerald-400 border border-emerald-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
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
                  className="hidden md:flex bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20 hover:text-red-300 gap-2 h-9"
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
                  notifMenuOpen ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-2 right-2.5 w-2 h-2 bg-emerald-500 rounded-full border border-slate-900 animate-pulse"></span>
                )}
              </button>

              {notifMenuOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-slate-900 rounded-xl shadow-2xl border border-slate-800 overflow-hidden animate-in fade-in slide-in-from-top-2 ring-1 ring-black/5">
                  <div className="p-3 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-white">Notifications</h3>
                    <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">{notifications.length} New</span>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-sm">
                      No new notifications
                    </div>
                  ) : (
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                      {notifications.map((notif) => (
                        <div key={notif.id} className="p-3 border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors last:border-0">
                          <p className="text-slate-200 text-sm font-medium">{notif.action}</p>
                          {notif.details && <p className="text-slate-400 text-xs mt-0.5 line-clamp-2">{notif.details}</p>}
                          <p className="text-slate-600 text-[10px] mt-1.5 flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-slate-600"/>
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
                className="flex items-center space-x-2 p-1 pr-2 rounded-full border border-slate-800 hover:bg-slate-800 hover:border-slate-700 transition-all"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg">
                  {getInitials(userInfo?.email)}
                </div>
                <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-200", userMenuOpen && "rotate-180")} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-slate-900 rounded-xl shadow-2xl border border-slate-800 overflow-hidden animate-in fade-in slide-in-from-top-2 ring-1 ring-black/5">
                  <div className="p-4 border-b border-slate-800 bg-slate-950/50">
                    <p className="text-sm font-medium text-white truncate">{userInfo?.email || "User"}</p>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"/>
                      {isAdmin ? "Administrator" : "Standard Plan"}
                    </p>
                  </div>
                  <div className="p-1.5 space-y-0.5">
                    <Link href="/profile">
                      <div className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer transition-colors">
                        <User className="w-4 h-4" /> Profile
                      </div>
                    </Link>
                    <Link href="/settings">
                      <div className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer transition-colors">
                        <Settings className="w-4 h-4" /> Settings
                      </div>
                    </Link>
                    
                    {/* Admin Link in Dropdown (Visible on Mobile/Desktop) */}
                    {isAdmin && (
                      <Link href="/admin">
                        <div className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg cursor-pointer transition-colors">
                          <ShieldAlert className="w-4 h-4" /> Admin Panel
                        </div>
                      </Link>
                    )}

                    <div className="h-px bg-slate-800 my-1 mx-2" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
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
        <div className="lg:hidden bg-slate-950/95 backdrop-blur-xl border-b border-slate-800 animate-in slide-in-from-top-5 duration-200 absolute w-full z-40">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link key={path} href={path}>
                <span className={cn(
                  "flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium transition-colors cursor-pointer",
                  location === path
                    ? "bg-emerald-600/10 text-emerald-400"
                    : "text-slate-300 hover:bg-slate-900 hover:text-white"
                )}>
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </span>
              </Link>
            ))}
            
            {isAdmin && (
              <Link href="/admin">
                <span className="flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium transition-colors cursor-pointer bg-red-500/10 text-red-400 mt-2">
                  <ShieldAlert className="w-5 h-5" />
                  <span>Admin Dashboard</span>
                </span>
              </Link>
            )}
          </div>
          
          <div className="border-t border-slate-800 p-4 bg-slate-900/50">
             <div className="flex items-center gap-3 mb-4 px-2">
               <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                 {getInitials(userInfo?.email)}
               </div>
               <div>
                   <p className="text-white font-medium text-sm">{userInfo?.email}</p>
                   <p className="text-slate-500 text-xs">Logged in</p>
               </div>
             </div>
             <div className="grid grid-cols-2 gap-2">
               <Link href="/profile">
                   <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800">
                       Profile
                   </Button>
               </Link>
               <Button onClick={handleLogout} variant="outline" className="w-full border-red-900/30 text-red-400 hover:bg-red-950/30 hover:text-red-300">
                   Logout
               </Button>
             </div>
          </div>
        </div>
      )}
    </header>
  );
}