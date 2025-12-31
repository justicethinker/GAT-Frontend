import { useEffect, useState } from "react";
import { Switch, Route, Redirect, useLocation } from "wouter";
import { create } from "zustand";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Pages
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/LandingPage";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ResetPassword from "@/pages/ResetPassword";
import Dashboard from "@/pages/Dashboard";
import Arbitrage from "@/pages/Arbitrage";
import Forex from "@/pages/Forex";
import Futures from "@/pages/Futures";
import Wallet from "@/pages/Wallet";
import Admin from "@/pages/Admin";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";

// ──────────────────────────────────────────────────────────────
// GLOBAL ADMIN GATE STORE
// ──────────────────────────────────────────────────────────────
const useAdminGate = create<{
  isOpen: boolean;
  open: () => void;
  close: () => void;
}>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

// ──────────────────────────────────────────────────────────────
// ADMIN ID PROMPT DIALOG
// ──────────────────────────────────────────────────────────────
function AdminIdPrompt() {
  const { isOpen, close } = useAdminGate();
  const [, setLocation] = useLocation(); 
  const [value, setValue] = useState("");

  // CHANGE THIS TO YOUR REAL SECRET (also set in your backend .env as ADMIN_ID)
  const CORRECT_ADMIN_ID = "gatadmin2025";

  const handleConfirm = () => {
    if (value.trim() === CORRECT_ADMIN_ID) {
      // 1. Set the flag
      sessionStorage.setItem("isAdmin", "true");
      
      // 2. Close the dialog
      close();

      // 3. Navigate with a tiny delay. 
      // This ensures sessionStorage is written BEFORE the new route mounts and checks it.
      setTimeout(() => {
        setLocation("/admin");
      }, 100);

    } else {
      alert("Incorrect Admin ID");
      setValue("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl">Admin Access Required</DialogTitle>
          <DialogDescription className="text-gray-400">
            Enter the admin ID to access the admin dashboard.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <Input
            type="password"
            placeholder="••••••••••••"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-emerald-500"
            autoFocus
          />

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
            >
              Enter Admin Dashboard
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ──────────────────────────────────────────────────────────────
// AUTH HELPERS
// ──────────────────────────────────────────────────────────────
const isAuthenticated = () => !!sessionStorage.getItem("token");

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const [, setLocation] = useLocation();
  const token = sessionStorage.getItem("token");

  if (!token) return <Redirect to="/login" />;

  const { isLoading, isError } = useQuery({
    queryKey: ["/auth/user-info"],
    enabled: !!token,
    retry: false,
  });

  if (isError) {
    sessionStorage.removeItem("token");
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin"); // cleanup
    queryClient.clear();
    return <Redirect to="/login" />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="text-center relative z-10">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-emerald-900/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-4 bg-emerald-500/10 rounded-full blur-sm animate-pulse"></div>
          </div>
          <p className="text-emerald-400 font-medium tracking-widest text-sm uppercase animate-pulse">
            Loading GAT System...
          </p>
        </div>
      </div>
    );
  }

  return <Component />;
}

function PublicRoute({ component: Component }: { component: React.ComponentType }) {
  return isAuthenticated() ? <Redirect to="/dashboard" /> : <Component />;
}

// ──────────────────────────────────────────────────────────────
// ADMIN GUARD (New Component)
// ──────────────────────────────────────────────────────────────
// This component performs the check EXACTLY when the route is hit.
function AdminGuard() {
  const isAdmin = sessionStorage.getItem("isAdmin") === "true";

  if (!isAdmin) {
    return <Redirect to="/dashboard" />;
  }

  return <ProtectedRoute component={Admin} />;
}

// ──────────────────────────────────────────────────────────────
// ROUTER + GLOBAL ADMIN BUTTON HANDLER
// ──────────────────────────────────────────────────────────────
function Router() {
  const [, setLocation] = useLocation();
  const openAdminGate = useAdminGate((s) => s.open);

  // Expose global function so ANY header button can trigger it
  useEffect(() => {
    // @ts-ignore - we're intentionally adding to window
    window.goToAdmin = () => {
      if (sessionStorage.getItem("isAdmin") === "true") {
        setLocation("/admin");
      } else {
        openAdminGate();
      }
    };

    // Cleanup on unmount
    return () => {
      // @ts-ignore
      delete window.goToAdmin;
    };
  }, [setLocation, openAdminGate]);

  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={() => <PublicRoute component={Login} />} />
      <Route path="/register" component={() => <PublicRoute component={Register} />} />
      <Route path="/reset-password" component={() => <PublicRoute component={ResetPassword} />} />

      {/* Protected User Routes */}
      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/arbitrage" component={() => <ProtectedRoute component={Arbitrage} />} />
      <Route path="/forex" component={() => <ProtectedRoute component={Forex} />} />
      <Route path="/futures" component={() => <ProtectedRoute component={Futures} />} />
      <Route path="/wallet" component={() => <ProtectedRoute component={Wallet} />} />
      <Route path="/profile" component={() => <ProtectedRoute component={Profile} />} />
      <Route path="/settings" component={() => <ProtectedRoute component={Settings} />} />

      {/* ADMIN ROUTE – Uses the new Guard component */}
      <Route path="/admin" component={AdminGuard} />

      <Route component={NotFound} />
    </Switch>
  );
}

// ──────────────────────────────────────────────────────────────
// MAIN APP
// ──────────────────────────────────────────────────────────────
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <AdminIdPrompt />  {/* Always rendered, but only shows when triggered */}
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;