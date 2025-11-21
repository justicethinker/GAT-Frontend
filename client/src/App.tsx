import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

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

// Helper to check basic token existence
const isAuthenticated = () => !!localStorage.getItem("token");

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const [, setLocation] = useLocation();
  const token = localStorage.getItem("token");

  // 1. Immediate check for token existence
  if (!token) {
    return <Redirect to="/login" />;
  }

  // 2. Verify token validity with backend
  const { isLoading, isError } = useQuery({
    queryKey: ["/auth/user-info"],
    enabled: !!token,
    retry: false,
  });

  // 3. Handle Invalid Token / Session Expiry
  if (isError) {
    localStorage.removeItem("token");
    queryClient.clear();
    return <Redirect to="/login" />;
  }

  // 4. Professional Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center relative overflow-hidden">
        {/* Background Effects */}
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

  // 5. Render Protected Component
  return <Component />;
}

function PublicRoute({ component: Component }: { component: React.ComponentType }) {
  // If user is already logged in, send them to dashboard instead of showing login/register
  return isAuthenticated() ? <Redirect to="/dashboard" /> : <Component />;
}

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={() => <PublicRoute component={Login} />} />
      <Route path="/register" component={() => <PublicRoute component={Register} />} />
      <Route path="/reset-password" component={() => <PublicRoute component={ResetPassword} />} />

      {/* Protected Routes */}
      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/arbitrage" component={() => <ProtectedRoute component={Arbitrage} />} />
      <Route path="/forex" component={() => <ProtectedRoute component={Forex} />} />
      <Route path="/futures" component={() => <ProtectedRoute component={Futures} />} />
      <Route path="/wallet" component={() => <ProtectedRoute component={Wallet} />} />
      <Route path="/profile" component={() => <ProtectedRoute component={Profile} />} />
      <Route path="/settings" component={() => <ProtectedRoute component={Settings} />} />
      <Route path="/admin" component={() => <ProtectedRoute component={Admin} />} />

      {/* Fallback */}
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