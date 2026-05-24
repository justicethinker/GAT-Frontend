import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  ArrowUpRight, ArrowDownLeft, RefreshCw,
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
    signal
  });
  if (!res.ok) throw new Error("Request failed");
  return res.json();
};

// ──────────────────────────────────────────────────────────────
// 3. COMPONENTS
// ──────────────────────────────────────────────────────────────

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
};

const PortfolioHeader = ({ stats, onRefresh, isLoading }: { stats?: UserInfo, onRefresh: () => void, isLoading: boolean }) => {
  const totalBalance = (stats?.balance_arb || 0) + (stats?.balance_forex || 0) + (stats?.balance_fut || 0);

  return (
    <div className="relative overflow-hidden bg-card border border-border rounded-3xl p-8 sm:p-10 shadow-2xl group font-grotesk">
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-105 transition-transform duration-500 pointer-events-none"></div>
      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <p className="text-slate-400 font-semibold mb-2 flex items-center gap-2 text-sm uppercase tracking-wider">
            Total Portfolio Value
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
          </p>
          <h2 className="text-4xl sm:text-6xl font-700 tracking-tight text-white glow-text">
            {formatCurrency(totalBalance)}
          </h2>
          <div className="flex items-center gap-3 mt-4 text-xs font-semibold">
            <Badge className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 font-bold px-3 py-1">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> +8.09%
            </Badge>
            <span className="text-slate-500">Last 24h</span>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onRefresh} className="border-border bg-secondary hover:bg-secondary/80 text-foreground font-bold font-grotesk px-4 py-2 h-10 shadow-md">
          <RefreshCw className={cn("w-4 h-4 mr-2 text-primary", isLoading && "animate-spin")} /> Refresh
        </Button>
      </div>
    </div>
  );
};

const ActionGrid = () => {
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

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Transfer Card */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <div className="bg-card border border-border rounded-2xl p-6 cursor-pointer hover:border-primary/45 transition-all group relative overflow-hidden shadow-lg font-grotesk">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary shadow-lg shadow-primary/10 group-hover:scale-110 transition-transform duration-300">
                  <ArrowRightLeft className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-700 text-white">Transfer Funds</h3>
                  <p className="text-slate-400 text-sm">Move assets between wallets</p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-secondary border border-border/60 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:border-primary/40 transition-all duration-300">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        </DialogTrigger>
        <DialogContent className="glass bg-card border-border text-foreground font-grotesk rounded-xl shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="font-700 text-white text-lg">Internal Transfer</DialogTitle>
            <DialogDescription className="text-slate-400">
              Move funds instantly between your trading accounts.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-semibold text-slate-350 text-xs">From</Label>
                <Select onValueChange={(v: any) => setValue("from", v)} defaultValue={watch("from")}>
                  <SelectTrigger className="bg-secondary border-border text-foreground font-bold"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground font-grotesk">
                    <SelectItem value="forex">Forex</SelectItem><SelectItem value="arb">Arbitrage</SelectItem><SelectItem value="fut">Futures</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="font-semibold text-slate-350 text-xs">To</Label>
                <Select onValueChange={(v: any) => setValue("to", v)} defaultValue={watch("to")}>
                  <SelectTrigger className="bg-secondary border-border text-foreground font-bold"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground font-grotesk">
                    <SelectItem value="forex">Forex</SelectItem><SelectItem value="arb">Arbitrage</SelectItem><SelectItem value="fut">Futures</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {errors.to && <p className="text-destructive text-xs">{errors.to.message}</p>}
            
            <div className="space-y-1.5">
              <Label className="font-semibold text-slate-350 text-xs">Amount</Label>
              <div className="relative">
                <Input 
                  type="text" 
                  inputMode="decimal"
                  {...register("amount")} 
                  className="bg-secondary border-border text-foreground pl-8 focus:ring-1 focus:ring-primary font-bold font-mono" 
                  placeholder="0.00" 
                  autoComplete="off"
                />
                <span className="absolute left-3 top-2.5 text-slate-500 font-bold">$</span>
              </div>
              {errors.amount && <p className="text-destructive text-xs">{errors.amount.message}</p>}
            </div>

            <Button disabled={mutation.isPending} className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold shadow-lg glow-primary mt-2">
              {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" /> : "Confirm Transfer"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const AccountsGrid = ({ stats }: { stats?: UserInfo }) => {
  const accounts = [
    { name: "Arbitrage Wallet", code: "ARB", balance: stats?.balance_arb || 0, color: "text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 shadow-[0_0_12px_rgba(34,211,238,0.15)]" },
    { name: "Forex Account", code: "FX", balance: stats?.balance_forex || 0, color: "text-amber-400 bg-amber-400/10 border border-amber-400/20 shadow-[0_0_12px_rgba(245,158,11,0.15)]" },
    { name: "Futures Margin", code: "FUT", balance: stats?.balance_fut || 0, color: "text-violet-400 bg-violet-400/10 border border-violet-400/20 shadow-[0_0_12px_rgba(139,92,246,0.15)]" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {accounts.map((acc) => (
        <Card key={acc.code} className="bg-card border-border p-6 flex flex-col justify-between hover:border-primary/45 transition-all duration-350 shadow-lg rounded-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/5 -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-300 pointer-events-none" />
          <div className="relative font-grotesk">
            <div className="flex justify-between items-start mb-4">
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm", acc.color)}>
                {acc.code}
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold">Active</Badge>
            </div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{acc.name}</p>
            <h3 className="text-2xl font-700 text-white mt-2 font-mono">{formatCurrency(acc.balance)}</h3>
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
    <Card className="lg:col-span-2 bg-card border-border p-6 rounded-xl shadow-lg relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/5 -translate-y-1/2 translate-x-1/2 group-hover:scale-105 transition-transform duration-500 pointer-events-none" />
      <Tabs defaultValue="deposit" className="w-full relative font-grotesk">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white leading-none">Transactions</h2>
          <TabsList className="bg-secondary border border-border p-1 rounded-xl">
            <TabsTrigger value="deposit" className="w-24 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold">Deposit</TabsTrigger>
            <TabsTrigger value="withdraw" className="w-24 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold">Withdraw</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="deposit" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="font-semibold text-slate-350 text-xs">Asset</Label>
                <Select value={coin} onValueChange={setCoin}>
                  <SelectTrigger className="bg-secondary border-border text-foreground font-bold"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground font-grotesk">
                    <SelectItem value="USDT">USDT (ERC20)</SelectItem>
                    <SelectItem value="BTC">Bitcoin</SelectItem>
                    <SelectItem value="ETH">Ethereum</SelectItem>
                    <SelectItem value="Solana">Solana</SelectItem>
                    <SelectItem value="USDC">USDC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="font-semibold text-slate-355 text-xs">Amount</Label>
                <Input 
                  type="text"
                  inputMode="decimal"
                  value={depositAmount} 
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || /^\d*\.?\d*$/.test(val)) setDepositAmount(val);
                  }} 
                  className="bg-secondary border-border text-foreground focus:ring-1 focus:ring-primary font-bold font-mono" 
                  placeholder="0.00" 
                />
              </div>
              <div className="p-4 bg-secondary/35 border border-border/70 rounded-xl flex items-center justify-between shadow-sm">
                <div className="text-xs">
                  <p className="text-slate-500 uppercase font-bold tracking-wider">Deposit Address</p>
                  <p className="text-primary font-mono font-semibold mt-2 break-all max-w-[200px] sm:max-w-xs">
                    {addressLoading
                      ? "Loading..."
                      : selectedAddress || "No address available"}
                  </p>
                </div>
                <Button size="sm" variant="ghost" className="h-8 text-primary hover:bg-secondary" onClick={() => {
                  if (selectedAddress) {
                    navigator.clipboard.writeText(selectedAddress);
                    toast({ title: "Copied", description: "Deposit address copied to clipboard." });
                  }
                }}>
                  <Copy className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="font-semibold text-slate-350 text-xs">Proof of Payment</Label>
              <label className="flex flex-col items-center justify-center w-full h-40 border border-border border-dashed rounded-xl cursor-pointer bg-secondary/20 hover:bg-secondary/40 transition-all group shadow-sm">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-8 h-8 mb-3 text-primary glow-text" />
                  <p className="text-sm text-slate-300 font-semibold">{receipt ? receipt.name : "Click to upload proof file"}</p>
                </div>
                <input type="file" className="hidden" onChange={e => setReceipt(e.target.files?.[0] || null)} />
              </label>
              <Button disabled={depositMutation.isPending} onClick={() => depositMutation.mutate()} className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold shadow-lg glow-primary mt-3 py-6 rounded-xl transition-all">
                {depositMutation.isPending ? "Uploading..." : "Submit Deposit"}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="withdraw" className="space-y-6">
          <form onSubmit={withdrawForm.handleSubmit((d) => withdrawMutation.mutate(d))} className="space-y-4 max-w-md mx-auto">
             <div className="space-y-1.5">
                <Label className="font-semibold text-slate-350 text-xs">Currency</Label>
                <Select onValueChange={v => withdrawForm.setValue("currency", v)} defaultValue="USDT">
                  <SelectTrigger className="bg-secondary border-border text-foreground font-bold"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground font-grotesk">
                    <SelectItem value="USDT" className="text-primary font-bold">USDT</SelectItem>
                    <SelectItem value="BTC" className="text-warning font-bold">BTC</SelectItem>
                  </SelectContent>
                </Select>
             </div>
             <div className="space-y-1.5">
               <Label className="font-semibold text-slate-350 text-xs">Wallet Address</Label>
               <Input {...withdrawForm.register("address")} className="bg-secondary border-border text-foreground focus:ring-1 focus:ring-primary font-bold font-mono" placeholder="0x..." />
               {withdrawForm.formState.errors.address && <p className="text-destructive text-xs">{withdrawForm.formState.errors.address.message}</p>}
             </div>
             <div className="space-y-1.5">
                <Label className="font-semibold text-slate-350 text-xs">Amount</Label>
                <Input 
                  type="text"
                  inputMode="decimal"
                  {...withdrawForm.register("amount")} 
                  className="bg-secondary border-border text-foreground focus:ring-1 focus:ring-primary font-bold font-mono" 
                  placeholder="0.00" 
                />
                {withdrawForm.formState.errors.amount && <p className="text-destructive text-xs">{withdrawForm.formState.errors.amount.message}</p>}
             </div>
             <div className="bg-warning/10 border border-warning/20 p-3.5 rounded-xl flex gap-3 items-start">
               <AlertCircle className="w-5 h-5 text-warning shrink-0" />
               <p className="text-xs text-warning/80">Withdrawals are processed manually. Please allow up to 24 hours.</p>
             </div>
             <Button disabled={withdrawMutation.isPending} className="w-full bg-destructive hover:bg-destructive/95 text-destructive-foreground font-bold shadow-lg mt-3 py-6 rounded-xl transition-all">
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
      <div className="min-h-screen bg-background text-foreground pb-20 font-sans">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          
          <PortfolioHeader 
            stats={stats} 
            isLoading={statsLoading} 
            onRefresh={() => queryClient.invalidateQueries({ queryKey: ["/auth/user-info"] })} 
          />
          
          <ActionGrid />
          
          <div className="space-y-4">
            <h3 className="text-lg font-bold px-1 font-grotesk text-white leading-none">Your Accounts</h3>
            <AccountsGrid stats={stats} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <TransactionManager />
            
            {/* Convert Card (Future Feature) */}
            <Card className="bg-card border-border p-6 flex flex-col rounded-xl shadow-lg relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/5 -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-300 pointer-events-none" />
               <h2 className="text-lg font-bold mb-4 text-white relative font-grotesk leading-none">Quick Convert</h2>
               <div className="flex-1 flex flex-col justify-center space-y-4 opacity-50 pointer-events-none relative font-grotesk">
                  <div className="p-4 border border-border/80 rounded-xl bg-secondary/35">
                    <p className="text-xs text-primary font-semibold mb-1 uppercase tracking-wider">From</p>
                    <div className="flex justify-between font-bold text-white font-mono"><span>USDT</span><span>0.00</span></div>
                  </div>
                  <div className="flex justify-center"><ArrowDownLeft className="w-5 h-5 text-slate-500" /></div>
                  <div className="p-4 border border-border/80 rounded-xl bg-secondary/35">
                    <p className="text-xs text-primary font-semibold mb-1 uppercase tracking-wider">To</p>
                    <div className="flex justify-between font-bold text-white font-mono"><span>BTC</span><span>0.00</span></div>
                  </div>
                  <Button className="w-full bg-secondary border border-border text-slate-450 rounded-xl py-6 font-bold text-sm">Coming Soon</Button>
               </div>
            </Card>
          </div>

          {/* History Table */}
          <Card className="bg-card border-border overflow-hidden rounded-xl shadow-lg">
            <div className="p-6 border-b border-border font-grotesk">
              <h3 className="font-bold text-lg text-white leading-none">Transaction History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-grotesk">
                <thead className="bg-secondary/20 border-b border-border/50 text-[10px] uppercase text-slate-400 font-bold tracking-wider">
                  <tr>
                    <th className="p-4">Type</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 text-sm">
                  {history.length === 0 ? (
                    <tr><td colSpan={4} className="p-8 text-center text-slate-500 font-semibold">No transactions found.</td></tr>
                  ) : (
                    history.slice(0, 10).map((tx, i) => (
                      <tr key={i} className="hover:bg-secondary/20 transition-colors">
                        <td className="p-4 font-bold">
                          <span className={tx.type === 'Deposit' ? "text-primary glow-text" : "text-slate-300"}>{tx.type}</span>
                        </td>
                        <td className="p-4 font-mono text-white font-semibold">{tx.amount} {tx.currency}</td>
                        <td className="p-4"><Badge className="bg-secondary border border-border text-[9px] font-bold text-slate-400 uppercase tracking-wider">{tx.status}</Badge></td>
                        <td className="p-4 text-slate-500 font-mono text-xs">{new Date(tx.created_at).toLocaleDateString()}</td>
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