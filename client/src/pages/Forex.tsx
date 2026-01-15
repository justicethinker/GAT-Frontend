import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowUpRight, ArrowDownRight, Clock, Globe, 
  TrendingUp, Activity, CalendarDays, DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";

// ──────────────────────────────────────────────────────────────
// 1. TYPES & DATA
// ──────────────────────────────────────────────────────────────

interface Session {
  name: string;
  timezone: string;
  status: "open" | "closed";
  volume: "Low" | "Medium" | "High";
  time: string;
}

interface CurrencyPair {
  pair: string;
  price: number;
  change: number;
  trend: "up" | "down";
}

const SESSIONS: Session[] = [
  { name: "Sydney", timezone: "AEDT", status: "closed", volume: "Low", time: "08:30" },
  { name: "Tokyo", timezone: "JST", status: "closed", volume: "Medium", time: "10:00" },
  { name: "London", timezone: "GMT", status: "open", volume: "High", time: "09:15" },
  { name: "New York", timezone: "EST", status: "open", volume: "High", time: "10:30" },
];

const CURRENCY_PAIRS: CurrencyPair[] = [
  { pair: "EUR/USD", price: 1.0842, change: 0.12, trend: "up" },
  { pair: "GBP/USD", price: 1.2654, change: -0.08, trend: "down" },
  { pair: "USD/JPY", price: 149.82, change: 0.24, trend: "up" },
  { pair: "USD/CHF", price: 0.8834, change: 0.05, trend: "up" },
  { pair: "AUD/USD", price: 0.6523, change: -0.15, trend: "down" },
  { pair: "USD/CAD", price: 1.3845, change: 0.18, trend: "up" },
];

// ──────────────────────────────────────────────────────────────
// 2. SUB-COMPONENTS
// ──────────────────────────────────────────────────────────────

const SessionCard = ({ session }: { session: Session }) => {
  const isOpen = session.status === "open";
  
  return (
    <div className={cn(
      "p-4 rounded-xl border transition-all",
      isOpen 
        ? "bg-slate-800 border-emerald-500/30 shadow-lg shadow-emerald-900/10" 
        : "bg-slate-900/50 border-slate-800 opacity-70"
    )}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <Globe className={cn("w-4 h-4", isOpen ? "text-emerald-400" : "text-slate-500")} />
          <h3 className="text-white font-bold text-sm">{session.name}</h3>
        </div>
        <div className={cn("w-2 h-2 rounded-full", isOpen ? "bg-emerald-400 animate-pulse" : "bg-slate-600")} />
      </div>
      
      <div className="space-y-1">
        <p className="text-slate-400 text-xs font-medium">{session.timezone}</p>
        <p className="text-white font-mono text-sm font-bold tracking-tight">{session.time}</p>
        <span className={cn(
          "inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border",
          isOpen 
            ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" 
            : "text-slate-500 bg-slate-800 border-slate-700"
        )}>
          {session.status}
        </span>
      </div>
    </div>
  );
};

const MarketMetric = ({ title, value, status, width }: { title: string, value: string, status: string, width: string }) => (
  <div>
    <div className="flex justify-between items-center mb-2">
      <span className="text-slate-400 text-xs font-medium">{title}</span>
      <span className={cn(
        "text-xs font-bold uppercase",
        status === "High" ? "text-blue-400" : "text-emerald-400"
      )}>{status}</span>
    </div>
    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
      <div 
        className={cn(
          "h-full rounded-full shadow-[0_0_10px_currentColor]",
          status === "High" ? "bg-blue-500 text-blue-500" : "bg-emerald-500 text-emerald-500"
        )} 
        style={{ width }} 
      />
    </div>
  </div>
);

// ──────────────────────────────────────────────────────────────
// 3. MAIN COMPONENT
// ──────────────────────────────────────────────────────────────

export default function Forex() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* TRADING SESSIONS */}
            <Card className="bg-slate-900 border-slate-800 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-emerald-500" />
                    Trading Sessions
                  </h2>
                  <p className="text-slate-400 text-xs mt-1">Global market operating hours</p>
                </div>
                <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-lg text-emerald-400 font-mono text-sm shadow-inner">
                  {currentTime.toLocaleTimeString()}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {SESSIONS.map((session) => (
                  <SessionCard key={session.name} session={session} />
                ))}
              </div>
            </Card>

            {/* LIVE CURRENCY PAIRS */}
            <Card className="bg-slate-900 border-slate-800 overflow-hidden">
              <div className="p-6 border-b border-slate-800">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-500" />
                  Live Markets
                </h2>
              </div>
              
              {/* DESKTOP TABLE */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-950 text-xs uppercase text-slate-500 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4">Pair</th>
                      <th className="px-6 py-4 text-right">Price</th>
                      <th className="px-6 py-4 text-right">Change %</th>
                      <th className="px-6 py-4 text-right">Trend</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-sm">
                    {CURRENCY_PAIRS.map((pair) => (
                      <tr key={pair.pair} className="group hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                              <DollarSign className="w-4 h-4" />
                            </div>
                            <span className="font-bold text-white">{pair.pair}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-slate-300">
                          {pair.price.toFixed(4)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={cn(
                            "px-2 py-1 rounded text-xs font-bold",
                            pair.change >= 0 
                              ? "bg-emerald-500/10 text-emerald-400" 
                              : "bg-red-500/10 text-red-400"
                          )}>
                            {pair.change >= 0 ? "+" : ""}{pair.change.toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {pair.trend === "up" 
                            ? <ArrowUpRight className="w-5 h-5 text-emerald-500 ml-auto" /> 
                            : <ArrowDownRight className="w-5 h-5 text-red-500 ml-auto" />
                          }
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button 
                            size="sm" 
                            className="bg-emerald-600 hover:bg-emerald-500 h-8 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Trade
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE LIST */}
              <div className="sm:hidden divide-y divide-slate-800">
                {CURRENCY_PAIRS.map((pair) => (
                  <div key={pair.pair} className="p-4 flex items-center justify-between hover:bg-slate-800/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-sm">{pair.pair}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-slate-400 font-mono text-xs">{pair.price.toFixed(4)}</span>
                          <span className={cn("text-[10px] font-bold", pair.change >= 0 ? "text-emerald-400" : "text-red-400")}>
                            {pair.change >= 0 ? "+" : ""}{pair.change.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" className="bg-emerald-600 h-8 text-xs font-bold">Trade</Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Market Overview */}
            <Card className="bg-slate-900 border-slate-800 p-6">
              <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                Market Overview
              </h3>
              <div className="space-y-6">
                <MarketMetric title="Market Volatility" value="" status="Moderate" width="60%" />
                <MarketMetric title="Trading Volume" value="" status="High" width="85%" />
              </div>
            </Card>

            {/* Economic Calendar */}
            <Card className="bg-slate-900 border-slate-800 p-6">
              <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-yellow-500" />
                Economic Calendar
              </h3>
              <div className="space-y-4">
                
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-white font-bold text-sm">US Non-Farm Payrolls</p>
                      <p className="text-slate-500 text-xs mt-0.5">United States</p>
                    </div>
                    <span className="px-2 py-0.5 bg-red-500/10 text-red-400 rounded text-[10px] font-bold border border-red-500/20">
                      HIGH
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs font-mono bg-slate-900/50 inline-block px-2 py-1 rounded">Expected: 180K</p>
                </div>
                
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-white font-bold text-sm">ECB Rate Decision</p>
                      <p className="text-slate-500 text-xs mt-0.5">European Union</p>
                    </div>
                    <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-400 rounded text-[10px] font-bold border border-yellow-500/20">
                      MED
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs font-mono bg-slate-900/50 inline-block px-2 py-1 rounded">Expected: 4.50%</p>
                </div>

              </div>
            </Card>
          </div>

        </div>
      </div>
    </Layout>
  );
}