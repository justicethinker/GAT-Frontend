import { Layout } from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useLocation } from "wouter";
import { useMemo, useEffect } from "react";

// --- TYPES (Derived from OAS 3.1 Docs) ---

interface Trade {
  id: number;
  symbol: string;
  side: "BUY" | "SELL";
  status: "PENDING" | "COMPLETED" | "ACTIVE" | "OPEN";
  profit_loss: string | number;
  amount: string | number;
}

interface Notification {
  id: number;
  action: string;
  details: string;
  created_at: string;
}

interface Transaction {
  amount: string | number;
  currency?: string;
  created_at?: string;
}

// --- CONFIGURATION ---

// We target OUR local proxy (routes.ts), not the external API directly.
// This avoids CORS and leverages the middleware logic we wrote.
const PROXY_BASE = ""; 

// --- ROBUST FETCHER ---
const authenticatedFetcher = async ({ queryKey }: any) => {
  const [path] = queryKey;
  const token = sessionStorage.getItem("token");

  // If no token, we can't fetch. Throw specific error to catch in UI.
  if (!token) {
    throw new Error("No authentication token found");
  }

  const res = await fetch(`${PROXY_BASE}${path}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`, // Pass to routes.ts, which forwards it
    },
  });

  if (res.status === 401) {
    sessionStorage.removeItem("token");
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || `Error fetching ${path}`);
  }

  return res.json();
};

export default function Dashboard() {
  const [, setLocation] = useLocation();

  // --- DATA FETCHING ---

  // 1. Recent Trades
  const { data: recentTrades = [], isLoading: tradesLoading, error: tradesError } = useQuery<Trade[]>({
    queryKey: ["/dash/recent-trades"],
    queryFn: authenticatedFetcher,
    retry: 1,
  });

  // 2. Notifications
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/dash/notification"],
    queryFn: authenticatedFetcher,
  });

  // 3. Deposits
  const { data: deposits = [], isLoading: depLoading } = useQuery<Transaction[]>({
    queryKey: ["/dash/deposits"],
    queryFn: authenticatedFetcher,
  });

  // 4. Withdrawals
  const { data: withdrawals = [], isLoading: withLoading } = useQuery<Transaction[]>({
    queryKey: ["/dash/withdrawals"],
    queryFn: authenticatedFetcher,
  });

  // --- AUTH GUARD ---
  useEffect(() => {
    if (tradesError?.message === "UNAUTHORIZED") {
      setLocation("/auth"); // Redirect to login on 401
    }
  }, [tradesError, setLocation]);

  // --- STATS CALCULATION ---
  // Replaces the missing /dash/stats endpoint
  const stats = useMemo(() => {
    const safeFloat = (val: string | number | undefined) => {
      if (typeof val === 'number') return val;
      if (typeof val === 'string') return parseFloat(val);
      return 0;
    };

    const totalDeposits = deposits.reduce((acc, d) => acc + safeFloat(d.amount), 0);
    const totalWithdrawals = withdrawals.reduce((acc, w) => acc + safeFloat(w.amount), 0);
    const totalPnL = recentTrades.reduce((acc, t) => acc + safeFloat(t.profit_loss), 0);
    
    // Core Balance Logic
    const calculatedBalance = totalDeposits - totalWithdrawals + totalPnL;

    // Win Rate Logic
    const finishedTrades = recentTrades.filter(t => t.status === 'COMPLETED' || t.status === 'CLOSED');
    const winningTrades = finishedTrades.filter(t => safeFloat(t.profit_loss) > 0).length;
    
    const winRate = finishedTrades.length > 0 
      ? ((winningTrades / finishedTrades.length) * 100).toFixed(1) 
      : "0.0";

    const activeTradesCount = recentTrades.filter(
      t => t.status === 'ACTIVE' || t.status === 'OPEN' || t.status === 'PENDING'
    ).length;

    // Balance Change % (PnL / Total Deposits)
    const balanceChange = totalDeposits > 0 
      ? ((totalPnL / totalDeposits) * 100).toFixed(2) 
      : "0.00";

    return {
      total_balance: calculatedBalance > 0 ? calculatedBalance : 0,
      total_pnl: totalPnL,
      active_trades: activeTradesCount,
      win_rate: winRate,
      balance_change_percent: balanceChange
    };
  }, [deposits, withdrawals, recentTrades]);

  const isLoading = tradesLoading || depLoading || withLoading;

  // --- WALLET MOCKUP ---
  // Since the backend has no "get_wallets" endpoint, we simulate distribution
  // based on the total balance calculated above.
  const wallets = [
    { 
      name: "Arbitrage", 
      abbreviation: "AR", 
      type: "arb", 
      balance: stats.total_balance * 0.4, 
      value: stats.total_balance * 0.4, 
      color: "bg-purple-600", 
      link: "/arbitrage" 
    },
    { 
      name: "Forex", 
      abbreviation: "FX", 
      type: "forex", 
      balance: stats.total_balance * 0.3, 
      value: stats.total_balance * 0.3, 
      color: "bg-blue-600", 
      link: "/forex" 
    },
    { 
      name: "Futures", 
      abbreviation: "FU", 
      type: "fut", 
      balance: stats.total_balance * 0.3, 
      value: stats.total_balance * 0.3, 
      color: "bg-yellow-600", 
      link: "/futures" 
    },
  ];

  return (
    <Layout>
      <div className="w-full px-3 sm:px-6 lg:px-8 py-4 lg:py-8">
        
        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6">
          
          {/* Total Balance Card */}
          <Card className="bg-gray-900 border-gray-800 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg border flex items-center justify-center bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                <i className="ri-wallet-3-line text-lg"></i>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${parseFloat(stats.balance_change_percent) >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {isLoading ? "..." : (parseFloat(stats.balance_change_percent) >= 0 ? '+' : '') + stats.balance_change_percent + "%"}
              </div>
            </div>
            <div>
              <h3 className="text-gray-400 text-xs font-medium mb-1">Total Balance</h3>
              <p className="text-white text-xl lg:text-2xl font-bold">
                {isLoading ? <Skeleton className="h-8 w-32 bg-gray-800" /> : `$${stats.total_balance.toLocaleString('en-US', {minimumFractionDigits: 2})}`}
              </p>
            </div>
          </Card>

          {/* P&L Card */}
          <Card className="bg-gray-900 border-gray-800 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg border flex items-center justify-center bg-green-500/10 text-green-400 border-green-500/20">
                <i className="ri-line-chart-line text-lg"></i>
              </div>
            </div>
            <div>
              <h3 className="text-gray-400 text-xs font-medium mb-1">Total P&L</h3>
              <p className={`text-xl lg:text-2xl font-bold ${stats.total_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {isLoading ? <Skeleton className="h-8 w-32 bg-gray-800" /> : `${stats.total_pnl >= 0 ? '+' : ''}$${stats.total_pnl.toLocaleString('en-US', {minimumFractionDigits: 2})}`}
              </p>
            </div>
          </Card>

          {/* Active Trades Card */}
          <Card className="bg-gray-900 border-gray-800 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg border flex items-center justify-center bg-blue-500/10 text-blue-400 border-blue-500/20">
                <i className="ri-exchange-line text-lg"></i>
              </div>
            </div>
            <div>
              <h3 className="text-gray-400 text-xs font-medium mb-1">Active Trades</h3>
              <p className="text-white text-xl lg:text-2xl font-bold">
                {isLoading ? <Skeleton className="h-8 w-16 bg-gray-800" /> : stats.active_trades}
              </p>
            </div>
          </Card>

          {/* Win Rate Card */}
          <Card className="bg-gray-900 border-gray-800 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg border flex items-center justify-center bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                <i className="ri-trophy-line text-lg"></i>
              </div>
            </div>
            <div>
              <h3 className="text-gray-400 text-xs font-medium mb-1">Win Rate</h3>
              <p className="text-white text-xl lg:text-2xl font-bold">
                {isLoading ? <Skeleton className="h-8 w-20 bg-gray-800" /> : `${stats.win_rate}%`}
              </p>
            </div>
          </Card>
        </div>

        {/* --- MAIN LAYOUT SPLIT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: Wallets */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <div className="p-4 sm:p-6 border-b border-gray-800 flex justify-between items-center">
                <div>
                  <h2 className="text-white text-lg font-bold">Wallet Overview</h2>
                  <p className="text-gray-400 text-sm">Portfolio Distribution</p>
                </div>
                {/* Link to actual deposit/transfer pages */}
                <Link href="/wallet" className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors">
                  Deposit / Transfer
                </Link>
              </div>

              <div className="p-4 sm:p-6 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-gray-400 text-xs uppercase border-b border-gray-800">
                      <th className="text-left pb-3 font-medium">Asset</th>
                      <th className="text-right pb-3 font-medium">Balance</th>
                      <th className="text-right pb-3 font-medium">Value (USD)</th>
                      <th className="text-right pb-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {wallets.map((wallet) => (
                      <tr key={wallet.type} className="group hover:bg-gray-800/30 transition-colors">
                        <td className="py-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full ${wallet.color} flex items-center justify-center text-white text-xs font-bold`}>
                              {wallet.abbreviation}
                            </div>
                            <p className="text-white text-sm font-medium">{wallet.name}</p>
                          </div>
                        </td>
                        <td className="text-right py-4 text-white text-sm">
                          ${wallet.balance.toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </td>
                        <td className="text-right py-4 text-white text-sm font-medium">
                          ${wallet.value.toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </td>
                        <td className="text-right py-4">
                          <Link href={wallet.link} className="text-emerald-400 text-xs hover:text-emerald-300 font-medium">
                            Go to Trade &rarr;
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* RIGHT: Trades & Notifications */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Recent Trades */}
            <Card className="bg-gray-900 border-gray-800">
              <div className="p-4 border-b border-gray-800">
                <h3 className="text-white font-medium">Recent Activity</h3>
              </div>
              <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                {isLoading ? (
                  <Skeleton className="h-20 w-full bg-gray-800" />
                ) : recentTrades.length === 0 ? (
                  <p className="text-gray-500 text-center py-4 text-sm">No trades yet. Start trading!</p>
                ) : (
                  recentTrades.map((trade, idx) => {
                    const pnl = parseFloat(trade.profit_loss as string) || 0;
                    return (
                      <div key={trade.id || idx} className="flex items-center justify-between p-3 mb-2 bg-gray-800/40 rounded-lg hover:bg-gray-800 transition-colors">
                        <div>
                          <p className="text-white font-medium text-sm">{trade.symbol}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${trade.side === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {trade.side}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}
                          </p>
                          <p className="text-gray-500 text-[10px] uppercase">{trade.status}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>

            {/* Notifications */}
            <Card className="bg-gray-900 border-gray-800">
              <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                <h3 className="text-white font-medium">Notifications</h3>
                {notifications.length > 0 && (
                  <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full">
                    {notifications.length}
                  </span>
                )}
              </div>
              <div className="p-4 space-y-4">
                {notifications.length === 0 ? (
                  <p className="text-gray-500 text-xs text-center">All caught up!</p>
                ) : (
                  notifications.slice(0, 5).map((n, idx) => (
                    <div key={n.id || idx} className="flex gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      </div>
                      <div>
                        <p className="text-gray-300 text-xs leading-relaxed">{n.action} - {n.details}</p>
                        <p className="text-gray-600 text-[10px] mt-1">
                          {n.created_at ? new Date(n.created_at).toLocaleDateString() : 'Just now'}
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