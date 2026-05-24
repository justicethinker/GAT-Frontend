import { useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { buildUrl } from "@/lib/api";
import { 
  Wallet, TrendingUp, Activity, Trophy, ArrowUpRight, 
  ArrowDownLeft, Bell, AlertCircle, Loader2 
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils"; // Assuming you have a class merger utility

// ──────────────────────────────────────────────────────────────
// 1. TYPES (Move to src/types/api.ts in real project)
// ──────────────────────────────────────────────────────────────

interface UserInfo {
  status: string;
  user_id: number;
  email: string;
  name: string | null;
  balance_forex: number;
  balance_arb: number;
  balance_fut: number;
  total_profit: number;
  total_pl: number;
  active_trade: number;
  win_rate: number;
}

interface Trade {
  id: number;
  symbol: string;
  side: "BUY" | "SELL";
  status: "PENDING" | "COMPLETED" | "ACTIVE" | "OPEN";
  profit_loss: string | number;
  amount: string | number;
  created_at?: string;
}

interface Notification {
  id: number;
  action: string;
  details: string;
  created_at: string;
  read: boolean;
}

interface WalletAsset {
  name: string;
  code: string;
  balance: number;
  color: string;
  link: string;
}

// ──────────────────────────────────────────────────────────────
// 2. UTILS & FORMATTERS
// ──────────────────────────────────────────────────────────────

const formatCurrency = (value: number) => 
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const formatPercent = (value: number) => 
  new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 1 }).format(value / 100);

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};

// Robust Fetcher with 401 handling
const authenticatedFetcher = async (context: { queryKey: readonly unknown[]; signal?: AbortSignal }) => {
  const { queryKey, signal } = context;
  const [path] = queryKey as [string];
  const token = sessionStorage.getItem("token");

  if (!token) throw new Error("UNAUTHORIZED");

  const res = await fetch(buildUrl(path), {
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}` 
    },
    signal,
  });

  if (res.status === 401) {
    sessionStorage.clear();
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || "API Error");
  }

  return res.json();
};

// ──────────────────────────────────────────────────────────────
// 3. SUB-COMPONENTS
// ──────────────────────────────────────────────────────────────

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  isLoading, 
  colorClass 
}: { 
  title: string; 
  value: string | number; 
  icon: any; 
  trend?: React.ReactNode; 
  isLoading: boolean;
  colorClass: string; 
}) => (
  <Card className="bg-card border border-border p-5 rounded-xl transition-all hover:border-primary/40 relative overflow-hidden shadow-lg group">
    <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/5 -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-300" />
    <div className="flex items-start justify-between relative">
      <div className="flex-1">
        <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider font-grotesk mb-1">{title}</h3>
        {isLoading ? (
          <Skeleton className="h-8 w-3/4 bg-secondary" />
        ) : (
          <p className="text-white text-2xl font-grotesk font-700 tracking-tight mt-1">{value}</p>
        )}
        {trend && <div className="mt-2.5 flex items-center font-grotesk text-xs">{trend}</div>}
      </div>
      {Icon && (
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 border border-primary/20 shrink-0 shadow-sm", colorClass.split(" ")[1] || "text-primary")}>
          <Icon className="w-5 h-5" />
        </div>
      )}
    </div>
  </Card>
);

const TransactionItem = ({ trade }: { trade: Trade }) => {
  const pnl = Number(trade.profit_loss);
  const isProfit = pnl >= 0;

  return (
    <div className="group flex items-center justify-between p-3.5 rounded-xl bg-secondary/30 hover:bg-secondary/60 border border-transparent hover:border-border transition-all font-grotesk">
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
          trade.side === 'BUY' ? "bg-primary/10 text-primary border border-primary/20" : "bg-destructive/10 text-destructive border border-destructive/20"
        )}>
          {trade.side === 'BUY' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
        </div>
        <div>
          <p className="text-white font-700 text-sm leading-none mb-1">{trade.symbol}</p>
          <span className={cn("text-[9px] font-700 px-1.5 py-0.5 rounded uppercase tracking-wider block w-fit leading-none", trade.side === 'BUY' ? "text-primary bg-primary/10" : "text-destructive bg-destructive/10")}>
            {trade.side}
          </span>
        </div>
      </div>
      <div className="text-right">
        <p className={cn("text-sm font-700 font-mono", isProfit ? "text-green-400" : "text-destructive")}>
          {isProfit ? '+' : ''}{formatCurrency(pnl)}
        </p>
        <p className="text-slate-500 text-[9px] uppercase font-bold tracking-wider mt-0.5">{trade.status}</p>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────
// 4. MAIN COMPONENT
// ──────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [, setLocation] = useLocation();

  // --- DATA FETCHING ---
  const { data: userInfo, isLoading: userLoading, error: userError } = useQuery<UserInfo>({
    queryKey: ["/auth/user-info"],
    queryFn: authenticatedFetcher,
    retry: 1,
  });

  const { data: recentTrades = [], isLoading: tradesLoading } = useQuery<Trade[]>({
    queryKey: ["/dash/recent-trades"],
    queryFn: authenticatedFetcher,
  });

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/dash/notification"],
    queryFn: authenticatedFetcher,
  });

  // --- AUTH GUARD ---
  useEffect(() => {
    if (userError?.message === "UNAUTHORIZED") {
      setLocation("/login");
    }
  }, [userError, setLocation]);

  // --- DERIVED STATE ---
  const stats = useMemo(() => {
    if (!userInfo) return null;
    return {
      totalBalance: (userInfo.balance_arb || 0) + (userInfo.balance_forex || 0) + (userInfo.balance_fut || 0),
      totalPnl: userInfo.total_pl || 0,
      activeTrades: userInfo.active_trade || 0,
      winRate: userInfo.win_rate || 0,
      totalProfit: userInfo.total_profit || 0
    };
  }, [userInfo]);

  const wallets: WalletAsset[] = useMemo(() => [
    { name: "Arbitrage", code: "ARB", balance: userInfo?.balance_arb || 0, color: "bg-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.3)]", link: "/arbitrage" },
    { name: "Forex", code: "FX", balance: userInfo?.balance_forex || 0, color: "bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]", link: "/forex" },
    { name: "Futures", code: "FUT", balance: userInfo?.balance_fut || 0, color: "bg-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.3)]", link: "/futures" },
  ], [userInfo]);

  const isLoading = userLoading || tradesLoading;

  // --- ERROR STATE ---
  if (userError && userError.message !== "UNAUTHORIZED") {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 font-grotesk">
          <AlertCircle className="w-16 h-16 text-destructive mb-4 glow-primary" />
          <h2 className="text-2xl font-bold text-white mb-2">Failed to load dashboard</h2>
          <p className="text-slate-400 text-sm mb-6 max-w-sm">We couldn't fetch your account data. Please check your connection.</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/95 shadow-lg glow-primary transition-all">
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
        
        {/* Header Greeting */}
        <div className="mb-8">
          <h1 className="text-3xl font-grotesk font-700 text-white tracking-tight">
            {getGreeting()}, <span className="text-primary glow-text">{userInfo?.name?.split(' ')[0] || 'Trader'}</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Here is what's happening with your portfolio today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            title="Total Balance" 
            value={stats ? formatCurrency(stats.totalBalance) : "$0.00"} 
            icon={Wallet} 
            isLoading={isLoading}
            colorClass="bg-primary/10 text-primary border-primary/20"
            trend={stats && <span className="text-primary font-bold">Profit: {formatCurrency(stats.totalProfit)}</span>}
          />
          <StatCard 
            title="Total P&L" 
            value={stats ? formatCurrency(stats.totalPnl) : "$0.00"} 
            icon={TrendingUp} 
            isLoading={isLoading}
            colorClass="bg-primary/10 text-primary border-primary/20"
            trend={
              <span className={cn("font-bold flex items-center gap-1", (stats?.totalPnl || 0) >= 0 ? "text-green-400" : "text-destructive")}>
                {((stats?.totalPnl || 0) >= 0 ? '▲' : '▼')} All Time
              </span>
            }
          />
          <StatCard 
            title="Active Trades" 
            value={stats?.activeTrades || 0} 
            icon={Activity} 
            isLoading={isLoading}
            colorClass="bg-primary/10 text-primary border-primary/20"
          />
          <StatCard 
            title="Win Rate" 
            value={stats ? formatPercent(stats.winRate) : "0%"} 
            icon={Trophy} 
            isLoading={isLoading}
            colorClass="bg-primary/10 text-primary border-primary/20"
          />
        </div>

        {/* Main Content Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: Wallets Table */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="bg-card border border-border rounded-xl overflow-hidden shadow-lg">
              <div className="p-6 border-b border-border flex flex-row justify-between items-center font-grotesk">
                <div>
                  <h2 className="text-lg font-bold text-white leading-none">Assets</h2>
                  <p className="text-slate-400 text-xs mt-1.5">Your portfolio distribution</p>
                </div>
                <Link href="/wallet" className="px-4 py-2 bg-secondary text-foreground text-xs font-semibold rounded-lg hover:bg-secondary/80 border border-border transition-colors">
                  Manage Wallet
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-grotesk">
                  <thead className="bg-secondary/20 border-b border-border/50 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Asset</th>
                      <th className="px-6 py-4 text-right">Balance</th>
                      <th className="px-6 py-4 text-right">Value (USD)</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50 text-sm">
                    {wallets.map((wallet) => (
                      <tr key={wallet.code} className="group hover:bg-secondary/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0", wallet.color)}>
                              {wallet.code.substring(0, 2)}
                            </div>
                            <div>
                              <p className="text-white font-semibold text-sm leading-none mb-1">{wallet.name}</p>
                              <p className="text-slate-500 text-xs tracking-wider leading-none">{wallet.code}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-slate-350 font-mono text-sm">
                          {isLoading ? <Skeleton className="h-4 w-20 ml-auto bg-secondary" /> : formatCurrency(wallet.balance)}
                        </td>
                        <td className="px-6 py-4 text-right text-white font-bold font-mono text-sm">
                          {isLoading ? <Skeleton className="h-4 w-20 ml-auto bg-secondary" /> : formatCurrency(wallet.balance)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href={wallet.link} className="text-primary text-xs font-bold hover:glow-text hover:underline tracking-wider">
                            TRADE
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* RIGHT: Activity & Notifications */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Recent Activity */}
            <Card className="bg-card border border-border h-[400px] flex flex-col rounded-xl shadow-lg">
              <div className="p-5 border-b border-border font-grotesk">
                <h3 className="text-white font-bold text-sm">Recent Trades</h3>
              </div>
              <div className="p-4 flex-1 overflow-y-auto space-y-2">
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-14 w-full bg-secondary rounded-xl" />)
                ) : recentTrades.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 font-grotesk text-center">
                    <Activity className="w-10 h-10 mb-2 opacity-25" />
                    <p className="text-sm">No recent trading activity.</p>
                  </div>
                ) : (
                  recentTrades.map((trade, idx) => <TransactionItem key={trade.id || idx} trade={trade} />)
                )}
              </div>
            </Card>

            {/* Notifications */}
            <Card className="bg-card border border-border rounded-xl shadow-lg font-grotesk">
              <div className="p-5 border-b border-border flex justify-between items-center">
                <h3 className="text-white font-bold text-sm">Notifications</h3>
                <Bell className="w-4 h-4 text-primary animate-pulse" />
              </div>
              <div className="p-4 space-y-4">
                {notifications.length === 0 ? (
                   <p className="text-slate-500 text-xs text-center py-4">You are all caught up!</p>
                ) : (
                  notifications.slice(0, 4).map((n, idx) => (
                    <div key={n.id || idx} className="flex gap-3 group">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-2 h-2 rounded-full bg-primary ring-4 ring-primary/10 group-hover:ring-primary/20 transition-all"></div>
                      </div>
                      <div>
                        <p className="text-slate-200 text-sm font-medium leading-none mb-1.5">{n.action}</p>
                        <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">{n.details}</p>
                        <p className="text-slate-600 text-[10px] mt-1 font-mono">
                          {n.created_at ? new Date(n.created_at).toLocaleDateString() : 'Today'}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

          </div>
        </div>
      </div>
    </Layout>
  );
}