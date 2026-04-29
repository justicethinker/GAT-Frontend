import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Play, Square, Filter, ArrowRightLeft, 
  History, Loader2, CheckCircle2, UploadCloud, FileText
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { buildUrl } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";

// ──────────────────────────────────────────────────────────────
// 1. CONFIGURATION & TYPES
// ──────────────────────────────────────────────────────────────

interface Opportunity {
  symbol: string;
  buy_exchange: string;
  sell_exchange: string;
  buy_price: number;
  sell_price: number;
  profit_percent: number;
}

interface UserInfo {
  balance_forex: number;
  balance_arb: number;
  balance_fut: number;
  total_pl: number;
  active_trade: number;
}

// Zod Schemas
const TradeSchema = z.object({
  symbol: z.string().min(1, "Symbol is required"),
  buy_exchange: z.string().min(1, "Buy Exchange required"),
  sell_exchange: z.string().min(1, "Sell Exchange required"),
  qty: z.coerce.number().positive("Quantity must be > 0"),
});

const WalletSchema = z.object({
  amount: z.coerce.number().positive("Amount must be > 0"),
  currency: z.string().optional(),
  from: z.enum(["forex", "arb", "fut"]).optional(),
  to: z.enum(["forex", "arb", "fut"]).optional(),
  address: z.string().optional(),
}).refine((data) => !data.from || !data.to || data.from !== data.to, {
  message: "Source and destination cannot be the same",
  path: ["to"],
});

type TradeFormValues = z.infer<typeof TradeSchema>;
type WalletFormValues = z.infer<typeof WalletSchema>;

// ──────────────────────────────────────────────────────────────
// 2. UTILITY: ROBUST FETCHER
// ──────────────────────────────────────────────────────────────

const authenticatedFetcher = async (context: { queryKey: readonly unknown[] }) => {
  const [path, params] = context.queryKey as [string, any?];
  const url = new URL(buildUrl(path), window.location.origin);
  const token = sessionStorage.getItem("token");

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) value.forEach((v) => url.searchParams.append(key, String(v)));
      else if (value != null && value !== "") url.searchParams.append(key, String(value));
    });
  }

  const res = await fetch(url.toString(), {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || errorBody.message || "API Error");
  }
  return res.json();
};

// ──────────────────────────────────────────────────────────────
// 3. CUSTOM HOOK: SCANNER LOGIC
// ──────────────────────────────────────────────────────────────

function useArbitrageScanner() {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [minProfit, setMinProfit] = useState(0.01);
  const [foundOpps, setFoundOpps] = useState<Opportunity[]>([]);

  const DEFAULT_EXCHANGES = ["COINEX", "COINW", "BINGX", "GATEIO", "MEXC", "BINANCE"];
  const DEFAULT_SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "TRXUSDT", "APEUSDT", "DOGEUSDT", "BNBUSDT", "AVAXUSDT", "CAKEUSDT"];

  const [filters, setFilters] = useState({
    exchanges: DEFAULT_EXCHANGES,
    symbols: DEFAULT_SYMBOLS,
  });

  useEffect(() => {
    setIsRunning(true);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning) {
      timer = setInterval(() => {
        setMinProfit((prev) => {
          if (prev <= 0.0000015) {
            setIsRunning(false);
            toast({ title: "Scan Complete", description: "Minimum profit threshold reached." });
            return 0.01;
          }
          return prev / 10;
        });
      }, 30_000);
    }
    return () => clearInterval(timer);
  }, [isRunning, toast]);

  const { data } = useQuery({
    queryKey: ["/arb/opportunity-scanner", { ...filters, min_profit: minProfit }],
    queryFn: authenticatedFetcher,
    enabled: isRunning,
    refetchInterval: 10_000,
  });

  useEffect(() => {
    if (!data) return;
    const newItems = Array.isArray(data) ? data : data.opportunities || [];
    
    if (newItems.length > 0) {
      setFoundOpps(prev => {
        const map = new Map(prev.map(o => [`${o.symbol}-${o.buy_exchange}-${o.sell_exchange}`, o]));
        newItems.forEach((o: Opportunity) => map.set(`${o.symbol}-${o.buy_exchange}-${o.sell_exchange}`, o));
        return Array.from(map.values());
      });
    }
  }, [data]);

//this ensures once if i start the scanner, it will set the Opps array to an empty one.
  const handleToggle = () => {
    if (!isRunning) {
      setFoundOpps([]);
    }
    setIsRunning(p => !p);
  };


  return { isRunning, toggle: () => handleToggle(), minProfit, setMinProfit, foundOpps, filters, setFilters };
}

// ──────────────────────────────────────────────────────────────
// 4. MAIN COMPONENT
// ──────────────────────────────────────────────────────────────

export default function Arbitrage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const scanner = useArbitrageScanner();
  const [activeWallet, setActiveWallet] = useState<'arb' | 'forex' | 'fut'>('arb');

  // Queries
  const { data: userInfo, isLoading: userLoading } = useQuery<UserInfo>({
    queryKey: ["/auth/user-info"],
    queryFn: authenticatedFetcher,
  });
  const { data: exchangeList = [] } = useQuery({ queryKey: ["/arb/arbitrage-exc"], queryFn: authenticatedFetcher, staleTime: Infinity });
  const { data: symbolList = [], isLoading: symbolsLoading } = useQuery({ queryKey: ["/arb/arbitrage-symbol"], queryFn: authenticatedFetcher, staleTime: Infinity });
  const { data: recentTrades = [] } = useQuery({ queryKey: ["/dash/recent-trades"], queryFn: authenticatedFetcher });
  const { data: userArbTrades = [] } = useQuery({ queryKey: ["/arb/user-arb"], queryFn: authenticatedFetcher });

  // --- Forms & Modals ---
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  
  // State for Inputs
  const [quickAmount, setQuickAmount] = useState(""); 
  const [receipt, setReceipt] = useState<File | null>(null); // State for Deposit Receipt

  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [walletAction, setWalletAction] = useState<"deposit" | "withdraw" | "transfer">("deposit");

  const walletForm = useForm<WalletFormValues>({ 
    resolver: zodResolver(WalletSchema),
    defaultValues: { from: "forex", to: "arb" }
  });
  const manualTradeForm = useForm<TradeFormValues>({ resolver: zodResolver(TradeSchema) });

  // --- Mutations ---
  const tradeMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(buildUrl('/arb/perform-arb-trade'), {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionStorage.getItem("token")}` },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).detail || "Trade Failed");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Order Placed", className: "bg-emerald-600 text-white" });
      queryClient.invalidateQueries({ queryKey: ["/auth/user-info"] });
      queryClient.invalidateQueries({ queryKey: ["/dash/recent-trades"] });
      queryClient.invalidateQueries({ queryKey: ["/arb/user-arb"] });
      setTradeModalOpen(false);
      setQuickAmount("");
      manualTradeForm.reset();
    },
    onError: (e) => toast({ title: "Trade Failed", description: e.message, variant: "destructive" }),
  });

  const walletMutation = useMutation({
    mutationFn: async (data: WalletFormValues) => {
      const endpoints = { transfer: "/dash/transfer", deposit: "/dash/deposits", withdraw: "/dash/withdrawals" };
      const endpoint = endpoints[walletAction];
      const headers: any = { Authorization: `Bearer ${sessionStorage.getItem("token")}` };
      let body: any;

      if (walletAction === 'deposit') {
        if (!receipt) throw new Error("Receipt is required for deposits.");
        
        const formData = new FormData();
        formData.append("amount", String(data.amount));
        formData.append("currency", data.currency || "USDT");
        formData.append("receipt", receipt); // Attach Receipt
        body = formData; 
        delete headers["Content-Type"]; // Browser sets boundary automatically
      } else {
        headers["Content-Type"] = "application/json";
        body = JSON.stringify(walletAction === 'transfer' 
          ? { amount: data.amount, from_wallet: data.from, to_wallet: data.to }
          : { amount: data.amount, currency: data.currency, wallet_address: data.address }
        );
      }

      const res = await fetch(buildUrl(endpoint), { method: "POST", headers, body });
      if (!res.ok) throw new Error((await res.json()).detail || "Transaction Failed");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: `${walletAction} submitted successfully.` });
      setWalletModalOpen(false);
      walletForm.reset();
      setReceipt(null); // Reset receipt
      queryClient.invalidateQueries({ queryKey: ["/auth/user-info"] });
    },
    onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" })
  });

  const handleQuickTrade = (opp: Opportunity) => {
    setSelectedOpp(opp);
    setQuickAmount(""); 
    setTradeModalOpen(true);
  };

  const confirmQuickTrade = (qty: number) => {
    if (!selectedOpp || isNaN(qty) || qty <= 0) {
      toast({ title: "Invalid Amount", variant: "destructive" });
      return;
    }
    tradeMutation.mutate({
      symbol: selectedOpp.symbol,
      buy_exchange: selectedOpp.buy_exchange,
      sell_exchange: selectedOpp.sell_exchange,
      qty
    });
  };

  const toggleItem = (list: string[], item: string) => 
    list.includes(item) ? list.filter(i => i !== item) : [...list, item];

  const getBalance = () => userInfo ? userInfo[`balance_${activeWallet}` as keyof UserInfo] || 0 : 0;

  return (
    <Layout>
      <div className="w-full min-h-screen bg-gray-950 px-4 py-6 space-y-6">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-lg">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              Arbitrage Scanner
              {scanner.isRunning && (
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50 animate-pulse">
                  Scanning @ {(scanner.minProfit * 100).toFixed(3)}%
                </Badge>
              )}
            </h1>
            <p className="text-gray-400 text-sm mt-1">Real-time cross-exchange opportunity detector.</p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
             <Sheet>
               <SheetTrigger asChild>
                 <Button variant="outline" className="lg:hidden border-gray-700 text-gray-300">
                   <Filter className="w-4 h-4 mr-2" /> Filters
                 </Button>
               </SheetTrigger>
               <SheetContent side="left" className="bg-gray-900 border-gray-800 text-white">
                 <SheetHeader className="mb-4"><SheetTitle className="text-white">Scanner Filters</SheetTitle></SheetHeader>
                 <FilterContent 
                    exchanges={exchangeList} 
                    symbols={symbolList}
                    selectedExchanges={scanner.filters.exchanges}
                    selectedSymbols={scanner.filters.symbols}
                    onToggleExchange={(e: string) => scanner.setFilters(p => ({...p, exchanges: toggleItem(p.exchanges, e)}))}
                    onToggleSymbol={(s: string) => scanner.setFilters(p => ({...p, symbols: toggleItem(p.symbols, s)}))}
                    disabled={scanner.isRunning}
                 />
               </SheetContent>
             </Sheet>

             <Button 
               onClick={scanner.toggle}
               className={scanner.isRunning ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/50" : "bg-emerald-600 hover:bg-emerald-700 text-white"}
             >
               {scanner.isRunning ? <Square className="mr-2 h-4 w-4 fill-current"/> : <Play className="mr-2 h-4 w-4 fill-current"/>}
               {scanner.isRunning ? "Stop Scanner" : "Start Scanner"}
             </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* SIDEBAR */}
          <div className="hidden lg:block lg:col-span-1 space-y-6 sticky top-6">
            <Card className="bg-gray-900 border-gray-800 h-[calc(100vh-200px)] overflow-hidden flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm uppercase tracking-wider text-gray-400">Market Filters</CardTitle>
              </CardHeader>
              <ScrollArea className="flex-1 p-4 pt-0">
                <FilterContent 
                    exchanges={exchangeList} 
                    symbols={symbolList}
                    selectedExchanges={scanner.filters.exchanges}
                    selectedSymbols={scanner.filters.symbols}
                    onToggleExchange={(e: string) => scanner.setFilters(p => ({...p, exchanges: toggleItem(p.exchanges, e)}))}
                    onToggleSymbol={(s: string) => scanner.setFilters(p => ({...p, symbols: toggleItem(p.symbols, s)}))}
                    disabled={scanner.isRunning}
                 />
              </ScrollArea>
            </Card>
          </div>

          {/* MAIN CONTENT */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* STATS STRIP */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gray-900 border-gray-800 p-4 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                   <div>
                     <p className="text-xs text-gray-500 uppercase font-bold">{activeWallet} Wallet</p>
                     <h2 className="text-2xl font-bold text-white mt-1">
                       {userLoading ? <Loader2 className="animate-spin w-5 h-5"/> : `$${getBalance().toFixed(2)}`}
                     </h2>
                   </div>
                   <Select value={activeWallet} onValueChange={(v: any) => setActiveWallet(v)}>
                     <SelectTrigger className="w-[100px] h-8 text-xs bg-gray-800 border-gray-700"><SelectValue /></SelectTrigger>
                     <SelectContent className="bg-gray-800 border-gray-700 text-white">
                       <SelectItem value="arb">Arb</SelectItem>
                       <SelectItem value="forex">Forex</SelectItem>
                       <SelectItem value="fut">Futures</SelectItem>
                     </SelectContent>
                   </Select>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="outline" className="flex-1 h-8 text-xs border-emerald-500/30 text-emerald-400" onClick={() => { setWalletAction('deposit'); setWalletModalOpen(true); }}>Deposit</Button>
                  <Button size="sm" variant="outline" className="flex-1 h-8 text-xs border-blue-500/30 text-blue-400" onClick={() => { setWalletAction('transfer'); setWalletModalOpen(true); }}>Transfer</Button>
                </div>
              </Card>

              <Card className="bg-gray-900 border-gray-800 p-4 flex flex-col justify-center items-center">
                 <p className="text-xs text-gray-500 uppercase">Total P&L</p>
                 <p className={`text-2xl font-bold ${userInfo?.total_pl && userInfo.total_pl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                   {userInfo?.total_pl ? `$${userInfo.total_pl.toFixed(2)}` : '$0.00'}
                 </p>
              </Card>
              <Card className="bg-gray-900 border-gray-800 p-4 flex flex-col justify-center items-center">
                 <p className="text-xs text-gray-500 uppercase">Live Opps</p>
                 <p className="text-2xl font-bold text-white">{scanner.foundOpps.length}</p>
              </Card>
            </div>

            <Tabs defaultValue="scanner" className="w-full">
              <TabsList className="bg-gray-900 border border-gray-800 p-1 w-full justify-start">
                <TabsTrigger value="scanner" className="flex-1 sm:flex-none w-32 data-[state=active]:bg-emerald-600">Scanner</TabsTrigger>
                <TabsTrigger value="manual" className="flex-1 sm:flex-none w-32 data-[state=active]:bg-emerald-600">Manual Trade</TabsTrigger>
                <TabsTrigger value="history" className="flex-1 sm:flex-none w-32 data-[state=active]:bg-emerald-600">History</TabsTrigger>
              </TabsList>

              {/* SCANNER TABLE */}
              <TabsContent value="scanner" className="mt-4">
                <Card className="bg-gray-900 border-gray-800 overflow-hidden min-h-[400px]">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px]">
                      <thead className="bg-gray-950/50 border-b border-gray-800 text-xs text-gray-400 uppercase">
                        <tr>
                          <th className="p-4 text-left">Symbol</th>
                          <th className="p-4 text-left">Strategy</th>
                          <th className="p-4 text-right">Prices (Buy/Sell)</th>
                          <th className="p-4 text-right">Spread</th>
                          <th className="p-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {scanner.foundOpps.length === 0 ? (
                          <tr><td colSpan={5} className="p-12 text-center text-gray-500">
                            {scanner.isRunning ? <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin w-4 h-4"/> Scanning...</span> : "Scanner Idle. Press start."}
                          </td></tr>
                        ) : (
                          scanner.foundOpps.map((opp, idx) => (
                            <tr key={idx} className="hover:bg-gray-800/50 transition-colors">
                              <td className="p-4 font-bold text-white">{opp.symbol}</td>
                              <td className="p-4 text-sm">
                                <span className="text-blue-400">{opp.buy_exchange}</span> 
                                <span className="mx-2 text-gray-600">→</span> 
                                <span className="text-purple-400">{opp.sell_exchange}</span>
                              </td>
                              <td className="p-4 text-right font-mono text-sm text-gray-300">
                                ${opp.buy_price} / ${opp.sell_price}
                              </td>
                              <td className="p-4 text-right font-bold text-emerald-400">
                                +{(opp.profit_percent * 100).toFixed(2)}%
                              </td>
                              <td className="p-4 text-right">
                                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 h-8" onClick={() => handleQuickTrade(opp)}>Trade</Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </TabsContent>

              {/* MANUAL TRADE */}
              <TabsContent value="manual" className="mt-4">
                 <Card className="bg-gray-900 border-gray-800 max-w-2xl mx-auto">
                    <CardHeader><CardTitle>Manual Execution</CardTitle><CardDescription>Execute a trade on specific exchanges.</CardDescription></CardHeader>
                    <CardContent>
                       <form onSubmit={manualTradeForm.handleSubmit((d) => tradeMutation.mutate(d))} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label>Symbol</Label>
                                <Select onValueChange={(v) => manualTradeForm.setValue("symbol", v)} disabled={symbolsLoading}>
                                   <SelectTrigger className="bg-gray-800 border-gray-700">
                                     <SelectValue placeholder={symbolsLoading ? "Loading symbols..." : "Select Symbol"} />
                                   </SelectTrigger>
                                   <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                     {symbolList.map((s: any, i: number) => {
                                       const symbol = typeof s === 'object' ? s.name || s.symbol || s : s;
                                       return <SelectItem key={i} value={symbol}>{symbol}</SelectItem>;
                                     })}
                                   </SelectContent>
                                </Select>
                                {manualTradeForm.formState.errors.symbol && <p className="text-red-500 text-xs">{manualTradeForm.formState.errors.symbol.message}</p>}
                             </div>
                             <div className="space-y-2">
                                <Label>Quantity</Label>
                                <Input 
                                  type="text" 
                                  inputMode="decimal"
                                  placeholder="0.00"
                                  {...manualTradeForm.register("qty")} 
                                  className="bg-gray-800 border-gray-700"
                                />
                                {manualTradeForm.formState.errors.qty && <p className="text-red-500 text-xs">{manualTradeForm.formState.errors.qty.message}</p>}
                             </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label>Buy From</Label>
                                <Select onValueChange={(v) => manualTradeForm.setValue("buy_exchange", v)}>
                                   <SelectTrigger className="bg-gray-800 border-gray-700"><SelectValue placeholder="Exchange" /></SelectTrigger>
                                   <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                     {exchangeList.map((e: any) => <SelectItem key={e.name || e} value={e.name || e}>{e.name || e}</SelectItem>)}
                                   </SelectContent>
                                </Select>
                             </div>
                             <div className="space-y-2">
                                <Label>Sell To</Label>
                                <Select onValueChange={(v) => manualTradeForm.setValue("sell_exchange", v)}>
                                   <SelectTrigger className="bg-gray-800 border-gray-700"><SelectValue placeholder="Exchange" /></SelectTrigger>
                                   <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                     {exchangeList.map((e: any) => <SelectItem key={e.name || e} value={e.name || e}>{e.name || e}</SelectItem>)}
                                   </SelectContent>
                                </Select>
                             </div>
                          </div>
                          <Button disabled={tradeMutation.isPending} className="w-full bg-emerald-600 hover:bg-emerald-500 mt-4">
                            {tradeMutation.isPending ? "Executing..." : "Place Order"}
                          </Button>
                       </form>
                    </CardContent>
                 </Card>
              </TabsContent>
              
              {/* HISTORY */}
              <TabsContent value="history" className="mt-4">
                <Card className="bg-gray-900 border-gray-800">
                  <div className="p-4 space-y-2">
                     {userArbTrades.length === 0 ? <p className="text-gray-500 text-center">No trade history.</p> : userArbTrades.map((t: any, i: number) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                           <div>
                              <p className="font-bold text-white text-sm">{t.symbol}</p>
                              <p className="text-xs text-gray-400">{t.buy_exchange} → {t.sell_exchange}</p>
                           </div>
                           <div className="text-right">
                              <Badge variant="outline" className= 'text-emerald-400 border-emerald-500/30'  >Quantity : {t.qty > 0 ? t.qty : '---'}</Badge>
                              <p className="text-xs font-mono mt-1 text-gray-300">{t.realized_profit? `$${t.realized_profit}` : '---'}</p>
                           </div>
                        </div>
                     ))}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* --- QUICK TRADE MODAL --- */}
      <Dialog open={tradeModalOpen} onOpenChange={setTradeModalOpen}>
         <DialogContent className="bg-gray-900 border-gray-800 text-white">
            <DialogHeader><DialogTitle>Quick Trade: {selectedOpp?.symbol}</DialogTitle></DialogHeader>
            {selectedOpp && (
               <div className="space-y-4">
                  <div className="flex justify-between text-sm bg-gray-800 p-3 rounded">
                     <span>Spread: <span className="text-emerald-400 font-bold">{(selectedOpp.profit_percent * 100).toFixed(2)}%</span></span>
                     <span>Price: {selectedOpp.buy_price}</span>
                  </div>
                  <div>
                     <Label>Quantity</Label>
                     <Input 
                       type="text" 
                       inputMode="decimal"
                       autoFocus
                       placeholder="Amount" 
                       value={quickAmount}
                       className="bg-gray-800 border-gray-700 mt-1"
                       onChange={(e) => {
                          const val = e.target.value;
                          if (val === '' || /^\d*\.?\d*$/.test(val)) setQuickAmount(val);
                       }}
                       onKeyDown={(e) => {
                          if (e.key === 'Enter') confirmQuickTrade(parseFloat(quickAmount));
                       }}
                     />
                  </div>
                  <Button className="w-full bg-emerald-600" onClick={() => confirmQuickTrade(parseFloat(quickAmount))}>
                    Confirm Execution
                  </Button>
               </div>
            )}
         </DialogContent>
      </Dialog>

      {/* --- WALLET MODAL --- */}
      <Dialog open={walletModalOpen} onOpenChange={setWalletModalOpen}>
         <DialogContent className="bg-gray-900 border-gray-800 text-white">
            <DialogHeader><DialogTitle className="capitalize">{walletAction} Assets</DialogTitle></DialogHeader>
            <form onSubmit={walletForm.handleSubmit((d) => walletMutation.mutate(d))} className="space-y-4 mt-2">
               {walletAction === 'transfer' && (
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <Label>From</Label>
                        <Select onValueChange={(v: any) => walletForm.setValue("from", v)} defaultValue={walletForm.watch("from")}>
                           <SelectTrigger className="bg-gray-800 border-gray-700"><SelectValue /></SelectTrigger>
                           <SelectContent className="bg-gray-800 border-gray-700 text-white">
                              <SelectItem value="forex">Forex</SelectItem><SelectItem value="arb">Arb</SelectItem><SelectItem value="fut">Futures</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>
                     <div className="space-y-1">
                        <Label>To</Label>
                        <Select onValueChange={(v: any) => walletForm.setValue("to", v)} defaultValue={walletForm.watch("to")}>
                           <SelectTrigger className="bg-gray-800 border-gray-700"><SelectValue /></SelectTrigger>
                           <SelectContent className="bg-gray-800 border-gray-700 text-white">
                              <SelectItem value="forex">Forex</SelectItem><SelectItem value="arb">Arb</SelectItem><SelectItem value="fut">Futures</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>
                  </div>
               )}
               {walletAction === 'transfer' && walletForm.formState.errors.to && <p className="text-red-500 text-xs">{walletForm.formState.errors.to.message}</p>}
               
               {walletAction === 'withdraw' && (
                  <div className="space-y-2">
                     <Label>Wallet Address</Label>
                     <Input {...walletForm.register("address")} className="bg-gray-800 border-gray-700" placeholder="0x..." />
                  </div>
               )}

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                     <Label>
                        Amount 
                        {walletAction === 'transfer' && <span className="text-emerald-400 text-xs ml-1">(USDT)</span>}
                     </Label>
                     <div className="relative">
                        <Input 
                          type="text" 
                          inputMode="decimal" 
                          {...walletForm.register("amount")} 
                          className="bg-gray-800 border-gray-700 pr-12" 
                        />
                        {walletAction === 'transfer' && (
                           <span className="absolute right-3 top-2.5 text-xs text-gray-500 font-bold">USDT</span>
                        )}
                     </div>
                     {walletForm.formState.errors.amount && <p className="text-red-500 text-xs">{walletForm.formState.errors.amount.message}</p>}
                  </div>
                  {(walletAction === 'deposit' || walletAction === 'withdraw') && (
                     <div className="space-y-1">
                        <Label>Asset</Label>
                        <Select onValueChange={v => walletForm.setValue("currency", v)} defaultValue="USDT">
                           <SelectTrigger className="bg-gray-800 border-gray-700"><SelectValue /></SelectTrigger>
                           <SelectContent className="bg-gray-800 border-gray-700 text-white">
                              <SelectItem value="USDT">USDT</SelectItem><SelectItem value="BTC">BTC</SelectItem><SelectItem value="ETH">ETH</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>
                  )}
               </div>

               {walletAction === 'deposit' && (
                  <div className="space-y-2">
                     <Label>Deposit Receipt</Label>
                     <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-700 border-dashed rounded-lg cursor-pointer bg-gray-800 hover:bg-gray-700 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                           <UploadCloud className="w-8 h-8 mb-2 text-gray-400" />
                           <p className="text-sm text-gray-400">
                              {receipt ? <span className="text-emerald-400 font-bold flex items-center gap-1"><FileText className="w-4 h-4"/> {receipt.name}</span> : "Click to upload proof of payment"}
                           </p>
                        </div>
                        <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => setReceipt(e.target.files?.[0] || null)} />
                     </label>
                  </div>
               )}

               <Button disabled={walletMutation.isPending} className="w-full bg-emerald-600 hover:bg-emerald-500 capitalize">
                  {walletMutation.isPending ? "Processing..." : `Confirm ${walletAction}`}
               </Button>
            </form>
         </DialogContent>
      </Dialog>
    </Layout>
  );
}

// ──────────────────────────────────────────────────────────────
// 5. HELPER COMPONENT: FILTER CONTENT
// ──────────────────────────────────────────────────────────────
const FilterContent = ({ exchanges, symbols, selectedExchanges, selectedSymbols, onToggleExchange, onToggleSymbol, disabled }: any) => {
  const getName = (item: any) => typeof item === 'object' ? item.name || "Unknown" : item;

  return (
    <div className={`space-y-6 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div>
        <h4 className="text-xs font-bold text-gray-500 mb-3 uppercase">Exchanges</h4>
        <div className="space-y-1">
          {exchanges.map((ex: any, i: number) => {
             const name = getName(ex);
             const isSelected = selectedExchanges.includes(name);
             return (
               <div key={i} onClick={() => onToggleExchange(name)} className={`flex items-center justify-between p-2 rounded cursor-pointer text-sm ${isSelected ? 'bg-emerald-900/20 text-emerald-300 border border-emerald-500/30' : 'text-gray-400 hover:bg-gray-800 border border-transparent'}`}>
                  <span>{name}</span>
                  {isSelected && <CheckCircle2 className="w-3 h-3"/>}
               </div>
             );
          })}
        </div>
      </div>
      <div>
        <h4 className="text-xs font-bold text-gray-500 mb-3 uppercase">Pairs</h4>
        <div className="space-y-1">
          {symbols.map((sym: any, i: number) => {
             const name = getName(sym);
             const isSelected = selectedSymbols.includes(name);
             return (
               <div key={i} onClick={() => onToggleSymbol(name)} className={`flex items-center justify-between p-2 rounded cursor-pointer text-sm ${isSelected ? 'bg-emerald-900/20 text-emerald-300 border border-emerald-500/30' : 'text-gray-400 hover:bg-gray-800 border border-transparent'}`}>
                  <span>{name}</span>
                  {isSelected && <CheckCircle2 className="w-3 h-3"/>}
               </div>
             );
          })}
        </div>
      </div>
    </div>
  );
};
