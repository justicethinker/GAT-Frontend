import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { ArrowUpRight, ArrowDownLeft, RefreshCw, Wallet as WalletIcon, ArrowRightLeft } from "lucide-react";

export default function Wallet() {
  const [transferOpen, setTransferOpen] = useState(false);
  const [fromWallet, setFromWallet] = useState<string>("");
  const [toWallet, setToWallet] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const { toast } = useToast();

  const wallets = [
    {
      name: "Arbitrage Wallet",
      abbreviation: "AR",
      type: "arb",
      balance: 45231.50,
      value: 45231.50,
      change: 12.5,
      color: "bg-purple-500",
      border: "border-purple-500/20",
      bg: "bg-purple-500/10"
    },
    {
      name: "Forex Account",
      abbreviation: "FX",
      type: "forex",
      balance: 28450.75,
      value: 28450.75,
      change: 5.2,
      color: "bg-blue-500",
      border: "border-blue-500/20",
      bg: "bg-blue-500/10"
    },
    {
      name: "Futures Margin",
      abbreviation: "FU",
      type: "fut",
      balance: 92707.35,
      value: 92707.35,
      change: -2.4,
      color: "bg-yellow-500",
      border: "border-yellow-500/20",
      bg: "bg-yellow-500/10"
    },
  ];

  const transferMutation = useMutation({
    mutationFn: async (data: { from_wallet: string; to_wallet: string; amount: number }) => {
      return await apiRequest("POST", "/dash/transfer", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Transfer completed successfully!",
      });
      setTransferOpen(false);
      setFromWallet("");
      setToWallet("");
      setAmount("");
      queryClient.invalidateQueries({ queryKey: ["/dash/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Transfer failed",
        variant: "destructive",
      });
    },
  });

  const handleTransfer = () => {
    if (!fromWallet || !toWallet || !amount) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    if (fromWallet === toWallet) {
      toast({ title: "Error", description: "Cannot transfer to the same wallet", variant: "destructive" });
      return;
    }
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({ title: "Error", description: "Please enter a valid amount", variant: "destructive" });
      return;
    }
    transferMutation.mutate({ from_wallet: fromWallet, to_wallet: toWallet, amount: amountNum });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-slate-950 w-full pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header & Portfolio Value */}
          <div className="mb-8 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Assets</h1>
              <Button variant="outline" size="sm" className="border-slate-700 hover:bg-slate-800 text-slate-300">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>

            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900/40 to-slate-900 border border-emerald-500/20 rounded-3xl p-6 sm:p-10 shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
              
              <div className="relative z-10">
                <p className="text-slate-400 font-medium mb-2">Total Portfolio Value</p>
                <h2 className="text-4xl sm:text-6xl font-bold text-white mb-4 tracking-tight">
                  $166,389.60
                </h2>
                <div className="flex items-center gap-3">
                  <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-sm font-bold border border-emerald-500/20">
                    +8.09%
                  </span>
                  <span className="text-emerald-400/80 text-sm">+$12,456.20 (24h)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
             <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
                <DialogTrigger asChild>
                  <button className="flex items-center justify-between bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-6 rounded-2xl transition-all group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-900/20 group-hover:scale-110 transition-transform">
                            <ArrowRightLeft className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <h3 className="text-lg font-bold text-white">Transfer Funds</h3>
                            <p className="text-slate-400 text-sm">Move assets between wallets</p>
                        </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-colors">
                        <ArrowUpRight className="w-5 h-5" />
                    </div>
                  </button>
                </DialogTrigger>
                
                {/* Transfer Dialog Content */}
                <DialogContent className="bg-slate-900 border-slate-800 sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="text-white text-xl">Transfer Funds</DialogTitle>
                    <DialogDescription className="text-slate-400">
                      Instantly move funds between your trading accounts.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-5 mt-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">From</Label>
                      <Select value={fromWallet} onValueChange={setFromWallet}>
                        <SelectTrigger className="bg-slate-950 border-slate-800 text-white h-12">
                          <SelectValue placeholder="Select source wallet" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800">
                          <SelectItem value="arb">Arbitrage Wallet</SelectItem>
                          <SelectItem value="forex">Forex Account</SelectItem>
                          <SelectItem value="fut">Futures Margin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex justify-center">
                        <div className="bg-slate-800 p-2 rounded-full">
                            <ArrowUpRight className="w-4 h-4 text-slate-400 rotate-45" />
                        </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-300">To</Label>
                      <Select value={toWallet} onValueChange={setToWallet}>
                        <SelectTrigger className="bg-slate-950 border-slate-800 text-white h-12">
                          <SelectValue placeholder="Select destination wallet" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800">
                          <SelectItem value="arb">Arbitrage Wallet</SelectItem>
                          <SelectItem value="forex">Forex Account</SelectItem>
                          <SelectItem value="fut">Futures Margin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-300">Amount (USDT)</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="bg-slate-950 border-slate-800 text-white h-12 font-mono text-lg"
                      />
                    </div>

                    <Button 
                        onClick={handleTransfer} 
                        disabled={transferMutation.isPending}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 font-bold text-base mt-2"
                    >
                        {transferMutation.isPending ? "Processing..." : "Confirm Transfer"}
                    </Button>
                  </div>
                </DialogContent>
             </Dialog>

             <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-slate-300">
                        <WalletIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Wallet Address</h3>
                        <p className="text-slate-400 text-sm font-mono">0x1234...5678</p>
                    </div>
                </div>
                <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                    Copy
                </Button>
             </div>
          </div>

          {/* Wallets Grid */}
          <h3 className="text-xl font-bold text-white mb-4">Your Accounts</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {wallets.map((wallet) => (
              <Card 
                key={wallet.type} 
                className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-all overflow-hidden group"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-12 h-12 rounded-xl ${wallet.bg} ${wallet.color.replace('bg-', 'text-')} flex items-center justify-center font-bold text-xl`}>
                      {wallet.abbreviation}
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${wallet.change >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {wallet.change >= 0 ? '+' : ''}{wallet.change}%
                    </span>
                  </div>

                  <div className="space-y-1 mb-6">
                    <p className="text-slate-400 text-sm font-medium">{wallet.name}</p>
                    <h3 className="text-2xl font-bold text-white">${wallet.balance.toLocaleString()}</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700/50">
                        <ArrowDownLeft className="w-4 h-4 mr-2 text-emerald-400" />
                        Deposit
                    </Button>
                    <Button className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700/50">
                        <ArrowUpRight className="w-4 h-4 mr-2 text-red-400" />
                        Withdraw
                    </Button>
                  </div>
                </div>
                
                {/* Colored bottom stripe */}
                <div className={`h-1 w-full ${wallet.color}`}></div>
              </Card>
            ))}
          </div>

        </div>
      </div>
    </Layout>
  );
}