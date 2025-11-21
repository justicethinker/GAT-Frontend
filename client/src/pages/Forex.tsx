import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button"; // Assuming you have this, or use <button>

export default function Forex() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const sessions = [
    { name: "Sydney", timezone: "AEDT", status: "closed", volume: "Low", time: "08:30", color: "gray" },
    { name: "Tokyo", timezone: "JST", status: "closed", volume: "Medium", time: "10:00", color: "gray" },
    { name: "London", timezone: "GMT", status: "open", volume: "High", time: "09:15", color: "emerald" },
    { name: "New York", timezone: "EST", status: "open", volume: "High", time: "10:30", color: "emerald" },
  ];

  const currencyPairs = [
    { pair: "EUR/USD", price: 1.0842, change: 0.12, trend: "up" },
    { pair: "GBP/USD", price: 1.2654, change: -0.08, trend: "down" },
    { pair: "USD/JPY", price: 149.82, change: 0.24, trend: "up" },
    { pair: "USD/CHF", price: 0.8834, change: 0.05, trend: "up" },
    { pair: "AUD/USD", price: 0.6523, change: -0.15, trend: "down" },
    { pair: "USD/CAD", price: 1.3845, change: 0.18, trend: "up" },
  ];

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 lg:py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN: Sessions & Pairs */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* TRADING SESSIONS */}
            <Card className="bg-gray-900 border-emerald-500/30 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Trading Sessions</h2>
                <div className="text-emerald-400 font-mono text-xs sm:text-sm bg-emerald-500/10 px-2 py-1 rounded" data-testid="text-current-time">
                  {currentTime.toLocaleTimeString()}
                </div>
              </div>

              {/* Responsive Grid: 2 cols on mobile, 4 cols on desktop */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {sessions.map((session, idx) => (
                  <div 
                    key={idx} 
                    className={`p-3 rounded-lg border ${session.status === "open" ? "bg-gray-800 border-emerald-500/30" : "bg-gray-800/50 border-gray-700/50"}`}
                    data-testid={`session-${session.name.toLowerCase()}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-white font-semibold text-sm">{session.name}</h3>
                      <div className={`w-2 h-2 rounded-full ${session.status === "open" ? "bg-emerald-400 animate-pulse" : "bg-gray-500"}`}></div>
                    </div>
                    
                    <p className="text-gray-400 text-xs mb-2">{session.timezone}</p>
                    
                    <div className="flex flex-col gap-1">
                      <p className="text-white font-mono text-xs">{session.time}</p>
                      <span className={`text-[10px] uppercase font-bold tracking-wider ${session.status === "open" ? "text-emerald-400" : "text-gray-500"}`}>
                        {session.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* LIVE CURRENCY PAIRS */}
            <Card className="bg-gray-900 border-gray-800">
              <div className="p-4 border-b border-gray-800">
                <h2 className="text-lg font-bold text-white">Live Currency Pairs</h2>
              </div>
              
              {/* DESKTOP: Table */}
              <div className="hidden sm:block overflow-x-auto p-4">
                <table className="w-full">
                  <thead>
                    <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-800">
                      <th className="text-left pb-3 font-medium">Pair</th>
                      <th className="text-right pb-3 font-medium">Price</th>
                      <th className="text-right pb-3 font-medium">Change %</th>
                      <th className="text-right pb-3 font-medium">Trend</th>
                      <th className="text-right pb-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {currencyPairs.map((pair, idx) => (
                      <tr key={idx} className="group hover:bg-gray-800/50 transition-colors">
                        <td className="py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center">
                              <i className="ri-currency-line text-blue-400 text-sm"></i>
                            </div>
                            <span className="text-white font-medium text-sm">{pair.pair}</span>
                          </div>
                        </td>
                        <td className="py-4 text-right text-white font-mono text-sm">{pair.price.toFixed(4)}</td>
                        <td className="py-4 text-right">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${pair.change >= 0 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                            {pair.change >= 0 ? "+" : ""}{pair.change.toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <i className={`${pair.trend === "up" ? "ri-arrow-up-line text-green-400" : "ri-arrow-down-line text-red-400"} text-lg`}></i>
                        </td>
                        <td className="py-4 text-right">
                          <button className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded transition opacity-0 group-hover:opacity-100">
                            Trade
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE: List View */}
              <div className="sm:hidden divide-y divide-gray-800">
                {currencyPairs.map((pair, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-800/30">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center">
                              <i className="ri-currency-line text-blue-400 text-lg"></i>
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-sm">{pair.pair}</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-gray-300 font-mono text-xs">{pair.price.toFixed(4)}</span>
                                <span className={`text-[10px] ${pair.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                                    {pair.change >= 0 ? "+" : ""}{pair.change.toFixed(2)}%
                                </span>
                            </div>
                        </div>
                    </div>
                    <button className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded active:scale-95 transition-transform">
                        Trade
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN: Sidebar */}
          <div className="space-y-6">
            
            {/* Market Overview */}
            <Card className="bg-gray-900 border-gray-800 p-5">
              <h3 className="text-white font-bold mb-4">Market Overview</h3>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 text-xs">Market Volatility</span>
                    <span className="text-emerald-400 text-xs font-bold uppercase">Moderate</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1.5">
                    <div className="bg-emerald-500 h-1.5 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: "60%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 text-xs">Trading Volume</span>
                    <span className="text-blue-400 text-xs font-bold uppercase">High</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1.5">
                    <div className="bg-blue-500 h-1.5 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: "85%" }}></div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Economic Calendar */}
            <Card className="bg-gray-900 border-gray-800 p-5">
              <h3 className="text-white font-bold mb-4">Economic Calendar</h3>
              <div className="space-y-3">
                <div className="p-3 bg-gray-800/50 border border-gray-800 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-white font-medium text-sm line-clamp-1">US Non-Farm Payrolls</p>
                      <p className="text-gray-500 text-xs mt-0.5">United States</p>
                    </div>
                    <span className="px-1.5 py-0.5 bg-red-500/10 text-red-400 rounded text-[10px] font-bold border border-red-500/20 whitespace-nowrap">
                      HIGH IMPACT
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs font-mono">Expected: 180K</p>
                </div>
                
                <div className="p-3 bg-gray-800/50 border border-gray-800 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-white font-medium text-sm line-clamp-1">ECB Rate Decision</p>
                      <p className="text-gray-500 text-xs mt-0.5">European Union</p>
                    </div>
                    <span className="px-1.5 py-0.5 bg-yellow-500/10 text-yellow-400 rounded text-[10px] font-bold border border-yellow-500/20 whitespace-nowrap">
                      MED IMPACT
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs font-mono">Expected: 4.50%</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}