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

export default function Wallet() {
  const [transferOpen, setTransferOpen] = useState(false);
  const [fromWallet, setFromWallet] = useState<string>("");
  const [toWallet, setToWallet] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const { toast } = useToast();

  const wallets = [
    {
      name: "Arbitrage",
      abbreviation: "AR",
      type: "arb",
      balance: 0,
      value: 0,
      change: 0,
      color: "bg-purple-600",
    },
    {
      name: "Forex",
      abbreviation: "FX",
      type: "forex",
      balance: 0,
      value: 0,
      change: 0,
      color: "bg-blue-600",
    },
    {
      name: "Futures",
      abbreviation: "FU",
      type: "fut",
      balance: 0,
      value: 0,
      change: 0,
      color: "bg-yellow-600",
    },
  ];

  const transferMutation = useMutation({
    mutationFn: async (data: { from_wallet: string; to_wallet: string; amount: number }) => {
      return await apiRequest("POST", "/api/dash/transfer", data);
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
      queryClient.invalidateQueries({ queryKey: ["/api/dash/stats"] });
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
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (fromWallet === toWallet) {
      toast({
        title: "Error",
        description: "Cannot transfer to the same wallet",
        variant: "destructive",
      });
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    transferMutation.mutate({
      from_wallet: fromWallet,
      to_wallet: toWallet,
      amount: amountNum,
    });
  };

  return (
    <Layout>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="mb-8">
          <Card className="bg-gray-900 shadow-lg border-emerald-500/30">
            <div className="p-6 border-b border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <i className="ri-pie-chart-line mr-3 text-emerald-400"></i>Portfolio Overview
                </h2>
                <button className="text-emerald-400 hover:text-emerald-300 transition-colors self-start sm:self-auto">
                  <i className="ri-refresh-line text-xl"></i>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-8 p-6 bg-gradient-to-r from-emerald-600/20 to-emerald-800/20 rounded-xl border border-emerald-500/30">
                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-2">Total Portfolio Value</p>
                  <p className="text-4xl lg:text-5xl font-bold text-white mb-3" data-testid="text-portfolio-value">
                    $166,389.6
                  </p>
                  <div className="flex items-center justify-center space-x-4">
                    <p className="text-emerald-400 text-sm flex items-center">
                      <i className="ri-arrow-up-line mr-1"></i>
                      +$12,456.20
                    </p>
                    <p className="text-emerald-400 text-sm">+8.09% (24h)</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {wallets.map((wallet, idx) => (
                  <Card
                    key={wallet.type}
                    data-testid={`wallet-card-${wallet.type}`}
                    className="bg-gray-800 border-gray-700 p-6 hover:border-emerald-500/50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-14 h-14 rounded-full ${wallet.color} flex items-center justify-center text-white font-bold text-lg`}
                        >
                          {wallet.abbreviation}
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-lg">{wallet.name}</h3>
                          <p className="text-gray-400 text-sm">Trading Account</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400">
                        +{wallet.change.toFixed(2)}%
                      </span>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Balance</span>
                        <span className="text-white font-semibold">${wallet.balance.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Est. Value</span>
                        <span className="text-emerald-400 font-bold">${wallet.value.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        data-testid={`button-deposit-${wallet.type}`}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <i className="ri-add-line mr-2"></i>
                        Deposit
                      </Button>
                      <Button
                        data-testid={`button-withdraw-${wallet.type}`}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white"
                      >
                        <i className="ri-subtract-line mr-2"></i>
                        Withdraw
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white mb-3 sm:mb-0">
                    <i className="ri-exchange-funds-line mr-2 text-emerald-400"></i>
                    Transfer Between Wallets
                  </h3>
                  <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
                    <DialogTrigger asChild>
                      <Button
                        data-testid="button-open-transfer"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <i className="ri-send-plane-line mr-2"></i>
                        New Transfer
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900 border-gray-800">
                      <DialogHeader>
                        <DialogTitle className="text-white">Transfer Funds</DialogTitle>
                        <DialogDescription className="text-gray-400">
                          Move funds between your trading wallets
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div>
                          <Label htmlFor="from-wallet" className="text-gray-300">
                            From Wallet
                          </Label>
                          <Select value={fromWallet} onValueChange={setFromWallet}>
                            <SelectTrigger
                              id="from-wallet"
                              data-testid="select-from-wallet"
                              className="bg-gray-800 border-gray-700 text-white"
                            >
                              <SelectValue placeholder="Select wallet" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              <SelectItem value="arb">Arbitrage</SelectItem>
                              <SelectItem value="forex">Forex</SelectItem>
                              <SelectItem value="fut">Futures</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="to-wallet" className="text-gray-300">
                            To Wallet
                          </Label>
                          <Select value={toWallet} onValueChange={setToWallet}>
                            <SelectTrigger
                              id="to-wallet"
                              data-testid="select-to-wallet"
                              className="bg-gray-800 border-gray-700 text-white"
                            >
                              <SelectValue placeholder="Select wallet" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              <SelectItem value="arb">Arbitrage</SelectItem>
                              <SelectItem value="forex">Forex</SelectItem>
                              <SelectItem value="fut">Futures</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="amount" className="text-gray-300">
                            Amount (USDT)
                          </Label>
                          <Input
                            id="amount"
                            data-testid="input-transfer-amount"
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                          />
                        </div>

                        <Button
                          data-testid="button-confirm-transfer"
                          onClick={handleTransfer}
                          disabled={transferMutation.isPending}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          {transferMutation.isPending ? "Processing..." : "Confirm Transfer"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="text-center py-8">
                  <i className="ri-exchange-funds-line text-4xl text-gray-600 mb-3"></i>
                  <p className="text-gray-400">Click "New Transfer" to move funds between wallets</p>
                  <p className="text-gray-500 text-sm mt-1">Transfers are instant and free</p>
                </div>
              </div>
            </div>
          </Card>
        </section>
      </main>
    </Layout>
  );
}
