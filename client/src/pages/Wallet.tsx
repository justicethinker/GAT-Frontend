import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useMutation, useQuery } from "@tanstack/react-query";
import { 
  ArrowUpRight, ArrowDownLeft, RefreshCw, Wallet as WalletIcon, 
  ArrowRightLeft, Search, CheckCircle2, Clock, UploadCloud, Eye, Copy,
  LucideIcon
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- TYPES & INTERFACES ---
interface WalletData {
  balance: number;
}

interface StatsData {
  total_balance: number;
  wallets: {
    arb: WalletData;
    forex: WalletData;
    fut: WalletData;
  };
}

interface Transaction {
  id?: string;
  tx_id?: string;
  created_at: string;
  amount: number;
  currency: string;
  status: string;
  wallet_address?: string;
  type?: 'Deposit' | 'Withdraw'; 
}

interface TransferRequest {
  from_wallet: string;
  to_wallet: string;
  amount: number;
}

// --- CONSTANTS ---
const WALLET_TYPES = [
  { value: "arb", label: "Arbitrage Wallet" },
  { value: "forex", label: "Forex Account" },
  { value: "fut", label: "Futures Margin" },
];

const COIN_TYPES = [
  { symbol: "USDT", network: "TRC20" },
  { symbol: "USDC", network: "ERC20" },
  { symbol: "BTC", network: "Bitcoin" },
];

const CARD_BASE_STYLE = "bg-[#0f172a] border border-slate-800 rounded-2xl";

// --- SUB-COMPONENTS ---

// 1. Wallet Stats Card
const PortfolioHeader = ({ stats, onRefresh }: { stats: StatsData | undefined, onRefresh: () => void }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold">Assets</h1>
      <Button variant="outline" size="sm" className="border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-300" onClick={onRefresh}>
        <RefreshCw className="w-4 h-4 mr-2" /> Refresh
      </Button>
    </div>
    <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900/40 to-[#0f172a] border border-emerald-500/20 rounded-3xl p-10 shadow-2xl">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
      <div className="relative z-10">
        <p className="text-slate-400 font-medium mb-2">Total Portfolio Value</p>
        <h2 className="text-5xl sm:text-6xl font-bold tracking-tight">
          ${stats?.total_balance?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
        </h2>
        <div className="flex items-center gap-3 mt-4">
          <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-sm font-bold border border-emerald-500/20">+8.09%</span>
          <span className="text-emerald-400/80 text-sm">+$12,456.20 (24h)</span>
        </div>
      </div>
    </div>
  </div>
);

// 2. Transfer Dialog & Address Card
const ActionGrid = ({ walletAddress }: { walletAddress: string }) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [fromWallet, setFromWallet] = useState<string>("");
  const [toWallet, setToWallet] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

  const transferMutation = useMutation({
    mutationFn: async (data: TransferRequest) => apiRequest("POST", "/dash/transfer", data),
    onSuccess: () => {
      toast({ title: "Success", description: "Transfer completed successfully!" });
      setOpen(false);
      setAmount("");
      setFromWallet("");
      setToWallet("");
      queryClient.invalidateQueries({ queryKey: ["/dash/stats"] });
    },
    onError: (err: Error) => toast({ title: "Transfer Failed", description: err.message, variant: "destructive" }),
  });

  const handleTransfer = () => {
    // Validation
    if (!fromWallet || !toWallet) return toast({ title: "Error", description: "Please select both wallets", variant: "destructive" });
    if (fromWallet === toWallet) return toast({ title: "Error", description: "Cannot transfer to the same wallet", variant: "destructive" });
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return toast({ title: "Error", description: "Please enter a valid positive amount", variant: "destructive" });

    transferMutation.mutate({ from_wallet: fromWallet, to_wallet: toWallet, amount: val });
  };

  const copyAddress = () => {
    if (navigator.clipboard && walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      toast({ title: "Copied!", description: "Wallet address copied to clipboard" });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button className={`flex items-center justify-between ${CARD_BASE_STYLE} hover:border-emerald-500/50 p-6 transition-all group`}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-900/20 group-hover:scale-110 transition-transform">
                <ArrowRightLeft className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold">Transfer Funds</h3>
                <p className="text-slate-400 text-sm">Move assets between wallets</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500/20 group-hover:text-emerald-400">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </button>
        </DialogTrigger>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader><DialogTitle>Transfer Funds</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <Select value={fromWallet} onValueChange={setFromWallet}>
              <SelectTrigger className="bg-slate-950 border-slate-800"><SelectValue placeholder="From Wallet" /></SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-white">
                {WALLET_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={toWallet} onValueChange={setToWallet}>
              <SelectTrigger className="bg-slate-950 border-slate-800"><SelectValue placeholder="To Wallet" /></SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-white">
                {WALLET_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input 
              type="number" 
              placeholder="Amount" 
              className="bg-slate-950 border-slate-800" 
              value={amount} 
              onChange={e => setAmount(e.target.value)}
              min="0"
            />
            <Button 
              onClick={handleTransfer}
              disabled={transferMutation.isPending}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              {transferMutation.isPending ? "Processing..." : "Confirm Transfer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className={`${CARD_BASE_STYLE} p-6 flex items-center justify-between`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-slate-300">
            <WalletIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Wallet Address</h3>
            <p className="text-slate-400 text-sm font-mono truncate max-w-[150px] sm:max-w-xs">{walletAddress || "Loading..."}</p>
          </div>
        </div>
        <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800" onClick={copyAddress}>
          <Copy className="w-4 h-4 mr-2" /> Copy
        </Button>
      </div>
    </div>
  );
};

// 3. Accounts Grid
const AccountsGrid = ({ stats }: { stats: StatsData | undefined }) => {
  const accounts = [
    { name: "Arbitrage Wallet", abbr: "AR", balance: stats?.wallets?.arb?.balance || 0, color: "text-purple-500", bg: "bg-purple-500/10", line: "bg-purple-500" },
    { name: "Forex Account", abbr: "FX", balance: stats?.wallets?.forex?.balance || 0, color: "text-blue-500", bg: "bg-blue-500/10", line: "bg-blue-500" },
    { name: "Futures Margin", abbr: "FU", balance: stats?.wallets?.fut?.balance || 0, color: "text-yellow-500", bg: "bg-yellow-500/10", line: "bg-yellow-500" },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white">Your Accounts</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {accounts.map((acc) => (
          <Card key={acc.abbr} className={`${CARD_BASE_STYLE} hover:border-slate-700 transition-all overflow-hidden group`}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-xl ${acc.bg} ${acc.color} flex items-center justify-center font-bold text-xl`}>{acc.abbr}</div>
                <span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-lg text-xs font-bold">+12.5%</span>
              </div>
              <div className="space-y-1 mb-6">
                <p className="text-slate-400 text-sm font-medium">{acc.name}</p>
                <h3 className="text-2xl font-bold text-white">${acc.balance.toLocaleString()}</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="secondary" className="bg-slate-800 hover:bg-slate-700 border border-slate-700/50 text-white text-xs h-9">
                  <ArrowDownLeft className="w-3 h-3 mr-2 text-emerald-400" /> Deposit
                </Button>
                <Button variant="secondary" className="bg-slate-800 hover:bg-slate-700 border border-slate-700/50 text-white text-xs h-9">
                  <ArrowUpRight className="w-3 h-3 mr-2 text-red-400" /> Withdraw
                </Button>
              </div>
            </div>
            <div className={`h-1.5 w-full ${acc.line}`}></div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// 4. Deposit / Withdraw Panel
const TransactionPanel = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("deposit");
  const [selectedCoin, setSelectedCoin] = useState("USDT");
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [receipt, setReceipt] = useState<File | null>(null);

  // Mutations
  const depositMutation = useMutation({
    mutationFn: async (formData: FormData) => apiRequest("POST", "/dash/deposits", formData),
    onSuccess: () => {
      toast({ title: "Success", description: "Deposit submitted for review" });
      setDepositAmount("");
      setReceipt(null);
      queryClient.invalidateQueries({ queryKey: ["/dash/deposits"] });
    },
    onError: (err: Error) => toast({ title: "Deposit Failed", description: err.message, variant: "destructive" })
  });

  const withdrawMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/dash/withdrawals", data),
    onSuccess: () => {
      toast({ title: "Success", description: "Withdrawal request submitted" });
      setWithdrawAmount("");
      setWithdrawAddress("");
      queryClient.invalidateQueries({ queryKey: ["/dash/withdrawals"] });
    },
    onError: (err: Error) => toast({ title: "Withdrawal Failed", description: err.message, variant: "destructive" })
  });

  const handleDeposit = () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) return toast({ title: "Error", description: "Invalid amount", variant: "destructive" });
    const fd = new FormData(); 
    fd.append("amount", depositAmount); 
    fd.append("currency", selectedCoin); 
    if(receipt) fd.append("receipt", receipt);
    depositMutation.mutate(fd);
  };

  const handleWithdraw = () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return toast({ title: "Error", description: "Invalid amount", variant: "destructive" });
    if (!withdrawAddress) return toast({ title: "Error", description: "Missing address", variant: "destructive" });
    withdrawMutation.mutate({ currency: selectedCoin, amount: parseFloat(withdrawAmount), wallet_address: withdrawAddress });
  };

  return (
    <Card className={`lg:col-span-2 ${CARD_BASE_STYLE} p-6`}>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">Transaction Manager</h2>
          <TabsList className="bg-slate-950 p-1 border border-slate-800">
            <TabsTrigger value="deposit" className="data-[state=active]:bg-emerald-600 px-6">Deposit</TabsTrigger>
            <TabsTrigger value="withdraw" className="data-[state=active]:bg-emerald-600 px-6">Withdraw</TabsTrigger>
          </TabsList>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Coin Selector */}
          <div className="space-y-3">
            <Label className="text-slate-400 text-xs uppercase tracking-wider">Select Cryptocurrency</Label>
            {COIN_TYPES.map(coin => (
              <div 
                key={coin.symbol} 
                onClick={() => setSelectedCoin(coin.symbol)} 
                className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${selectedCoin === coin.symbol ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-800 bg-slate-950/50 hover:bg-slate-900'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs">{coin.symbol[0]}</div>
                  <div><p className="font-bold">{coin.symbol}</p><p className="text-[10px] text-slate-500">Network: {coin.network}</p></div>
                </div>
                {selectedCoin === coin.symbol && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
              </div>
            ))}
          </div>

          {/* Forms */}
          <div>
            <TabsContent value="deposit" className="m-0 space-y-6">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <div className="space-y-1"><p className="text-[10px] text-slate-500 uppercase">Deposit Address</p><p className="text-xs font-mono">0x742d35...96C4b4</p></div>
                <Button variant="ghost" size="sm" className="text-emerald-400 text-xs hover:bg-emerald-500/10"><Eye className="w-3 h-3 mr-1"/> Show</Button>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs text-slate-400">Amount</Label>
                  <Input type="number" min="0" placeholder="0.00" className="bg-slate-950 border-slate-800 h-12 font-mono text-lg" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-400">Payment Proof</Label>
                  <div className="border-2 border-dashed border-slate-800 rounded-xl p-8 text-center hover:border-emerald-500/50 transition-colors cursor-pointer relative bg-slate-950/50">
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setReceipt(e.target.files?.[0] || null)} />
                    <UploadCloud className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                    <p className="text-xs text-slate-400 font-medium">{receipt ? receipt.name : "Click to upload proof"}</p>
                  </div>
                </div>
                <Button onClick={handleDeposit} disabled={depositMutation.isPending} className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 font-bold shadow-lg shadow-emerald-900/20">
                  {depositMutation.isPending ? "Submitting..." : `Submit Deposit ${selectedCoin}`}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="withdraw" className="m-0 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs text-slate-400">Destination Address</Label>
                  <Input placeholder="Enter external wallet address" className="bg-slate-950 border-slate-800 h-12 text-sm" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-400">Amount</Label>
                  <Input type="number" min="0" placeholder="0.00" className="bg-slate-950 border-slate-800 h-12 font-mono text-lg" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded text-[10px] text-yellow-500">
                  Network must match: <strong>{COIN_TYPES.find(c => c.symbol === selectedCoin)?.network}</strong>.
                </div>
                <Button onClick={handleWithdraw} disabled={withdrawMutation.isPending} className="w-full bg-red-600 hover:bg-red-700 h-12 font-bold shadow-lg shadow-red-900/20">
                  {withdrawMutation.isPending ? "Processing..." : "Confirm Withdrawal"}
                </Button>
              </div>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </Card>
  );
};

// 5. Transaction History Table
const HistoryTable = ({ deposits, withdrawals }: { deposits: Transaction[], withdrawals: Transaction[] }) => {
  const [filter, setFilter] = useState("All");

  const history = useMemo(() => {
    // Architectural Fix: Don't store JSX in data objects. Store string types.
    const d = deposits.map(x => ({ ...x, type: 'Deposit' as const }));
    const w = withdrawals.map(x => ({ ...x, type: 'Withdraw' as const }));
    
    // Logic Fix: Safe date parsing
    return [...d, ...w].sort((a, b) => {
      const tA = new Date(a.created_at || 0).getTime();
      const tB = new Date(b.created_at || 0).getTime();
      return tB - tA;
    });
  }, [deposits, withdrawals]);

  const filteredHistory = useMemo(() => {
    if (filter === "All") return history;
    return history.filter(h => h.type === filter.slice(0, -1)); // "Deposits" -> "Deposit"
  }, [history, filter]);

  const getIcon = (type: string) => {
    if (type === 'Deposit') return <ArrowDownLeft className="w-3 h-3 text-emerald-400"/>;
    return <ArrowUpRight className="w-3 h-3 text-red-400"/>;
  };

  return (
    <Card className={`${CARD_BASE_STYLE} overflow-hidden shadow-2xl`}>
      <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Transaction History</h2>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input placeholder="Search transactions..." className="bg-slate-950 border-slate-800 pl-10 h-10 text-sm" />
        </div>
      </div>
      
      <div className="p-6">
         <div className="flex gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
           {["All", "Deposits", "Withdrawals"].map(tab => (
             <Button key={tab} size="sm" onClick={() => setFilter(tab)} className={`h-9 px-6 font-bold rounded-lg transition-all ${filter === tab ? "bg-emerald-600 text-white" : "bg-slate-800/50 text-slate-400 hover:text-white"}`}>{tab}</Button>
           ))}
         </div>

         <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse min-w-[800px]">
             <thead>
               <tr className="text-slate-500 text-[10px] uppercase tracking-widest border-b border-slate-800">
                 <th className="pb-4 font-bold">Transaction</th>
                 <th className="pb-4 font-bold">Type</th>
                 <th className="pb-4 font-bold">Amount</th>
                 <th className="pb-4 font-bold">USD Value</th>
                 <th className="pb-4 font-bold">Status</th>
                 <th className="pb-4 font-bold">Date</th>
                 <th className="pb-4 font-bold">Address</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-800">
               {filteredHistory.length > 0 ? filteredHistory.map((tx, idx) => (
                 <tr key={tx.id || idx} className="group hover:bg-slate-900/30 transition-colors">
                   <td className="py-5"><div className="flex items-center gap-3"><div className={`w-9 h-9 rounded-full ${tx.type === 'Deposit' ? 'bg-orange-500/20 text-orange-500' : 'bg-blue-500/20 text-blue-500'} flex items-center justify-center font-bold text-[10px]`}>TX</div><div><p className="text-xs font-bold text-white">{tx.tx_id || `TXN${idx}`}</p><p className="text-[10px] text-slate-500">{tx.currency || 'USDT'}</p></div></div></td>
                   <td className="py-5"><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">{getIcon(tx.type || 'Deposit')} {tx.type}</div></td>
                   <td className="py-5 text-xs font-black text-white">{tx.amount} {tx.currency || 'USDT'}</td>
                   <td className="py-5 text-xs font-bold text-emerald-400">${(tx.amount * 1).toLocaleString()}</td>
                   <td className="py-5"><span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${tx.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'}`}>{tx.status || 'pending'}</span></td>
                   <td className="py-5 text-[10px] font-medium text-slate-500">{new Date(tx.created_at).toLocaleString()}</td>
                   <td className="py-5 text-[10px] font-mono text-slate-500">{tx.wallet_address || '---'}</td>
                 </tr>
               )) : (
                 <tr><td colSpan={7} className="py-20 text-center"><div className="flex flex-col items-center gap-2"><Clock className="w-10 h-10 text-slate-800"/><p className="text-slate-500 text-sm font-medium">No records found</p></div></td></tr>
               )}
             </tbody>
           </table>
         </div>
      </div>
    </Card>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function Wallet() {
  const { data: stats, refetch: refetchStats } = useQuery<StatsData>({ 
    queryKey: ["/dash/stats"],
    queryFn: () => apiRequest("GET", "/dash/stats") 
  });
  
  const { data: depositsData = [] } = useQuery<Transaction[]>({ 
    queryKey: ["/dash/deposits"],
    queryFn: () => apiRequest("GET", "/dash/deposits")
  });
  
  const { data: withdrawalsData = [] } = useQuery<Transaction[]>({ 
    queryKey: ["/dash/withdrawals"],
    queryFn: () => apiRequest("GET", "/dash/withdrawals") 
  });

  // Safe Arrays
  const safeDeposits = Array.isArray(depositsData) ? depositsData : [];
  const safeWithdrawals = Array.isArray(withdrawalsData) ? withdrawalsData : [];

  // TODO: Fetch from user profile
  const userWalletAddress = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";

  return (
    <Layout>
      <div className="min-h-screen bg-[#020817] text-white w-full pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          
          <PortfolioHeader stats={stats} onRefresh={() => refetchStats()} />
          
          <ActionGrid walletAddress={userWalletAddress} />
          
          <AccountsGrid stats={stats} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <TransactionPanel />
            
            {/* Convert Card (Simplified for length, can be extracted similarly) */}
            <Card className={`${CARD_BASE_STYLE} p-6 rounded-2xl flex flex-col`}>
               <h2 className="text-lg font-bold mb-6 flex items-center gap-2">Convert Crypto</h2>
               <div className="space-y-5 flex-1">
                 <div className="space-y-2">
                   <Label className="text-[10px] text-slate-500 uppercase">From</Label>
                   <Select defaultValue="USDT"><SelectTrigger className="bg-slate-950 border-slate-800 h-12"><SelectValue /></SelectTrigger></Select>
                 </div>
                 <div className="flex justify-center -my-3 relative z-10">
                    <Button variant="outline" size="icon" className="rounded-full bg-emerald-600 border-none h-8 w-8 text-white shadow-lg"><ArrowRightLeft className="w-4 h-4 rotate-90" /></Button>
                 </div>
                 <div className="space-y-2">
                   <Label className="text-[10px] text-slate-500 uppercase">To</Label>
                   <Select defaultValue="BTC"><SelectTrigger className="bg-slate-950 border-slate-800 h-12"><SelectValue /></SelectTrigger></Select>
                 </div>
                 <Button className="w-full bg-slate-800 hover:bg-emerald-600 text-white h-12 mt-4 font-bold transition-all border border-slate-700">Convert USDT to BTC</Button>
               </div>
            </Card>
          </div>

          <HistoryTable deposits={safeDeposits} withdrawals={safeWithdrawals} />

        </div>
      </div>
    </Layout>
  );
}