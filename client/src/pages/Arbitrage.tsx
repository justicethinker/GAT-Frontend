import { Layout } from "@/components/Layout";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Arbitrage() {
  const [selectedExchanges, setSelectedExchanges] = useState<string[]>(["BYBIT", "MEXC"]);
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>(["BTCUSDT", "ETHUSDT"]);
  const [minProfit, setMinProfit] = useState(0.001);

  const { data: exchanges = [], isLoading: exchangesLoading } = useQuery({
    queryKey: ["/arb/exchanges"],
    retry: false,
  });

  const { data: symbols = [], isLoading: symbolsLoading } = useQuery({
    queryKey: ["/arb/symbols"],
    retry: false,
  });

  const { data: opportunities = [], isLoading: opportunitiesLoading } = useQuery({
    queryKey: [
      "/arb/opportunities",
      {
        exchanges: selectedExchanges.join(','),
        symbols: selectedSymbols.join(','),
        minProfit: minProfit.toString(),
      },
    ],
    retry: false,
  });

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Arbitrage Trading</h1>
          <p className="text-gray-400">Discover profitable arbitrage opportunities across exchanges</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
          <Card className="bg-gray-900 border-emerald-500/30 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-gray-400 text-sm mb-1">Active Opportunities</h3>
                <p className="text-2xl sm:text-3xl font-bold text-white" data-testid="text-active-opportunities">
                  {opportunitiesLoading ? <Skeleton className="h-8 w-16" /> : opportunities.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <i className="ri-exchange-line text-2xl"></i>
              </div>
            </div>
            <p className="text-xs text-gray-500">Updated in real-time</p>
          </Card>

          <Card className="bg-gray-900 border-gray-800 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-gray-400 text-sm mb-1">Best Opportunity</h3>
                <p className="text-2xl sm:text-3xl font-bold text-emerald-400" data-testid="text-best-opportunity">
                  {opportunitiesLoading ? <Skeleton className="h-8 w-20" /> : opportunities.length > 0 ? `${(opportunities[0]?.profit_percentage || 0).toFixed(2)}%` : '0.00%'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 flex items-center justify-center">
                <i className="ri-arrow-up-line text-2xl"></i>
              </div>
            </div>
            <p className="text-xs text-gray-500">Potential profit margin</p>
          </Card>

          <Card className="bg-gray-900 border-gray-800 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-gray-400 text-sm mb-1">Exchanges Monitored</h3>
                <p className="text-2xl sm:text-3xl font-bold text-white" data-testid="text-exchanges-monitored">
                  {exchangesLoading ? <Skeleton className="h-8 w-12" /> : selectedExchanges.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                <i className="ri-global-line text-2xl"></i>
              </div>
            </div>
            <p className="text-xs text-gray-500">Scanning continuously</p>
          </Card>
        </div>

        <Card className="bg-gray-900 border-gray-800 mb-6">
          <div className="p-4 sm:p-6 border-b border-gray-800">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Scanner Settings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Exchanges</label>
                <div className="text-white text-sm bg-gray-800 rounded-lg p-2">
                  {selectedExchanges.join(", ")}
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Trading Pairs</label>
                <div className="text-white text-sm bg-gray-800 rounded-lg p-2">
                  {selectedSymbols.join(", ")}
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Min Profit %</label>
                <div className="text-white text-sm bg-gray-800 rounded-lg p-2">
                  {(minProfit * 100).toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <div className="p-4 sm:p-6 border-b border-gray-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <h2 className="text-lg sm:text-xl font-bold text-white">Arbitrage Opportunities</h2>
              <Button
                data-testid="button-refresh"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <i className="ri-refresh-line mr-2"></i>
                Refresh
              </Button>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {opportunitiesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : opportunities.length === 0 ? (
              <div className="text-center py-12">
                <i className="ri-exchange-line text-5xl text-gray-600 mb-4"></i>
                <h3 className="text-xl font-semibold text-white mb-2">No Opportunities Found</h3>
                <p className="text-gray-400 mb-4">
                  No arbitrage opportunities match your criteria at the moment
                </p>
                <p className="text-sm text-gray-500">
                  Try adjusting your scanner settings or check back later
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-gray-400 text-sm border-b border-gray-800">
                      <th className="text-left pb-3">Symbol</th>
                      <th className="text-left pb-3">Buy Exchange</th>
                      <th className="text-right pb-3">Buy Price</th>
                      <th className="text-left pb-3">Sell Exchange</th>
                      <th className="text-right pb-3">Sell Price</th>
                      <th className="text-right pb-3">Profit</th>
                      <th className="text-right pb-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {opportunities.map((opp: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-800/50 transition-colors" data-testid={`opportunity-${idx}`}>
                        <td className="py-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-full bg-emerald-600/20 flex items-center justify-center">
                              <i className="ri-currency-line text-emerald-400 text-sm"></i>
                            </div>
                            <span className="text-white font-medium">{opp.symbol || 'BTC/USDT'}</span>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-sm font-medium">
                            {opp.exchange_buy || 'BYBIT'}
                          </span>
                        </td>
                        <td className="py-4 text-right text-white font-mono">
                          ${(opp.price_buy || 0).toLocaleString()}
                        </td>
                        <td className="py-4">
                          <span className="px-2 py-1 bg-purple-500/10 text-purple-400 rounded text-sm font-medium">
                            {opp.exchange_sell || 'MEXC'}
                          </span>
                        </td>
                        <td className="py-4 text-right text-white font-mono">
                          ${(opp.price_sell || 0).toLocaleString()}
                        </td>
                        <td className="py-4 text-right">
                          <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-sm font-bold">
                            +{(opp.profit_percentage || 0).toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <Button
                            size="sm"
                            data-testid={`button-execute-${idx}`}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            Execute
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
}
