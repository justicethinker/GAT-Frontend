import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";

export default function Forex() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const sessions = [
    {
      name: "Sydney",
      timezone: "AEDT",
      status: "closed",
      volume: "Low",
      time: "08:30",
      color: "gray",
    },
    {
      name: "Tokyo",
      timezone: "JST",
      status: "closed",
      volume: "Medium",
      time: "10:00",
      color: "gray",
    },
    {
      name: "London",
      timezone: "GMT",
      status: "open",
      volume: "High",
      time: "09:15",
      color: "emerald",
    },
    {
      name: "New York",
      timezone: "EST",
      status: "open",
      volume: "High",
      time: "10:30",
      color: "emerald",
    },
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <Card className="bg-gray-900 border-emerald-500/30 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-0">Trading Sessions</h2>
                <div className="text-emerald-400 font-mono text-sm sm:text-base" data-testid="text-current-time">
                  {currentTime.toLocaleTimeString()}
                </div>
              </div>

              <div className="hidden sm:grid sm:grid-cols-4 gap-4">
                {sessions.map((session, idx) => (
                  <Card key={idx} className="bg-gray-800 border-gray-700 p-4" data-testid={`session-${session.name.toLowerCase()}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-white font-semibold text-lg">{session.name}</h3>
                        <p className="text-gray-400 text-sm">{session.timezone}</p>
                      </div>
                      <div className="text-right">
                        <div
                          className={`w-3 h-3 rounded-full mb-1 ${session.status === "open" ? "bg-emerald-400" : "bg-gray-400"}`}
                        ></div>
                        <p className="text-white font-mono text-sm">{session.time}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          session.status === "open"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-gray-600 text-gray-300"
                        }`}
                      >
                        {session.status === "open" ? "Open" : "Closed"}
                      </span>
                      <span className="text-gray-400 text-sm">Volume: {session.volume}</span>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="block sm:hidden space-y-3">
                {sessions.map((session, idx) => (
                  <Card key={idx} className="bg-gray-800 border-gray-700 p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-white font-semibold text-lg">{session.name}</h3>
                        <p className="text-gray-400 text-sm">{session.timezone}</p>
                      </div>
                      <div className="text-right">
                        <div
                          className={`w-3 h-3 rounded-full mb-1 ${session.status === "open" ? "bg-emerald-400" : "bg-gray-400"}`}
                        ></div>
                        <p className="text-white font-mono text-sm">{session.time}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          session.status === "open"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-gray-600 text-gray-300"
                        }`}
                      >
                        {session.status === "open" ? "Open" : "Closed"}
                      </span>
                      <span className="text-gray-400 text-sm">Volume: {session.volume}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            <Card className="bg-gray-900 border-gray-800 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Live Currency Pairs</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-gray-400 text-sm border-b border-gray-800">
                      <th className="text-left pb-3">Pair</th>
                      <th className="text-right pb-3">Price</th>
                      <th className="text-right pb-3">Change %</th>
                      <th className="text-right pb-3">Trend</th>
                      <th className="text-right pb-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {currencyPairs.map((pair, idx) => (
                      <tr key={idx} className="hover:bg-gray-800/50 transition-colors" data-testid={`pair-${pair.pair.replace('/', '-')}`}>
                        <td className="py-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center">
                              <i className="ri-currency-line text-blue-400 text-sm"></i>
                            </div>
                            <span className="text-white font-medium">{pair.pair}</span>
                          </div>
                        </td>
                        <td className="py-4 text-right text-white font-mono font-bold">{pair.price.toFixed(4)}</td>
                        <td className="py-4 text-right">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              pair.change >= 0
                                ? "bg-green-500/10 text-green-400"
                                : "bg-red-500/10 text-red-400"
                            }`}
                          >
                            {pair.change >= 0 ? "+" : ""}
                            {pair.change.toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <i
                            className={`${
                              pair.trend === "up"
                                ? "ri-arrow-up-line text-green-400"
                                : "ri-arrow-down-line text-red-400"
                            } text-xl`}
                          ></i>
                        </td>
                        <td className="py-4 text-right">
                          <button
                            data-testid={`button-trade-${pair.pair.replace('/', '-')}`}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded transition"
                          >
                            Trade
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-gray-900 border-gray-800 p-4 sm:p-6">
              <h3 className="text-white font-semibold mb-4">Market Overview</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-400 text-sm">Market Volatility</span>
                    <span className="text-emerald-400 text-sm font-medium">Moderate</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "60%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-400 text-sm">Trading Volume</span>
                    <span className="text-blue-400 text-sm font-medium">High</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: "85%" }}></div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-gray-900 border-gray-800 p-4 sm:p-6">
              <h3 className="text-white font-semibold mb-4">Economic Calendar</h3>
              <div className="space-y-3">
                <div className="p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-white font-medium text-sm">US Non-Farm Payrolls</p>
                      <p className="text-gray-400 text-xs">United States</p>
                    </div>
                    <span className="px-2 py-1 bg-red-500/10 text-red-400 rounded text-xs font-medium">
                      High Impact
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs">Expected: 180K</p>
                </div>
                <div className="p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-white font-medium text-sm">ECB Interest Rate Decision</p>
                      <p className="text-gray-400 text-xs">European Union</p>
                    </div>
                    <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 rounded text-xs font-medium">
                      Medium Impact
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs">Expected: 4.50%</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
