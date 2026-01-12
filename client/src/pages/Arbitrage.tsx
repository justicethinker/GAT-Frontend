import { Layout } from "@/components/Layout";
import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

// --- CONFIGURATION ---
const API_BASE = "https://gat-zm1r.onrender.com";

// --- TYPES ---
interface Opportunity {
  symbol: string;
  exchange_buy: string;
  exchange_sell: string;
  price_buy: number;
  price_sell: number;
  profit_percentage: number;
}

interface TradeHistoryItem {
  id: number;
  symbol: string;
  buy_exchange: string;
  sell_exchange: string;
  profit: string;
  status: 'PENDING' | 'COMPLETED' | 'ACTIVE';
}

// --- FETCHER UTILITY ---
const defaultFetcher = async ({ queryKey, signal }: { queryKey: any[]; signal?: AbortSignal }) => {
  const [path, params] = queryKey;
  const url = new URL(`${API_BASE}${path}`);
  const token = sessionStorage.getItem("token");

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => url.searchParams.append(key, String(v)));
      } else if (value !== undefined && value !== null && value !== "") {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const res = await fetch(url.toString(), {
    method: "GET",
    signal,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  let data;
  try {
    data = await res.json();
  } catch (e) {
    data = {};
  }

  if (!res.ok) {
    throw new Error(data.detail || `Error fetching ${path}: ${res.statusText}`);
  }
  return data;
};

export default function Arbitrage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // --- STATE: SCANNER ---
  const [selectedExchanges, setSelectedExchanges] = useState<string[]>(["BYBIT", "MEXC", "BINANCE"]);
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>(["BTCUSDT", "ETHUSDT"]);
  const [minProfit, setMinProfit] = useState(0.001);
  const [isScannerRunning, setIsScannerRunning] = useState(false);
  const [emergencyStop, setEmergencyStop] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [autoExecute, setAutoExecute] = useState(false);

  // --- STATE: MODALS ---
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [tradeQty, setTradeQty] = useState("0.01");

  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [walletAction, setWalletAction] = useState<"deposit" | "withdraw" | "transfer">("deposit");

  // --- STATE: WALLET FORMS ---
  const [transferData, setTransferData] = useState({ amount: "", from: "forex", to: "arb" });
  const [depositData, setDepositData] = useState({ amount: "", currency: "USDT", receipt: null as File | null });
  const [withdrawData, setWithdrawData] = useState({ amount: "", currency: "USDT", address: "" });

  // --- STATE: RISK (Hidden) ---
  const [riskSettings, setRiskSettings] = useState(() => {
    const defaults = { maxPos: "1000", maxDailyLoss: "100", stopLoss: "2", takeProfit: "5" };
    const saved = localStorage.getItem("arb_risk_settings");
    try {
      return saved ? JSON.parse(saved) : defaults;
    } catch (e) {
      return defaults;
    }
  });

  useEffect(() => {
    localStorage.setItem("arb_risk_settings", JSON.stringify(riskSettings));
  }, [riskSettings]);

  // --- QUERIES ---
  const { data: exchangeList = [] } = useQuery({
    queryKey: ["/arb/arbitrage-exc"],
    queryFn: defaultFetcher,
    staleTime: 60000,
  });

  useEffect(() => {
    if (exchangeList?.length > 0 && selectedExchanges.length === 0) {
      // Auto-init logic if needed
    }
  }, [exchangeList, selectedExchanges.length]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: symbolList = [] } = useQuery({
    queryKey: ["/arb/arbitrage-symbol"],
    queryFn: defaultFetcher,
    staleTime: 60000,
  });

  // SCANNER QUERY
  const { data: rawOpportunities, isLoading: isScanning } = useQuery({
    queryKey: [
      "/arb/opportunity-scanner",
      {
        exchanges: [...selectedExchanges].sort(),
        symbols: [...selectedSymbols].sort(),
        min_profit: Number(minProfit),
      },
    ],
    queryFn: defaultFetcher,
    enabled: isScannerRunning && !emergencyStop && !tradeModalOpen,
    refetchInterval: 120000, // FIXED: 2 minutes (120,000ms)
    retry: false,
  });

  const opportunities: Opportunity[] = Array.isArray(rawOpportunities) ? rawOpportunities : [];

  useEffect(() => {
    if (tradeModalOpen && selectedOpp && opportunities.length > 0) {
      const updatedOpp = opportunities.find(o => o.symbol === selectedOpp.symbol);
      if (updatedOpp) {
        setSelectedOpp(updatedOpp);
      }
    }
  }, [opportunities, tradeModalOpen, selectedOpp?.symbol]);

  const { data: rawHistory } = useQuery({
    queryKey: ["/arb/user-arb"],
    queryFn: defaultFetcher,
    refetchInterval: 5000,
  });

  const tradeHistory: TradeHistoryItem[] = Array.isArray(rawHistory) ? rawHistory : [];

  const parsedHistory = useMemo(() => {
    return tradeHistory.map(t => ({
      ...t,
      profitNum: parseFloat(t.profit) || 0
    }));
  }, [tradeHistory]);

  const stats = useMemo(() => {
    const totalPnL = parsedHistory.reduce((acc, t) => acc + t.profitNum, 0);
    const winningTrades = parsedHistory.filter((t) => t.profitNum > 0).length;
    const winRate = parsedHistory.length > 0 ? ((winningTrades / parsedHistory.length) * 100).toFixed(1) : "0.0";
    const activeCount = parsedHistory.filter((t) => t.status === 'ACTIVE' || t.status === 'PENDING').length;
    return { totalPnL, winRate, activeCount };
  }, [parsedHistory]);

  // --- MUTATIONS ---
  const tradeMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = sessionStorage.getItem("token");
      const res = await fetch(`${API_BASE}/arb/perform-arb-trade`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      });
      
      let responseData;
      try { responseData = await res.json(); } catch { responseData = {}; }

      if (!res.ok) {
        throw new Error(responseData.detail || "Trade failed");
      }
      return responseData;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Trade executed successfully", className: "bg-emerald-600 text-white" });
      queryClient.invalidateQueries({ queryKey: ["/arb/user-arb"] });
      setTradeModalOpen(false);
    },
    onError: (err: Error) => toast({ title: "Trade Failed", description: err.message, variant: "destructive" }),
  });

  const transferMutation = useMutation({
    mutationFn: async () => {
      const token = sessionStorage.getItem("token");
      const res = await fetch(`${API_BASE}/dash/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          amount: Math.abs(parseFloat(transferData.amount)),
          from_wallet: transferData.from,
          to_wallet: transferData.to
        }),
      });
      if (!res.ok) throw new Error("Transfer failed");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Transfer Successful", description: `$${transferData.amount} moved to ${transferData.to}` });
      setWalletModalOpen(false);
    },
    onError: () => toast({ title: "Error", description: "Transfer failed.", variant: "destructive" })
  });

  const depositMutation = useMutation({
    mutationFn: async () => {
      const token = sessionStorage.getItem("token");
      const formData = new FormData();
      formData.append("amount", String(Math.abs(parseFloat(depositData.amount))));
      formData.append("currency", depositData.currency);
      if (depositData.receipt) formData.append("receipt", depositData.receipt);

      const res = await fetch(`${API_BASE}/dash/deposits`, {
        method: "POST",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: formData,
      });
      if (!res.ok) throw new Error("Deposit failed");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Deposit Submitted", description: "Awaiting admin approval." });
      setWalletModalOpen(false);
    },
    onError: () => toast({ title: "Error", description: "Deposit failed.", variant: "destructive" })
  });

  const withdrawMutation = useMutation({
    mutationFn: async () => {
      const token = sessionStorage.getItem("token");
      const res = await fetch(`${API_BASE}/dash/withdrawals`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          amount: Math.abs(parseFloat(withdrawData.amount)),
          currency: withdrawData.currency,
          wallet_address: withdrawData.address
        }),
      });
      if (!res.ok) throw new Error("Withdrawal failed");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Withdrawal Requested", description: "Processing request." });
      setWalletModalOpen(false);
    },
    onError: () => toast({ title: "Error", description: "Withdrawal failed.", variant: "destructive" })
  });

  // --- HANDLERS ---
  const handleTradeClick = (opp: Opportunity) => {
    if (emergencyStop) {
      toast({ title: "Emergency Stop Active", description: "Cannot trade while emergency stop is on.", variant: "destructive" });
      return;
    }
    setSelectedOpp(opp);
    setTradeModalOpen(true);
  };

  const confirmTrade = () => {
    if (!selectedOpp) return;
    
    const qty = parseFloat(tradeQty);
    if (isNaN(qty) || qty <= 0) {
      toast({ title: "Invalid Quantity", description: "Please enter a valid positive number.", variant: "destructive" });
      return;
    }

    tradeMutation.mutate({
      symbol: selectedOpp.symbol,
      buy_exchange: selectedOpp.exchange_buy,
      sell_exchange: selectedOpp.exchange_sell,
      qty: qty
    });
  };

  const openWalletModal = (action: "deposit" | "withdraw" | "transfer") => {
    setWalletAction(action);
    setWalletModalOpen(true);
  };

  const handleWalletSubmit = () => {
    const actions = {
      transfer: transferMutation.mutate,
      deposit: depositMutation.mutate,
      withdraw: withdrawMutation.mutate,
    };
    
    const currentData = walletAction === 'transfer' ? transferData : walletAction === 'deposit' ? depositData : withdrawData;
    const amount = parseFloat(currentData.amount);
    
    if (isNaN(amount) || amount <= 0) {
       toast({ title: "Invalid Amount", variant: "destructive" });
       return;
    }

    actions[walletAction]();
  };

  const toggleExchange = (exName: string) => {
    if (isScannerRunning) return;
    setSelectedExchanges(prev => prev.includes(exName) ? prev.filter(e => e !== exName) : [...prev, exName]);
  };

  const getExchangeName = (ex: any) => (typeof ex === 'object' ? ex.name : ex);

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* --- HEADER --- */}
        <Card className="bg-gray-900 border-gray-800 p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              Arbitrage Scanner
              <span className={`h-3 w-3 rounded-full shadow-[0_0_10px] ${isScannerRunning && !emergencyStop ? 'bg-emerald-500 shadow-emerald-500/50 animate-pulse' : 'bg-gray-600'}`}></span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">Real-time cross-exchange opportunity detector.</p>
          </div>
          <div className="flex items-center gap-4">
            {emergencyStop && <Badge variant="destructive" className="animate-pulse">EMERGENCY STOP ACTIVE</Badge>}
            <Button
              onClick={() => setIsScannerRunning(!isScannerRunning)}
              disabled={emergencyStop}
              className={`${isScannerRunning ? 'bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20' : 'bg-emerald-600 hover:bg-emerald-700 text-white'} min-w-[140px]`}
            >
              <i className={`ri-${isScannerRunning ? 'stop' : 'play'}-circle-line mr-2`}></i>
              {isScannerRunning ? "Stop Scanner" : "Start Scanner"}
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* --- SIDEBAR --- */}
          {/* Sticky positioning keeps it visible on scroll */}
          <div className="space-y-6 lg:col-span-1 sticky top-6 self-start">
            
            {/* 2. EXCHANGES (Reordered: Above Wallet) */}
            <Card className="bg-gray-900 border-gray-800 p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-white">Exchanges</h3>
                <span 
                  onClick={() => !isScannerRunning && setSelectedExchanges(exchangeList.map(getExchangeName))} 
                  className={`text-xs text-emerald-400 cursor-pointer hover:underline ${isScannerRunning ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  Select All
                </span>
              </div>
              {/* FIXED: Constrained height with max-h so it doesn't push wallet off screen */}
              <ScrollArea className="h-[250px] max-h-[40vh] pr-3">
                <div className={`space-y-2 ${isScannerRunning ? 'opacity-50 pointer-events-none' : ''}`}>
                  {exchangeList.map((ex: any, i: number) => {
                    const name = getExchangeName(ex);
                    const isSelected = selectedExchanges.includes(name);
                    return (
                      <div key={i} onClick={() => toggleExchange(name)}
                        className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${isSelected ? 'bg-emerald-900/20 border border-emerald-500/30' : 'hover:bg-gray-800 border border-transparent'}`}>
                        <span className={`text-sm ${isSelected ? 'text-emerald-300' : 'text-gray-400'}`}>{name}</span>
                        {isSelected && <i className="ri-check-line text-emerald-400"></i>}
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
              {isScannerRunning && <p className="text-xs text-center text-yellow-500/70 mt-4">Stop scanner to edit filters</p>}
            </Card>

            {/* Wallet Card */}
            <Card className="bg-gray-900 border-gray-800 p-5 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-white flex items-center gap-2"><i className="ri-wallet-3-line"></i> Wallet</h3>
                <Badge variant="outline" className="border-gray-700 text-gray-400">Arb</Badge>
              </div>
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border border-gray-700 text-center">
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Total Balance</p>
                <h2 className="text-3xl font-bold text-white tracking-tight">$ --.--</h2>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm" onClick={() => openWalletModal("deposit")} className="border-emerald-600/30 text-emerald-400 hover:bg-emerald-600/10 text-xs">Deposit</Button>
                <Button variant="outline" size="sm" onClick={() => openWalletModal("withdraw")} className="border-red-600/30 text-red-400 hover:bg-red-600/10 text-xs">Withdraw</Button>
                <Button variant="outline" size="sm" onClick={() => openWalletModal("transfer")} className="border-blue-600/30 text-blue-400 hover:bg-blue-600/10 text-xs">Transfer</Button>
              </div>
            </Card>

          </div>

          {/* --- MAIN CONTENT --- */}
          <div className="lg:col-span-3 space-y-6">
            <Tabs defaultValue="scanner" className="w-full">
              <TabsList className="bg-gray-900 border border-gray-800 p-1">
                <TabsTrigger value="scanner" className="data-[state=active]:bg-emerald-600">Scanner</TabsTrigger>
                {/* 3. HIDDEN RISK MANAGEMENT (Commented Out) */}
                {/* <TabsTrigger value="risk" className="data-[state=active]:bg-emerald-600">Risk Management</TabsTrigger> */}
              </TabsList>

              {/* SCANNER TAB */}
              <TabsContent value="scanner" className="space-y-6 mt-4">
                {/* Stats Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="bg-gray-900 border-gray-800 p-4">
                    <p className="text-xs text-gray-500">Live Opportunities</p>
                    <p className="text-2xl font-bold text-white">{opportunities.length}</p>
                  </Card>
                  <Card className="bg-gray-900 border-gray-800 p-4">
                    <p className="text-xs text-gray-500">Total PnL</p>
                    <p className={`text-2xl font-bold ${stats.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>${stats.totalPnL.toFixed(2)}</p>
                  </Card>
                  <Card className="bg-gray-900 border-gray-800 p-4">
                    <p className="text-xs text-gray-500">Active Trades</p>
                    <p className="text-2xl font-bold text-blue-400">{stats.activeCount}</p>
                  </Card>
                  <Card className="bg-gray-900 border-gray-800 p-4 flex flex-col justify-center">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-gray-400">Min Profit</Label>
                      {/* 1. FIXED: Input with 'no-spin' appearance to look like standard text entry */}
                      <Input
                        type="number"
                        disabled={isScannerRunning}
                        className="w-16 h-7 bg-gray-800 border-gray-700 text-xs text-right [&::-webkit-inner-spin-button]:appearance-none"
                        value={minProfit}
                        onChange={(e) => setMinProfit(parseFloat(e.target.value))}
                      />
                    </div>
                  </Card>
                </div>

                {/* Opportunities Table */}
                <Card className="bg-gray-900 border-gray-800 overflow-hidden min-h-[400px]">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-950/50 border-b border-gray-800">
                        <tr className="text-left text-xs text-gray-400 uppercase tracking-wider">
                          <th className="p-4">Symbol</th>
                          <th className="p-4">Strategy</th>
                          <th className="p-4 text-right">Spread</th>
                          <th className="p-4 text-right">Profit %</th>
                          <th className="p-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {isScanning && opportunities.length === 0 ? (
                          <tr><td colSpan={5} className="p-8 text-center text-gray-500 animate-pulse">Scanning markets...</td></tr>
                        ) : opportunities.length === 0 ? (
                          <tr><td colSpan={5} className="p-8 text-center text-gray-500">No opportunities found. Adjust filters or start scanner.</td></tr>
                        ) : (
                          opportunities.map((opp, idx) => (
                            <tr key={idx} className="hover:bg-gray-800/50 transition-colors">
                              <td className="p-4 font-medium text-white">{opp.symbol}</td>
                              <td className="p-4 text-sm text-gray-400">
                                <span className="text-blue-400">{opp.exchange_buy}</span> <i className="ri-arrow-right-line px-1"></i> <span className="text-purple-400">{opp.exchange_sell}</span>
                              </td>
                              <td className="p-4 text-right font-mono text-xs text-gray-300">
                                ${opp.price_buy} / ${opp.price_sell}
                              </td>
                              <td className="p-4 text-right font-bold text-emerald-400">
                                +{opp.profit_percentage.toFixed(2)}%
                              </td>
                              <td className="p-4 text-right">
                                <Button size="sm" onClick={() => handleTradeClick(opp)} className="bg-emerald-600 hover:bg-emerald-700 h-8 text-xs">Trade</Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </TabsContent>

              {/* RISK MANAGEMENT HIDDEN */}
              {/* <TabsContent value="risk">...</TabsContent> */}
            </Tabs>

            {/* HISTORY SECTION */}
            <div className="mt-8">
              <h3 className="text-lg font-bold text-white mb-4">Trade History</h3>
              <div className="space-y-3">
                {parsedHistory.length === 0 ? (
                  <Card className="bg-gray-900 border-gray-800 p-6 text-center text-gray-500">No trading history available.</Card>
                ) : (
                  parsedHistory.map((trade) => (
                    <Card key={trade.id} className="bg-gray-900 border-gray-800 p-4 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white">{trade.symbol}</div>
                        <div className="text-xs text-gray-500">{trade.buy_exchange} → {trade.sell_exchange}</div>
                      </div>
                      <Badge variant={trade.status === 'COMPLETED' ? 'default' : 'secondary'} className={trade.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}>{trade.status}</Badge>
                      <div className={`font-mono font-bold ${trade.profitNum >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {trade.profitNum > 0 ? '+' : ''}{trade.profitNum.toFixed(2)}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL: TRADE EXECUTION --- */}
      <Dialog open={tradeModalOpen} onOpenChange={setTradeModalOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Execute Arbitrage</DialogTitle>
            <DialogDescription>Confirm trade details below. Data updates live.</DialogDescription>
          </DialogHeader>
          {selectedOpp && (
            <div className="space-y-4 py-2">
              <div className="flex justify-between p-3 bg-gray-800 rounded border border-gray-700">
                <div className="text-center"><div className="text-xs text-gray-400">Buy</div><div className="font-bold text-blue-400">{selectedOpp.exchange_buy}</div></div>
                <div className="text-center"><div className="text-xs text-gray-400">Sell</div><div className="font-bold text-purple-400">{selectedOpp.exchange_sell}</div></div>
                <div className="text-center"><div className="text-xs text-gray-400">Spread</div><div className="font-bold text-emerald-400">{selectedOpp.profit_percentage.toFixed(2)}%</div></div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 text-center">
                 <span>Buy @ {selectedOpp.price_buy}</span>
                 <span>Sell @ {selectedOpp.price_sell}</span>
              </div>
              <div>
                <Label>Quantity ({selectedOpp.symbol.replace("USDT", "")})</Label>
                {/* Fixed: Input with no spinners */}
                <Input 
                  type="number" 
                  value={tradeQty} 
                  onChange={(e) => setTradeQty(e.target.value)} 
                  className="bg-gray-800 border-gray-700 mt-1 [&::-webkit-inner-spin-button]:appearance-none" 
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setTradeModalOpen(false)}>Cancel</Button>
            <Button onClick={confirmTrade} disabled={tradeMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {tradeMutation.isPending ? "Executing..." : "Confirm Trade"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- MODAL: WALLET ACTIONS --- */}
      <Dialog open={walletModalOpen} onOpenChange={setWalletModalOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="capitalize">{walletAction} Funds</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* TRANSFER FORM */}
            {walletAction === "transfer" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>From</Label>
                    <Select value={transferData.from} onValueChange={(v) => setTransferData({ ...transferData, from: v })}>
                      <SelectTrigger className="bg-gray-800 border-gray-700"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700 text-white">
                        <SelectItem value="forex">Forex</SelectItem>
                        <SelectItem value="arb">Arbitrage</SelectItem>
                        <SelectItem value="fut">Futures</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>To</Label>
                    <Select value={transferData.to} onValueChange={(v) => setTransferData({ ...transferData, to: v })}>
                      <SelectTrigger className="bg-gray-800 border-gray-700"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700 text-white">
                        <SelectItem value="forex">Forex</SelectItem>
                        <SelectItem value="arb">Arbitrage</SelectItem>
                        <SelectItem value="fut">Futures</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Amount</Label>
                  <Input 
                    type="number" 
                    value={transferData.amount} 
                    onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })} 
                    className="bg-gray-800 border-gray-700 mt-1 [&::-webkit-inner-spin-button]:appearance-none" 
                  />
                </div>
              </>
            )}

            {/* DEPOSIT FORM */}
            {walletAction === "deposit" && (
              <>
                <div>
                  <Label>Amount</Label>
                  {/* Fixed: Input with no spinners */}
                  <Input 
                    type="number" 
                    value={depositData.amount} 
                    onChange={(e) => setDepositData({ ...depositData, amount: e.target.value })} 
                    className="bg-gray-800 border-gray-700 mt-1 [&::-webkit-inner-spin-button]:appearance-none" 
                  />
                </div>
                <div><Label>Receipt (Image)</Label><Input type="file" onChange={(e) => setDepositData({ ...depositData, receipt: e.target.files?.[0] || null })} className="bg-gray-800 border-gray-700 mt-1 cursor-pointer" /></div>
              </>
            )}

            {/* WITHDRAW FORM */}
            {walletAction === "withdraw" && (
              <>
                <div>
                  <Label>Amount</Label>
                  {/* Fixed: Input with no spinners */}
                  <Input 
                    type="number" 
                    value={withdrawData.amount} 
                    onChange={(e) => setWithdrawData({ ...withdrawData, amount: e.target.value })} 
                    className="bg-gray-800 border-gray-700 mt-1 [&::-webkit-inner-spin-button]:appearance-none" 
                  />
                </div>
                <div><Label>Wallet Address</Label><Input value={withdrawData.address} onChange={(e) => setWithdrawData({ ...withdrawData, address: e.target.value })} className="bg-gray-800 border-gray-700 mt-1" placeholder="0x..." /></div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setWalletModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleWalletSubmit} 
              disabled={transferMutation.isPending || depositMutation.isPending || withdrawMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white capitalize"
            >
              {(transferMutation.isPending || depositMutation.isPending || withdrawMutation.isPending) 
                ? "Processing..." 
                : `Confirm ${walletAction}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </Layout>
  );
}