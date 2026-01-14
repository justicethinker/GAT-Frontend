import { Link, useLocation } from "wouter";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { 
  Menu, 
  X, 
  Bell, 
  User, 
  LogOut, 
  LayoutDashboard, 
  ArrowRightLeft, 
  TrendingUp, 
  Wallet, 
  Settings, 
  ChevronDown,
  Shield 
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  const { data: userInfo } = useQuery<{ email: string }>({
    queryKey: ["/auth/user-info"],
    retry: false,
  });

  // Sample notifications logic
  const { data: notifications = [] } = useQuery<Array<{
    id: number;
    action: string;
    details: string | null;
    created_at: string;
  }>>({
    queryKey: ["/dash/notification"],
    retry: false,
  });

  // Click outside handler
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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    localStorage.removeItem("token");
    queryClient.clear();
    window.location.href = "/login";
  };



  const navLinks = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/arbitrage", label: "Arbitrage", icon: ArrowRightLeft },
    { path: "/futures", label: "Futures", icon: TrendingUp },
    { path: "/forex", label: "Forex", icon: Wallet },
    { path: "/wallet", label: "Wallet", icon: Wallet },
  ];

  const getInitials = (email?: string) => {
    if (!email) return "U";
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <header className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* LEFT: Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 -ml-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <Link href="/dashboard" className="flex items-center space-x-2 group">
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
                <span className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location === path
                    ? "bg-emerald-600/10 text-emerald-400 border border-emerald-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}>
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </span>
              </Link>
            ))}
          </nav>

          {/* RIGHT: Notifications, Admin & User Menu */}
          <div className="flex items-center space-x-3">
            
        

            {/* Notifications Dropdown */}
            <div className="relative" ref={notifMenuRef}>
              <button
                onClick={() => setNotifMenuOpen(!notifMenuOpen)}
                className={`p-2.5 rounded-full transition-colors relative ${notifMenuOpen ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-slate-900"></span>
                )}
              </button>

              {notifMenuOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-slate-900 rounded-xl shadow-2xl border border-slate-800 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-3 border-b border-slate-800 bg-slate-900/50">
                    <h3 className="text-sm font-semibold text-white">Notifications</h3>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-sm">
                      No new notifications
                    </div>
                  ) : (
                    <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                      {notifications.map((notif) => (
                        <div key={notif.id} className="p-3 border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors">
                          <p className="text-slate-200 text-sm font-medium">{notif.action}</p>
                          {notif.details && <p className="text-slate-400 text-xs mt-0.5">{notif.details}</p>}
                          <p className="text-slate-600 text-[10px] mt-1.5">{new Date(notif.created_at).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 p-1 pr-2 rounded-full border border-slate-800 hover:bg-slate-800 hover:border-slate-700 transition-all"
              >
                <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-emerald-900/20">
                  {getInitials(userInfo?.email)}
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-slate-900 rounded-xl shadow-2xl border border-slate-800 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                    <p className="text-sm font-medium text-white truncate">{userInfo?.email}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Basic Plan</p>
                  </div>
                  <div className="p-1">
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
                    <div className="h-px bg-slate-800 my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
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

      {/* MOBILE NAVIGATION MENU (Slide Down) */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-b border-slate-800 animate-in slide-in-from-top-5 duration-200">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link key={path} href={path}>
                <span className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                  location === path
                    ? "bg-emerald-600/10 text-emerald-400"
                    : "text-slate-300 hover:bg-slate-900 hover:text-white"
                }`}>
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </span>
              </Link>
            ))}
          </div>
          <div className="border-t border-slate-800 p-4">
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