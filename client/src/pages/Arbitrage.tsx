import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Play, Square, Filter,
  Loader2, CheckCircle2, UploadCloud, FileText
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

// Zod schemas 
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
// 2. UTILITY: ROBUST FETCHER FOR AUTHENTICATION
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
// 3. CUSTOM HOOK: WEBSOCKET SCANNER LOGIC
// ──────────────────────────────────────────────────────────────

function useArbitrageScanner(
  exchangeList: any[],
  symbolList: any[]

) {
  const { toast } = useToast();

  const [isRunning, setIsRunning] = useState(false);
  const [minProfit, setMinProfit] = useState(0.00001);
  const [foundOpps, setFoundOpps] = useState<Opportunity[]>([]);
  const [isRestarting, setIsRestarting] = useState(false);

  const [filters, setFilters] = useState({
    exchanges: [] as string[],
    symbols: [] as string[],
  });

  const wsRef = useRef<WebSocket | null>(null);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const updateCountRef = useRef(0);

  const isRunningRef = useRef(isRunning);
  const filtersRef = useRef(filters);
  const minProfitRef = useRef(minProfit);
  const hasInitializedFilters = useRef(false);

  const closeReasonRef = useRef<"manual" | "filter" | "error" | "unmount" | "none">("none");
  // const isFirstFilterRun = useRef(true);

  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    minProfitRef.current = minProfit;
  }, [minProfit]);

  useEffect(()=> {
    if (!exchangeList.length || !symbolList.length )
      return;

    const exchanges = exchangeList.map((e: any) => 
    typeof e === "object" ? e.name : e );
    
    const symbols = symbolList.map((s: any) => 
    typeof s === "object" ? s.name || s.symbol : s );

    console.log(" [WS] Loaded filters from backend ", {
      exchanges, symbols });

    setFilters((prev) => {
      if (prev.exchanges.length || prev.symbols.length) {
        return prev
      }
      return { exchanges, symbols };
    });

  }, [exchangeList, symbolList]);

  const clearRestartTimer = useCallback(() => {
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
  }, []);

  const closeSocket = useCallback((reason: "manual" | "filter" | "error" | "unmount" | "none") => {
    closeReasonRef.current = reason;

    if (wsRef.current) {
      console.log(`[WS] Closing socket (${reason})`);
      try {
        wsRef.current.close();
      } catch (err) {
        console.warn("[WS] Error while closing socket:", err);
      } finally {
        wsRef.current = null;
      }
    }
  }, []);

  const connectWebSocket = useCallback(() => {
    if (wsRef.current && (
      wsRef.current.readyState === WebSocket.OPEN ||
      wsRef.current.readyState === WebSocket.CONNECTING
    )) {
      console.log("[WS] Socket already open/connecting. Skipping connect.");
      return;
    }

    const token = sessionStorage.getItem("token");
    console.log("[WS] Opening WebSocket. Token present:", !!token);

    const ws = new WebSocket("wss://gatbackend.name.ng/arb/ws/opportunity-scanner");
    wsRef.current = ws;
    closeReasonRef.current = "none";

    ws.onopen = () => {
      console.log("[WS] Connected.");
      setIsRestarting(false);

      const payload = {
        exchanges: filtersRef.current.exchanges,
        symbols: filtersRef.current.symbols,
        min_profit: minProfitRef.current,
        interval: 2,
      };

      console.log("[WS] Sending payload:", payload);
      ws.send(JSON.stringify(payload));
    };

    ws.onmessage = (event) => {
      console.log("[WS] Message received:", event.data);

      let parsed: any;
      try {
        parsed = JSON.parse(event.data);
      } catch (err) {
        console.error("[WS] Invalid JSON from server:", err);
        return;
      }

      const incoming: Opportunity[] = Array.isArray(parsed)
        ? parsed
        : parsed.data || parsed.oppurtunities || [];

      console.log("[WS] Opportunities in message:", incoming.length);

      updateCountRef.current += 1;
      console.log("[WS] Message counter:", updateCountRef.current);

      if (updateCountRef.current >= 3) {
        console.log("[WS] Clearing table after 3 updates.");
        updateCountRef.current = 0;
        setFoundOpps([]);
        return;
      }

      if (incoming.length > 0) {
        setFoundOpps((prev) => {
          const map = new Map<string, Opportunity>();

          prev.forEach((opp) => {
            map.set(`${opp.symbol}-${opp.buy_exchange}-${opp.sell_exchange}`, opp);
          });

          incoming.forEach((opp) => {
            map.set(`${opp.symbol}-${opp.buy_exchange}-${opp.sell_exchange}`, opp);
          });

          return Array.from(map.values());
        });
      }
    };

    ws.onerror = (err) => {
      console.error("[WS] Socket error:", err);
      closeReasonRef.current = "error";
      clearRestartTimer();
      setIsRestarting(false);
      setIsRunning(false);
      toast({
        title: "Scanner Disconnected",
        description: "The connection failed and the scanner has stopped.",
        variant: "destructive",
      });

      try {
        ws.close();
      } catch {}
    };

    ws.onclose = (event) => {
      console.log(`[WS] Closed | code: ${event.code} | reason: "${event.reason}"`);

      const reason = closeReasonRef.current;
      wsRef.current = null;

      if (reason === "manual") {
        console.log("[WS] Manual stop complete.");
        return;
      }

      if (reason === "filter") {
        console.log("[WS] Filter restart path active.");
        return;
      }

      if (reason === "unmount") {
        console.log("[WS] Unmount cleanup complete.");
        return;
      }

      if (reason === "error") {
        console.log("[WS] Closed after socket error.");
        return;
      }

      console.warn("[WS] Unexpected close. Stopping scanner.");
      clearRestartTimer();
      setIsRestarting(false);
      setIsRunning(false);
      toast({
        title: "Scanner Disconnected",
        description: "Connection lost and the scanner has stopped.",
        variant: "destructive",
      });
    };
  }, [clearRestartTimer, toast]);

  useEffect(() => {
    if (isRunning) {
      console.log("[WS] Scanner running. Connecting...");
      connectWebSocket();
    } 
    else {
      console.log("[WS] Scanner stopped.");
    }
  }, [isRunning, connectWebSocket]);

  useEffect(() => {
    // Ignore initial backend filter load
    if (!hasInitializedFilters.current) {
      const hasFilters =
        filters.exchanges.length > 0 ||
        filters.symbols.length > 0;

      if (hasFilters) {
        hasInitializedFilters.current = true;
        console.log("[WS] Initial backend filters loaded. No restart.");
      }

      return;
    }

    // Ignore if scanner is not running
    if (!isRunningRef.current) return;

    console.log("[WS] User changed filters. Restarting scanner in 5 seconds.");

    setIsRestarting(true);

    clearRestartTimer();
    closeSocket("filter");

    restartTimerRef.current = setTimeout(() => {
      restartTimerRef.current = null;

      if (!isRunningRef.current) {
        console.log("[WS] Restart skipped. Scanner stopped.");
        setIsRestarting(false);
        return;
      }

      console.log("[WS] Restarting WebSocket with updated filters.");

      connectWebSocket();
    }, 5000);

  }, [
    filters,
    minProfit,
    clearRestartTimer,
    closeSocket,
    connectWebSocket]);

  useEffect(() => {
    const ready =
      exchangeList.length > 0 &&
      symbolList.length > 0;

    if (!ready) return;

    console.log("[WS] Backend filters ready. Auto-starting scanner.");
    setIsRunning(true);

    return () => {
      console.log("[WS] Component unmounting. Cleaning up scanner.");
      clearRestartTimer();
      closeSocket("unmount");
    };
  }, [
    exchangeList,
    symbolList,
    clearRestartTimer,
    closeSocket,
  ]);

  const handleToggle = useCallback(() => {
    if (isRunningRef.current) {
      console.log("[WS] User stopped the scanner.");
      clearRestartTimer();
      setIsRestarting(false);
      setIsRunning(false);
      closeSocket("manual");
      return;
    }

    console.log("[WS] User started the scanner.");
    closeReasonRef.current = "none";
    updateCountRef.current = 0;
    setFoundOpps([]);
    setIsRestarting (false);
    setIsRunning(true);
  }, [clearRestartTimer, closeSocket]);

  return {
    isRunning,
    isRestarting,
    toggle: handleToggle,
    minProfit,
    setMinProfit,
    foundOpps,
    filters,
    setFilters,
  };
}

// ──────────────────────────────────────────────────────────────
// 4. MAIN COMPONENT
// ──────────────────────────────────────────────────────────────

export default function Arbitrage() {
  const { toast }       = useToast();
  const queryClient     = useQueryClient();
  const [activeWallet, setActiveWallet] = useState<"arb" | "forex" | "fut">("arb");

  // ── REST QUERIES ─────────────────────────────────────────
  const { data: userInfo, isLoading: userLoading } = useQuery<UserInfo>({
    queryKey: ["/auth/user-info"],
    queryFn:  authenticatedFetcher,
  });
  const { data: exchangeList = [] } = useQuery({
    queryKey:  ["/arb/arbitrage-exc"],
    queryFn:   authenticatedFetcher,
    staleTime: Infinity,
  });
  const { data: symbolList = [], isLoading: symbolsLoading } = useQuery({
    queryKey:  ["/arb/arbitrage-symbol"],
    queryFn:   authenticatedFetcher,
    staleTime: Infinity,
  });
  const { data: userArbTrades = [] } = useQuery({
    queryKey: ["/arb/user-arb"],
    queryFn:  authenticatedFetcher,
  });

  const scanner         = useArbitrageScanner( exchangeList, symbolList);

  // Forms & Modals
  const [tradeModalOpen, setTradeModalOpen]   = useState(false);
  const [selectedOpp, setSelectedOpp]         = useState<Opportunity | null>(null);

  // State for Inputs
  const [quickAmount, setQuickAmount]         = useState("");
  const [receipt, setReceipt]                 = useState<File | null>(null);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [walletAction, setWalletAction]       = useState<"deposit" | "withdraw" | "transfer">("deposit");

  const walletForm = useForm<WalletFormValues>({
    resolver:      zodResolver(WalletSchema),
    defaultValues: { from: "forex", to: "arb" },
  });
  const manualTradeForm = useForm<TradeFormValues>({ resolver: zodResolver(TradeSchema) });

  // ── MUTATIONS ────────────────────────────────────────────
  const tradeMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(buildUrl("/arb/perform-arb-trade"), {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${sessionStorage.getItem("token")}`,
        },
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
      const endpoints = {
        transfer: "/dash/transfer",
        deposit:  "/dash/deposits",
        withdraw: "/dash/withdrawals",
      };
      const endpoint = endpoints[walletAction];
      const headers: any = { Authorization: `Bearer ${sessionStorage.getItem("token")}` };
      let body: any;

      if (walletAction === "deposit") {
        if (!receipt) throw new Error("Receipt is required for deposits.");
        const formData = new FormData();
        formData.append("amount",   String(data.amount));
        formData.append("currency", data.currency || "USDT");
        formData.append("receipt",  receipt);// Attach Receipt
        body = formData;
        delete headers["Content-Type"]; // browser sets boundary automatically
      } else {
        headers["Content-Type"] = "application/json";
        body = JSON.stringify(
          walletAction === "transfer"
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
      setReceipt(null);// Reset receipt 
      queryClient.invalidateQueries({ queryKey: ["/auth/user-info"] });
    },
    onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
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
      symbol:        selectedOpp.symbol,
      buy_exchange:  selectedOpp.buy_exchange,
      sell_exchange: selectedOpp.sell_exchange,
      qty,
    });
  };

  // Toggles a single item in/out of an array (filter checkboxes)
  const toggleItem = (list: string[], item: string) =>
    list.includes(item) ? list.filter((i) => i !== item) : [...list, item];

  // Returns the balance for the currently selected wallet
  const getBalance = () =>
    userInfo ? (userInfo[`balance_${activeWallet}` as keyof UserInfo] as number) || 0 : 0;

  return (
    <Layout>
      <div className="w-full min-h-screen bg-background px-4 py-6 space-y-6">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-xl border border-border shadow-lg font-grotesk relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/5 -translate-y-1/2 translate-x-1/2 group-hover:scale-105 transition-transform duration-500" />
          <div className="relative">
            <h1 className="text-2xl font-700 text-white flex items-center gap-3">
              Arbitrage Scanner
              {scanner.isRunning && !scanner.isRestarting && (
                <Badge className="bg-primary/10 text-primary border-primary/20 animate-pulse font-bold shadow-sm glow-primary">
                  Scanning @ {(scanner.minProfit * 100).toFixed(3)}%
                </Badge>
              )}
            </h1>
            <p className="text-slate-400 text-xs mt-1">Real-time cross-exchange opportunity detector.</p>
          </div>

          <div className="flex gap-3 w-full md:w-auto relative">

            {/* Mobile filter sheet (hidden on desktop) */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden border-border bg-secondary text-slate-300 hover:bg-secondary/80">
                  <Filter className="w-4 h-4 mr-2 text-primary" /> Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-card border-border text-foreground font-grotesk">
                <SheetHeader className="mb-4">
                  <SheetTitle className="text-white">Scanner Filters</SheetTitle>
                </SheetHeader>
                <FilterContent
                  exchanges={exchangeList}
                  symbols={symbolList}
                  selectedExchanges={scanner.filters.exchanges}
                  selectedSymbols={scanner.filters.symbols}
                  onToggleExchange={(e: string) =>
                    scanner.setFilters((p) => ({ ...p, exchanges: toggleItem(p.exchanges, e) }))
                  }
                  onToggleSymbol={(s: string) =>
                    scanner.setFilters((p) => ({ ...p, symbols: toggleItem(p.symbols, s) }))
                  }
                  disabled={false}
                />
              </SheetContent>
            </Sheet>

            <Button
              onClick={scanner.toggle}
              className={
                scanner.isRunning
                  ? "bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/30 font-semibold rounded-lg shadow-sm transition-all"
                  : "bg-primary hover:bg-primary/95 text-primary-foreground font-semibold shadow-lg glow-primary transition-all rounded-lg"
              }
            >
              {scanner.isRunning
                ? <Square className="mr-2 h-4 w-4 fill-current" />
                : <Play   className="mr-2 h-4 w-4 fill-current" />}
              {scanner.isRunning ? "Stop Scanner" : "Start Scanner"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">

          {/* SIDEBAR */}
          <div className="hidden lg:block lg:col-span-1 space-y-6 sticky top-6">
            <Card className="bg-card border-border h-[calc(100vh-200px)] overflow-hidden flex flex-col rounded-xl shadow-lg font-grotesk">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                  Market Filters
                </CardTitle>
              </CardHeader>
              <ScrollArea className="flex-1 p-4 pt-0">
                <FilterContent
                  exchanges={exchangeList}
                  symbols={symbolList}
                  selectedExchanges={scanner.filters.exchanges}
                  selectedSymbols={scanner.filters.symbols}
                  onToggleExchange={(e: string) =>
                    scanner.setFilters((p) => ({ ...p, exchanges: toggleItem(p.exchanges, e) }))
                  }
                  onToggleSymbol={(s: string) =>
                    scanner.setFilters((p) => ({ ...p, symbols: toggleItem(p.symbols, s) }))
                  }
                  disabled={false}
                />
              </ScrollArea>
            </Card>
          </div>

          {/* MAIN CONTENT */}
          <div className="lg:col-span-3 space-y-6">

            {/* STATS STRIP */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-card border-border p-5 flex flex-col justify-between rounded-xl shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/5 -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-300" />
                <div className="flex justify-between items-start mb-2 relative font-grotesk">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{activeWallet} Wallet</p>
                    <h2 className="text-2xl font-700 text-white mt-1.5">
                      {userLoading
                        ? <Loader2 className="animate-spin w-5 h-5" />
                        : `$${getBalance().toFixed(2)}`}
                    </h2>
                  </div>
                  <Select value={activeWallet} onValueChange={(v: any) => setActiveWallet(v)}>
                    <SelectTrigger className="w-[100px] h-8 text-xs bg-secondary border-border text-foreground font-bold font-grotesk">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border text-foreground font-grotesk">
                      <SelectItem value="arb">Arb</SelectItem>
                      <SelectItem value="forex">Forex</SelectItem>
                      <SelectItem value="fut">Futures</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 mt-4 relative">
                  <Button
                    size="sm" variant="outline"
                    className="flex-1 h-8 text-xs border-primary/30 text-primary hover:bg-primary/10 font-bold font-grotesk transition-all shadow-sm"
                    onClick={() => { setWalletAction("deposit"); setWalletModalOpen(true); }}
                  >
                    Deposit
                  </Button>
                  <Button
                    size="sm" variant="outline"
                    className="flex-1 h-8 text-xs border-primary/30 text-primary hover:bg-primary/10 font-bold font-grotesk transition-all shadow-sm"
                    onClick={() => { setWalletAction("transfer"); setWalletModalOpen(true); }}
                  >
                    Transfer
                  </Button>
                </div>
              </Card>

              {/* Total P&L */}
              <Card className="bg-card border-border p-5 flex flex-col justify-center items-center rounded-xl shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/5 -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-300" />
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider relative font-grotesk">Total P&L</p>
                <p className={`text-2xl font-700 font-grotesk mt-1.5 relative ${userInfo?.total_pl && userInfo.total_pl >= 0 ? "text-green-400" : "text-destructive"}`}>
                  {userInfo?.total_pl ? `$${userInfo.total_pl.toFixed(2)}` : "$0.00"}
                </p>
              </Card>

              {/* Live opportunity count */}
              <Card className="bg-card border-border p-5 flex flex-col justify-center items-center rounded-xl shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/5 -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-300" />
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider relative font-grotesk">Live Opps</p>
                <p className="text-2xl font-700 font-grotesk mt-1.5 text-white relative">{scanner.foundOpps.length}</p>
              </Card>
            </div>

            {/*TABS */}
            <Tabs defaultValue="scanner" className="w-full">
              <TabsList className="bg-secondary border border-border p-1 w-full justify-start rounded-xl font-grotesk">
                <TabsTrigger value="scanner" className="flex-1 sm:flex-none w-32 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold rounded-lg transition-all">Scanner</TabsTrigger>
                <TabsTrigger value="manual"  className="flex-1 sm:flex-none w-32 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold rounded-lg transition-all">Manual Trade</TabsTrigger>
                <TabsTrigger value="history" className="flex-1 sm:flex-none w-32 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold rounded-lg transition-all">History</TabsTrigger>
              </TabsList>

              {/* SCANNER TABLE */}
              <TabsContent value="scanner" className="mt-4">
                <Card className="bg-card border-border overflow-hidden min-h-[400px] rounded-xl shadow-lg">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] font-grotesk">
                      <thead className="bg-secondary/20 border-b border-border text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                        <tr>
                          <th className="p-4 text-left">Symbol</th>
                          <th className="p-4 text-left">Strategy</th>
                          <th className="p-4 text-right">Prices (Buy/Sell)</th>
                          <th className="p-4 text-right">Spread</th>
                          <th className="p-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50 text-sm">
                        {scanner.foundOpps.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-12 text-center text-slate-500 font-semibold">
                              {scanner.isRestarting ? (
                                <span className="flex items-center justify-center gap-2 text-warning font-bold">
                                  <Loader2 className="animate-spin w-4 h-4 text-primary" />
                                  Reconnecting to scanner...
                                </span>
                              ) : scanner.isRunning ? (
                                <span className="flex items-center justify-center gap-2">
                                  <Loader2 className="animate-spin w-4 h-4 text-primary" />
                                  Scanning for opportunities...
                                </span>
                              ) : (
                                "Scanner idle. Press Start."
                              )}
                            </td>
                          </tr>
                        ) : (
                          scanner.foundOpps.map((opp, idx) => (
                            <tr key={idx} className="hover:bg-secondary/20 transition-colors">
                              <td className="p-4 font-700 text-white">{opp.symbol}</td>
                              <td className="p-4 text-sm font-semibold">
                                <span className="text-primary font-bold">{opp.buy_exchange}</span>
                                <span className="mx-2 text-slate-500">→</span>
                                <span className="text-primary/70">{opp.sell_exchange}</span>
                              </td>
                              <td className="p-4 text-right font-mono text-xs text-slate-300">
                                ${opp.buy_price} / ${opp.sell_price}
                              </td>
                              <td className="p-4 text-right font-700 text-green-400">
                                +{(opp.profit_percent * 100).toFixed(2)}%
                              </td>
                              <td className="p-4 text-right">
                                <Button
                                  size="sm"
                                  className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold shadow-md glow-primary transition-all font-grotesk"
                                  onClick={() => handleQuickTrade(opp)}
                                >
                                  Trade
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </TabsContent>

              {/*MANUAL TRADE */}
              <TabsContent value="manual" className="mt-4">
                <Card className="bg-card border-border max-w-2xl mx-auto rounded-xl shadow-lg font-grotesk">
                  <CardHeader>
                    <CardTitle className="font-700 text-white">Manual Execution</CardTitle>
                    <CardDescription className="text-slate-450">Execute a trade on specific exchanges.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={manualTradeForm.handleSubmit((d) => tradeMutation.mutate(d))}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="font-semibold text-slate-300">Symbol</Label>
                          <Select
                            onValueChange={(v) => manualTradeForm.setValue("symbol", v)}
                            disabled={symbolsLoading}
                          >
                            <SelectTrigger className="bg-secondary border-border text-foreground font-bold">
                              <SelectValue placeholder={symbolsLoading ? "Loading..." : "Select Symbol"} />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border text-foreground font-grotesk">
                              {symbolList.map((s: any, i: number) => {
                                const symbol = typeof s === "object" ? s.name || s.symbol || s : s;
                                return <SelectItem key={i} value={symbol}>{symbol}</SelectItem>;
                              })}
                            </SelectContent>
                          </Select>
                          {manualTradeForm.formState.errors.symbol && (
                            <p className="text-destructive text-xs">{manualTradeForm.formState.errors.symbol.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label className="font-semibold text-slate-300">Quantity</Label>
                          <Input
                            type="text" inputMode="decimal" placeholder="0.00"
                            {...manualTradeForm.register("qty")}
                            className="bg-secondary border-border text-foreground focus:ring-1 focus:ring-primary font-bold font-mono"
                          />
                          {manualTradeForm.formState.errors.qty && (
                            <p className="text-destructive text-xs">{manualTradeForm.formState.errors.qty.message}</p>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="font-semibold text-slate-300">Buy From</Label>
                          <Select onValueChange={(v) => manualTradeForm.setValue("buy_exchange", v)}>
                            <SelectTrigger className="bg-secondary border-border text-foreground font-bold"><SelectValue placeholder="Exchange" /></SelectTrigger>
                            <SelectContent className="bg-card border-border text-foreground font-grotesk">
                              {exchangeList.map((e: any) => (
                                <SelectItem key={e.name || e} value={e.name || e}>{e.name || e}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="font-semibold text-slate-300">Sell To</Label>
                          <Select onValueChange={(v) => manualTradeForm.setValue("sell_exchange", v)}>
                            <SelectTrigger className="bg-secondary border-border text-foreground font-bold"><SelectValue placeholder="Exchange" /></SelectTrigger>
                            <SelectContent className="bg-card border-border text-foreground font-grotesk">
                              {exchangeList.map((e: any) => (
                                <SelectItem key={e.name || e} value={e.name || e}>{e.name || e}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button
                        disabled={tradeMutation.isPending}
                        className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold shadow-lg glow-primary mt-4 transition-all"
                      >
                        {tradeMutation.isPending ? "Executing..." : "Place Order"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/*HISTORY */}
              <TabsContent value="history" className="mt-4">
                <Card className="bg-card border-border rounded-xl shadow-lg overflow-hidden font-grotesk">
                  <div className="p-4 space-y-2">
                    {userArbTrades.length === 0 ? (
                      <p className="text-slate-500 text-center py-8">No trade history recorded yet.</p>
                    ) : (
                      userArbTrades.map((t: any, i: number) => (
                        <div
                          key={i}
                          className="flex justify-between items-center p-3.5 bg-secondary/35 hover:bg-secondary/50 rounded-xl border border-border/50 transition-all"
                        >
                          <div>
                            <p className="font-700 text-white text-sm leading-none mb-1.5">{t.symbol}</p>
                            <p className="text-xs text-slate-400 flex items-center gap-1.5">
                              <span className="text-primary font-semibold">{t.buy_exchange}</span>
                              <span className="text-slate-650">→</span>
                              <span className="text-primary/70 font-semibold">{t.sell_exchange}</span>
                            </p>
                            {t.timestamp && (
                              <p className="text-[10px] text-slate-600 mt-1.5 font-mono">
                                {new Date(t.timestamp).toLocaleString()}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <Badge className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold">
                              Qty: {t.qty > 0 ? t.qty : "---"}
                            </Badge>
                            <p className="text-xs font-mono font-700 mt-2 text-slate-300">
                              {t.realized_profit != null ? `$${t.realized_profit}` : "---"}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </TabsContent>

            </Tabs>
          </div>
        </div>
      </div>

      {/* QUICK TRADE MODAL */}
      <Dialog open={tradeModalOpen} onOpenChange={setTradeModalOpen}>
        <DialogContent className="glass bg-card border-border text-foreground font-grotesk rounded-xl shadow-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-700 text-white text-lg">Quick Trade: {selectedOpp?.symbol}</DialogTitle>
          </DialogHeader>
          {selectedOpp && (
            <div className="space-y-4 mt-2">
              <div className="flex justify-between text-xs bg-secondary/55 p-3 rounded-lg border border-border/40 font-bold">
                <span>
                  Spread:{" "}
                  <span className="text-green-400 font-bold">
                    {(selectedOpp.profit_percent * 100).toFixed(2)}%
                  </span>
                </span>
                <span className="text-slate-350">Price: ${selectedOpp.buy_price}</span>
              </div>
              <div className="space-y-1.5">
                <Label className="font-semibold text-slate-300 text-xs">Quantity</Label>
                <Input
                  type="text" inputMode="decimal" autoFocus placeholder="Enter amount..."
                  value={quickAmount}
                  className="bg-secondary border-border text-foreground focus:ring-1 focus:ring-primary font-bold font-mono"
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || /^\d*\.?\d*$/.test(val)) setQuickAmount(val);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") confirmQuickTrade(parseFloat(quickAmount));
                  }}
                />
              </div>
              <Button
                className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold shadow-lg glow-primary mt-2"
                onClick={() => confirmQuickTrade(parseFloat(quickAmount))}
              >
                Confirm Execution
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* WALLET MODAL  */}
      <Dialog open={walletModalOpen} onOpenChange={setWalletModalOpen}>
        <DialogContent className="glass bg-card border-border text-foreground font-grotesk rounded-xl shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="capitalize font-700 text-white text-lg">{walletAction} Assets</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={walletForm.handleSubmit((d) => walletMutation.mutate(d))}
            className="space-y-4 mt-2"
          >
            {walletAction === "transfer" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="font-semibold text-slate-300 text-xs">From</Label>
                  <Select
                    onValueChange={(v: any) => walletForm.setValue("from", v)}
                    defaultValue={walletForm.watch("from")}
                  >
                    <SelectTrigger className="bg-secondary border-border text-foreground font-bold"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-card border-border text-foreground font-grotesk">
                      <SelectItem value="forex">Forex</SelectItem>
                      <SelectItem value="arb">Arb</SelectItem>
                      <SelectItem value="fut">Futures</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="font-semibold text-slate-300 text-xs">To</Label>
                  <Select
                    onValueChange={(v: any) => walletForm.setValue("to", v)}
                    defaultValue={walletForm.watch("to")}
                  >
                    <SelectTrigger className="bg-secondary border-border text-foreground font-bold"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-card border-border text-foreground font-grotesk">
                      <SelectItem value="forex">Forex</SelectItem>
                      <SelectItem value="arb">Arb</SelectItem>
                      <SelectItem value="fut">Futures</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            {walletAction === "transfer" && walletForm.formState.errors.to && (
              <p className="text-destructive text-xs">{walletForm.formState.errors.to.message}</p>
            )}

            {walletAction === "withdraw" && (
              <div className="space-y-1.5">
                <Label className="font-semibold text-slate-300 text-xs">Wallet Address</Label>
                <Input
                  {...walletForm.register("address")}
                  className="bg-secondary border-border text-foreground focus:ring-1 focus:ring-primary font-bold font-mono"
                  placeholder="0x..."
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-semibold text-slate-300 text-xs">
                  Amount
                  {walletAction === "transfer" && (
                    <span className="text-primary text-xs ml-1">(USDT)</span>
                  )}
                </Label>
                <div className="relative">
                  <Input
                    type="text" inputMode="decimal"
                    {...walletForm.register("amount")}
                    className="bg-secondary border-border text-foreground pr-12 focus:ring-1 focus:ring-primary font-bold font-mono"
                  />
                  {walletAction === "transfer" && (
                    <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-bold">USDT</span>
                  )}
                </div>
                {walletForm.formState.errors.amount && (
                  <p className="text-destructive text-xs">{walletForm.formState.errors.amount.message}</p>
                )}
              </div>
              {(walletAction === "deposit" || walletAction === "withdraw") && (
                <div className="space-y-1.5">
                  <Label className="font-semibold text-slate-300 text-xs">Asset</Label>
                  <Select onValueChange={(v) => walletForm.setValue("currency", v)} defaultValue="USDT">
                    <SelectTrigger className="bg-secondary border-border text-foreground font-bold"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-card border-border text-foreground font-grotesk">
                      <SelectItem value="USDT">USDT</SelectItem>
                      <SelectItem value="BTC">BTC</SelectItem>
                      <SelectItem value="ETH">ETH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {walletAction === "deposit" && (
              <div className="space-y-1.5">
                <Label className="font-semibold text-slate-300 text-xs">Deposit Receipt</Label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-border border-dashed rounded-xl cursor-pointer bg-secondary/40 hover:bg-secondary/65 transition-all">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-8 h-8 mb-2 text-primary glow-text" />
                    <p className="text-sm text-slate-400">
                      {receipt ? (
                        <span className="text-primary font-bold flex items-center gap-1">
                          <FileText className="w-4 h-4" /> {receipt.name}
                        </span>
                      ) : (
                        "Click to upload proof of payment"
                      )}
                    </p>
                  </div>
                  <input
                    type="file" className="hidden" accept="image/*,.pdf"
                    onChange={(e) => setReceipt(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
            )}

            <Button
              disabled={walletMutation.isPending}
              className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold shadow-lg glow-primary capitalize mt-2 transition-all"
            >
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

const FilterContent = ({
  exchanges, symbols,
  selectedExchanges, selectedSymbols,
  onToggleExchange, onToggleSymbol,
  disabled,
}: any) => {
  const getName = (item: any) => (typeof item === "object" ? item.name || "Unknown" : item);

  return (
    <div className={`space-y-6 ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
      <div>
        <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Exchanges</h4>
        <div className="space-y-1">
          {exchanges.map((ex: any, i: number) => {
            const name = getName(ex);
            const isSelected = selectedExchanges.includes(name);
            return (
              <div
                key={i} onClick={() => onToggleExchange(name)}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-sm font-semibold transition-all ${
                  isSelected
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                    : "text-slate-400 hover:bg-secondary border border-transparent"
                }`}
              >
                <span>{name}</span>
                {isSelected && <CheckCircle2 className="w-3 h-3 text-primary" />}
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Pairs</h4>
        <div className="space-y-1">
          {symbols.map((sym: any, i: number) => {
            const name = getName(sym);
            const isSelected = selectedSymbols.includes(name);
            return (
              <div
                key={i} onClick={() => onToggleSymbol(name)}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-sm font-semibold transition-all ${
                  isSelected
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                    : "text-slate-400 hover:bg-secondary border border-transparent"
                }`}
              >
                <span>{name}</span>
                {isSelected && <CheckCircle2 className="w-3 h-3 text-primary" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
