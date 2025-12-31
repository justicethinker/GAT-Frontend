import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useMutation, useQuery } from "@tanstack/react-query";
import { 
  ArrowUpRight, ArrowDownLeft, RefreshCw, Wallet as WalletIcon, 
  ArrowRightLeft, Search, CheckCircle2, Clock, UploadCloud, Eye, Copy
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Wallet() {
  const { toast } = useToast();
  
  // --- EXISTING TRANSFER STATES ---
  const [transferOpen, setTransferOpen] = useState(false);
  const [fromWallet, setFromWallet] = useState<string>("");
  const [toWallet, setToWallet] = useState<string>("");
  const [transferAmount, setTransferAmount] = useState<string>("");

  // --- DEPOSIT/WITHDRAW STATES ---
  const [selectedCoin, setSelectedCoin] = useState("USDT");
  const [amount, setAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [receipt, setReceipt] = useState<File | null>(null);

  // --- DATA FETCHING ---
  const { data: stats } = useQuery<any>({ queryKey: ["/dash/stats"] });
  const { data: depositsData = [] } = useQuery<any[]>({ queryKey: ["/dash/deposits"] });
  const { data: withdrawalsData = [] } = useQuery<any[]>({ queryKey: ["/dash/withdrawals"] });

  // Safe Array Handling & Merging
  const safeDeposits = Array.isArray(depositsData) ? depositsData : [];
  const safeWithdrawals = Array.isArray(withdrawalsData) ? withdrawalsData : [];

  const transactionHistory = [
    ...safeDeposits.map(d => ({ ...d, type: 'Deposit', icon: <ArrowDownLeft className="w-3 h-3 text-emerald-400"/> })),
    ...safeWithdrawals.map(w => ({ ...w, type: 'Withdraw', icon: <ArrowUpRight className="w-3 h-3 text-red-400"/> }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // --- MUTATIONS ---
  const transferMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/dash/transfer", data),
    onSuccess: () => {
      toast({ title: "Success", description: "Transfer completed!" });
      setTransferOpen(false);
      setTransferAmount("");
      queryClient.invalidateQueries({ queryKey: ["/dash/stats"] });
    },
    onError: (err: any) => toast({ title: "Transfer Failed", description: err.message, variant: "destructive" })
  });

  const depositMutation = useMutation({
    mutationFn: async (formData: FormData) => apiRequest("POST", "/dash/deposits", formData),
    onSuccess: () => {
      toast({ title: "Success", description: "Deposit submitted for review" });
      setAmount("");
      setReceipt(null);
      queryClient.invalidateQueries({ queryKey: ["/dash/deposits"] });
    },
    onError: (err: any) => toast({ title: "Deposit Failed", description: err.message, variant: "destructive" })
  });

  const withdrawMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/dash/withdrawals", data),
    onSuccess: () => {
      toast({ title: "Success", description: "Withdrawal request submitted" });
      setAmount("");
      setWalletAddress("");
      queryClient.invalidateQueries({ queryKey: ["/dash/withdrawals"] });
    },
    onError: (err: any) => toast({ title: "Withdrawal Failed", description: err.message, variant: "destructive" })
  });

  // --- UI HELPER ---
  const wallets = [
    { name: "Arbitrage Wallet", abbr: "AR", type: "arb", balance: stats?.wallets?.arb?.balance || 0, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20", line: "bg-purple-500" },
    { name: "Forex Account", abbr: "FX", type: "forex", balance: stats?.wallets?.forex?.balance || 0, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", line: "bg-blue-500" },
    { name: "Futures Margin", abbr: "FU", type: "fut", balance: stats?.wallets?.fut?.balance || 0, color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20", line: "bg-yellow-500" },
  ];

  return (
    <Layout>
      {/* Main Background: Deep Slate #020817 */}
      <div className="min-h-screen bg-[#020817] text-white w-full pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          
          {/* 1. PORTFOLIO HEADER */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Assets</h1>
              <Button variant="outline" size="sm" className="border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-300" onClick={() => queryClient.invalidateQueries()}>
                <RefreshCw className="w-4 h-4 mr-2" /> Refresh
              </Button>
            </div>

            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900/40 to-[#0f172a] border border-emerald-500/20 rounded-3xl p-10 shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
              <div className="relative z-10">
                <p className="text-slate-400 font-medium mb-2">Total Portfolio Value</p>
                <h2 className="text-5xl sm:text-6xl font-bold tracking-tight">
                  ${stats?.total_balance?.toLocaleString() || '0.00'}
                </h2>
                <div className="flex items-center gap-3 mt-4">
                  <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-sm font-bold border border-emerald-500/20">+8.09%</span>
                  <span className="text-emerald-400/80 text-sm">+$12,456.20 (24h)</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. ACTION BAR */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
              <DialogTrigger asChild>
                {/* Card Background: #0f172a */}
                <button className="flex items-center justify-between bg-[#0f172a] border border-slate-800 hover:border-emerald-500/50 p-6 rounded-2xl transition-all group">
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
                      <SelectItem value="arb">Arbitrage Wallet</SelectItem>
                      <SelectItem value="forex">Forex Account</SelectItem>
                      <SelectItem value="fut">Futures Margin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={toWallet} onValueChange={setToWallet}>
                    <SelectTrigger className="bg-slate-950 border-slate-800"><SelectValue placeholder="To Wallet" /></SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white">
                      <SelectItem value="arb">Arbitrage Wallet</SelectItem>
                      <SelectItem value="forex">Forex Account</SelectItem>
                      <SelectItem value="fut">Futures Margin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input type="number" placeholder="Amount" className="bg-slate-950 border-slate-800" value={transferAmount} onChange={e => setTransferAmount(e.target.value)}/>
                  <Button 
                    onClick={() => transferMutation.mutate({from_wallet: fromWallet, to_wallet: toWallet, amount: parseFloat(transferAmount)})} 
                    disabled={transferMutation.isPending}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    {transferMutation.isPending ? "Processing..." : "Confirm Transfer"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-slate-300">
                  <WalletIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Wallet Address</h3>
                  <p className="text-slate-400 text-sm font-mono">0x1234...5678</p>
                </div>
              </div>
              <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800" onClick={() => toast({title: "Copied!", description: "Address copied to clipboard"})}>
                <Copy className="w-4 h-4 mr-2" /> Copy
              </Button>
            </div>
          </div>

          {/* 3. ACCOUNT GRID */}
          <h3 className="text-xl font-bold text-white">Your Accounts</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {wallets.map((wallet) => (
              <Card key={wallet.type} className="bg-[#0f172a] border-slate-800 hover:border-slate-700 transition-all overflow-hidden group">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-12 h-12 rounded-xl ${wallet.bg} ${wallet.color} flex items-center justify-center font-bold text-xl`}>{wallet.abbr}</div>
                    <span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-lg text-xs font-bold">+12.5%</span>
                  </div>
                  <div className="space-y-1 mb-6">
                    <p className="text-slate-400 text-sm font-medium">{wallet.name}</p>
                    <h3 className="text-2xl font-bold text-white">${wallet.balance.toLocaleString()}</h3>
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
                <div className={`h-1.5 w-full ${wallet.line}`}></div>
              </Card>
            ))}
          </div>

          {/* 4. DEPOSIT / WITHDRAW & CONVERT (Styles Fixed) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* DEPOSIT CARD */}
            <Card className="lg:col-span-2 bg-[#0f172a] border-slate-800 p-6 rounded-2xl">
              <Tabs defaultValue="deposit">
                <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">Deposit & Withdraw</h2>
                  <TabsList className="bg-slate-950 p-1 border border-slate-800">
                    <TabsTrigger value="deposit" className="data-[state=active]:bg-emerald-600 px-6">Deposit</TabsTrigger>
                    <TabsTrigger value="withdraw" className="data-[state=active]:bg-emerald-600 px-6">Withdraw</TabsTrigger>
                  </TabsList>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Coin Selector */}
                  <div className="space-y-3">
                    <Label className="text-slate-400 text-xs uppercase tracking-wider">Select Cryptocurrency</Label>
                    {["USDT", "USDC", "BTC"].map(coin => (
                      <div key={coin} onClick={() => setSelectedCoin(coin)} className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${selectedCoin === coin ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-800 bg-slate-950/50 hover:bg-slate-900'}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs">{coin[0]}</div>
                          <div><p className="font-bold">{coin}</p><p className="text-[10px] text-slate-500">Network: {coin === 'BTC' ? 'Bitcoin' : 'TRC20'}</p></div>
                        </div>
                        {selectedCoin === coin && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      </div>
                    ))}
                  </div>

                  {/* Forms Area */}
                  <div>
                    {/* DEPOSIT FORM */}
                    <TabsContent value="deposit" className="m-0 space-y-6">
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                        <div className="space-y-1"><p className="text-[10px] text-slate-500 uppercase">Deposit Address</p><p className="text-xs font-mono">0x742d35...96C4b4d4d4</p></div>
                        <Button variant="ghost" size="sm" className="text-emerald-400 text-xs hover:bg-emerald-500/10"><Eye className="w-3 h-3 mr-1"/> Show</Button>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-xs text-slate-400">Amount</Label>
                          <Input type="number" placeholder="0.00" className="bg-slate-950 border-slate-800 h-12 font-mono text-lg" value={amount} onChange={e => setAmount(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-slate-400">Payment Proof</Label>
                          <div className="border-2 border-dashed border-slate-800 rounded-xl p-8 text-center hover:border-emerald-500/50 transition-colors cursor-pointer relative bg-slate-950/50">
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setReceipt(e.target.files?.[0] || null)} />
                            <UploadCloud className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                            <p className="text-xs text-slate-400 font-medium">{receipt ? receipt.name : "Click to upload payment proof"}</p>
                            <p className="text-[10px] text-slate-600 mt-1">Max file size: 10MB</p>
                          </div>
                        </div>
                        <Button 
                          onClick={() => {
                            const fd = new FormData(); fd.append("amount", amount); fd.append("currency", selectedCoin); if(receipt) fd.append("receipt", receipt);
                            depositMutation.mutate(fd);
                          }} 
                          disabled={depositMutation.isPending}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 font-bold shadow-lg shadow-emerald-900/20"
                        >
                          {depositMutation.isPending ? "Submitting..." : `Submit Deposit ${selectedCoin}`}
                        </Button>
                      </div>
                    </TabsContent>

                    {/* WITHDRAW FORM */}
                    <TabsContent value="withdraw" className="m-0 space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-xs text-slate-400">Destination Address</Label>
                          <Input 
                            placeholder="Enter external wallet address" 
                            className="bg-slate-950 border-slate-800 h-12 text-sm" 
                            value={walletAddress} 
                            onChange={e => setWalletAddress(e.target.value)} 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-slate-400">Amount</Label>
                          <Input 
                            type="number" 
                            placeholder="0.00" 
                            className="bg-slate-950 border-slate-800 h-12 font-mono text-lg" 
                            value={amount} 
                            onChange={e => setAmount(e.target.value)} 
                          />
                        </div>
                        <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded text-[10px] text-yellow-500">
                          Withdrawals are processed within 24 hours. Ensure the network matches: <strong>{selectedCoin === 'BTC' ? 'Bitcoin' : selectedCoin === 'USDT' ? 'TRC20' : 'ERC20'}</strong>.
                        </div>
                        <Button 
                          onClick={() => withdrawMutation.mutate({ currency: selectedCoin, amount: parseFloat(amount), wallet_address: walletAddress })}
                          disabled={withdrawMutation.isPending}
                          className="w-full bg-red-600 hover:bg-red-700 h-12 font-bold shadow-lg shadow-red-900/20"
                        >
                          {withdrawMutation.isPending ? "Processing..." : "Confirm Withdrawal"}
                        </Button>
                      </div>
                    </TabsContent>
                  </div>
                </div>
              </Tabs>
            </Card>

            {/* CONVERT CARD */}
            <Card className="bg-[#0f172a] border-slate-800 p-6 rounded-2xl flex flex-col">
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
              <div className="mt-8 border-t border-slate-800 pt-6">
                <h3 className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center gap-2"><Clock className="w-3 h-3" /> Recent Conversions</h3>
                <div className="space-y-3">
                  <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div><p className="text-xs font-bold text-white">USDT → BTC</p><p className="text-[10px] text-slate-600">2024-01-15</p></div>
                    <div className="text-right"><p className="text-xs font-bold">1000</p><p className="text-[10px] text-emerald-400 font-bold uppercase">Completed</p></div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* 5. TRANSACTION HISTORY */}
          <Card className="bg-[#0f172a] border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-2xl font-bold">Transaction History</h2>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input placeholder="Search transactions..." className="bg-slate-950 border-slate-800 pl-10 h-10 text-sm" />
              </div>
            </div>
            
            <div className="p-6">
               <div className="flex gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
                  {["All", "Deposits", "Withdrawals", "Transfers"].map(tab => (
                    <Button key={tab} size="sm" className={`h-9 px-6 font-bold rounded-lg transition-all ${tab === "All" ? "bg-emerald-600 text-white" : "bg-slate-800/50 text-slate-400 hover:text-white"}`}>{tab}</Button>
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
                     {transactionHistory.length > 0 ? transactionHistory.map((tx, idx) => (
                       <tr key={idx} className="group hover:bg-slate-900/30 transition-colors">
                         <td className="py-5"><div className="flex items-center gap-3"><div className={`w-9 h-9 rounded-full ${tx.type === 'Deposit' ? 'bg-orange-500/20 text-orange-500' : 'bg-blue-500/20 text-blue-500'} flex items-center justify-center font-bold text-[10px]`}>TX</div><div><p className="text-xs font-bold text-white">{tx.tx_id || `TXN00${idx+1}`}</p><p className="text-[10px] text-slate-500">{tx.currency || 'USDT'}</p></div></div></td>
                         <td className="py-5"><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">{tx.icon} {tx.type}</div></td>
                         <td className="py-5 text-xs font-black text-white">{tx.amount} {tx.currency || 'USDT'}</td>
                         <td className="py-5 text-xs font-bold text-emerald-400">${(tx.amount * 1).toLocaleString()}</td>
                         <td className="py-5"><span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${tx.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'}`}>{tx.status || 'pending'}</span></td>
                         <td className="py-5 text-[10px] font-medium text-slate-500">{new Date(tx.created_at || Date.now()).toLocaleString()}</td>
                         <td className="py-5 text-[10px] font-mono text-slate-500">{tx.wallet_address || 'bc1qxy2kgd...kkfjhx0wlh'}</td>
                       </tr>
                     )) : (
                       <tr><td colSpan={7} className="py-20 text-center"><div className="flex flex-col items-center gap-2"><Clock className="w-10 h-10 text-slate-800"/><p className="text-slate-500 text-sm font-medium">No transaction records found</p></div></td></tr>
                     )}
                   </tbody>
                 </table>
               </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}