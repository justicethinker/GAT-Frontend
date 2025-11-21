import { Layout } from "@/components/Layout";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

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
      {/* Container: Responsive padding */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 lg:py-8">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Arbitrage Trading</h1>
          <p className="text-gray-400 text-sm sm:text-base">Discover profitable arbitrage opportunities across exchanges</p>
        </div>

        {/* Top Stats Grid - Stacks nicely on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-6">
          <Card className="bg-gray-900 border-emerald-500/30 p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-gray-400 text-xs sm:text-sm mb-1">Active Opportunities</h3>
                <p className="text-2xl sm:text-3xl font-bold text-white" data-testid="text-active-opportunities">
                  {opportunitiesLoading ? <Skeleton className="h-8 w-16" /> : opportunities.length}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <i className="ri-exchange-line text-xl sm:text-2xl"></i>
              </div>
            </div>
            <p className="text-xs text-gray-500">Updated in real-time</p>
          </Card>

          <Card className="bg-gray-900 border-gray-800 p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-gray-400 text-xs sm:text-sm mb-1">Best Opportunity</h3>
                <p className="text-2xl sm:text-3xl font-bold text-emerald-400" data-testid="text-best-opportunity">
                  {opportunitiesLoading ? <Skeleton className="h-8 w-20" /> : opportunities.length > 0 ? `${(opportunities[0]?.profit_percentage || 0).toFixed(2)}%` : '0.00%'}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 flex items-center justify-center">
                <i className="ri-arrow-up-line text-xl sm:text-2xl"></i>
              </div>
            </div>
            <p className="text-xs text-gray-500">Potential profit margin</p>
          </Card>

          <Card className="bg-gray-900 border-gray-800 p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-gray-400 text-xs sm:text-sm mb-1">Exchanges Monitored</h3>
                <p className="text-2xl sm:text-3xl font-bold text-white" data-testid="text-exchanges-monitored">
                  {exchangesLoading ? <Skeleton className="h-8 w-12" /> : selectedExchanges.length}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                <i className="ri-global-line text-xl sm:text-2xl"></i>
              </div>
            </div>
            <p className="text-xs text-gray-500">Scanning continuously</p>
          </Card>
        </div>

        {/* Settings Card */}
        <Card className="bg-gray-900 border-gray-800 mb-6">
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-lg font-bold text-white mb-4">Scanner Settings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs sm:text-sm text-gray-400 mb-2 block">Exchanges</label>
                <div className="text-white text-sm bg-gray-800 rounded-lg p-2.5 border border-gray-700">
                  {selectedExchanges.join(", ")}
                </div>
              </div>
              <div>
                <label className="text-xs sm:text-sm text-gray-400 mb-2 block">Trading Pairs</label>
                <div className="text-white text-sm bg-gray-800 rounded-lg p-2.5 border border-gray-700">
                  {selectedSymbols.join(", ")}
                </div>
              </div>
              <div>
                <label className="text-xs sm:text-sm text-gray-400 mb-2 block">Min Profit %</label>
                <div className="text-white text-sm bg-gray-800 rounded-lg p-2.5 border border-gray-700">
                  {(minProfit * 100).toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Main Opportunities List */}
        <Card className="bg-gray-900 border-gray-800">
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Arbitrage Opportunities</h2>
              <Button
                size="sm"
                data-testid="button-refresh"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <i className="ri-refresh-line mr-2"></i>
                Refresh
              </Button>
            </div>
          </div>

          <div className="p-0 sm:p-4">
            {opportunitiesLoading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full bg-gray-800" />)}
              </div>
            ) : opportunities.length === 0 ? (
              <div className="text-center py-12 px-4">
                <i className="ri-exchange-line text-5xl text-gray-700 mb-4"></i>
                <h3 className="text-xl font-semibold text-white mb-2">No Opportunities Found</h3>
                <p className="text-gray-500 mb-4 max-w-md mx-auto">
                  No arbitrage opportunities match your criteria at the moment
                </p>
              </div>
            ) : (
              <>
                {/* DESKTOP VIEW: Table (Hidden on mobile) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-800">
                        <th className="text-left p-4">Symbol</th>
                        <th className="text-left p-4">Buy Exchange</th>
                        <th className="text-right p-4">Buy Price</th>
                        <th className="text-left p-4 pl-8">Sell Exchange</th>
                        <th className="text-right p-4">Sell Price</th>
                        <th className="text-right p-4">Profit</th>
                        <th className="text-right p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {opportunities.map((opp: any, idx: number) => (
                        <tr key={idx} className="hover:bg-gray-800/50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 rounded-full bg-emerald-600/20 flex items-center justify-center">
                                <i className="ri-currency-line text-emerald-400 text-sm"></i>
                              </div>
                              <span className="text-white font-medium text-sm">{opp.symbol || 'BTC/USDT'}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded text-xs font-medium border border-blue-500/20">
                              {opp.exchange_buy || 'BYBIT'}
                            </span>
                          </td>
                          <td className="p-4 text-right text-white font-mono text-sm">
                            ${(opp.price_buy || 0).toLocaleString()}
                          </td>
                          <td className="p-4 pl-8">
                            <span className="px-2.5 py-1 bg-purple-500/10 text-purple-400 rounded text-xs font-medium border border-purple-500/20">
                              {opp.exchange_sell || 'MEXC'}
                            </span>
                          </td>
                          <td className="p-4 text-right text-white font-mono text-sm">
                            ${(opp.price_sell || 0).toLocaleString()}
                          </td>
                          <td className="p-4 text-right">
                            <span className="px-2 py-1 bg-green-500/10 text-green-400 rounded text-xs font-bold border border-green-500/20">
                              +{(opp.profit_percentage || 0).toFixed(2)}%
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs">
                              Execute
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE VIEW: Cards (Hidden on desktop) */}
                <div className="md:hidden flex flex-col divide-y divide-gray-800">
                  {opportunities.map((opp: any, idx: number) => (
                    <div key={idx} className="p-4 hover:bg-gray-800/30 transition-colors">
                      {/* Card Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-emerald-600/20 flex items-center justify-center">
                                <i className="ri-currency-line text-emerald-400 text-sm"></i>
                            </div>
                            <span className="text-white font-bold">{opp.symbol || 'BTC/USDT'}</span>
                        </div>
                        <span className="px-2 py-1 bg-green-500/10 text-green-400 rounded text-xs font-bold border border-green-500/20">
                            +{(opp.profit_percentage || 0).toFixed(2)}%
                        </span>
                      </div>

                      {/* Trade Flow Visual */}
                      <div className="flex items-center justify-between bg-gray-950/50 rounded-lg p-3 mb-4 border border-gray-800">
                        <div className="flex-1">
                            <p className="text-xs text-gray-500 mb-1">Buy</p>
                            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded text-[10px] font-medium border border-blue-500/20 mb-1 inline-block">
                              {opp.exchange_buy || 'BYBIT'}
                            </span>
                            <p className="text-white font-mono text-sm">${(opp.price_buy || 0).toLocaleString()}</p>
                        </div>
                        
                        <div className="px-2 text-gray-600">
                            <i className="ri-arrow-right-line"></i>
                        </div>

                        <div className="flex-1 text-right">
                            <p className="text-xs text-gray-500 mb-1">Sell</p>
                            <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded text-[10px] font-medium border border-purple-500/20 mb-1 inline-block">
                              {opp.exchange_sell || 'MEXC'}
                            </span>
                            <p className="text-white font-mono text-sm">${(opp.price_sell || 0).toLocaleString()}</p>
                        </div>
                      </div>

                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                        Execute Arbitrage
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
}