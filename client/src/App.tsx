import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

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

// ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
// NEW IMPORTS FOR PROFILE & SETTINGS
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
// ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←

// Helper function for AuthGuard: Checks for local token presence
const isAuthenticated = () => !!localStorage.getItem("token");

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const [, setLocation] = useLocation();
  const token = localStorage.getItem("token");

  if (!token) {
    return <Redirect to="/login" />;
  }

  const { isLoading, error } = useQuery({
    queryKey: ["/auth/user-info"],
    enabled: !!token,
    retry: false,
    onError: () => {
      localStorage.removeItem("token");
      queryClient.clear();
      setLocation("/login");
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    localStorage.removeItem("token");
    queryClient.clear();
    return <Redirect to="/login" />;
  }

  return <Component />;
}

function PublicRoute({ component: Component }: { component: React.ComponentType }) {
  return isAuthenticated() ? <Redirect to="/dashboard" /> : <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => (isAuthenticated() ? <Redirect to="/dashboard" /> : <LandingPage />)} />

      <Route path="/login" component={() => <PublicRoute component={Login} />} />
      <Route path="/register" component={() => <PublicRoute component={Register} />} />
      <Route path="/reset-password" component={() => <PublicRoute component={ResetPassword} />} />

      {/* PROTECTED ROUTES */}
      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/arbitrage" component={() => <ProtectedRoute component={Arbitrage} />} />
      <Route path="/forex" component={() => <ProtectedRoute component={Forex} />} />
      <Route path="/futures" component={() => <ProtectedRoute component={Futures} />} />
      <Route path="/wallet" component={() => <ProtectedRoute component={Wallet} />} />
      <Route path="/admin" component={() => <ProtectedRoute component={Admin} />} />

      {/* ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←← */}
      {/* NEW PROTECTED ROUTES */}
      <Route path="/profile" component={() => <ProtectedRoute component={Profile} />} />
      <Route path="/settings" component={() => <ProtectedRoute component={Settings} />} />
      {/* ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←← */}

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;