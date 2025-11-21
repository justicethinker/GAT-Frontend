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
      <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8 py-4 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* MAIN CONTENT AREA (Chart & Tables) */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* CHART SECTION */}
            <Card className="bg-gray-900 border-emerald-500/30 p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                <h2 className="text-lg font-bold text-white">Chart Analysis</h2>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Pair Selector */}
                  <select
                    value={selectedPair}
                    onChange={(e) => setSelectedPair(e.target.value)}
                    data-testid="select-trading-pair"
                    className="bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 w-full sm:w-auto"
                  >
                    <option value="BTC/USDT">BTC/USDT</option>
                    <option value="ETH/USDT">ETH/USDT</option>
                    <option value="BNB/USDT">BNB/USDT</option>
                    <option value="SOL/USDT">SOL/USDT</option>
                  </select>

                  {/* Scrollable Timeframes for Mobile */}
                  <div className="flex overflow-x-auto pb-1 sm:pb-0 no-scrollbar bg-gray-800 rounded-lg p-1 gap-1">
                    {timeframes.map((tf) => (
                      <button
                        key={tf}
                        data-testid={`button-timeframe-${tf}`}
                        onClick={() => setSelectedTimeframe(tf)}
                        className={`flex-1 sm:flex-none px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                          selectedTimeframe === tf
                            ? "bg-emerald-600 text-white"
                            : "text-gray-400 hover:text-white hover:bg-gray-700"
                        }`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Chart Placeholder */}
              <div className="h-64 sm:h-96 bg-gray-800/50 border border-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <i className="ri-line-chart-line text-5xl text-gray-700 mb-3"></i>
                  <p className="text-gray-400 text-sm">Trading Chart</p>
                  <p className="text-gray-600 text-xs mt-1">
                    {selectedPair} • {selectedTimeframe}
                  </p>
                </div>
              </div>
            </Card>

            {/* OPEN POSITIONS SECTION */}
            <Card className="bg-gray-900 border-gray-800">
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Open Positions</h3>
                <Button
                  data-testid="button-close-all"
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white text-xs h-8"
                >
                  Close All
                </Button>
              </div>

              {positions.length === 0 ? (
                <div className="text-center py-8">
                  <i className="ri-file-list-line text-4xl text-gray-700 mb-2"></i>
                  <p className="text-gray-500 text-sm">No open positions</p>
                </div>
              ) : (
                <>
                  {/* DESKTOP TABLE VIEW */}
                  <div className="hidden md:block overflow-x-auto p-4">
                    <table className="w-full">
                      <thead>
                        <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-800">
                          <th className="text-left pb-3 font-medium">Symbol</th>
                          <th className="text-left pb-3 font-medium">Side/Lev</th>
                          <th className="text-right pb-3 font-medium">Size</th>
                          <th className="text-right pb-3 font-medium">Entry</th>
                          <th className="text-right pb-3 font-medium">Mark Price</th>
                          <th className="text-right pb-3 font-medium">P&L (ROI)</th>
                          <th className="text-right pb-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {positions.map((position, idx) => (
                          <tr key={idx} className="hover:bg-gray-800/50 transition-colors" data-testid={`position-${idx}`}>
                            <td className="py-4">
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 rounded-full bg-emerald-600/20 flex items-center justify-center">
                                  <i className="ri-currency-line text-emerald-400 text-xs"></i>
                                </div>
                                <span className="text-white font-medium text-sm">{position.symbol}</span>
                              </div>
                            </td>
                            <td className="py-4">
                              <span className={`px-2 py-0.5 rounded text-xs font-medium mr-2 ${position.side === "Long" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                                {position.side}
                              </span>
                              <span className="text-gray-400 text-xs bg-gray-800 px-1.5 py-0.5 rounded">{position.leverage}</span>
                            </td>
                            <td className="py-4 text-right text-white text-sm">{position.size}</td>
                            <td className="py-4 text-right text-gray-400 text-sm font-mono">${position.entryPrice.toLocaleString()}</td>
                            <td className="py-4 text-right text-white text-sm font-mono">${position.currentPrice.toLocaleString()}</td>
                            <td className="py-4 text-right">
                              <div className="flex flex-col items-end">
                                <span className={`text-sm font-bold ${position.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                                  {position.pnl >= 0 ? "+" : ""}${position.pnl.toFixed(2)}
                                </span>
                                <span className={`text-xs ${position.roi >= 0 ? "text-green-500/70" : "text-red-500/70"}`}>
                                  ({position.roi >= 0 ? "+" : ""}{position.roi.toFixed(2)}%)
                                </span>
                              </div>
                            </td>
                            <td className="py-4 text-right">
                              <Button size="sm" className="bg-gray-800 hover:bg-gray-700 text-white h-7 text-xs border border-gray-700">Close</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* MOBILE CARD VIEW */}
                  <div className="md:hidden flex flex-col divide-y divide-gray-800">
                    {positions.map((position, idx) => (
                      <div key={idx} className="p-4 hover:bg-gray-800/30">
                         {/* Header: Symbol & Side */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                              <span className="text-white font-bold text-sm">{position.symbol}</span>
                              <span className="text-gray-500 text-xs px-1.5 bg-gray-800 rounded">{position.leverage}</span>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-bold ${position.side === "Long" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                                {position.side}
                          </span>
                        </div>

                        {/* Prices Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-3 text-xs">
                            <div>
                                <p className="text-gray-500 mb-0.5">Entry Price</p>
                                <p className="text-white font-mono">${position.entryPrice.toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-gray-500 mb-0.5">Mark Price</p>
                                <p className="text-white font-mono">${position.currentPrice.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Footer: PNL & Close */}
                        <div className="flex items-center justify-between bg-gray-950/30 p-2 rounded">
                            <div>
                                <p className="text-gray-500 text-[10px] uppercase">Unrealized P&L</p>
                                <div className="flex items-baseline gap-1">
                                    <span className={`text-sm font-bold ${position.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                                        {position.pnl >= 0 ? "+" : ""}${position.pnl.toFixed(2)}
                                    </span>
                                    <span className={`text-[10px] ${position.roi >= 0 ? "text-green-500/70" : "text-red-500/70"}`}>
                                        ({position.roi.toFixed(2)}%)
                                    </span>
                                </div>
                            </div>
                            <Button size="sm" className="h-8 bg-gray-800 hover:bg-gray-700 text-white text-xs">
                                Close
                            </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card>

            {/* OPEN ORDERS SECTION */}
            <Card className="bg-gray-900 border-gray-800">
              <div className="p-4 border-b border-gray-800">
                 <h3 className="text-lg font-bold text-white">Open Orders</h3>
              </div>
              
              {openOrders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">No open orders</p>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto p-4">
                    <table className="w-full">
                      <thead>
                        <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-800">
                          <th className="text-left pb-3 font-medium">Symbol</th>
                          <th className="text-left pb-3 font-medium">Type</th>
                          <th className="text-left pb-3 font-medium">Side</th>
                          <th className="text-right pb-3 font-medium">Price</th>
                          <th className="text-right pb-3 font-medium">Amount</th>
                          <th className="text-right pb-3 font-medium">Filled</th>
                          <th className="text-right pb-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {openOrders.map((order, idx) => (
                          <tr key={idx} className="hover:bg-gray-800/50">
                            <td className="py-4 text-white font-medium text-sm">{order.symbol}</td>
                            <td className="py-4"><span className="text-blue-400 text-xs bg-blue-500/10 px-2 py-1 rounded">{order.type}</span></td>
                            <td className="py-4">
                                <span className={`text-xs font-medium ${order.side === "Long" ? "text-green-400" : "text-red-400"}`}>{order.side}</span>
                            </td>
                            <td className="py-4 text-right text-white font-mono text-sm">${order.price}</td>
                            <td className="py-4 text-right text-white text-sm">{order.amount}</td>
                            <td className="py-4 text-right text-gray-400 text-sm">{order.filled}</td>
                            <td className="py-4 text-right">
                              <Button size="sm" className="bg-red-600/10 hover:bg-red-600/20 text-red-400 h-7 text-xs border border-red-600/20">Cancel</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                   {/* Mobile Card View */}
                   <div className="md:hidden flex flex-col divide-y divide-gray-800">
                    {openOrders.map((order, idx) => (
                      <div key={idx} className="p-4 hover:bg-gray-800/30 flex items-center justify-between">
                         <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-white font-bold text-sm">{order.symbol}</span>
                                <span className={`text-[10px] px-1.5 rounded border ${order.side === 'Long' ? 'border-green-500/30 text-green-400' : 'border-red-500/30 text-red-400'}`}>
                                    {order.side}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <span>{order.type}</span>
                                <span>•</span>
                                <span className="text-white font-mono">${order.price}</span>
                            </div>
                         </div>
                         <Button size="sm" className="bg-red-900/20 text-red-400 border border-red-900/50 h-8 text-xs">
                            Cancel
                         </Button>
                      </div>
                    ))}
                   </div>
                </>
              )}
            </Card>
          </div>

          {/* RIGHT SIDEBAR (Market Info & Quick Trade) */}
          <div className="space-y-6">
            
            <Card className="bg-gray-900 border-gray-800 p-5">
              <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wide">Market Info</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-800 last:border-0 last:pb-0">
                  <p className="text-gray-400 text-xs">24h Change</p>
                  <p className="text-green-400 text-sm font-bold">+2.45%</p>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-800 last:border-0 last:pb-0">
                  <p className="text-gray-400 text-xs">24h High</p>
                  <p className="text-white font-mono text-sm">$43,920</p>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-800 last:border-0 last:pb-0">
                  <p className="text-gray-400 text-xs">24h Low</p>
                  <p className="text-white font-mono text-sm">$42,150</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-gray-400 text-xs">24h Volume</p>
                  <p className="text-white font-mono text-sm">$2.1B</p>
                </div>
              </div>
            </Card>

            <Card className="bg-gray-900 border-gray-800 p-5 sticky top-4">
              <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wide">Quick Trade</h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <button className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-bold transition active:scale-95">
                    Long
                  </button>
                  <button className="flex-1 py-2.5 bg-gray-800 hover:bg-red-600 hover:text-white text-gray-300 rounded text-sm font-bold transition active:scale-95">
                    Short
                  </button>
                </div>
                
                <div>
                  <label className="text-gray-400 text-xs mb-1.5 block">Amount (USDT)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    data-testid="input-trade-amount"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-3 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="text-gray-400 text-xs mb-1.5 block">Leverage</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['1x', '5x', '10x', '20x'].map((lev) => (
                        <button key={lev} className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs py-2 rounded border border-gray-700 hover:border-gray-600 transition">
                            {lev}
                        </button>
                    ))}
                  </div>
                </div>

                <Button
                  data-testid="button-execute-trade"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-6"
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