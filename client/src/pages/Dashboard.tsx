import { Layout } from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dash/stats"],
    retry: false,
  });

  const { data: recentTrades = [], isLoading: tradesLoading } = useQuery<any[]>({
    queryKey: ["/api/dash/recent-trades"],
    retry: false,
  });

  const wallets = [
    {
      name: "Arbitrage",
      abbreviation: "AR",
      type: "arb",
      balance: 0,
      value: 0,
      change: 0,
      color: "bg-purple-600",
      link: "/arbitrage",
    },
    {
      name: "Forex",
      abbreviation: "FX",
      type: "forex",
      balance: 0,
      value: 0,
      change: 0,
      color: "bg-blue-600",
      link: "/forex",
    },
    {
      name: "Futures",
      abbreviation: "FU",
      type: "fut",
      balance: 0,
      value: 0,
      change: 0,
      color: "bg-yellow-600",
      link: "/futures",
    },
  ];

  return (
    <Layout>
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <Card className="bg-gray-900 border-gray-800 p-4 sm:p-6 hover:border-gray-700 transition-colors">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border flex items-center justify-center bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                <i className="ri-wallet-3-line text-lg sm:text-xl"></i>
              </div>
              <div className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400">
                +12.5%
              </div>
            </div>
            <div>
              <h3 className="text-gray-400 text-xs sm:text-sm font-medium mb-1 sm:mb-2">
                Total Balance
              </h3>
              <p className="text-white text-lg sm:text-xl lg:text-2xl font-bold" data-testid="text-total-balance">
                {statsLoading ? <Skeleton className="h-8 w-32" /> : `$${stats?.total_balance?.toLocaleString() || '124,567.89'}`}
              </p>
            </div>
          </Card>

          <Card className="bg-gray-900 border-gray-800 p-4 sm:p-6 hover:border-gray-700 transition-colors">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border flex items-center justify-center bg-green-500/10 text-green-400 border-green-500/20">
                <i className="ri-line-chart-line text-lg sm:text-xl"></i>
              </div>
              <div className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400">
                +8.2%
              </div>
            </div>
            <div>
              <h3 className="text-gray-400 text-xs sm:text-sm font-medium mb-1 sm:mb-2">
                Today's P&L
              </h3>
              <p className="text-white text-lg sm:text-xl lg:text-2xl font-bold" data-testid="text-today-pnl">
                {statsLoading ? <Skeleton className="h-8 w-32" /> : `+$${stats?.today_pnl?.toLocaleString() || '2,847.32'}`}
              </p>
            </div>
          </Card>

          <Card className="bg-gray-900 border-gray-800 p-4 sm:p-6 hover:border-gray-700 transition-colors">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border flex items-center justify-center bg-blue-500/10 text-blue-400 border-blue-500/20">
                <i className="ri-exchange-line text-lg sm:text-xl"></i>
              </div>
              <div className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400">
                +3
              </div>
            </div>
            <div>
              <h3 className="text-gray-400 text-xs sm:text-sm font-medium mb-1 sm:mb-2">
                Active Trades
              </h3>
              <p className="text-white text-lg sm:text-xl lg:text-2xl font-bold" data-testid="text-active-trades">
                {statsLoading ? <Skeleton className="h-8 w-16" /> : stats?.active_trades || 23}
              </p>
            </div>
          </Card>

          <Card className="bg-gray-900 border-gray-800 p-4 sm:p-6 hover:border-gray-700 transition-colors">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border flex items-center justify-center bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                <i className="ri-trophy-line text-lg sm:text-xl"></i>
              </div>
              <div className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400">
                +2.1%
              </div>
            </div>
            <div>
              <h3 className="text-gray-400 text-xs sm:text-sm font-medium mb-1 sm:mb-2">
                Win Rate
              </h3>
              <p className="text-white text-lg sm:text-xl lg:text-2xl font-bold" data-testid="text-win-rate">
                {statsLoading ? <Skeleton className="h-8 w-20" /> : `${stats?.win_rate || 78.5}%`}
              </p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
          <div className="lg:col-span-8 xl:col-span-8 space-y-4 sm:space-y-6 lg:space-y-8">
            <Card className="bg-gray-900 border-gray-800">
              <div className="p-4 sm:p-6 border-b border-gray-800">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div>
                    <h2 className="text-white text-lg sm:text-xl font-bold">Wallet Overview</h2>
                    <p className="text-gray-400 text-sm">Total Portfolio Value: $167,948.23</p>
                  </div>
                  <div className="flex bg-gray-800 rounded-lg p-1">
                    <button className="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap text-gray-400 hover:text-white">
                      1h
                    </button>
                    <button className="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap bg-emerald-600 text-white">
                      24h
                    </button>
                    <button className="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap text-gray-400 hover:text-white">
                      7d
                    </button>
                    <button className="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap text-gray-400 hover:text-white">
                      30d
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 border-b border-gray-800">
                <div className="h-48 sm:h-64 bg-gray-800 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <i className="ri-line-chart-line text-4xl sm:text-5xl text-gray-600 mb-3"></i>
                    <p className="text-gray-400 text-sm sm:text-base">Portfolio Performance Chart</p>
                    <p className="text-gray-500 text-xs sm:text-sm mt-1">Chart integration coming soon</p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <h3 className="text-white font-medium mb-4">Assets</h3>

                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-gray-400 text-sm border-b border-gray-800">
                        <th className="text-left pb-3">Asset</th>
                        <th className="text-right pb-3">Balance</th>
                        <th className="text-right pb-3">Value</th>
                        <th className="text-right pb-3">24h Change</th>
                        <th className="text-right pb-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {wallets.map((wallet) => (
                        <tr key={wallet.type} className="border-b border-gray-800 last:border-b-0">
                          <td className="py-4">
                            <div className="flex items-center space-x-3">
                              <div
                                className={`w-10 h-10 rounded-full ${wallet.color} flex items-center justify-center text-white font-bold text-sm`}
                              >
                                {wallet.abbreviation}
                              </div>
                              <div>
                                <p className="text-white font-medium">{wallet.name}</p>
                                <p className="text-gray-400 text-sm">Trading Account</p>
                              </div>
                            </div>
                          </td>
                          <td className="text-right py-4 text-white">${wallet.balance.toFixed(2)}</td>
                          <td className="text-right py-4 text-white font-medium">${wallet.value.toFixed(2)}</td>
                          <td className="text-right py-4">
                            <span className="px-3 py-1 rounded text-sm font-medium bg-green-500/10 text-green-400">
                              +${wallet.change.toFixed(2)}
                            </span>
                          </td>
                          <td className="text-right py-4">
                            <div className="flex justify-end space-x-2">
                              <Link
                                href={wallet.link}
                                data-testid={`button-trade-${wallet.type}`}
                                className="px-4 py-2 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700 transition"
                              >
                                Trade
                              </Link>
                              <Link
                                href="/wallet"
                                data-testid={`button-transfer-${wallet.type}`}
                                className="px-4 py-2 bg-gray-700 text-white text-sm rounded hover:bg-gray-600 transition"
                              >
                                Transfer
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="sm:hidden space-y-4">
                  {wallets.map((wallet) => (
                    <Card key={wallet.type} className="bg-gray-800 p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-12 h-12 rounded-full ${wallet.color} flex items-center justify-center text-white font-bold`}
                          >
                            {wallet.abbreviation}
                          </div>
                          <div>
                            <p className="text-white font-medium">{wallet.name}</p>
                            <p className="text-gray-400 text-sm">Trading Account</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 rounded text-sm font-medium bg-green-500/10 text-green-400">
                          +${wallet.change.toFixed(2)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <p className="text-gray-400">Balance</p>
                          <p className="text-white font-medium">${wallet.balance}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Value</p>
                          <p className="text-white font-medium">${wallet.value}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Link
                          href={wallet.link}
                          className="flex-1 py-3 bg-emerald-600 text-white rounded text-center hover:bg-emerald-700 transition"
                        >
                          Trade
                        </Link>
                        <Link
                          href="/wallet"
                          className="flex-1 py-3 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
                        >
                          Transfer
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-4 xl:col-span-4">
            <Card className="bg-gray-900 border-gray-800">
              <div className="p-4 sm:p-6 border-b border-gray-800">
                <h3 className="text-white font-medium">Recent Trades</h3>
              </div>
              <div className="p-4">
                {tradesLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : recentTrades.length === 0 ? (
                  <div className="text-center py-8">
                    <i className="ri-exchange-line text-4xl text-gray-600 mb-2"></i>
                    <p className="text-gray-400 text-sm">No recent trades</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentTrades.slice(0, 5).map((trade: any, idx) => (
                      <div
                        key={trade.id || idx}
                        className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
                        data-testid={`trade-${idx}`}
                      >
                        <div>
                          <p className="text-white font-medium text-sm">{trade.symbol || 'BTC/USDT'}</p>
                          <p className="text-gray-400 text-xs">{trade.type || 'Market'} • {trade.side || 'Buy'}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${(trade.profit_loss || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {(trade.profit_loss || 0) >= 0 ? '+' : ''}${Math.abs(trade.profit_loss || 0).toFixed(2)}
                          </p>
                          <p className="text-gray-500 text-xs">{trade.status || 'COMPLETED'}</p>
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
