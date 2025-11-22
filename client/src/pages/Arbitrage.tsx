import { Layout } from "@/components/Layout";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- FETCHER FUNCTION ---
const defaultFetcher = async ({ queryKey }: any) => {
  const [path, params] = queryKey;
  const queryString = params ? "?" + new URLSearchParams(params).toString() : "";
  const token = localStorage.getItem("token");
  const res = await fetch(`${path}${queryString}`, {
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

  // --- QUERIES ---
  const { data: exchanges = [], isLoading: exchangesLoading } = useQuery({
    queryKey: ["/arb/exchanges"],
    queryFn: defaultFetcher,
    retry: false,
  });

  const { data: symbols = [], isLoading: symbolsLoading } = useQuery({
    queryKey: ["/arb/symbols"],
    queryFn: defaultFetcher,
    retry: false,
  });

  const { data: opportunities = [], isLoading: opportunitiesLoading } = useQuery({
    queryKey: [
      "/arb/opportunities",
      {
        exchanges: selectedExchanges.join(','),
        symbols: selectedSymbols.join(','),
        minProfit: minProfit.toString(),
      },
    ],
    queryFn: defaultFetcher,
    retry: false,
    enabled: isScannerRunning, // Only fetch if scanner is "Running"
    refetchInterval: 3000,
  });

  // --- MOCK DATA FOR UI DEMO (Since backend endpoints might not exist for these specific sections yet) ---
  const activeTrades = [
    { pair: "BTC/USDT", route: "Binance → Coinbase", amount: "0.5 BTC", pnl: "+$52.75", pnlPercent: "+0.30%", progress: 75, status: "Active" },
    { pair: "ETH/USDT", route: "Kraken → Binance", amount: "2 ETH", pnl: "+$20.15", pnlPercent: "+0.56%", progress: 45, status: "Active" },
  ];

  const priceAlerts = [
    { pair: "BTC/USDT", exchange: "Binance", current: "$43,250", target: "$45,000", type: "Above", status: "Active", progress: 96 },
    { pair: "ETH/USDT", exchange: "Coinbase", current: "$2,650", target: "$2,500", type: "Below", status: "Active", progress: 0 },
  ];

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 lg:py-8 space-y-6">
        
        {/* --- TOP SECTION: SCANNER CONTROL --- */}
        <Card className="bg-gray-900 border-gray-800 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                    Arbitrage Scanner Control
                    <span className={`h-2.5 w-2.5 rounded-full ${isScannerRunning ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'}`}></span>
                </h1>
                <p className="text-gray-400 text-sm mt-1">Start scanning to discover arbitrage opportunities across multiple exchanges in real-time.</p>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">{isScannerRunning ? "Scanner Active" : "Scanner Idle"}</span>
                <Button 
                    onClick={() => setIsScannerRunning(!isScannerRunning)}
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
                            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded cursor-pointer">All</span>
                            <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded cursor-pointer">None</span>
                        </div>
                    </div>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {["Binance", "KuCoin", "OKX", "MEXC", "HTX", "XT", "Bitget"].map(ex => (
                            <div key={ex} className="flex items-center justify-between p-2 rounded hover:bg-gray-800/50">
                                <div className="flex items-center gap-2">
                                    <div className={`w-4 h-4 rounded border ${selectedExchanges.includes(ex.toUpperCase()) ? 'bg-emerald-500 border-emerald-500' : 'border-gray-600'}`}>
                                        {selectedExchanges.includes(ex.toUpperCase()) && <i className="ri-check-line text-white text-xs block text-center"></i>}
                                    </div>
                                    <span className="text-gray-300 text-sm">{ex}</span>
                                </div>
                                <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-4">Selected: {selectedExchanges.length} / 15 exchanges</p>
                </Card>

                {/* Wallet Manager (NEW) */}
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
                        <h2 className="text-2xl font-bold text-white">$89,682.05</h2>
                        <div className="flex justify-between mt-2 text-xs">
                            <span className="text-emerald-400">+ $1,120.25 (24h)</span>
                            <span className="text-emerald-400">+ 1.08%</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-2 bg-gray-800/30 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs">USDT</div>
                                <div>
                                    <p className="text-white text-sm font-medium">USDT</p>
                                    <p className="text-gray-500 text-xs">Balance: 45,250</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-white text-sm">$45,252</p>
                                <p className="text-emerald-400 text-xs">+2.84%</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-800/30 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-xs">BTC</div>
                                <div>
                                    <p className="text-white text-sm font-medium">BTC</p>
                                    <p className="text-gray-500 text-xs">Balance: 0.85</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-white text-sm">$36,742</p>
                                <p className="text-emerald-400 text-xs">+2.1%</p>
                            </div>
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
                                    <div><p className="text-2xl font-bold text-white">{opportunitiesLoading ? "..." : opportunities.length + 12}</p><p className="text-xs text-gray-500">Scanned</p></div>
                                    <div><p className="text-2xl font-bold text-emerald-400">{opportunitiesLoading ? "..." : opportunities.length}</p><p className="text-xs text-gray-500">Profitable</p></div>
                                    <div><p className="text-2xl font-bold text-blue-400">{activeTrades.length}</p><p className="text-xs text-gray-500">Active</p></div>
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
                                    <Input className="bg-gray-800 border-gray-700 h-9 text-xs" defaultValue="10" />
                                </div>
                            </div>

                            <div className="flex gap-2 mt-4">
                                <Button size="sm" className="bg-emerald-600 text-white text-xs"><i className="ri-money-dollar-circle-line mr-1"></i> Profit</Button>
                                <Button size="sm" variant="outline" className="border-gray-700 text-gray-400 text-xs"><i className="ri-bar-chart-line mr-1"></i> Spread</Button>
                                <Button size="sm" variant="outline" className="border-gray-700 text-gray-400 text-xs"><i className="ri-signal-tower-line mr-1"></i> Volume</Button>
                                <div className="ml-auto">
                                    <Select defaultValue="all">
                                        <SelectTrigger className="bg-gray-800 border-gray-700 h-8 text-xs w-[120px]"><SelectValue placeholder="Risk Level" /></SelectTrigger>
                                        <SelectContent className="bg-gray-800 border-gray-700 text-white"><SelectItem value="all">All Levels</SelectItem></SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </Card>

                        {/* Existing Opportunities List */}
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
                                        {opportunities.length === 0 ? (
                                             <tr><td colSpan={7} className="text-center p-8 text-gray-500">Start scanner to see opportunities</td></tr>
                                        ) : (
                                            opportunities.map((opp: any, idx: number) => (
                                                <tr key={idx} className="hover:bg-gray-800/50">
                                                    <td className="p-4 text-white font-medium">{opp.symbol || 'BTC/USDT'}</td>
                                                    <td className="p-4"><span className="text-blue-400 bg-blue-500/10 px-2 py-1 rounded text-xs">{opp.exchange_buy}</span></td>
                                                    <td className="p-4 text-right text-gray-300 font-mono">${opp.price_buy}</td>
                                                    <td className="p-4 pl-8"><span className="text-purple-400 bg-purple-500/10 px-2 py-1 rounded text-xs">{opp.exchange_sell}</span></td>
                                                    <td className="p-4 text-right text-gray-300 font-mono">${opp.price_sell}</td>
                                                    <td className="p-4 text-right text-emerald-400 font-bold">+{opp.profit_percentage?.toFixed(2)}%</td>
                                                    <td className="p-4 text-right"><Button size="sm" className="bg-emerald-600 h-7 text-xs">Execute</Button></td>
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
                            <h2 className="text-lg font-bold text-white flex gap-2">Price Alerts <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded-full">2 Active</span></h2>
                            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white"><i className="ri-add-line mr-2"></i> Create Alert</Button>
                        </div>
                        {priceAlerts.map((alert, idx) => (
                            <Card key={idx} className="bg-gray-900 border-gray-800 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4 w-full md:w-1/3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${alert.type === 'Above' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                        <i className={`ri-arrow-${alert.type === 'Above' ? 'up' : 'down'}-line text-xl`}></i>
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold">{alert.pair} <span className="ml-2 text-xs bg-gray-800 text-emerald-400 px-2 py-0.5 rounded">Active</span></h3>
                                        <p className="text-gray-500 text-xs">{alert.exchange}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-8 w-full md:w-1/3 text-center md:text-left">
                                    <div><p className="text-gray-500 text-xs">Current Price</p><p className="text-white font-mono">{alert.current}</p></div>
                                    <div><p className="text-gray-500 text-xs">Target Price</p><p className="text-white font-mono">{alert.target}</p></div>
                                    <div><p className="text-gray-500 text-xs">Alert Type</p><p className={alert.type === 'Above' ? 'text-emerald-400' : 'text-red-400'}>{alert.type}</p></div>
                                </div>
                                <div className="flex gap-2 w-full md:w-auto justify-end">
                                    <div className="w-24 mr-4 flex flex-col justify-center"><div className="h-1.5 bg-gray-700 rounded-full w-full"><div className="h-full bg-emerald-500 rounded-full" style={{width: `${alert.progress}%`}}></div></div><p className="text-[10px] text-right text-gray-500 mt-1">{alert.progress}%</p></div>
                                    <Button size="sm" className="bg-yellow-600/20 text-yellow-500 border border-yellow-600/50 hover:bg-yellow-600/30"><i className="ri-pause-line mr-1"></i> Pause</Button>
                                    <Button size="sm" className="bg-red-600/20 text-red-500 border border-red-600/50 hover:bg-red-600/30"><i className="ri-delete-bin-line mr-1"></i> Delete</Button>
                                </div>
                            </Card>
                        ))}
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

                        {/* Top Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <Card className="bg-gray-900 border-gray-800 p-4">
                                <div className="flex justify-between items-start mb-2"><span className="text-gray-400 text-xs">Risk Score</span><i className="ri-shield-line text-gray-500"></i></div>
                                <h3 className="text-2xl font-bold text-red-500">65</h3>
                                <div className="w-full h-1.5 bg-gray-800 rounded-full mt-2"><div className="h-full bg-red-500 rounded-full w-[65%]"></div></div>
                            </Card>
                            <Card className="bg-gray-900 border-gray-800 p-4">
                                <div className="flex justify-between items-start mb-2"><span className="text-gray-400 text-xs">Daily P&L</span><i className="ri-line-chart-line text-gray-500"></i></div>
                                <h3 className="text-2xl font-bold text-emerald-400">+$450.00</h3>
                                <p className="text-xs text-gray-500">Limit: $1,000</p>
                            </Card>
                            <Card className="bg-gray-900 border-gray-800 p-4">
                                <div className="flex justify-between items-start mb-2"><span className="text-gray-400 text-xs">Active Trades</span><i className="ri-exchange-dollar-line text-gray-500"></i></div>
                                <h3 className="text-2xl font-bold text-white">3/5</h3>
                                <p className="text-xs text-gray-500">Exposure: $25,000</p>
                            </Card>
                            <Card className="bg-gray-900 border-gray-800 p-4">
                                <div className="flex justify-between items-start mb-2"><span className="text-gray-400 text-xs">Win Rate</span><i className="ri-trophy-line text-gray-500"></i></div>
                                <h3 className="text-2xl font-bold text-emerald-400">72.5%</h3>
                                <p className="text-xs text-gray-500">Sharpe: 1.85</p>
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

                        {/* Performance Analysis */}
                        <div>
                             <h4 className="text-white text-sm font-bold mb-4 flex items-center gap-2"><i className="ri-bar-chart-grouped-line"></i> Performance Analysis</h4>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-gray-900 border border-gray-800 p-4 rounded-lg">
                                    <p className="text-xs text-gray-500 mb-1">Average Profit</p>
                                    <div className="flex justify-between items-center"><span className="text-xl font-bold text-emerald-400">+$125.50</span><i className="ri-arrow-up-line text-emerald-500"></i></div>
                                </div>
                                <div className="bg-gray-900 border border-gray-800 p-4 rounded-lg">
                                    <p className="text-xs text-gray-500 mb-1">Average Loss</p>
                                    <div className="flex justify-between items-center"><span className="text-xl font-bold text-red-400">-$85.25</span><i className="ri-arrow-down-line text-red-500"></i></div>
                                </div>
                                <div className="bg-gray-900 border border-gray-800 p-4 rounded-lg">
                                    <p className="text-xs text-gray-500 mb-1">Current Drawdown</p>
                                    <span className="text-xl font-bold text-yellow-500">$1250.00</span>
                                </div>
                             </div>
                             <div className="flex gap-4">
                                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white"><i className="ri-save-line mr-2"></i> Save Settings</Button>
                                <Button variant="outline" className="border-blue-600 text-blue-400 hover:bg-blue-600/10"><i className="ri-download-line mr-2"></i> Export Report</Button>
                                <Button variant="ghost" className="text-gray-400 hover:text-white"><i className="ri-refresh-line mr-2"></i> Reset to Default</Button>
                             </div>
                        </div>

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
                    <h3 className="text-2xl font-bold text-emerald-400">+$94.15</h3>
                </Card>
                <Card className="bg-gray-900 border-gray-800 p-4">
                    <p className="text-xs text-gray-500 mb-1">Total Fees</p>
                    <h3 className="text-2xl font-bold text-red-400">-$21.25</h3>
                </Card>
                <Card className="bg-gray-900 border-gray-800 p-4">
                    <p className="text-xs text-gray-500 mb-1">Net P&L</p>
                    <h3 className="text-2xl font-bold text-emerald-400">+$72.90</h3>
                </Card>
            </div>

            <Card className="bg-gray-900 border-gray-800 p-6 space-y-6">
                {activeTrades.map((trade, idx) => (
                    <div key={idx} className="bg-gray-950/50 border border-gray-800 rounded-lg p-4">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                            <div>
                                <h3 className="text-white font-bold text-lg">{trade.pair} <span className="text-gray-400 text-sm font-normal ml-2">{trade.route} • {trade.amount}</span></h3>
                                <p className="text-xs text-gray-500 mt-1">Status: {trade.status}</p>
                            </div>
                            <div className="text-right">
                                <h3 className="text-emerald-400 font-bold text-xl">{trade.pnl}</h3>
                                <p className="text-emerald-500/80 text-xs">{trade.pnlPercent}</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                             <div className="flex justify-between text-xs text-gray-400">
                                <span>Progress</span>
                                <span>{trade.progress}%</span>
                             </div>
                             <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{width: `${trade.progress}%`}}></div>
                             </div>
                        </div>
                        <div className="flex gap-3 mt-4">
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white"><i className="ri-eye-line mr-2"></i> View Details</Button>
                            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white"><i className="ri-close-line mr-2"></i> Cancel Trade</Button>
                        </div>
                    </div>
                ))}
            </Card>
        </div>

      </div>
    </Layout>
  );
}