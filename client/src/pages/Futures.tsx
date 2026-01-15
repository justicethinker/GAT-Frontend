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

// ──────────────────────────────────────────────────────────────
// 2. SUB-COMPONENTS
// ──────────────────────────────────────────────────────────────

const PositionsTable = ({ positions }: { positions: Position[] }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left">
      <thead className="bg-slate-950 text-xs uppercase text-slate-500 border-b border-slate-800">
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
      <tbody className="divide-y divide-slate-800 text-sm">
        {positions.map((pos, i) => (
          <tr key={i} className="hover:bg-slate-800/30">
            <td className="p-4 font-bold text-white">{pos.symbol}</td>
            <td className="p-4">
              <div className="flex gap-2">
                <span className={cn("text-xs font-bold", pos.side === "Long" ? "text-emerald-400" : "text-red-400")}>
                  {pos.side}
                </span>
                <Badge variant="outline" className="text-[10px] h-5 border-slate-700 text-slate-400">{pos.leverage}</Badge>
              </div>
            </td>
            <td className="p-4 text-right text-slate-300 font-mono">{pos.size}</td>
            <td className="p-4 text-right text-slate-400 font-mono">{formatCurrency(pos.entryPrice)}</td>
            <td className="p-4 text-right text-white font-mono">{formatCurrency(pos.currentPrice)}</td>
            <td className="p-4 text-right">
              <div className="flex flex-col items-end">
                <span className={cn("font-bold", pos.pnl >= 0 ? "text-emerald-400" : "text-red-400")}>
                  {pos.pnl >= 0 ? "+" : ""}{pos.pnl.toFixed(2)}
                </span>
                <span className={cn("text-[10px]", pos.roi >= 0 ? "text-emerald-500/70" : "text-red-500/70")}>
                  ({pos.roi >= 0 ? "+" : ""}{pos.roi}%)
                </span>
              </div>
            </td>
            <td className="p-4 text-right">
              <Button size="sm" variant="outline" className="h-7 text-xs border-slate-700 hover:bg-slate-800">Close</Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const PositionsMobile = ({ positions }: { positions: Position[] }) => (
  <div className="flex flex-col divide-y divide-slate-800">
    {positions.map((pos, i) => (
      <div key={i} className="p-4 flex flex-col gap-3 hover:bg-slate-800/30">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">{pos.symbol}</span>
            <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-400">{pos.leverage}</Badge>
          </div>
          <span className={cn("text-xs font-bold px-2 py-0.5 rounded bg-opacity-10", pos.side === "Long" ? "bg-emerald-500 text-emerald-400" : "bg-red-500 text-red-400")}>
            {pos.side}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <div className="text-slate-400">Entry: <span className="text-slate-200 font-mono">{formatCurrency(pos.entryPrice)}</span></div>
          <div className="text-slate-400">Mark: <span className="text-slate-200 font-mono">{formatCurrency(pos.currentPrice)}</span></div>
        </div>
        <div className="flex justify-between items-center bg-slate-950/50 p-2 rounded">
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold">Unrealized PNL</p>
            <p className={cn("font-mono font-bold text-sm", pos.pnl >= 0 ? "text-emerald-400" : "text-red-400")}>
              {pos.pnl >= 0 ? "+" : ""}{pos.pnl.toFixed(2)}
            </p>
          </div>
          <Button size="sm" className="h-8 bg-slate-800 hover:bg-slate-700 text-xs">Close Position</Button>
        </div>
      </div>
    ))}
  </div>
);

const OpenOrdersTable = ({ orders }: { orders: Order[] }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left">
      <thead className="bg-slate-950 text-xs uppercase text-slate-500 border-b border-slate-800">
        <tr>
          <th className="p-4">Symbol</th>
          <th className="p-4">Type</th>
          <th className="p-4">Side</th>
          <th className="p-4 text-right">Price</th>
          <th className="p-4 text-right">Amount</th>
          <th className="p-4 text-right">Action</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-800 text-sm">
        {orders.map((order, i) => (
          <tr key={i} className="hover:bg-slate-800/30">
            <td className="p-4 font-bold text-white">{order.symbol}</td>
            <td className="p-4"><Badge variant="secondary" className="bg-slate-800 text-slate-400 text-[10px]">{order.type}</Badge></td>
            <td className="p-4">
              <span className={cn("text-xs font-bold", order.side === "Long" ? "text-emerald-400" : "text-red-400")}>
                {order.side}
              </span>
            </td>
            <td className="p-4 text-right font-mono text-slate-300">{formatCurrency(order.price)}</td>
            <td className="p-4 text-right font-mono text-slate-300">{order.amount}</td>
            <td className="p-4 text-right">
              <Button size="sm" variant="ghost" className="h-7 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10">Cancel</Button>
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <Select value={selectedPair} onValueChange={setSelectedPair}>
              <SelectTrigger className="w-[140px] bg-slate-950 border-slate-800 font-bold text-white">
                <SelectValue placeholder="Pair" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-white">
                <SelectItem value="BTC/USDT">BTC/USDT</SelectItem>
                <SelectItem value="ETH/USDT">ETH/USDT</SelectItem>
                <SelectItem value="SOL/USDT">SOL/USDT</SelectItem>
              </SelectContent>
            </Select>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xl font-bold text-white">$43,580.00</span>
              <span className="text-emerald-400 text-sm font-medium flex items-center"><TrendingUp className="w-3 h-3 mr-1" /> +2.4%</span>
            </div>
          </div>

          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 w-full sm:w-auto overflow-x-auto no-scrollbar">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-all flex-1 sm:flex-none",
                  selectedTimeframe === tf 
                    ? "bg-slate-800 text-white shadow-sm" 
                    : "text-slate-500 hover:text-slate-300"
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
            <Card className="bg-slate-900 border-slate-800 h-[400px] sm:h-[500px] flex items-center justify-center relative overflow-hidden">
              <div className="text-center opacity-50">
                <Activity className="w-16 h-16 mx-auto mb-4 text-slate-700" />
                <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">TradingView Chart Placeholder</p>
                <p className="text-slate-600 text-xs mt-2">{selectedPair} • {selectedTimeframe.toUpperCase()}</p>
              </div>
              {/* Add real TradingView widget here in production */}
            </Card>

            {/* POSITIONS & ORDERS TABS */}
            <Card className="bg-slate-900 border-slate-800 min-h-[300px]">
              <Tabs defaultValue="positions" className="w-full">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                  <TabsList className="bg-slate-950 border border-slate-800">
                    <TabsTrigger value="positions" className="text-xs">Positions ({POSITIONS.length})</TabsTrigger>
                    <TabsTrigger value="orders" className="text-xs">Open Orders ({OPEN_ORDERS.length})</TabsTrigger>
                  </TabsList>
                  <Button size="sm" variant="destructive" className="h-7 text-xs px-3">Close All</Button>
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
          <div className="space-y-6">
            <Card className="bg-slate-900 border-slate-800 p-5 sticky top-6">
              <Tabs defaultValue="long" className="w-full">
                <TabsList className="w-full bg-slate-950 border border-slate-800 grid grid-cols-2 mb-6">
                  <TabsTrigger value="long" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Long</TabsTrigger>
                  <TabsTrigger value="short" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">Short</TabsTrigger>
                </TabsList>

                <div className="space-y-5">
                  <div className="flex justify-between text-xs text-slate-400 px-1">
                    <span>Avail: $1,240.50</span>
                    <span className="text-emerald-400 cursor-pointer hover:underline">Deposit</span>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-slate-400">Order Type</Label>
                    <Select defaultValue="limit">
                      <SelectTrigger className="bg-slate-950 border-slate-800"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-white">
                        <SelectItem value="limit">Limit</SelectItem>
                        <SelectItem value="market">Market</SelectItem>
                        <SelectItem value="stop">Stop Limit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-slate-400">Price (USDT)</Label>
                    <Input 
                      type="text" 
                      inputMode="decimal" 
                      placeholder="Market Price" 
                      className="bg-slate-950 border-slate-800" 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-slate-400">Amount (BTC)</Label>
                    <Input 
                      type="text" 
                      inputMode="decimal" 
                      value={tradeAmount} 
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || /^\d*\.?\d*$/.test(val)) setTradeAmount(val);
                      }}
                      className="bg-slate-950 border-slate-800" 
                      placeholder="0.00" 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-slate-400">Leverage</Label>
                    <div className="grid grid-cols-5 gap-1">
                      {['1x','5x','10x','20x','50x'].map(lev => (
                        <button key={lev} className="bg-slate-950 hover:bg-slate-800 text-slate-400 text-[10px] py-1.5 rounded border border-slate-800 transition">
                          {lev}
                        </button>
                      ))}
                    </div>
                  </div>

                  <TabsContent value="long" className="mt-4">
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 py-6 font-bold text-lg">
                      Buy / Long
                    </Button>
                  </TabsContent>
                  <TabsContent value="short" className="mt-4">
                    <Button className="w-full bg-red-600 hover:bg-red-700 py-6 font-bold text-lg">
                      Sell / Short
                    </Button>
                  </TabsContent>

                  <div className="pt-4 border-t border-slate-800">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Cost</span>
                      <span className="text-slate-300 font-mono">0.00 USDT</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Max</span>
                      <span className="text-slate-300 font-mono">0.024 BTC</span>
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