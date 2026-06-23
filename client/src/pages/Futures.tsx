import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, Activity, Timer, ChevronDown, 
  XCircle, CheckCircle2, AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

// ──────────────────────────────────────────────────────────────
// 1. TYPES & DATA
// ──────────────────────────────────────────────────────────────

interface Position {
  symbol: string;
  side: "Long" | "Short";
  size: number;
  leverage: string;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  roi: number;
}

interface Order {
  symbol: string;
  type: string;
  side: "Long" | "Short";
  price: number;
  amount: number;
  filled: string;
}

const POSITIONS: Position[] = [
  { symbol: "BTC/USDT", side: "Long", size: 0.5, leverage: "10x", entryPrice: 43250, currentPrice: 43580, pnl: 165.0, roi: 7.63 },
  { symbol: "ETH/USDT", side: "Short", size: 5.0, leverage: "5x", entryPrice: 2280, currentPrice: 2265, pnl: 37.5, roi: 3.29 },
];

const OPEN_ORDERS: Order[] = [
  { symbol: "SOL/USDT", type: "Limit", side: "Long", price: 98.5, amount: 10, filled: "0%" },
  { symbol: "MATIC/USDT", type: "Stop Loss", side: "Short", price: 0.92, amount: 500, filled: "0%" },
];

const TIMEFRAMES = ["1m", "5m", "15m", "1h", "4h", "1d"];

const formatCurrency = (val: number) => 
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

const PositionsTable = ({ positions }: { positions: Position[] }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left font-grotesk">
      <thead className="bg-secondary/20 border-b border-border text-[10px] uppercase text-slate-400 font-bold tracking-wider">
        <tr>
          <th className="p-4">Symbol</th>
          <th className="p-4">Side/Lev</th>
          <th className="p-4 text-right">Size</th>
          <th className="p-4 text-right">Entry</th>
          <th className="p-4 text-right">Mark</th>
          <th className="p-4 text-right">PnL (ROI)</th>
          <th className="p-4 text-right">Action</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border/50 text-sm">
        {positions.map((pos, i) => (
          <tr key={i} className="hover:bg-secondary/20 transition-colors">
            <td className="p-4 font-700 text-white">{pos.symbol}</td>
            <td className="p-4">
              <div className="flex items-center gap-2">
                <span className={cn("text-xs font-bold", pos.side === "Long" ? "text-green-400" : "text-destructive")}>
                  {pos.side}
                </span>
                <Badge className="text-[9px] h-5 border-violet-400/25 bg-violet-500/10 text-violet-400 font-bold">{pos.leverage}</Badge>
              </div>
            </td>
            <td className="p-4 text-right text-slate-300 font-mono font-semibold">{pos.size}</td>
            <td className="p-4 text-right text-slate-400 font-mono">{formatCurrency(pos.entryPrice)}</td>
            <td className="p-4 text-right text-white font-mono font-bold">{formatCurrency(pos.currentPrice)}</td>
            <td className="p-4 text-right">
              <div className="flex flex-col items-end">
                <span className={cn("font-bold font-mono", pos.pnl >= 0 ? "text-green-400" : "text-destructive")}>
                  {pos.pnl >= 0 ? "+" : ""}{pos.pnl.toFixed(2)}
                </span>
                <span className={cn("text-[10px] font-mono", pos.roi >= 0 ? "text-green-400/80" : "text-destructive/80")}>
                  ({pos.roi >= 0 ? "+" : ""}{pos.roi}%)
                </span>
              </div>
            </td>
            <td className="p-4 text-right">
              <Button size="sm" variant="outline" className="h-7 text-xs border-border bg-secondary hover:bg-secondary/80 text-foreground font-bold">Close</Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const PositionsMobile = ({ positions }: { positions: Position[] }) => (
  <div className="flex flex-col divide-y divide-border/50 font-grotesk">
    {positions.map((pos, i) => (
      <div key={i} className="p-4 flex flex-col gap-3 hover:bg-secondary/15">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="font-700 text-white">{pos.symbol}</span>
            <Badge className="text-[9px] border-violet-400/20 bg-violet-500/10 text-violet-400 font-bold">{pos.leverage}</Badge>
          </div>
          <span className={cn("text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider", pos.side === "Long" ? "bg-green-550/10 text-green-400" : "bg-destructive/10 text-destructive")}>
            {pos.side}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <div className="text-slate-400">Entry: <span className="text-slate-200 font-mono font-bold">{formatCurrency(pos.entryPrice)}</span></div>
          <div className="text-slate-400">Mark: <span className="text-slate-200 font-mono font-bold">{formatCurrency(pos.currentPrice)}</span></div>
        </div>
        <div className="flex justify-between items-center bg-secondary/30 border border-border/40 p-2.5 rounded-xl">
          <div>
            <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider leading-none mb-1">Unrealized PNL</p>
            <p className={cn("font-mono font-bold text-sm leading-none", pos.pnl >= 0 ? "text-green-400" : "text-destructive")}>
              {pos.pnl >= 0 ? "+" : ""}{pos.pnl.toFixed(2)}
            </p>
          </div>
          <Button size="sm" className="h-8 bg-secondary border border-border text-foreground font-bold hover:bg-secondary/80 text-xs">Close Position</Button>
        </div>
      </div>
    ))}
  </div>
);

const OpenOrdersTable = ({ orders }: { orders: Order[] }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left font-grotesk">
      <thead className="bg-secondary/20 border-b border-border text-[10px] uppercase text-slate-400 font-bold tracking-wider">
        <tr>
          <th className="p-4">Symbol</th>
          <th className="p-4">Type</th>
          <th className="p-4">Side</th>
          <th className="p-4 text-right">Price</th>
          <th className="p-4 text-right">Amount</th>
          <th className="p-4 text-right">Action</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border/50 text-sm">
        {orders.map((order, i) => (
          <tr key={i} className="hover:bg-secondary/20 transition-colors">
            <td className="p-4 font-700 text-white">{order.symbol}</td>
            <td className="p-4"><Badge className="bg-secondary border border-border text-slate-300 text-[10px] font-bold">{order.type}</Badge></td>
            <td className="p-4">
              <span className={cn("text-xs font-bold", order.side === "Long" ? "text-green-400" : "text-destructive")}>
                {order.side}
              </span>
            </td>
            <td className="p-4 text-right font-mono text-slate-350">{formatCurrency(order.price)}</td>
            <td className="p-4 text-right font-mono text-slate-350">{order.amount}</td>
            <td className="p-4 text-right">
              <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10">Cancel</Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ──────────────────────────────────────────────────────────────
// 3. MAIN PAGE
// ──────────────────────────────────────────────────────────────

export default function Futures() {
  const [selectedPair, setSelectedPair] = useState("BTC/USDT");
  const [selectedTimeframe, setSelectedTimeframe] = useState("1h");
  const [tradeAmount, setTradeAmount] = useState("");

  return (
    <Layout>
      <div className="w-full max-w-[1600px] mx-auto px-4 py-6 space-y-6">
        
        {/* TOP BAR: Asset Selector & Timeframes */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border border-border p-4 rounded-xl shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/5 -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-300" />
          <div className="flex items-center gap-4 w-full sm:w-auto relative font-grotesk">
            <Select value={selectedPair} onValueChange={setSelectedPair}>
              <SelectTrigger className="w-[140px] bg-secondary border-border font-bold text-white">
                <SelectValue placeholder="Pair" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground font-grotesk">
                <SelectItem value="BTC/USDT">BTC/USDT</SelectItem>
                <SelectItem value="ETH/USDT">ETH/USDT</SelectItem>
                <SelectItem value="SOL/USDT">SOL/USDT</SelectItem>
              </SelectContent>
            </Select>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xl font-bold text-white">$43,580.00</span>
              <span className="text-green-450 text-sm font-semibold flex items-center"><TrendingUp className="w-3.5 h-3.5 mr-1" /> +2.4%</span>
            </div>
          </div>

          <div className="flex bg-secondary p-1 rounded-lg border border-border w-full sm:w-auto overflow-x-auto no-scrollbar relative font-grotesk">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex-1 sm:flex-none",
                  selectedTimeframe === tf 
                    ? "bg-card text-white shadow-sm" 
                    : "text-slate-550 hover:text-slate-350"
                )}
              >
                {tf.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* LEFT COLUMN: Chart & Tables */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* CHART */}
            <Card className="bg-card border-border h-[400px] sm:h-[500px] flex items-center justify-center relative overflow-hidden shadow-lg rounded-xl">
              <div className="text-center opacity-50 font-grotesk">
                <Activity className="w-16 h-16 mx-auto mb-4 text-slate-750 glow-text" />
                <p className="text-slate-400 text-sm font-semibold uppercase tracking-widest leading-none mb-2">TradingView Chart Placeholder</p>
                <p className="text-slate-500 text-xs mt-2 font-mono">{selectedPair} • {selectedTimeframe.toUpperCase()}</p>
              </div>
            </Card>

            {/* POSITIONS & ORDERS TABS */}
            <Card className="bg-card border-border min-h-[300px] rounded-xl shadow-lg">
              <Tabs defaultValue="positions" className="w-full">
                <div className="p-4 border-b border-border flex justify-between items-center font-grotesk">
                  <TabsList className="bg-secondary border border-border p-1 rounded-xl">
                    <TabsTrigger value="positions" className="text-xs font-bold">Positions ({POSITIONS.length})</TabsTrigger>
                    <TabsTrigger value="orders" className="text-xs font-bold">Open Orders ({OPEN_ORDERS.length})</TabsTrigger>
                  </TabsList>
                  <Button size="sm" variant="destructive" className="h-7 text-xs px-3 font-semibold">Close All</Button>
                </div>

                <TabsContent value="positions" className="m-0">
                  <div className="hidden md:block"><PositionsTable positions={POSITIONS} /></div>
                  <div className="md:hidden"><PositionsMobile positions={POSITIONS} /></div>
                </TabsContent>
                
                <TabsContent value="orders" className="m-0">
                  <OpenOrdersTable orders={OPEN_ORDERS} />
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* RIGHT COLUMN: Trade Panel */}
          <div className="space-y-6 font-grotesk">
            <Card className="bg-card border-border p-5 sticky top-6 rounded-xl shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/5 -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-300" />
              <Tabs defaultValue="long" className="w-full relative">
                <TabsList className="w-full bg-secondary border border-border grid grid-cols-2 mb-6 rounded-xl p-1">
                  <TabsTrigger value="long" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold rounded-lg py-2">Long</TabsTrigger>
                  <TabsTrigger value="short" className="data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground font-bold rounded-lg py-2">Short</TabsTrigger>
                </TabsList>

                <div className="space-y-5 text-sm">
                  <div className="flex justify-between text-xs text-slate-400 px-1 font-semibold">
                    <span>Avail: $1,240.50</span>
                    <span className="text-primary cursor-pointer hover:underline">Deposit</span>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-400 font-semibold">Order Type</Label>
                    <Select defaultValue="limit">
                      <SelectTrigger className="bg-secondary border-border text-foreground font-bold"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-card border-border text-foreground font-grotesk">
                        <SelectItem value="limit">Limit</SelectItem>
                        <SelectItem value="market">Market</SelectItem>
                        <SelectItem value="stop">Stop Limit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-400 font-semibold">Price (USDT)</Label>
                    <Input 
                      type="text" 
                      inputMode="decimal" 
                      placeholder="Market Price" 
                      className="bg-secondary border-border text-foreground font-bold font-mono" 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-400 font-semibold">Amount (BTC)</Label>
                    <Input 
                      type="text" 
                      inputMode="decimal" 
                      value={tradeAmount} 
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || /^\d*\.?\d*$/.test(val)) setTradeAmount(val);
                      }}
                      className="bg-secondary border-border text-foreground font-bold font-mono" 
                      placeholder="0.00" 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-400 font-semibold">Leverage</Label>
                    <div className="grid grid-cols-5 gap-1">
                      {['1x','5x','10x','20x','50x'].map(lev => (
                        <button key={lev} className="bg-secondary hover:bg-secondary/70 text-slate-350 text-[10px] font-bold py-1.5 rounded-lg border border-border transition-all">
                          {lev}
                        </button>
                      ))}
                    </div>
                  </div>

                  <TabsContent value="long" className="mt-4">
                    <Button className="w-full bg-primary hover:bg-primary/95 text-primary-foreground py-6 font-bold text-lg shadow-lg glow-primary rounded-xl transition-all">
                      Buy / Long
                    </Button>
                  </TabsContent>
                  <TabsContent value="short" className="mt-4">
                    <Button className="w-full bg-destructive hover:bg-destructive/95 text-destructive-foreground py-6 font-bold text-lg shadow-lg rounded-xl transition-all">
                      Sell / Short
                    </Button>
                  </TabsContent>

                  <div className="pt-4 border-t border-border">
                    <div className="flex justify-between text-xs text-slate-500 mb-1 font-semibold">
                      <span>Cost</span>
                      <span className="text-slate-300 font-mono font-bold">0.00 USDT</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 font-semibold">
                      <span>Max</span>
                      <span className="text-slate-300 font-mono font-bold">0.024 BTC</span>
                    </div>
                  </div>
                </div>
              </Tabs>
            </Card>
          </div>

        </div>
      </div>
    </Layout>
  );
}