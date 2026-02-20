import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  ArrowUpRight, ArrowDownLeft, RefreshCw, Wallet as WalletIcon, 
  ArrowRightLeft, Copy, CheckCircle2, UploadCloud, Loader2, AlertCircle, TrendingUp
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { buildUrl } from "@/lib/api";

// ──────────────────────────────────────────────────────────────
// 1. TYPES & SCHEMAS
// ──────────────────────────────────────────────────────────────

interface UserInfo {
  balance_arb: number;
  balance_forex: number;
  balance_fut: number;
  total_balance?: number;
  wallet_address?: string;
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

// Zod Schemas for Validation
const TransferSchema = z.object({
  from: z.enum(["forex", "arb", "fut"], { required_error: "Select source wallet" }),
  to: z.enum(["forex", "arb", "fut"], { required_error: "Select destination wallet" }),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
}).refine((data) => data.from !== data.to, {
  message: "Source and destination cannot be the same",
  path: ["to"],
});

const WithdrawSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  address: z.string().min(10, "Invalid wallet address"),
  currency: z.string(),
});

type TransferForm = z.infer<typeof TransferSchema>;
type WithdrawForm = z.infer<typeof WithdrawSchema>;

// ──────────────────────────────────────────────────────────────
// 2. UTILS
// ──────────────────────────────────────────────────────────────

const authenticatedFetcher = async (context: { queryKey: readonly unknown[]; signal?: AbortSignal }) => {
  const { queryKey, signal } = context;
  const [path] = queryKey as [string];
  const token = sessionStorage.getItem("token");
  
  // Use buildUrl to ensure requests go to the backend server
  const res = await fetch(buildUrl(path), {
    headers: { 
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    },
    signal,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
};

const formatCurrency = (val: number) => 
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

// ──────────────────────────────────────────────────────────────
// 3. SUB-COMPONENTS
// ──────────────────────────────────────────────────────────────

const PortfolioHeader = ({ stats, onRefresh, isLoading }: { stats?: UserInfo, onRefresh: () => void, isLoading: boolean }) => {
  const totalBalance = (stats?.balance_arb || 0) + (stats?.balance_forex || 0) + (stats?.balance_fut || 0);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900/40 to-slate-900 border border-emerald-500/20 rounded-3xl p-8 sm:p-10 shadow-2xl">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <p className="text-slate-400 font-medium mb-2 flex items-center gap-2">
            Total Portfolio Value
            {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
          </p>
          <h2 className="text-4xl sm:text-6xl font-bold tracking-tight text-white">
            {formatCurrency(totalBalance)}
          </h2>
          <div className="flex items-center gap-3 mt-4">
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20">
              <TrendingUp className="w-3 h-3 mr-1" /> +8.09%
            </Badge>
            <span className="text-slate-500 text-sm">Last 24h</span>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onRefresh} className="border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-300">
          <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} /> Refresh
        </Button>
      </div>
    </div>
  );
};

const ActionGrid = ({ walletAddress }: { walletAddress: string }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<TransferForm>({
    resolver: zodResolver(TransferSchema),
    defaultValues: { from: "forex", to: "arb" }
  });

  const mutation = useMutation({
    mutationFn: async (data: TransferForm) => {
      const res = await fetch(buildUrl("/dash/transfer"), {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionStorage.getItem("token")}`
        },
        body: JSON.stringify({ amount: data.amount, from_wallet: data.from, to_wallet: data.to })
      });
      if (!res.ok) throw new Error((await res.json()).detail || "Transfer failed");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Transfer completed successfully." });
      queryClient.invalidateQueries({ queryKey: ["/auth/user-info"] });
      setIsOpen(false);
      reset();
    },
    onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" })
  });

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    toast({ title: "Copied", description: "Address copied to clipboard." });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Transfer Card */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 cursor-pointer hover:border-emerald-500/50 transition-all group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-900/20 group-hover:scale-110 transition-transform">
                  <ArrowRightLeft className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Transfer Funds</h3>
                  <p className="text-slate-400 text-sm">Move assets between wallets</p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 transition-colors">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        </DialogTrigger>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>Internal Transfer</DialogTitle>
            <DialogDescription className="text-slate-400">
              Move funds instantly between your trading accounts.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>From</Label>
                <Select onValueChange={(v: any) => setValue("from", v)} defaultValue={watch("from")}>
                  <SelectTrigger className="bg-slate-950 border-slate-800"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    <SelectItem value="forex">Forex</SelectItem><SelectItem value="arb">Arbitrage</SelectItem><SelectItem value="fut">Futures</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>To</Label>
                <Select onValueChange={(v: any) => setValue("to", v)} defaultValue={watch("to")}>
                  <SelectTrigger className="bg-slate-950 border-slate-800"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    <SelectItem value="forex">Forex</SelectItem><SelectItem value="arb">Arbitrage</SelectItem><SelectItem value="fut">Futures</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {errors.to && <p className="text-red-500 text-xs">{errors.to.message}</p>}
            
            <div className="space-y-2">
              <Label>Amount</Label>
              <div className="relative">
                <Input 
                  type="text" 
                  inputMode="decimal"
                  {...register("amount")} 
                  className="bg-slate-950 border-slate-800 pl-8 text-white" 
                  placeholder="0.00" 
                  autoComplete="off"
                />
                <span className="absolute left-3 top-2.5 text-slate-500">$</span>
              </div>
              {errors.amount && <p className="text-red-500 text-xs">{errors.amount.message}</p>}
            </div>

            <Button disabled={mutation.isPending} className="w-full bg-emerald-600 hover:bg-emerald-700">
              {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Transfer"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Address Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-slate-300">
            <WalletIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Wallet Address</h3>
            <p className="text-slate-400 text-xs font-mono bg-slate-950 px-2 py-1 rounded mt-1 truncate max-w-[140px] sm:max-w-[200px]">
              {walletAddress || "Loading..."}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={copyAddress} className="border-slate-700 hover:bg-slate-800 text-slate-300">
          <Copy className="w-4 h-4 mr-2" /> Copy
        </Button>
      </div>
    </div>
  );
};

const AccountsGrid = ({ stats }: { stats?: UserInfo }) => {
  const accounts = [
    { name: "Arbitrage Wallet", code: "ARB", balance: stats?.balance_arb || 0, color: "text-purple-400", bg: "bg-purple-500/10" },
    { name: "Forex Account", code: "FX", balance: stats?.balance_forex || 0, color: "text-blue-400", bg: "bg-blue-500/10" },
    { name: "Futures Margin", code: "FUT", balance: stats?.balance_fut || 0, color: "text-yellow-400", bg: "bg-yellow-500/10" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {accounts.map((acc) => (
        <Card key={acc.code} className="bg-slate-900 border-slate-800 p-6 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm", acc.bg, acc.color)}>
                {acc.code}
              </div>
              <Badge variant="outline" className="border-slate-700 text-slate-400 font-normal">Active</Badge>
            </div>
            <p className="text-slate-400 text-sm font-medium">{acc.name}</p>
            <h3 className="text-2xl font-bold text-white mt-1">{formatCurrency(acc.balance)}</h3>
          </div>
        </Card>
      ))}
    </div>
  );
};


interface DepositAddress {
  id: number;
  name: string;
  address: string;
}

const TransactionManager = () => {
  const { toast } = useToast();
  const [receipt, setReceipt] = useState<File | null>(null);
  const [coin, setCoin] = useState("USDT");
  const { data: depositAddresses = [], isLoading: addressLoading } = useQuery<DepositAddress[]>({
  queryKey: ["/dash/deposit-address"],
  queryFn: authenticatedFetcher
  });

  // React Hook Form for Withdraw
  const withdrawForm = useForm<WithdrawForm>({ resolver: zodResolver(WithdrawSchema) });
  
  // Custom State for Deposit (Controlled Text Input)
  const [depositAmount, setDepositAmount] = useState("");

  const coinNameMap: Record<string, string> = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
  USDT: "USDT(TRC20)",
  USDC: "USDC",
  Solana: "Solana",
  };

  const selectedAddress =
  depositAddresses.find(
    (item) => item.name === coinNameMap[coin]
  )?.address || "";


  const depositMutation = useMutation({
    mutationFn: async () => {
      if (!receipt) throw new Error("Receipt is required");
      const fd = new FormData();
      fd.append("amount", depositAmount);
      fd.append("currency", coin);
      fd.append("receipt", receipt);
      
      const res = await fetch(buildUrl("/dash/deposits"), {
        method: "POST",
        headers: { "Authorization": `Bearer ${sessionStorage.getItem("token")}` },
        body: fd
      });
      if (!res.ok) throw new Error((await res.json()).detail || "Deposit failed");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Submitted", description: "Deposit under review." });
      setDepositAmount("");
      setReceipt(null);
    },
    onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" })
  });

  const withdrawMutation = useMutation({
    mutationFn: async (data: WithdrawForm) => {
      const res = await fetch(buildUrl("/dash/withdrawals"), {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionStorage.getItem("token")}`
        },
        body: JSON.stringify({ ...data, wallet_address: data.address })
      });
      if (!res.ok) throw new Error((await res.json()).detail || "Withdraw failed");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Submitted", description: "Withdrawal processing." });
      withdrawForm.reset();
    },
    onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" })
  });

  return (
    <Card className="lg:col-span-2 bg-slate-900 border-slate-800 p-6">
      <Tabs defaultValue="deposit" className="w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Transactions</h2>
          <TabsList className="bg-slate-950 border border-slate-800">
            <TabsTrigger value="deposit" className="w-24">Deposit</TabsTrigger>
            <TabsTrigger value="withdraw" className="w-24">Withdraw</TabsTrigger>
          </TabsList>
        </div>


        

        <TabsContent value="deposit" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-emerald-200">Asset</Label>
                <Select value={coin} onValueChange={setCoin}>
                  <SelectTrigger className="bg-slate-900 border border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-lg text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-slate-900 border border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-lg text-white">
                    <SelectItem value="USDT">USDT (ERC20)</SelectItem>
                    <SelectItem value="BTC">Bitcoin</SelectItem>
                    <SelectItem value="ETH">Ethereum</SelectItem>
                    <SelectItem value="SOL">Solana</SelectItem>
                    <SelectItem value="USDC">USDC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-emerald-200">Amount</Label>
                <Input 
                  type="text"
                  inputMode="decimal"
                  value={depositAmount} 
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || /^\d*\.?\d*$/.test(val)) setDepositAmount(val);
                  }} 
                  className="bg-slate-900 border border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-lg text-white" 
                  placeholder="0.00" 
                />
              </div>
              <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="text-xs">
                  <p className="text-slate-500 uppercase font-bold">Deposit Address</p>
                  <p className="text-emerald-400 font-mono mt-1 break-all">
  {addressLoading
    ? "Loading..."
    : selectedAddress || "No address available"}
</p>
                </div>
                <Button size="sm" variant="ghost" className="h-8 text-emerald-300"><Copy className="w-3 h-3" /></Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-emerald-200">Proof of Payment</Label>
              <label className="flex flex-col items-center justify-center w-full h-40 border border-emerald-500/20 border-dashed rounded-xl cursor-pointer bg-emerald-500/5 hover:bg-emerald-500/10 transition-all duration-200 group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-8 h-8 mb-3 text-emerald-400" />
                  <p className="text-sm text-emerald-200">{receipt ? receipt.name : "Click to upload image"}</p>
                </div>
                <input type="file" className="hidden" onChange={e => setReceipt(e.target.files?.[0] || null)} />
              </label>
              <Button disabled={depositMutation.isPending} onClick={() => depositMutation.mutate()} className="w-full bg-emerald-600 hover:bg-emerald-700 mt-2">
                {depositMutation.isPending ? "Uploading..." : "Submit Deposit"}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="withdraw" className="space-y-6">
          <form onSubmit={withdrawForm.handleSubmit((d) => withdrawMutation.mutate(d))} className="space-y-4 max-w-md mx-auto">
             <div className="space-y-2">
                <Label>Currency</Label>
                <Select onValueChange={v => withdrawForm.setValue("currency", v)} defaultValue="USDT">
                  <SelectTrigger className="bg-slate-950 border-slate-800"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    <SelectItem value="USDT">USDT</SelectItem><SelectItem value="BTC">BTC</SelectItem>
                  </SelectContent>
                </Select>
             </div>
             <div className="space-y-2">
                <Label>Wallet Address</Label>
                <Input {...withdrawForm.register("address")} className="bg-slate-950 border-slate-800 text-white" placeholder="0x..." />
                {withdrawForm.formState.errors.address && <p className="text-red-500 text-xs">{withdrawForm.formState.errors.address.message}</p>}
             </div>
             <div className="space-y-2">
                <Label>Amount</Label>
                <Input 
                  type="text"
                  inputMode="decimal"
                  {...withdrawForm.register("amount")} 
                  className="bg-slate-950 border-slate-800 text-white" 
                  placeholder="0.00" 
                />
                {withdrawForm.formState.errors.amount && <p className="text-red-500 text-xs">{withdrawForm.formState.errors.amount.message}</p>}
             </div>
             <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg flex gap-3 items-start">
               <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0" />
               <p className="text-xs text-yellow-200/80">Withdrawals are processed manually. Please allow up to 24 hours.</p>
             </div>
             <Button disabled={withdrawMutation.isPending} className="w-full bg-red-600 hover:bg-red-700">
               {withdrawMutation.isPending ? "Processing..." : "Confirm Withdraw"}
             </Button>
          </form>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

// ──────────────────────────────────────────────────────────────
// 4. MAIN PAGE
// ──────────────────────────────────────────────────────────────

export default function Wallet() {
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useQuery<UserInfo>({
    queryKey: ["/auth/user-info"],
    queryFn: authenticatedFetcher
  });

  const { data: deposits = [] } = useQuery<Transaction[]>({
    queryKey: ["/dash/deposits"],
    queryFn: authenticatedFetcher
  });

  const { data: withdrawals = [] } = useQuery<Transaction[]>({
    queryKey: ["/dash/withdrawals"],
    queryFn: authenticatedFetcher
  });

  // Merge & Sort History
  const history = useMemo(() => {
    const d = Array.isArray(deposits) ? deposits.map(x => ({ ...x, type: 'Deposit' })) : [];
    const w = Array.isArray(withdrawals) ? withdrawals.map(x => ({ ...x, type: 'Withdraw' })) : [];
    return [...d, ...w].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [deposits, withdrawals]);

  return (
    <Layout>
      <div className="min-h-screen bg-slate-950 text-white pb-20">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          
          <PortfolioHeader 
            stats={stats} 
            isLoading={statsLoading} 
            onRefresh={() => queryClient.invalidateQueries({ queryKey: ["/auth/user-info"] })} 
          />
          
          <ActionGrid walletAddress={stats?.wallet_address || "0x71C7656EC7ab88b098defB751B7401B5f6d8976F"} />
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold px-1">Your Accounts</h3>
            <AccountsGrid stats={stats} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <TransactionManager />
            
            {/* Convert Card (Future Feature) */}
            <Card className="bg-slate-900 border-slate-800 p-6 flex flex-col">
               <h2 className="text-lg font-bold mb-4 text-emerald-200">Quick Convert</h2>
               <div className="flex-1 flex flex-col justify-center space-y-4 opacity-50 pointer-events-none">
                  <div className="p-4 border border-slate-800 rounded-xl">
                    <p className="text-xs text-emerald-400 mb-1">From</p>
                    <div className="flex justify-between font-bold text-emerald-200"><span>USDT</span><span>0.00</span></div>
                  </div>
                  <div className="flex justify-center"><ArrowDownLeft className="w-5 h-5 text-slate-600" /></div>
                  <div className="p-4 border border-slate-800 rounded-xl">
                    <p className="text-xs text-emerald-400 mb-1">To</p>
                    <div className="flex justify-between font-bold text-emerald-200"><span>BTC</span><span>0.00</span></div>
                  </div>
                  <Button className="w-full bg-slate-800">Coming Soon</Button>
               </div>
            </Card>
          </div>

          {/* History Table */}
          <Card className="bg-slate-900 border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-800">
              <h3 className="font-bold text-lg text-emerald-200">Transaction History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-950 text-xs uppercase text-slate-500 font-semibold">
                  <tr>
                    <th className="p-4">Type</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm">
                  {history.length === 0 ? (
                    <tr><td colSpan={4} className="p-8 text-center text-slate-500">No transactions found.</td></tr>
                  ) : (
                    history.slice(0, 10).map((tx, i) => (
                      <tr key={i} className="hover:bg-slate-800/50">
                        <td className="p-4 font-bold">
                          <span className={tx.type === 'Deposit' ? "text-emerald-400" : "text-slate-300"}>{tx.type}</span>
                        </td>
                        <td className="p-4 font-mono text-white">{tx.amount} {tx.currency}</td>
                        <td className="p-4"><Badge variant="outline" className="text-[10px] border-slate-700 text-slate-400">{tx.status}</Badge></td>
                        <td className="p-4 text-slate-500">{new Date(tx.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

        </div>
      </div>
    </Layout>
  );
}