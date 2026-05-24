import { Suspense, lazy, useEffect, useRef, useCallback } from "react";
import { Switch, Route, Redirect, useLocation } from "wouter";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

// Types
interface UserInfo {
  isAdmin?: boolean;
}

// Lazy Load Pages
const NotFound = lazy(() => import("@/pages/not-found"));
const LandingPage = lazy(() => import("@/pages/LandingPage"));
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Arbitrage = lazy(() => import("@/pages/Arbitrage"));
const Forex = lazy(() => import("@/pages/Forex"));
const Futures = lazy(() => import("@/pages/Futures"));
const Wallet = lazy(() => import("@/pages/Wallet" ));
const Admin = lazy(() => import("@/pages/Admin"));
const Profile = lazy(() => import("@/pages/Profile"));
const Settings = lazy(() => import("@/pages/Settings"));
const AdminLogin = lazy(() => import("@/pages/AdminLogin"));

// ──────────────────────────────────────────────────────────────
// UTILS
// ──────────────────────────────────────────────────────────────

// Centralized logout
const clearAuth = () => {
  sessionStorage.clear(); 
  localStorage.removeItem("token"); 
  localStorage.removeItem("isAdmin"); 
  queryClient.clear();
};

//  Explicit Fetcher to ensure Token is sent
const authenticatedFetcher = async <T,>(context: { queryKey: readonly unknown[] }): Promise<T> => {
  const [path] = context.queryKey as string[];
  const token = sessionStorage.getItem("token");
  
  if (!token) throw new Error("No token found");

  const res = await fetch(path, {
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}` 
    }
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || "Request failed");
  }
  return res.json() as T;
};

/**
 * useIdleTimer
 * Automatically logs out the user after 15 minutes of inactivity.
 */
function useIdleTimer() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const IDLE_LIMIT = 15 * 60 * 1000; 

  const logoutUser = useCallback(() => {
    if (sessionStorage.getItem("token")) {
      clearAuth();
      setLocation("/login");
      toast({
        title: "Session Expired",
        description: "You have been logged out due to inactivity.",
        variant: "destructive",
      });
    }
  }, [setLocation, toast]);

  const resetTimer = useCallback(() => {
    if (!sessionStorage.getItem("token")) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(logoutUser, IDLE_LIMIT);
  }, [logoutUser]);

  useEffect(() => {
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    const handleActivity = () => resetTimer();
    events.forEach((event) => window.addEventListener(event, handleActivity));
    resetTimer(); 

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((event) => window.removeEventListener(event, handleActivity));
    };
  }, [resetTimer]);
}

// ──────────────────────────────────────────────────────────────
// COMPONENTS
// ──────────────────────────────────────────────────────────────

const FullScreenLoader = ({ label = "Loading GAT System..." }: { label?: string }) => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />
    <div className="text-center relative z-10">
      <div className="relative w-20 h-20 mx-auto mb-6">
        <div className="absolute inset-0 border-4 border-emerald-900/30 rounded-full" />
        <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <div className="absolute inset-4 bg-emerald-500/10 rounded-full blur-sm animate-pulse" />
      </div>
      <p className="text-emerald-400 font-medium tracking-widest text-sm uppercase animate-pulse">
        {label}
      </p>
    </div>
  </div>
);

// ──────────────────────────────────────────────────────────────
// SECURITY GUARDS 
// ──────────────────────────────────────────────────────────────

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = sessionStorage.getItem("token");

  // Hook 1: Query (Now uses authenticatedFetcher)
  const { isLoading, isError } = useQuery({
    queryKey: ["/auth/user-info"],
    queryFn: authenticatedFetcher, // <--- CRITICAL FIX
    retry: false,
    staleTime: 1000 * 60 * 5, 
    enabled: !!token, 
  });

  // Hook 2: Effect
  useEffect(() => {
    if (isError || (!token && localStorage.getItem("token"))) {
      clearAuth();
    }
  }, [isError, token]);

  if (!token) return <Redirect to="/login" />;
  if (isError) return <Redirect to="/login" />;
  if (isLoading) return <FullScreenLoader />;

  return <>{children}</>;
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const token = sessionStorage.getItem("token");
  const isAdminStored = sessionStorage.getItem("isAdmin") === "true";

  // Hook 1: Query (Now uses authenticatedFetcher)
  const { isLoading, isError, data } = useQuery<UserInfo>({
    queryKey: ["/auth/user-info"],
    queryFn: authenticatedFetcher, // <--- CRITICAL FIX
    retry: false,
    enabled: !!token,
  });

  // Debugging Logs (Check browser console if it still fails)
  useEffect(() => {
    if (isError) console.error("Admin Check Failed: API Error");
  }, [isError]);

  // Fast Client-Side Check
  if (!token || !isAdminStored) {
    return <Redirect to="/admin-login" />;
  }

  // Waiting for server...
  if (isLoading) return <FullScreenLoader label="Verifying Admin Access..." />;

  // Server Side Verification
  if (isError) {
    clearAuth(); // Only clear auth if it's a real error (like expired token)
    return <Redirect to="/admin-login" />;
  }

  return <>{children}</>;
}

function PublicOnly({ children }: { children: React.ReactNode }) {
  const token = sessionStorage.getItem("token");
  return token ? <Redirect to="/dashboard" /> : <>{children}</>;
}

// ──────────────────────────────────────────────────────────────
// ROUTING
// ──────────────────────────────────────────────────────────────

function Router() {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <Switch>
        {/* PUBLIC ROUTES */}
        <Route path="/" component={LandingPage} />
        
        <Route path="/login">
          <PublicOnly><Login /></PublicOnly>
        </Route>
        
        <Route path="/register">
          <PublicOnly><Register /></PublicOnly>
        </Route>
        
        <Route path="/reset-password">
          <PublicOnly><ResetPassword /></PublicOnly>
        </Route>

        {/* Note: Admin Login is NOT wrapped in PublicOnly so you can re-login if session expires */}
        <Route path="/admin-login" component={AdminLogin} />

        {/* PROTECTED ROUTES */}
        <Route path="/dashboard">
          <RequireAuth><Dashboard /></RequireAuth>
        </Route>
        <Route path="/arbitrage">
          <RequireAuth><Arbitrage /></RequireAuth>
        </Route>
        <Route path="/forex">
          <RequireAuth><Forex /></RequireAuth>
        </Route>
        <Route path="/futures">
          <RequireAuth><Futures /></RequireAuth>
        </Route>
        <Route path="/wallet">
          <RequireAuth><Wallet /></RequireAuth>
        </Route>
        <Route path="/profile">
          <RequireAuth><Profile /></RequireAuth>
        </Route>
        <Route path="/settings">
          <RequireAuth><Settings /></RequireAuth>
        </Route>

        {/* ADMIN ROUTES */}
        <Route path="/admin">
          <RequireAdmin><Admin /></RequireAdmin>
        </Route>

        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  useIdleTimer();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
