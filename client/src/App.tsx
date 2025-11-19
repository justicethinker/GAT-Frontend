import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ResetPassword from "@/pages/ResetPassword";
import Dashboard from "@/pages/Dashboard";
import Arbitrage from "@/pages/Arbitrage";
import Forex from "@/pages/Forex";
import Futures from "@/pages/Futures";
import Wallet from "@/pages/Wallet";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const [, setLocation] = useLocation();
  const token = localStorage.getItem("token");

  const { data: userInfo, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user-info"],
    enabled: !!token,
    retry: false,
    onError: () => {
      localStorage.removeItem("token");
      queryClient.clear();
      setLocation("/login");
    },
  });

  if (!token) {
    return <Redirect to="/login" />;
  }

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

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <Redirect to="/dashboard" />} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/reset-password" component={ResetPassword} />
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
