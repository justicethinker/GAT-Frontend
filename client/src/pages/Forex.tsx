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

const SessionCard = ({ session }: { session: session }) => {
  const isOpen = session.status === "open";
  
  return (
    <div className={cn(
      "p-4 rounded-xl border transition-all relative overflow-hidden group font-grotesk",
      isOpen 
        ? "bg-secondary/35 border-amber-500/30 shadow-lg shadow-amber-900/5" 
        : "bg-secondary/15 border-border opacity-70"
    )}>
      <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-amber-550/5 -translate-y-1/2 translate-x-1/2" />
      <div className="flex justify-between items-start mb-3 relative">
        <div className="flex items-center gap-2">
          <Globe className={cn("w-4 h-4 shrink-0", isOpen ? "text-amber-400 glow-text" : "text-slate-500")} />
          <h3 className="text-white font-bold text-sm leading-none">{session.name}</h3>
        </div>
        <div className={cn("w-2 h-2 rounded-full", isOpen ? "bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]" : "bg-slate-650")} />
      </div>
      
      <div className="space-y-1 relative text-xs">
        <p className="text-slate-500 font-medium">{session.timezone}</p>
        <p className="text-white font-mono text-sm font-bold tracking-tight">{session.time}</p>
        <span className={cn(
          "inline-block mt-1 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border leading-none",
          isOpen 
            ? "text-amber-400 bg-amber-500/10 border-amber-500/20" 
            : "text-slate-500 bg-secondary border-border"
        )}>
          {session.status}
        </span>
      </div>
    </div>
  );
};

const MarketMetric = ({ title, value, status, width }: { title: string, value: string, status: string, width: string }) => (
  <div className="font-grotesk">
    <div className="flex justify-between items-center mb-2">
      <span className="text-slate-400 text-xs font-semibold">{title}</span>
      <span className={cn(
        "text-xs font-bold uppercase",
        status === "High" ? "text-amber-400" : "text-primary"
      )}>{status}</span>
    </div>
    <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden border border-border/30">
      <div 
        className={cn(
          "h-full rounded-full transition-all duration-500",
          status === "High" ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" : "bg-primary shadow-[0_0_8px_rgba(47,211,193,0.4)]"
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
      <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* TRADING SESSIONS */}
            <Card className="bg-card border-border p-6 rounded-xl shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-amber-550/5 -translate-y-1/2 translate-x-1/2 group-hover:scale-105 transition-transform duration-500" />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative font-grotesk">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-400" />
                    Trading Sessions
                  </h2>
                  <p className="text-slate-400 text-xs mt-1">Global market operating hours</p>
                </div>
                <div className="bg-secondary border border-border px-4 py-2 rounded-lg text-amber-400 font-mono text-sm font-bold shadow-inner">
                  {currentTime.toLocaleTimeString()}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
                {SESSIONS.map((session) => (
                  <SessionCard key={session.name} session={session} />
                ))}
              </div>
            </Card>

            {/* LIVE CURRENCY PAIRS */}
            <Card className="bg-card border-border overflow-hidden rounded-xl shadow-lg">
              <div className="p-6 border-b border-border font-grotesk">
                <h2 className="text-lg font-bold text-white flex items-center gap-2 leading-none">
                  <Activity className="w-5 h-5 text-primary glow-text" />
                  Live Markets
                </h2>
              </div>
              
              {/* DESKTOP TABLE */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left font-grotesk">
                  <thead className="bg-secondary/20 text-[10px] uppercase text-slate-400 font-bold border-b border-border tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Pair</th>
                      <th className="px-6 py-4 text-right">Price</th>
                      <th className="px-6 py-4 text-right">Change %</th>
                      <th className="px-6 py-4 text-right">Trend</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50 text-sm">
                    {CURRENCY_PAIRS.map((pair) => (
                      <tr key={pair.pair} className="group hover:bg-secondary/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-sm shrink-0">
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
                            "px-2 py-1 rounded text-xs font-bold border leading-none block w-fit ml-auto",
                            pair.change >= 0 
                              ? "bg-green-500/10 text-green-400 border-green-550/20" 
                              : "bg-destructive/10 text-destructive border-destructive/20"
                          )}>
                            {pair.change >= 0 ? "+" : ""}{pair.change.toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {pair.trend === "up" 
                            ? <ArrowUpRight className="w-5 h-5 text-green-400 ml-auto" /> 
                            : <ArrowDownRight className="w-5 h-5 text-destructive ml-auto" />
                          }
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button 
                            size="sm" 
                            className="bg-primary hover:bg-primary/95 text-primary-foreground h-8 text-xs font-bold opacity-0 group-hover:opacity-100 transition-all shadow-md glow-primary font-grotesk rounded-lg"
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
              <div className="sm:hidden divide-y divide-border/50 text-sm">
                {CURRENCY_PAIRS.map((pair) => (
                  <div key={pair.pair} className="p-4 flex items-center justify-between hover:bg-secondary/15 font-grotesk">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-sm shrink-0">
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-sm leading-none mb-1.5">{pair.pair}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-450 font-mono text-xs leading-none">{pair.price.toFixed(4)}</span>
                          <span className={cn("text-[10px] font-bold leading-none", pair.change >= 0 ? "text-green-400" : "text-destructive")}>
                            {pair.change >= 0 ? "+" : ""}{pair.change.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold shadow-md h-8 text-xs rounded-lg transition-all">Trade</Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Market Overview */}
            <Card className="bg-card border-border p-6 rounded-xl shadow-lg">
              <h3 className="text-white font-bold mb-6 flex items-center gap-2 font-grotesk text-sm">
                <TrendingUp className="w-5 h-5 text-amber-400" />
                Market Overview
              </h3>
              <div className="space-y-6">
                <MarketMetric title="Market Volatility" value="" status="Moderate" width="60%" />
                <MarketMetric title="Trading Volume" value="" status="High" width="85%" />
              </div>
            </Card>

            {/* Economic Calendar */}
            <Card className="bg-card border-border p-6 rounded-xl shadow-lg font-grotesk">
              <h3 className="text-white font-bold mb-6 flex items-center gap-2 text-sm">
                <CalendarDays className="w-5 h-5 text-amber-400" />
                Economic Calendar
              </h3>
              <div className="space-y-4">
                
                <div className="p-4 bg-secondary/45 border border-border/50 rounded-xl hover:border-primary/45 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-white font-bold text-sm">US Non-Farm Payrolls</p>
                      <p className="text-slate-500 text-xs mt-0.5">United States</p>
                    </div>
                    <span className="px-2 py-0.5 bg-destructive/10 text-destructive rounded text-[9px] font-bold border border-destructive/20 tracking-wider">
                      HIGH
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs font-mono bg-secondary/70 inline-block px-2 py-1 rounded">Expected: 180K</p>
                </div>
                
                <div className="p-4 bg-secondary/45 border border-border/50 rounded-xl hover:border-primary/45 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-white font-bold text-sm">ECB Rate Decision</p>
                      <p className="text-slate-500 text-xs mt-0.5">European Union</p>
                    </div>
                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded text-[9px] font-bold border border-amber-500/20 tracking-wider">
                      MED
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs font-mono bg-secondary/70 inline-block px-2 py-1 rounded">Expected: 4.50%</p>
                </div>

              </div>
            </Card>
          </div>

        </div>
      </div>
    </Layout>
  );
}