import { Layout } from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/dash/stats"],
    retry: false,
  });

  const { data: recentTrades = [], isLoading: tradesLoading } = useQuery<any[]>({
    queryKey: ["/dash/recent-trades"],
    retry: false,
  });

  const wallets = [
    { name: "Arbitrage", abbreviation: "AR", type: "arb", balance: 0, value: 0, change: 0, color: "bg-purple-600", link: "/arbitrage" },
    { name: "Forex", abbreviation: "FX", type: "forex", balance: 0, value: 0, change: 0, color: "bg-blue-600", link: "/forex" },
    { name: "Futures", abbreviation: "FU", type: "fut", balance: 0, value: 0, change: 0, color: "bg-yellow-600", link: "/futures" },
  ];

  return (
    <Layout>
      {/* Main Container: Adjusted padding for cleaner mobile edges */}
      <div className="w-full px-3 sm:px-6 lg:px-8 py-4 lg:py-8">
        
        {/* TOP STATS GRID */}
        {/* Reduced gap on mobile (gap-3) to fit more content without scrolling */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6">
          <Card className="bg-gray-900 border-gray-800 p-4 hover:border-gray-700 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg border flex items-center justify-center bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                <i className="ri-wallet-3-line text-lg"></i>
              </div>
              <div className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400">
                +12.5%
              </div>
            </div>
            <div>
              <h3 className="text-gray-400 text-xs font-medium mb-1">Total Balance</h3>
              <p className="text-white text-xl lg:text-2xl font-bold" data-testid="text-total-balance">
                {statsLoading ? <Skeleton className="h-8 w-32" /> : `$${stats?.total_balance?.toLocaleString() || '124,567.89'}`}
              </p>
            </div>
          </Card>

          <Card className="bg-gray-900 border-gray-800 p-4 hover:border-gray-700 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg border flex items-center justify-center bg-green-500/10 text-green-400 border-green-500/20">
                <i className="ri-line-chart-line text-lg"></i>
              </div>
              <div className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400">
                +8.2%
              </div>
            </div>
            <div>
              <h3 className="text-gray-400 text-xs font-medium mb-1">Today's P&L</h3>
              <p className="text-white text-xl lg:text-2xl font-bold" data-testid="text-today-pnl">
                {statsLoading ? <Skeleton className="h-8 w-32" /> : `+$${stats?.today_pnl?.toLocaleString() || '2,847.32'}`}
              </p>
            </div>
          </Card>

          <Card className="bg-gray-900 border-gray-800 p-4 hover:border-gray-700 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg border flex items-center justify-center bg-blue-500/10 text-blue-400 border-blue-500/20">
                <i className="ri-exchange-line text-lg"></i>
              </div>
              <div className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400">
                +3
              </div>
            </div>
            <div>
              <h3 className="text-gray-400 text-xs font-medium mb-1">Active Trades</h3>
              <p className="text-white text-xl lg:text-2xl font-bold" data-testid="text-active-trades">
                {statsLoading ? <Skeleton className="h-8 w-16" /> : stats?.active_trades || 23}
              </p>
            </div>
          </Card>

          <Card className="bg-gray-900 border-gray-800 p-4 hover:border-gray-700 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg border flex items-center justify-center bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                <i className="ri-trophy-line text-lg"></i>
              </div>
              <div className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400">
                +2.1%
              </div>
            </div>
            <div>
              <h3 className="text-gray-400 text-xs font-medium mb-1">Win Rate</h3>
              <p className="text-white text-xl lg:text-2xl font-bold" data-testid="text-win-rate">
                {statsLoading ? <Skeleton className="h-8 w-20" /> : `${stats?.win_rate || 78.5}%`}
              </p>
            </div>
          </Card>
        </div>

        {/* MAIN LAYOUT SPLIT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN (Wallets & Chart) */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <div className="p-4 sm:p-6 border-b border-gray-800">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div>
                    <h2 className="text-white text-lg font-bold">Wallet Overview</h2>
                    <p className="text-gray-400 text-sm">Total Portfolio Value: $167,948.23</p>
                  </div>
                  
                  {/* MOBILE FIX: Scrollable container for buttons so they don't stack vertically */}
                  <div className="flex overflow-x-auto pb-1 sm:pb-0 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                    <div className="flex bg-gray-800 rounded-lg p-1 min-w-max">
                        <button className="px-3 py-1.5 text-sm font-medium rounded-md text-gray-400 hover:text-white">1h</button>
                        <button className="px-3 py-1.5 text-sm font-medium rounded-md bg-emerald-600 text-white shadow-sm">24h</button>
                        <button className="px-3 py-1.5 text-sm font-medium rounded-md text-gray-400 hover:text-white">7d</button>
                        <button className="px-3 py-1.5 text-sm font-medium rounded-md text-gray-400 hover:text-white">30d</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 border-b border-gray-800">
                <div className="h-48 sm:h-64 bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700/50">
                  <div className="text-center">
                    <i className="ri-line-chart-line text-4xl text-gray-600 mb-3"></i>
                    <p className="text-gray-400 text-sm">Portfolio Performance Chart</p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <h3 className="text-white font-medium mb-4">Assets</h3>

                {/* DESKTOP VIEW: Table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-800">
                        <th className="text-left pb-3 font-medium">Asset</th>
                        <th className="text-right pb-3 font-medium">Balance</th>
                        <th className="text-right pb-3 font-medium">Value</th>
                        <th className="text-right pb-3 font-medium">24h Change</th>
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
                              <div>
                                <p className="text-white text-sm font-medium">{wallet.name}</p>
                                <p className="text-gray-500 text-xs">Trading Account</p>
                              </div>
                            </div>
                          </td>
                          <td className="text-right py-4 text-white text-sm">${wallet.balance.toFixed(2)}</td>
                          <td className="text-right py-4 text-white text-sm font-medium">${wallet.value.toFixed(2)}</td>
                          <td className="text-right py-4">
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-500/10 text-green-400">
                              +${wallet.change.toFixed(2)}
                            </span>
                          </td>
                          <td className="text-right py-4">
                            <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Link href={wallet.link} className="px-3 py-1.5 bg-emerald-600 text-white text-xs rounded hover:bg-emerald-700">Trade</Link>
                              <Link href="/wallet" className="px-3 py-1.5 bg-gray-700 text-white text-xs rounded hover:bg-gray-600">Transfer</Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE VIEW: Cards (Refined Layout) */}
                <div className="sm:hidden space-y-3">
                  {wallets.map((wallet) => (
                    <div key={wallet.type} className="bg-gray-800/50 border border-gray-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full ${wallet.color} flex items-center justify-center text-white font-bold text-sm`}>
                            {wallet.abbreviation}
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">{wallet.name}</p>
                            <p className="text-gray-500 text-xs">Trading Account</p>
                          </div>
                        </div>
                        <span className="px-2 py-1 rounded text-xs font-medium bg-green-500/10 text-green-400">
                          +${wallet.change.toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-900/50 rounded">
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Balance</p>
                          <p className="text-white font-medium">${wallet.balance}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-500 text-xs mb-1">Value</p>
                          <p className="text-white font-medium">${wallet.value}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <Link href={wallet.link} className="py-2.5 bg-emerald-600 text-white text-sm font-medium rounded text-center active:scale-95 transition-transform">
                          Trade
                        </Link>
                        <Link href="/wallet" className="py-2.5 bg-gray-700 text-white text-sm font-medium rounded text-center active:scale-95 transition-transform">
                          Transfer
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN (Recent Trades) */}
          <div className="lg:col-span-4">
            <Card className="bg-gray-900 border-gray-800 h-full">
              <div className="p-4 border-b border-gray-800">
                <h3 className="text-white font-medium">Recent Trades</h3>
              </div>
              <div className="p-4">
                {tradesLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full bg-gray-800" />)}
                  </div>
                ) : recentTrades.length === 0 ? (
                  <div className="text-center py-8">
                    <i className="ri-exchange-line text-4xl text-gray-700 mb-2"></i>
                    <p className="text-gray-500 text-sm">No recent trades</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentTrades.slice(0, 5).map((trade: any, idx) => (
                      <div key={trade.id || idx} className="flex items-center justify-between p-3 bg-gray-800/50 border border-gray-800 rounded-lg">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-white font-medium text-sm">{trade.symbol || 'BTC/USDT'}</p>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${trade.side === 'Buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {trade.side || 'Buy'}
                            </span>
                          </div>
                          <p className="text-gray-500 text-xs mt-0.5">{trade.type || 'Market'}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${(trade.profit_loss || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {(trade.profit_loss || 0) >= 0 ? '+' : ''}${Math.abs(trade.profit_loss || 0).toFixed(2)}
                          </p>
                          <p className="text-gray-600 text-[10px] uppercase">{trade.status || 'COMPLETED'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}