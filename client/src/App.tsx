import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster"; // Reverting to alias
import { TooltipProvider } from "@/components/ui/tooltip"; // Reverting to alias
import NotFound from "@/pages/not-found"; // Reverting to alias
import LandingPage from "@/pages/LandingPage"; // Reverting to alias
import Login from "@/pages/Login"; // Reverting to alias
import Register from "@/pages/Register"; // Reverting to alias
import ResetPassword from "@/pages/ResetPassword"; // Reverting to alias
import Dashboard from "@/pages/Dashboard"; // Reverting to alias
import Arbitrage from "@/pages/Arbitrage"; // Reverting to alias
import Forex from "@/pages/Forex"; // Reverting to alias
import Futures from "@/pages/Futures"; // Reverting to alias
import Wallet from "@/pages/Wallet"; // Reverting to alias

// Helper function for AuthGuard: Checks for local token presence
const isAuthenticated = () => !!localStorage.getItem("token");

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const [, setLocation] = useLocation();
  const token = localStorage.getItem("token");

  // 1. Initial AuthGuard check (Local Token)
  if (!token) {
    return <Redirect to="/Login" />; // Redirect to /login path
  }

  // 2. Server Validation Check (Token Validity)
  const { data: userInfo, isLoading, error } = useQuery({
    queryKey: ["/auth/user-info"],
    enabled: !!token,
    retry: false,
    onError: () => {
      // If server validation fails (e.g., expired token), clear and redirect
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

  if (error || !userInfo) {
    localStorage.removeItem("token");
    queryClient.clear();
    return <Redirect to="/login" />;
  }

  return <Component />;
}

// Helper component to redirect authenticated users away from public pages
function PublicRoute({ component: Component }: { component: React.ComponentType }) {
    return isAuthenticated() ? <Redirect to="/dashboard" /> : <Component />;
}

function Router() {
  return (
    <Switch>
      {/* ROOT PATH: If authenticated, redirect to /dashboard. Otherwise, show LandingPage. */}
      <Route path="/" component={() => (isAuthenticated() ? <Redirect to="/dashboard" /> : <LandingPage />)} />

      {/* PUBLIC ROUTES: Use PublicRoute to prevent access if logged in */}
      <Route path="/login" component={() => <PublicRoute component={Login} />} />
      <Route path="/register" component={() => <PublicRoute component={Register} />} />
      <Route path="/reset-password" component={() => <PublicRoute component={ResetPassword} />} />
      
      {/* PROTECTED ROUTES (All use the AuthGuard: ProtectedRoute) */}
      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/arbitrage" component={() => <ProtectedRoute component={Arbitrage} />} />
      <Route path="/forex" component={() => <ProtectedRoute component={Forex} />} />
      <Route path="/futures" component={() => <ProtectedRoute component={Futures} />} />
      <Route path="/wallet" component={() => <ProtectedRoute component={Wallet} />} />
      
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