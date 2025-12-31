import { Layout } from "@/components/Layout";
import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"; 
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// --- CONFIGURATION ---
const API_BASE = "https://gat-zm1r.onrender.com";

// --- FETCHER FUNCTION ---
const defaultFetcher = async ({ queryKey }: any) => {
  const [path, params] = queryKey;
  const searchParams = new URLSearchParams();
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        searchParams.append(key, value.join(','));
      } else {
        searchParams.append(key, String(value));
      }
    });
  }
  
  const queryString = searchParams.toString() ? "?" + searchParams.toString() : "";
  const token = sessionStorage.getItem("token");
  
  // Direct connection to backend
  const url = `${API_BASE}${path}${queryString}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`Error fetching ${path}: ${res.statusText}`);
  return res.json();
};

export default function Arbitrage() {
  const { toast } = useToast();

  // --- STATE ---
  const [selectedExchanges, setSelectedExchanges] = useState<string[]>(["BYBIT", "MEXC", "BINANCE"]);
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>(["BTCUSDT", "ETHUSDT"]);
  const [minProfit, setMinProfit] = useState(0.001);
  
  // UI States
  const [isScannerRunning, setIsScannerRunning] = useState(false);
  const [showAdvancedRisk, setShowAdvancedRisk] = useState(false);
  const [activeTab, setActiveTab] = useState("scanner");
  const [autoExecute, setAutoExecute] = useState(false);
  const [emergencyStop, setEmergencyStop] = useState(false);

  // --- Trade Execution State ---
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [selectedOpp, setSelectedOpp] = useState<any>(null);
  const [tradeQty, setTradeQty] = useState("0.01");

  // --- QUERIES ---
  
  const { data: exchangeList = [] } = useQuery({
    queryKey: ["/arb/arbitrage-exc"],
    queryFn: defaultFetcher,
    retry: false,
  });

  const { data: symbolList = [] } = useQuery({
    queryKey: ["/arb/arbitrage-symbol"],
    queryFn: defaultFetcher,
    retry: false,
  });

  const { data: rawOpportunities, isLoading: opportunitiesLoading } = useQuery({
    queryKey: [
      "/arb/opportunity-scanner",
      {
        exchanges: selectedExchanges,
        symbols: selectedSymbols,
        min_profit: minProfit,
      },
    ],
    queryFn: defaultFetcher,
    retry: false,
    enabled: isScannerRunning && !emergencyStop, 
    refetchInterval: 3000,
  });

  const opportunities = Array.isArray(rawOpportunities) ? rawOpportunities : [];

  const { data: rawHistory } = useQuery({
    queryKey: ["/arb/user-arb"],
    queryFn: defaultFetcher,
    retry: false,
  });

  const tradeHistory = Array.isArray(rawHistory) ? rawHistory : [];

  // --- DYNAMIC STATS CALCULATIONS ---
  const stats = useMemo(() => {
    const totalPnL = tradeHistory.reduce((acc: number, t: any) => acc + (parseFloat(t.profit) || 0), 0);
    const winningTrades = tradeHistory.filter((t: any) => (parseFloat(t.profit) || 0) > 0).length;
    const winRate = tradeHistory.length > 0 ? ((winningTrades / tradeHistory.length) * 100).toFixed(1) : "0.0";
    const activeTradesCount = tradeHistory.filter((t: any) => t.status === 'Active' || t.status === 'Pending').length;
    
    // Risk score is static (0) as API doesn't provide it yet
    const riskScore = 0; 

    return { totalPnL, winRate, activeTradesCount, riskScore };
  }, [tradeHistory]);


  // --- MUTATIONS ---
  const executeTradeMutation = useMutation({
    mutationFn: async (tradeData: any) => {
      // Manual fetch here to ensure we hit the API_BASE directly
      const token = sessionStorage.getItem("token");
      const res = await fetch(`${API_BASE}/arb/perform-arb-trade`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(tradeData)
      });
      if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || "Failed to execute trade");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Trade Executed", description: "Arbitrage trade placed successfully." });
      queryClient.invalidateQueries({ queryKey: ["/arb/user-arb"] });
      setTradeModalOpen(false); 
    },
    onError: (error: any) => {
      toast({ title: "Execution Failed", description: error.message, variant: "destructive" });
    },
  });

  const handleSetupTrade = (opp: any) => {
    if(emergencyStop) {
        toast({ title: "Emergency Stop Active", description: "Disable emergency stop to trade.", variant: "destructive" });
        return;
    }
    setSelectedOpp(opp);
    setTradeModalOpen(true);
  };

  const handleConfirmTrade = () => {
    if (!selectedOpp) return;
    executeTradeMutation.mutate({
      symbol: selectedOpp.symbol,
      buy_exchange: selectedOpp.exchange_buy,
      sell_exchange: selectedOpp.exchange_sell,
      qty: parseFloat(tradeQty) 
    });
  };

  const getExchangeName = (ex: any) => (typeof ex === 'object' && ex !== null ? ex.name : ex);

  const toggleExchange = (ex: any) => {
    const name = getExchangeName(ex);
    if (selectedExchanges.includes(name)) {
      setSelectedExchanges(prev => prev.filter(e => e !== name));
    } else {
      setSelectedExchanges(prev => [...prev, name]);
    }
  };

  // Removed Placeholder Alerts - Now using empty array since endpoint doesn't exist
  const priceAlerts: any[] = []; 

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 lg:py-8 space-y-6">
        
        {/* --- MODAL: Trade Execution --- */}
        <Dialog open={tradeModalOpen} onOpenChange={setTradeModalOpen}>
          <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <i className="ri-flashlight-fill text-yellow-500"></i> Execute Arbitrage
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Review parameters before executing this trade.
              </DialogDescription>
            </DialogHeader>
            
            {selectedOpp && (
              <div className="grid gap-4 py-4">
                <div className="flex items-center justify-between bg-gray-800/50 p-3 rounded border border-gray-700">
                  <div className="text-center">
                    <p className="text-xs text-blue-400 font-bold">BUY</p>
                    <p className="text-sm font-bold text-white">{selectedOpp.exchange_buy}</p>
                    <p className="text-xs text-gray-400">${selectedOpp.price_buy}</p>
                  </div>
                  <i className="ri-arrow-right-line text-gray-500"></i>
                  <div className="text-center">
                    <p className="text-xs text-purple-400 font-bold">SELL</p>
                    <p className="text-sm font-bold text-white">{selectedOpp.exchange_sell}</p>
                    <p className="text-xs text-gray-400">${selectedOpp.price_sell}</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="symbol" className="text-right text-gray-400">Symbol</Label>
                  <Input id="symbol" value={selectedOpp.symbol} disabled className="col-span-3 bg-gray-800 border-gray-700 text-gray-500" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="qty" className="text-right text-white">Quantity</Label>
                  <Input 
                    id="qty" 
                    type="number" 
                    value={tradeQty} 
                    onChange={(e) => setTradeQty(e.target.value)} 
                    className="col-span-3 bg-gray-950 border-gray-700 text-white focus:border-emerald-500" 
                  />
                </div>
                <div className="flex justify-between items-center px-2">
                   <span className="text-sm text-gray-400">Est. Profit:</span>
                   <span className="text-sm font-bold text-emerald-400">
                     +{(selectedOpp.profit_percentage || 0).toFixed(2)}%
                   </span>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setTradeModalOpen(false)} className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">Cancel</Button>
              <Button onClick={handleConfirmTrade} disabled={executeTradeMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {executeTradeMutation.isPending ? "Executing..." : "Confirm Trade"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* --- TOP SECTION: SCANNER CONTROL --- */}
        <Card className="bg-gray-900 border-gray-800 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                    Arbitrage Scanner Control
                    <span className={`h-2.5 w-2.5 rounded-full ${isScannerRunning && !emergencyStop ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'}`}></span>
                </h1>
                <p className="text-gray-400 text-sm mt-1">Start scanning to discover arbitrage opportunities across multiple exchanges in real-time.</p>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">{isScannerRunning ? (emergencyStop ? "HALTED" : "Scanner Active") : "Scanner Idle"}</span>
                <Button 
                    onClick={() => setIsScannerRunning(!isScannerRunning)}
                    disabled={emergencyStop}
                    className={`${isScannerRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-600 hover:bg-emerald-700'} text-white min-w-[140px]`}
                >
                    <i className={`ri-${isScannerRunning ? 'stop' : 'play'}-circle-line mr-2`}></i>
                    {isScannerRunning ? "Stop Scanner" : "Start Scanner"}
                </Button>
            </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* --- LEFT SIDEBAR --- */}
            <div className="space-y-6">
                
                {/* Exchange Filters */}
                <Card className="bg-gray-900 border-gray-800 p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-white">Exchange Filters</h3>
                        <div className="flex gap-2">
                            <span onClick={() => setSelectedExchanges(Array.isArray(exchangeList) ? exchangeList.map(getExchangeName) : [])} className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded cursor-pointer">All</span>
                            <span onClick={() => setSelectedExchanges([])} className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded cursor-pointer">None</span>
                        </div>
                    </div>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {Array.isArray(exchangeList) && exchangeList.length > 0 ? (
                            exchangeList.map((ex: any, idx: number) => {
                                const name = getExchangeName(ex);
                                return (
                                    <div 
                                        key={name || idx} 
                                        onClick={() => toggleExchange(ex)}
                                        className="flex items-center justify-between p-2 rounded hover:bg-gray-800/50 cursor-pointer"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedExchanges.includes(name) ? 'bg-emerald-500 border-emerald-500' : 'border-gray-600'}`}>
                                                {selectedExchanges.includes(name) && <i className="ri-check-line text-white text-xs"></i>}
                                            </div>
                                            <span className="text-gray-300 text-sm">{name}</span>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-gray-500 text-xs p-2">Loading exchanges...</div>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 mt-4">Selected: {selectedExchanges.length} exchanges</p>
                </Card>

                {/* Wallet Manager */}
                <Card className="bg-gray-900 border-gray-800 p-4">
                    <h3 className="font-bold text-white mb-4">Wallet Manager</h3>
                    <Select defaultValue="binance">
                        <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-white mb-4">
                            <SelectValue placeholder="Select Exchange" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700 text-white">
                            <SelectItem value="binance">Binance</SelectItem>
                            <SelectItem value="mexc">MEXC</SelectItem>
                            <SelectItem value="kraken">Kraken</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-lg p-4 mb-4 text-center">
                        <p className="text-gray-400 text-xs mb-1">Total Portfolio</p>
                        {/* Placeholder Value: Could fetch from stats endpoint if available later */}
                        <h2 className="text-2xl font-bold text-white">$ --.--</h2> 
                        <div className="flex justify-between mt-2 text-xs">
                             {/* Static until portfolio endpoint exists */}
                            <span className="text-emerald-400">-- (24h)</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-4">
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 h-8 text-xs">Deposit</Button>
                        <Button size="sm" variant="outline" className="border-blue-600 text-blue-500 hover:bg-blue-600/10 h-8 text-xs">Withdraw</Button>
                        <Button size="sm" variant="outline" className="border-purple-600 text-purple-500 hover:bg-purple-600/10 h-8 text-xs">Transfer</Button>
                    </div>
                </Card>

            </div>

            {/* --- RIGHT COLUMN / MAIN CONTENT --- */}
            <div className="lg:col-span-3 space-y-6">
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="flex items-center gap-4 mb-4">
                        <TabsList className="bg-gray-900 border border-gray-800">
                            <TabsTrigger value="scanner" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                                <i className="ri-radar-line mr-2"></i> Opportunity Scanner
                            </TabsTrigger>
                            <TabsTrigger value="alerts" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                                <i className="ri-notification-3-line mr-2"></i> Price Alerts
                            </TabsTrigger>
                            <TabsTrigger value="risk" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                                <i className="ri-shield-check-line mr-2"></i> Risk Management
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* === TAB 1: OPPORTUNITY SCANNER === */}
                    <TabsContent value="scanner" className="space-y-6">
                        {/* Real-Time Stats Header */}
                        <Card className="bg-gray-900 border-gray-800 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-white">Real-Time Opportunities</h2>
                                <div className="flex gap-4 text-center">
                                    <div><p className="text-2xl font-bold text-white">{opportunities.length}</p><p className="text-xs text-gray-500">Scanned</p></div>
                                    <div><p className="text-2xl font-bold text-emerald-400">{opportunities.length}</p><p className="text-xs text-gray-500">Profitable</p></div>
                                    <div><p className="text-2xl font-bold text-blue-400">{tradeHistory.length}</p><p className="text-xs text-gray-500">Executed</p></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-gray-950/50 p-4 rounded-lg border border-gray-800">
                                <div className="flex items-center gap-3">
                                    <Switch checked={autoExecute} onCheckedChange={setAutoExecute} />
                                    <div>
                                        <p className="text-sm text-white font-medium">Auto Execute</p>
                                        <p className="text-xs text-gray-500">Automatically take trades</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Scan Interval (s)</label>
                                    <Select defaultValue="3">
                                        <SelectTrigger className="bg-gray-800 border-gray-700 h-9 text-xs"><SelectValue /></SelectTrigger>
                                        <SelectContent className="bg-gray-800 border-gray-700 text-white"><SelectItem value="1">1 second</SelectItem><SelectItem value="3">3 seconds</SelectItem></SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Alert Threshold ($)</label>
                                    <Input className="bg-gray-800 border-gray-700 h-9 text-xs" defaultValue="100" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Min Profit ($)</label>
                                    <Input 
                                      className="bg-gray-800 border-gray-700 h-9 text-xs" 
                                      value={minProfit} 
                                      onChange={(e) => setMinProfit(parseFloat(e.target.value))} 
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* Opportunities List */}
                        <Card className="bg-gray-900 border-gray-800 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-950">
                                        <tr className="text-gray-400 text-xs uppercase tracking-wider">
                                            <th className="text-left p-4">Symbol</th>
                                            <th className="text-left p-4">Buy</th>
                                            <th className="text-right p-4">Price</th>
                                            <th className="text-left p-4 pl-8">Sell</th>
                                            <th className="text-right p-4">Price</th>
                                            <th className="text-right p-4">Profit</th>
                                            <th className="text-right p-4">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800">
                                        {opportunitiesLoading ? (
                                            <tr><td colSpan={7} className="text-center p-8 text-gray-500">Scanning for opportunities...</td></tr>
                                        ) : opportunities.length === 0 ? (
                                            <tr><td colSpan={7} className="text-center p-8 text-gray-500">No opportunities matching criteria. Start scanner to see live data.</td></tr>
                                        ) : (
                                            opportunities.map((opp: any, idx: number) => (
                                                <tr key={idx} className="hover:bg-gray-800/50">
                                                    <td className="p-4 text-white font-medium">{opp.symbol}</td>
                                                    <td className="p-4"><span className="text-blue-400 bg-blue-500/10 px-2 py-1 rounded text-xs">{opp.exchange_buy}</span></td>
                                                    <td className="p-4 text-right text-gray-300 font-mono">${opp.price_buy}</td>
                                                    <td className="p-4 pl-8"><span className="text-purple-400 bg-purple-500/10 px-2 py-1 rounded text-xs">{opp.exchange_sell}</span></td>
                                                    <td className="p-4 text-right text-gray-300 font-mono">${opp.price_sell}</td>
                                                    <td className="p-4 text-right text-emerald-400 font-bold">+{opp.profit_percentage ? opp.profit_percentage.toFixed(3) : 0}%</td>
                                                    <td className="p-4 text-right">
                                                      <Button 
                                                        size="sm" 
                                                        className="bg-emerald-600 h-7 text-xs hover:bg-emerald-700"
                                                        onClick={() => handleSetupTrade(opp)} 
                                                      >
                                                        Execute
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

                    {/* === TAB 2: PRICE ALERTS === */}
                    <TabsContent value="alerts" className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-white flex gap-2">Price Alerts <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded-full">{priceAlerts.length} Active</span></h2>
                            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white"><i className="ri-add-line mr-2"></i> Create Alert</Button>
                        </div>
                        {priceAlerts.length === 0 ? (
                             <div className="text-center py-10 text-gray-500 bg-gray-900 border border-gray-800 rounded-lg">No active alerts configured.</div>
                        ) : (
                            priceAlerts.map((alert, idx) => (
                                <Card key={idx} className="bg-gray-900 border-gray-800 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                                    {/* Alert rendering logic would go here if endpoint existed */}
                                </Card>
                            ))
                        )}
                    </TabsContent>

                    {/* === TAB 3: RISK MANAGEMENT === */}
                    <TabsContent value="risk" className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-bold text-white flex gap-2">Risk Management <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded">Active</span></h2>
                            <Button 
                                variant="outline" 
                                className="border-gray-700 text-gray-300"
                                onClick={() => setShowAdvancedRisk(!showAdvancedRisk)}
                            >
                                <i className="ri-settings-3-line mr-2"></i> {showAdvancedRisk ? "Hide" : "Show"} Advanced Settings
                            </Button>
                        </div>

                        {/* Top Stats - CALCULATED FROM REAL HISTORY */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <Card className="bg-gray-900 border-gray-800 p-4">
                                <div className="flex justify-between items-start mb-2"><span className="text-gray-400 text-xs">Risk Score</span><i className="ri-shield-line text-gray-500"></i></div>
                                <h3 className="text-2xl font-bold text-gray-500">N/A</h3>
                                <div className="w-full h-1.5 bg-gray-800 rounded-full mt-2"><div className="h-full bg-gray-600 rounded-full w-[0%]"></div></div>
                            </Card>
                            <Card className="bg-gray-900 border-gray-800 p-4">
                                <div className="flex justify-between items-start mb-2"><span className="text-gray-400 text-xs">Total P&L</span><i className="ri-line-chart-line text-gray-500"></i></div>
                                <h3 className={`text-2xl font-bold ${stats.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>${stats.totalPnL.toFixed(2)}</h3>
                            </Card>
                            <Card className="bg-gray-900 border-gray-800 p-4">
                                <div className="flex justify-between items-start mb-2"><span className="text-gray-400 text-xs">Active Trades</span><i className="ri-exchange-dollar-line text-gray-500"></i></div>
                                <h3 className="text-2xl font-bold text-white">{stats.activeTradesCount}</h3>
                            </Card>
                            <Card className="bg-gray-900 border-gray-800 p-4">
                                <div className="flex justify-between items-start mb-2"><span className="text-gray-400 text-xs">Win Rate</span><i className="ri-trophy-line text-gray-500"></i></div>
                                <h3 className="text-2xl font-bold text-emerald-400">{stats.winRate}%</h3>
                            </Card>
                        </div>

                        {/* Emergency Stop */}
                        <div className={`p-4 rounded-lg border flex items-center justify-between ${emergencyStop ? 'bg-red-900/20 border-red-500/50' : 'bg-gray-900 border-gray-800'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${emergencyStop ? 'bg-red-500 text-white' : 'bg-red-500/10 text-red-500'}`}>
                                    <i className="ri-alarm-warning-line text-xl"></i>
                                </div>
                                <div>
                                    <h3 className={`font-bold ${emergencyStop ? 'text-red-400' : 'text-white'}`}>Emergency Stop</h3>
                                    <p className="text-xs text-gray-400">Immediately halt all trading activities</p>
                                </div>
                            </div>
                            <Switch checked={emergencyStop} onCheckedChange={setEmergencyStop} className="data-[state=checked]:bg-red-500" />
                        </div>

                        {/* Standard Inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h4 className="text-emerald-400 text-sm font-bold mb-4 flex items-center gap-2"><i className="ri-hexagon-line"></i> Position Limits</h4>
                                <div className="space-y-4">
                                    <div><label className="text-xs text-gray-400 mb-1 block">Max Position Size ($)</label><Input className="bg-gray-800 border-gray-700" defaultValue="10000" /></div>
                                    <div><label className="text-xs text-gray-400 mb-1 block">Max Daily Loss ($)</label><Input className="bg-gray-800 border-gray-700" defaultValue="1000" /></div>
                                    <div><label className="text-xs text-gray-400 mb-1 block">Max Concurrent Trades</label><Input className="bg-gray-800 border-gray-700" defaultValue="5" /></div>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-white text-sm font-bold mb-4 flex items-center gap-2"><i className="ri-percent-line"></i> Risk Percentages</h4>
                                <div className="space-y-4">
                                    <div><label className="text-xs text-gray-400 mb-1 block">Stop Loss (%)</label><Input className="bg-gray-800 border-gray-700" defaultValue="2" /></div>
                                    <div><label className="text-xs text-gray-400 mb-1 block">Take Profit (%)</label><Input className="bg-gray-800 border-gray-700" defaultValue="5" /></div>
                                    <div><label className="text-xs text-gray-400 mb-1 block">Risk Per Trade (%)</label><Input className="bg-gray-800 border-gray-700" defaultValue="1" /></div>
                                </div>
                            </div>
                        </div>

                        {/* Advanced Controls (Toggleable) */}
                        {showAdvancedRisk && (
                            <div className="bg-gray-900 border border-gray-700 p-4 rounded-lg animate-in fade-in slide-in-from-top-2">
                                <h4 className="text-emerald-400 text-sm font-bold mb-4 flex items-center gap-2"><i className="ri-tools-line"></i> Advanced Risk Controls</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div><label className="text-xs text-gray-400 mb-1 block">Max Drawdown ($)</label><Input className="bg-gray-800 border-gray-600" defaultValue="5000" /></div>
                                    <div><label className="text-xs text-gray-400 mb-1 block">Min Profit Threshold ($)</label><Input className="bg-gray-800 border-gray-600" defaultValue="50" /></div>
                                    <div><label className="text-xs text-gray-400 mb-1 block">Max Slippage (%)</label><Input className="bg-gray-800 border-gray-600" defaultValue="0.5" /></div>
                                </div>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>

        {/* --- BOTTOM SECTION: ACTIVE TRADES --- */}
        <div className="mt-8">
            <h2 className="text-xl font-bold text-white mb-4">Active Trades & History</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-gray-900 border-gray-800 p-4">
                    <p className="text-xs text-gray-500 mb-1">Gross P&L</p>
                    <h3 className={`text-2xl font-bold ${stats.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {stats.totalPnL >= 0 ? '+' : ''}${stats.totalPnL.toFixed(2)}
                    </h3>
                </Card>
                <Card className="bg-gray-900 border-gray-800 p-4">
                    <p className="text-xs text-gray-500 mb-1">Total Trades</p>
                    <h3 className="text-2xl font-bold text-blue-400">{tradeHistory.length}</h3>
                </Card>
                <Card className="bg-gray-900 border-gray-800 p-4">
                    <p className="text-xs text-gray-500 mb-1">Net P&L</p>
                    <h3 className={`text-2xl font-bold ${stats.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {stats.totalPnL >= 0 ? '+' : ''}${stats.totalPnL.toFixed(2)}
                    </h3>
                </Card>
            </div>

            <Card className="bg-gray-900 border-gray-800 p-6 space-y-6">
                {tradeHistory.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>No active trades or history found.</p>
                    </div>
                ) : (
                    tradeHistory.map((trade: any, idx: number) => (
                        <div key={idx} className="bg-gray-950/50 border border-gray-800 rounded-lg p-4">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                                <div>
                                    <h3 className="text-white font-bold text-lg">{trade.symbol} <span className="text-gray-400 text-sm font-normal ml-2">{trade.buy_exchange || 'Unknown'} → {trade.sell_exchange || 'Unknown'}</span></h3>
                                    <p className="text-xs text-gray-500 mt-1">Status: {trade.status || 'Active'}</p>
                                </div>
                                <div className="text-right">
                                    <h3 className={`font-bold text-xl ${parseFloat(trade.profit) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {parseFloat(trade.profit) >= 0 ? '+' : ''}${parseFloat(trade.profit).toFixed(2)}
                                    </h3>
                                </div>
                            </div>
                            <div className="space-y-2">
                                 <div className="flex justify-between text-xs text-gray-400">
                                    <span>Progress</span>
                                    <span>{trade.status === 'Completed' ? 100 : 50}%</span>
                                 </div>
                                 <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full" style={{width: `${trade.status === 'Completed' ? 100 : 50}%`}}></div>
                                 </div>
                            </div>
                            <div className="flex gap-3 mt-4">
                                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white"><i className="ri-eye-line mr-2"></i> View Details</Button>
                                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white"><i className="ri-close-line mr-2"></i> Cancel Trade</Button>
                            </div>
                        </div>
                    ))
                )}
            </Card>
        </div>

      </div>
    </Layout>
  );
}