import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Futures() {
  const [selectedPair, setSelectedPair] = useState("BTC/USDT");
  const [selectedTimeframe, setSelectedTimeframe] = useState("1H");

  const positions = [
    {
      symbol: "BTC/USDT",
      side: "Long",
      size: 0.5,
      leverage: "10x",
      entryPrice: 43250,
      currentPrice: 43580,
      pnl: 165.0,
      roi: 7.63,
    },
    {
      symbol: "ETH/USDT",
      side: "Short",
      size: 5.0,
      leverage: "5x",
      entryPrice: 2280,
      currentPrice: 2265,
      pnl: 37.5,
      roi: 3.29,
    },
  ];

  const openOrders = [
    {
      symbol: "SOL/USDT",
      type: "Limit",
      side: "Long",
      price: 98.5,
      amount: 10,
      filled: "0%",
    },
    {
      symbol: "MATIC/USDT",
      type: "Stop Loss",
      side: "Short",
      price: 0.92,
      amount: 500,
      filled: "0%",
    },
  ];

  const timeframes = ["1M", "5M", "15M", "1H", "4H", "1D"];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
          <div className="lg:col-span-3 space-y-6 sm:space-y-8">
            <Card className="bg-gray-900 border-emerald-500/30 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-0">Chart Analysis</h2>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                  <select
                    value={selectedPair}
                    onChange={(e) => setSelectedPair(e.target.value)}
                    data-testid="select-trading-pair"
                    className="bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="BTC/USDT">BTC/USDT</option>
                    <option value="ETH/USDT">ETH/USDT</option>
                    <option value="BNB/USDT">BNB/USDT</option>
                    <option value="SOL/USDT">SOL/USDT</option>
                  </select>

                  <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
                    {timeframes.map((tf) => (
                      <button
                        key={tf}
                        data-testid={`button-timeframe-${tf}`}
                        onClick={() => setSelectedTimeframe(tf)}
                        className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium ${
                          selectedTimeframe === tf
                            ? "bg-emerald-600 text-white"
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="h-64 sm:h-96 bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <i className="ri-line-chart-line text-4xl sm:text-5xl text-gray-600 mb-3"></i>
                  <p className="text-gray-400 text-sm sm:text-base">Trading Chart</p>
                  <p className="text-gray-500 text-xs sm:text-sm mt-1">
                    {selectedPair} - {selectedTimeframe} Timeframe
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-gray-900 border-gray-800 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Open Positions</h3>
                <Button
                  data-testid="button-close-all"
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Close All
                </Button>
              </div>

              {positions.length === 0 ? (
                <div className="text-center py-8">
                  <i className="ri-file-list-line text-4xl text-gray-600 mb-2"></i>
                  <p className="text-gray-400 text-sm">No open positions</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-gray-400 text-sm border-b border-gray-800">
                        <th className="text-left pb-3">Symbol</th>
                        <th className="text-left pb-3">Side/Leverage</th>
                        <th className="text-right pb-3">Size</th>
                        <th className="text-right pb-3">Entry Price</th>
                        <th className="text-right pb-3">Current Price</th>
                        <th className="text-right pb-3">P&L</th>
                        <th className="text-right pb-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {positions.map((position, idx) => (
                        <tr key={idx} className="hover:bg-gray-800/50 transition-colors" data-testid={`position-${idx}`}>
                          <td className="py-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 rounded-full bg-emerald-600/20 flex items-center justify-center">
                                <i className="ri-currency-line text-emerald-400 text-sm"></i>
                              </div>
                              <span className="text-white font-medium">{position.symbol}</span>
                            </div>
                          </td>
                          <td className="py-4">
                            <div>
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  position.side === "Long"
                                    ? "bg-green-500/10 text-green-400"
                                    : "bg-red-500/10 text-red-400"
                                }`}
                              >
                                {position.side}
                              </span>
                              <span className="ml-2 text-gray-400 text-sm">{position.leverage}</span>
                            </div>
                          </td>
                          <td className="py-4 text-right text-white">{position.size}</td>
                          <td className="py-4 text-right text-white font-mono">
                            ${position.entryPrice.toLocaleString()}
                          </td>
                          <td className="py-4 text-right text-white font-mono">
                            ${position.currentPrice.toLocaleString()}
                          </td>
                          <td className="py-4 text-right">
                            <div>
                              <p
                                className={`font-bold ${
                                  position.pnl >= 0 ? "text-green-400" : "text-red-400"
                                }`}
                              >
                                {position.pnl >= 0 ? "+" : ""}${position.pnl.toFixed(2)}
                              </p>
                              <p
                                className={`text-xs ${
                                  position.roi >= 0 ? "text-green-400" : "text-red-400"
                                }`}
                              >
                                {position.roi >= 0 ? "+" : ""}
                                {position.roi.toFixed(2)}%
                              </p>
                            </div>
                          </td>
                          <td className="py-4 text-right">
                            <Button
                              size="sm"
                              data-testid={`button-close-position-${idx}`}
                              className="bg-gray-700 hover:bg-gray-600 text-white"
                            >
                              Close
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            <Card className="bg-gray-900 border-gray-800 p-4 sm:p-6">
              <h3 className="text-lg font-bold text-white mb-4">Open Orders</h3>
              {openOrders.length === 0 ? (
                <div className="text-center py-8">
                  <i className="ri-file-list-3-line text-4xl text-gray-600 mb-2"></i>
                  <p className="text-gray-400 text-sm">No open orders</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-gray-400 text-sm border-b border-gray-800">
                        <th className="text-left pb-3">Symbol</th>
                        <th className="text-left pb-3">Type</th>
                        <th className="text-left pb-3">Side</th>
                        <th className="text-right pb-3">Price</th>
                        <th className="text-right pb-3">Amount</th>
                        <th className="text-right pb-3">Filled</th>
                        <th className="text-right pb-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {openOrders.map((order, idx) => (
                        <tr key={idx} className="hover:bg-gray-800/50 transition-colors" data-testid={`order-${idx}`}>
                          <td className="py-4 text-white font-medium">{order.symbol}</td>
                          <td className="py-4">
                            <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-xs font-medium">
                              {order.type}
                            </span>
                          </td>
                          <td className="py-4">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                order.side === "Long"
                                  ? "bg-green-500/10 text-green-400"
                                  : "bg-red-500/10 text-red-400"
                              }`}
                            >
                              {order.side}
                            </span>
                          </td>
                          <td className="py-4 text-right text-white font-mono">${order.price}</td>
                          <td className="py-4 text-right text-white">{order.amount}</td>
                          <td className="py-4 text-right text-gray-400">{order.filled}</td>
                          <td className="py-4 text-right">
                            <Button
                              size="sm"
                              data-testid={`button-cancel-order-${idx}`}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              Cancel
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-gray-900 border-gray-800 p-4">
              <h3 className="text-white font-semibold mb-4">Market Info</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-xs mb-1">24h Change</p>
                  <p className="text-green-400 text-lg font-bold">+2.45%</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">24h High</p>
                  <p className="text-white font-mono">$43,920</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">24h Low</p>
                  <p className="text-white font-mono">$42,150</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">24h Volume</p>
                  <p className="text-white font-mono">$2.1B</p>
                </div>
              </div>
            </Card>

            <Card className="bg-gray-900 border-gray-800 p-4">
              <h3 className="text-white font-semibold mb-4">Quick Trade</h3>
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <button className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium text-sm">
                    Long
                  </button>
                  <button className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium text-sm">
                    Short
                  </button>
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Amount (USDT)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    data-testid="input-trade-amount"
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Leverage</label>
                  <select
                    data-testid="select-leverage"
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option>1x</option>
                    <option>5x</option>
                    <option>10x</option>
                    <option>20x</option>
                  </select>
                </div>
                <Button
                  data-testid="button-execute-trade"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Execute Trade
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
