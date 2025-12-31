import { Layout } from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { useMemo } from "react";

// --- CONFIGURATION ---
const API_BASE = "https://gat-zm1r.onrender.com";

// --- FETCHER FUNCTION ---
const defaultFetcher = async ({ queryKey }: any) => {
  const [path] = queryKey;
  const token = sessionStorage.getItem("token"); 
  
  const url = `${API_BASE}${path}`;
  
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    throw new Error(`Error fetching ${path}: ${res.statusText}`);
  }
  return res.json();
};

export default function Dashboard() {
  // 1. Fetch Real Data Streams
  const { data: recentTrades = [], isLoading: tradesLoading } = useQuery<any[]>({
    queryKey: ["/dash/recent-trades"],
    queryFn: defaultFetcher,
  });

  const { data: notifications = [] } = useQuery<any[]>({
    queryKey: ["/dash/notification"],
    queryFn: defaultFetcher,
  });

  const { data: deposits = [], isLoading: depLoading } = useQuery<any[]>({
    queryKey: ["/dash/deposits"],
    queryFn: defaultFetcher,
  });

  const { data: withdrawals = [], isLoading: withLoading } = useQuery<any[]>({
    queryKey: ["/dash/withdrawals"],
    queryFn: defaultFetcher,
  });

  // 2. CALCULATE STATS DYNAMICALLY (Since /dash/stats doesn't exist)
  const stats = useMemo(() => {
    // Helper to safely parse numbers
    const safeNum = (val: any) => parseFloat(val) || 0;

    // A. Total Deposits
    const totalDeposits = deposits.reduce((acc: number, d: any) => acc + safeNum(d.amount), 0);
    
    // B. Total Withdrawals
    const totalWithdrawals = withdrawals.reduce((acc: number, w: any) => acc + safeNum(w.amount), 0);
    
    // C. Trading Profit/Loss
    const totalPnL = recentTrades.reduce((acc: number, t: any) => acc + safeNum(t.profit_loss), 0);
    
    // D. Final Balance Calculation
    const totalBalance = totalDeposits - totalWithdrawals + totalPnL;

    // E. Win Rate Calculation
    const winningTrades = recentTrades.filter((t: any) => safeNum(t.profit_loss) > 0).length;
    const winRate = recentTrades.length > 0 
      ? ((winningTrades / recentTrades.length) * 100).toFixed(1) 
      : "0.0";

    // F. Active Trades Count
    const activeTrades = recentTrades.filter((t: any) => t.status === 'ACTIVE' || t.status === 'OPEN').length;

    // G. Today's P&L (Mock logic: assuming recent trades are sorted or filtered by backend)
    // For now, we'll just use total PnL of recent trades as "Today's" or similar
    const todayPnL = totalPnL; 

    return {
      total_balance: totalBalance > 0 ? totalBalance : 0, // Prevent negative balance display if data is weird
      today_pnl: todayPnL,
      active_trades: activeTrades,
      win_rate: winRate,
      balance_change_percent: totalDeposits > 0 ? ((totalPnL / totalDeposits) * 100).toFixed(2) + "%" : "0.00%"
    };
  }, [deposits, withdrawals, recentTrades]);

  const isLoading = tradesLoading || depLoading || withLoading;

  // 3. Wallet Logic (Derived from calculated stats)
  const wallets = [
    { 
      name: "Arbitrage", 
      abbreviation: "AR", 
      type: "arb", 
      balance: stats.total_balance * 0.4, // Simulating 40% allocation
      value: stats.total_balance * 0.4, 
      color: "bg-purple-600", 
      link: "/arbitrage" 
    },
    { 
      name: "Forex", 
      abbreviation: "FX", 
      type: "forex", 
      balance: stats.total_balance * 0.3, // Simulating 30% allocation
      value: stats.total_balance * 0.3, 
      color: "bg-blue-600", 
      link: "/forex" 
    },
    { 
      name: "Futures", 
      abbreviation: "FU", 
      type: "fut", 
      balance: stats.total_balance * 0.3, // Simulating 30% allocation
      value: stats.total_balance * 0.3, 
      color: "bg-yellow-600", 
      link: "/futures" 
    },
  ];

  return (
    <Layout>
      <div className="w-full px-3 sm:px-6 lg:px-8 py-4 lg:py-8">
        
        {/* TOP STATS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6">
          <Card className="bg-gray-900 border-gray-800 p-4 hover:border-gray-700 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg border flex items-center justify-center bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                <i className="ri-wallet-3-line text-lg"></i>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${parseFloat(stats.balance_change_percent) >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {isLoading ? "..." : (parseFloat(stats.balance_change_percent) >= 0 ? '+' : '') + stats.balance_change_percent}
              </div>
            </div>
            <div>
              <h3 className="text-gray-400 text-xs font-medium mb-1">Total Balance</h3>
              <p className="text-white text-xl lg:text-2xl font-bold">
                {isLoading ? <Skeleton className="h-8 w-32 bg-gray-800" /> : `$${stats.total_balance.toLocaleString('en-US', {minimumFractionDigits: 2})}`}
              </p>
            </div>
          </Card>

          <Card className="bg-gray-900 border-gray-800 p-4 hover:border-gray-700 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg border flex items-center justify-center bg-green-500/10 text-green-400 border-green-500/20">
                <i className="ri-line-chart-line text-lg"></i>
              </div>
            </div>
            <div>
              <h3 className="text-gray-400 text-xs font-medium mb-1">Total P&L</h3>
              <p className="text-white text-xl lg:text-2xl font-bold">
                {isLoading ? <Skeleton className="h-8 w-32 bg-gray-800" /> : `${stats.today_pnl >= 0 ? '+' : '-'}$${Math.abs(stats.today_pnl).toLocaleString('en-US', {minimumFractionDigits: 2})}`}
              </p>
            </div>
          </Card>

          <Card className="bg-gray-900 border-gray-800 p-4 hover:border-gray-700 transition-colors">
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

          <Card className="bg-gray-900 border-gray-800 p-4 hover:border-gray-700 transition-colors">
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

        {/* MAIN LAYOUT SPLIT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: Wallets & Asset Table */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <div className="p-4 sm:p-6 border-b border-gray-800">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div>
                    <h2 className="text-white text-lg font-bold">Wallet Overview</h2>
                    <p className="text-gray-400 text-sm">Portfolio Value: ${stats.total_balance.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
                  </div>
                  <div className="flex bg-gray-800 rounded-lg p-1 min-w-max">
                    <button className="px-3 py-1.5 text-sm font-medium rounded-md bg-emerald-600 text-white">All Time</button>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <h3 className="text-white font-medium mb-4">Assets</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-gray-400 text-xs uppercase border-b border-gray-800">
                        <th className="text-left pb-3 font-medium">Asset</th>
                        <th className="text-right pb-3 font-medium">Balance</th>
                        <th className="text-right pb-3 font-medium">Value</th>
                        <th className="text-right pb-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {wallets.map((wallet) => (
                        <tr key={wallet.type} className="group">
                          <td className="py-4">
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-full ${wallet.color} flex items-center justify-center text-white text-xs font-bold`}>
                                {wallet.abbreviation}
                              </div>
                              <p className="text-white text-sm font-medium">{wallet.name}</p>
                            </div>
                          </td>
                          <td className="text-right py-4 text-white text-sm">${(wallet.balance || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                          <td className="text-right py-4 text-white text-sm font-medium">${(wallet.value || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                          <td className="text-right py-4">
                            <div className="flex justify-end space-x-2">
                              <Link href={wallet.link} className="px-3 py-1.5 bg-emerald-600 text-white text-xs rounded hover:bg-emerald-700">Trade</Link>
                              <Link href="/wallet" className="px-3 py-1.5 bg-gray-700 text-white text-xs rounded hover:bg-gray-600">Transfer</Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN: Recent Trades & Notifications */}
          <div className="lg:col-span-4 space-y-6">
            {/* Recent Trades Section */}
            <Card className="bg-gray-900 border-gray-800">
              <div className="p-4 border-b border-gray-800">
                <h3 className="text-white font-medium">Recent Trades</h3>
              </div>
              <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                {isLoading ? (
                  <Skeleton className="h-20 w-full bg-gray-800" />
                ) : recentTrades.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No recent trades</p>
                ) : (
                  recentTrades.map((trade: any, idx: number) => (
                    <div key={trade.id || idx} className="flex items-center justify-between p-3 mb-2 bg-gray-800/50 rounded-lg">
                      <div>
                        <p className="text-white font-medium text-sm">{trade.symbol || "Unknown Pair"}</p>
                        <p className="text-gray-500 text-xs">{trade.side || "Trade"}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${(trade.profit_loss || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ${Math.abs(parseFloat(trade.profit_loss) || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Notifications Feed */}
            <Card className="bg-gray-900 border-gray-800">
              <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                <h3 className="text-white font-medium">Notifications</h3>
                <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full">{notifications.length}</span>
              </div>
              <div className="p-4 space-y-3">
                {notifications.length === 0 ? (
                    <p className="text-gray-500 text-xs text-center">No new notifications</p>
                ) : (
                    notifications.slice(0, 3).map((n: any, idx: number) => (
                    <div key={n.id || idx} className="border-l-2 border-emerald-500 pl-3 py-1">
                        <p className="text-white text-xs font-medium">{n.action || n.details || "Notification"}</p>
                        <p className="text-gray-500 text-[10px]">{n.created_at ? new Date(n.created_at).toLocaleDateString() : 'Just now'}</p>
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