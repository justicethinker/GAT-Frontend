import React, { useState, useMemo, useRef, useEffect } from "react";
import { buildUrl } from '@/lib/api';
import { useLocation } from "wouter";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  Shield,
  BarChart3,
  Bell,
  Menu,
  User as UserIcon,
  ChevronDown,
  TrendingUp,
  Wallet,
  Activity,
  AlertTriangle,
  ArrowUpRight,
  LineChart,
  DollarSign,
  Search,
  Plus,
  X,
  CheckCircle,
  Ban,
  Edit,
  QrCode,
  Copy,
  Save,
  Eye,
  Check,
  Trash2,
  Coins,
  Globe,
  Clock,
  Zap,
  Download,
  PieChart,
  Calendar,
  Lock,
  Code,
  FileText,
  AlertOctagon,
  Server,
  Cpu,
  HardDrive,
  Database,
  RefreshCw,
  Power,
  Cloud,
  RotateCcw,
  LogOut,
  UserCog,
  Key,
  History
} from "lucide-react";

// --- 1. CSS for Custom Dark Scrollbar ---
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #030712;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #374151;
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #4b5563;
  }
`;

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active = false, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors cursor-pointer ${
      active
        ? "bg-emerald-600 text-white"
        : "text-gray-400 hover:text-white hover:bg-gray-800"
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </button>
);

const StatCard = ({ title, value, subValue, icon: Icon, colorClass }: any) => (
  <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-colors cursor-pointer group">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-400 text-sm font-medium mb-1 group-hover:text-gray-300">{title}</p>
        <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
        {subValue && (
           <span className={`text-xs font-medium ${colorClass} flex items-center`}>
             {typeof subValue === 'string' && (subValue.includes('%') || subValue.includes('+')) && <TrendingUp size={12} className="mr-1" />} 
             {subValue}
           </span>
        )}
      </div>
      <div className="p-3 bg-gray-800 rounded-lg group-hover:bg-gray-700 transition-colors">
        <Icon size={24} className="text-gray-300" />
      </div>
    </div>
  </div>
);

const ChartPlaceholder = ({ title, label, icon: Icon, color }: any) => (
  <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-colors">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <button className="text-gray-500 hover:text-white"><ArrowUpRight size={16} /></button>
    </div>
    <div className="bg-gray-800/30 rounded-lg h-64 flex flex-col items-center justify-center border border-gray-800/50 group cursor-pointer hover:bg-gray-800/40 transition-colors">
      <div className={`mb-4 transform group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={48} className={color} />
      </div>
      <p className="text-gray-400 font-medium">{label}</p>
      <p className="text-xs text-gray-500 mt-1">Chart integration coming soon</p>
    </div>
  </div>
);

const TradingStatCard = ({ title, totalTrades, profit, icon: Icon, color }: any) => (
  <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-colors">
    <div className="flex items-center gap-3 mb-4">
      <div className={`p-2 rounded-lg ${color} bg-opacity-20`}>
        <Icon size={20} className={color.replace('bg-', 'text-')} />
      </div>
      <h3 className="text-white font-bold">{title}</h3>
    </div>
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">Total Trades</span>
        <span className="text-white font-medium">{totalTrades}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">Total Profit</span>
        <span className="text-emerald-500 font-medium">{profit}</span>
      </div>
    </div>
  </div>
);

const ActivityItem = ({ icon: Icon, title, sub, time, color }: any) => (
  <div className="flex items-center p-4 bg-gray-800/50 rounded-lg border border-gray-800 hover:bg-gray-800 transition-colors cursor-pointer">
    <div className={`p-2 rounded-full mr-4 ${color} bg-opacity-20`}>
      <Icon size={16} className={color.replace('bg-', 'text-')} />
    </div>
    <div className="flex-1">
      <h4 className="text-sm font-medium text-white">{title}</h4>
      <p className="text-xs text-gray-400">{sub}</p>
    </div>
    <span className="text-xs text-gray-500">{time}</span>
  </div>
);

const TopTraderRow = ({ rank, name, trades, winRate, profit }: any) => (
  <div className="flex items-center justify-between p-4 hover:bg-gray-800/50 rounded-lg transition-colors border-b border-gray-800 last:border-0 cursor-pointer">
    <div className="flex items-center gap-4">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${rank === 1 ? 'bg-yellow-500 text-black' : rank === 2 ? 'bg-gray-400 text-black' : rank === 3 ? 'bg-orange-700 text-white' : 'bg-gray-800 text-gray-400'}`}>
        {rank}
      </div>
      <div>
        <p className="text-white font-medium text-sm">{name}</p>
        <p className="text-xs text-gray-400">{trades} trades • {winRate}% win rate</p>
      </div>
    </div>
    <span className="text-emerald-500 font-bold text-sm">{profit}</span>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    Active: "bg-emerald-500/10 text-emerald-500",
    Pending: "bg-yellow-500/10 text-yellow-500",
    Suspended: "bg-red-500/10 text-red-500",
    Completed: "bg-emerald-500/10 text-emerald-500",
    Failed: "bg-red-500/10 text-red-500",
    Rejected: "bg-red-500/10 text-red-500",
    Approved: "bg-emerald-500/10 text-emerald-500",
    "Pending Review": "bg-yellow-500/10 text-yellow-500"
  };
  const normalizedStatus = Object.keys(styles).find(key => key.toLowerCase() === (status || "").toLowerCase()) || "Pending";
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${styles[normalizedStatus as keyof typeof styles] || "text-gray-400"}`}>
      {status || "Unknown"}
    </span>
  );
};

const SeverityBadge = ({ level }: { level: string }) => {
    const styles = {
        HIGH: "bg-red-500/10 text-red-500 border-red-500/20",
        MEDIUM: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
        LOW: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    };
    return (
        <span className={`px-2 py-1 rounded text-xs font-bold border ${styles[level as keyof typeof styles] || "text-gray-400"}`}>
            {level}
        </span>
    )
}

const Switch = ({ checked, onChange }: { checked: boolean; onChange: (val: boolean) => void }) => (
  <button 
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-emerald-600' : 'bg-gray-600'}`}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

// --- Interfaces ---
interface User {
  id: number;
  name: string;
  email: string;
  status: string;
  balance: string;
  trades: number;
  joinDate: string;
  verified: boolean;
  rawBalance: number;
}

// --- Main Admin Page ---

const Admin = () => {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
    
  // --- Profile Dropdown & Modal State ---
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileActiveTab, setProfileActiveTab] = useState("Profile"); 
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpenProfileModal = (tab: string) => {
    setProfileActiveTab(tab);
    setIsProfileModalOpen(true);
    setIsProfileMenuOpen(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    localStorage.removeItem("token");
    setLocation("/");
  };

  // Shared State
  const [timeRange, setTimeRange] = useState("7D");
  const timeFilters = ["24H", "7D", "30D", "90D"];

  // --- User Management State & Logic ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
   
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userPage, setUserPage] = useState(1);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", accountId: "" });

  // --- FETCH USERS FROM API ---
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const token = sessionStorage.getItem("token");
      const headers = { 'Authorization': token ? `Bearer ${token}` : '' };

      let url = `${buildUrl('/admini/dashboard')}?page=${userPage}`;
      if (filterStatus === "Suspended") {
        url += `&suspended=true`;
      }

      const response = await fetch(url, { headers });
      
      if (response.ok) {
        const rawData = await response.json();
        
        let usersArray: any[] = [];
        if (Array.isArray(rawData)) {
            usersArray = rawData;
        } else if (rawData.users && Array.isArray(rawData.users)) {
            usersArray = rawData.users;
        } else if (rawData.data && Array.isArray(rawData.data)) {
            usersArray = rawData.data;
        } else if (rawData.items && Array.isArray(rawData.items)) {
            usersArray = rawData.items;
        } else if (rawData.results && Array.isArray(rawData.results)) {
            usersArray = rawData.results;
        }

        const mappedUsers = usersArray.map((u: any) => ({
          id: u.id || u.user_id,
          name: u.name || u.full_name || u.username || "Unknown User",
          email: u.email || "No Email",
          status: u.suspended ? "Suspended" : (u.status || "Active"),
          balance: u.balance ? `$${parseFloat(u.balance).toLocaleString()}` : "$0.00",
          rawBalance: u.balance ? parseFloat(u.balance) : 0, 
          trades: u.trades_count || u.trades || 0,
          joinDate: u.created_at ? new Date(u.created_at).toLocaleDateString() : "N/A",
          verified: u.is_verified || u.verified || false
        }));
        
        setUsers(mappedUsers);
      } else {
        console.error("Failed to fetch users. Status:", response.status);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [userPage, filterStatus]); 

  // --- ACTIONS ---
  const handleUserAction = async (userId: number, currentStatus: string) => {
    try {
      const token = sessionStorage.getItem("token");
      const action = currentStatus === "Suspended" ? "unsuspend" : "suspend";
      
      if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

      const response = await fetch(`${buildUrl('/admini/suspend-user')}?user_id=${userId}&action=${action}`, {
        method: "GET",
        headers: { 'Authorization': token ? `Bearer ${token}` : '' }
      });

      if (response.ok) {
        await fetchUsers(); 
        alert(`User ${action}ed successfully.`);
      } else {
        const err = await response.json();
        alert(`Action failed: ${err.detail || "Unknown error"}`);
      }
    } catch (error) {
      alert("Connection error occurred.");
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const token = sessionStorage.getItem("token");
        const response = await fetch(buildUrl("/auth/create-user"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { "Authorization": `Bearer ${token}` } : {})
            },
            body: JSON.stringify({
                email: newUser.email,
                password: newUser.password, 
                full_name: newUser.name,
            })
        });

        if (response.ok) {
            alert("User created successfully!");
            setIsAddUserOpen(false);
            setNewUser({ name: "", email: "", password: "", accountId: "" });
            fetchUsers();
        } else {
            const data = await response.json();
            alert(`Error: ${data.message || data.detail || "Failed to create user"}`);
        }
    } catch (error) {
        alert("Network error occurred.");
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
      let matchesStatus = true;
      if (filterStatus !== "All" && filterStatus !== "Suspended") {
          matchesStatus = user.status === filterStatus;
      }
      return matchesSearch && matchesStatus;
    });
  }, [users, searchTerm, filterStatus]);

  // --- DYNAMIC ANALYTICS CALCULATIONS ---
  const platformStats = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === "Active").length;
    const suspendedUsers = users.filter(u => u.status === "Suspended").length;
    
    // Calculate total balance held on platform as a proxy for Volume/Revenue if API doesn't provide it
    const totalBalance = users.reduce((acc, curr) => acc + (curr.rawBalance || 0), 0);
    const totalTrades = users.reduce((acc, curr) => acc + (curr.trades || 0), 0);

    return {
        totalUsers,
        activeUsers,
        suspendedUsers,
        totalBalance: `$${totalBalance.toLocaleString()}`,
        totalTrades
    };
  }, [users]);
  
  // --- USER STATS FOR USERS TAB ---
  // Re-added this variable to fix the "userStats is not defined" error
  const userStats = {
    total: users.length,
    active: users.filter(u => u.status === "Active").length,
    pending: users.filter(u => u.status === "Pending").length,
    suspended: users.filter(u => u.status === "Suspended").length,
  };

  // --- Payment Gateway State ---
  const [activeGateway, setActiveGateway] = useState("stripe");
  const [gateways, setGateways] = useState({
    stripe: { enabled: true, publicKey: "pk_test_...", secretKey: "", webhook: "", currency: "USD" },
    paypal: { enabled: false, clientId: "", clientSecret: "", mode: "Sandbox" },
    crypto: { enabled: true }
  });
  const [currencies, setCurrencies] = useState(["USD", "EUR", "GBP", "CAD"]);
  const [cryptoTab, setCryptoTab] = useState("wallets");
  const [newCurrency, setNewCurrency] = useState("");
  const [isAddWalletOpen, setIsAddWalletOpen] = useState(false);
  const [wallets, setWallets] = useState([
    { id: 1, name: "Tether", network: "TRC20", address: "TQn9Y2khEsLJW1ChVW...5KcbLSE", color: "bg-emerald-500" },
    { id: 2, name: "USD Coin", network: "ERC20", address: "0x742d35Cc6634C053...c4b4d4d4", color: "bg-blue-500" },
    { id: 3, name: "Bitcoin", network: "Bitcoin", address: "bc1qxy2kgdygjrsqtz...fjhx0wlh", color: "bg-orange-500" },
    { id: 4, name: "Ethereum", network: "Ethereum", address: "0x742d35Cc6634C053...c4b4d4d4", color: "bg-indigo-500" },
  ]);
  const [newWallet, setNewWallet] = useState({ name: "", network: "", address: "" });
  const recentTransactions = [
    { id: "TXN001", user: "John Smith", type: "Deposit", method: "Stripe", amount: "$1,250.00", fee: "$12.50", status: "Completed", date: "2024-03-15 14:30", proof: false },
    { id: "TXN002", Sarah: "Sarah Johnson", user: "Sarah Johnson", type: "Deposit", method: "Crypto (BTC)", amount: "$890.00", fee: "$8.90", status: "Pending", date: "2024-03-15 13:45", proof: true },
    { id: "TXN003", user: "Mike Chen", type: "Deposit", method: "PayPal", amount: "$500.00", fee: "$5.00", status: "Failed", date: "2024-03-15 12:20", proof: false },
  ];
  const paymentProofs = [
    { id: "PROOF001", user: "Sarah Johnson", crypto: "BTC", amount: "$890.00", status: "Pending Review", date: "2024-03-15 13:45" },
    { id: "PROOF002", user: "Alex Wilson", crypto: "USDT", amount: "$1,200.00", status: "Approved", date: "2024-03-15 12:30" },
    { id: "PROOF003", user: "Emma Davis", crypto: "ETH", amount: "$750.00", status: "Rejected", date: "2024-03-15 11:15" },
  ];

  // --- Trading Settings State ---
  const [tradingTab, setTradingTab] = useState("Arbitrage");
  const [tradingConfig, setTradingConfig] = useState({
    arbitrage: {
      enabled: true,
      minProfit: 0.5,
      maxPosition: 10000,
      autoExecute: false,
      exchanges: ["Binance", "Coinbase", "Kraken", "Huobi", "KuCoin", "Bybit"]
    },
    futures: {
      enabled: true,
      leverage: "10x",
      margin: 0.1,
      liquidation: 0.8,
      pairs: ["BTC/USDT", "ETH/USDT", "BNB/USDT", "SOL/USDT"]
    },
    forex: {
      enabled: true,
      leverage: "100:1",
      spread: 0.2,
      sessions: {
        london: { start: "08:00", end: "17:00" },
        newyork: { start: "13:00", end: "22:00" },
        tokyo: { start: "00:00", end: "09:00" }
      }
    },
    risk: {
      maxDailyLoss: 1000,
      maxPositions: 20,
      requireStopLoss: true,
      requireTakeProfit: false
    }
  });

  const allExchanges = ["Binance", "Coinbase", "Kraken", "Huobi", "KuCoin", "Bybit", "OKX", "Bitstamp"];
  const allPairs = ["BTC/USDT", "ETH/USDT", "BNB/USDT", "ADA/USDT", "SOL/USDT", "DOT/USDT", "XRP/USDT", "DOGE/USDT"];

  // --- Security Settings State ---
  const [securityTab, setSecurityTab] = useState("Authentication");
  const [securityConfig, setSecurityConfig] = useState({
    auth: {
      enable2FA: true,
      require2FA: false,
      maxLoginAttempts: 5,
      lockoutDuration: 30,
      sessionTimeout: 24,
      strongPassword: true
    },
    api: {
      rateLimiting: true,
      reqPerMin: 100,
      requireApiKey: true,
      ipWhitelist: ""
    },
    monitoring: {
      suspiciousDetection: true,
      largeTxAlerts: true,
      multiLoginAlerts: true,
      alertThreshold: 10000
    }
  });
    
  const securityLogs = [
    { id: 1, severity: "MEDIUM", event: "Multiple failed login attempts from IP 192.168.1.100", user: "john.smith@email.com", timestamp: "2024-03-15 14:30:25", action: "Account temporarily locked", actionColor: "text-emerald-400" },
    { id: 2, severity: "HIGH", event: "Large withdrawal request detected", user: "sarah.j@email.com", timestamp: "2024-03-15 13:45:12", action: "Manual review required", actionColor: "text-emerald-400" },
    { id: 3, severity: "LOW", event: "API rate limit exceeded", user: "api_user_123", timestamp: "2024-03-15 12:20:08", action: "Rate limited for 1 hour", actionColor: "text-emerald-400" },
    { id: 4, severity: "HIGH", event: "Unusual trading pattern detected", user: "mike.chen@email.com", timestamp: "2024-03-15 11:15:33", action: "Account flagged for review", actionColor: "text-emerald-400" },
  ];

  // --- System Settings State ---
  const [systemTab, setSystemTab] = useState("General"); 
  const [systemConfig, setSystemConfig] = useState({
    general: { siteName: "TradingPro Platform", siteDesc: "Advanced Trading Platform for Crypto, Forex & Futures", maintenance: false, registration: true, emailVerify: true },
    notifications: { email: true, sms: false, push: true, trading: true, system: true },
    performance: { caching: true, compression: true, cdn: true, maxUsers: 10000, sessionTimeout: 24 },
    backup: { auto: true, frequency: "Daily", retention: 30 }
  });
    
  const [backups, setBackups] = useState([
    { id: 1, name: "Full Backup", date: "2024-03-15 02:00:00", size: "2.4 GB", status: "Completed" },
    { id: 2, name: "Incremental", date: "2024-03-14 02:00:00", size: "156 MB", status: "Completed" },
  ]);

  // --- Handlers ---
  const handleSaveSettings = () => {
    alert("Settings saving logic not yet connected to backend.");
  };

  const handleExportReport = () => {
    alert("Downloading analytics report... (Mock CSV/PDF)");
  };

  const handleAddCurrency = () => {
    if (newCurrency && !currencies.includes(newCurrency)) {
      setCurrencies([...currencies, newCurrency]);
      setNewCurrency("");
    }
  };

  const handleAddWallet = (e: React.FormEvent) => {
    e.preventDefault();
    setWallets([...wallets, { ...newWallet, id: Date.now(), color: "bg-gray-500" }]);
    setIsAddWalletOpen(false);
    setNewWallet({ name: "", network: "", address: "" });
  };

  const toggleItem = (category: 'arbitrage' | 'futures', key: 'exchanges' | 'pairs', item: string) => {
    if (category === 'arbitrage' && key === 'exchanges') {
      const list = tradingConfig.arbitrage.exchanges;
      const newList = list.includes(item) ? list.filter(i => i !== item) : [...list, item];
      setTradingConfig(prev => ({ ...prev, arbitrage: { ...prev.arbitrage, exchanges: newList } }));
      return;
    }

    if (category === 'futures' && key === 'pairs') {
      const list = tradingConfig.futures.pairs;
      const newList = list.includes(item) ? list.filter(i => i !== item) : [...list, item];
      setTradingConfig(prev => ({ ...prev, futures: { ...prev.futures, pairs: newList } }));
      return;
    }
  };

  // System Handlers
  const handleRestartSystem = () => {
    setIsRestarting(true);
    setTimeout(() => {
      // Simulate logout
      sessionStorage.removeItem("token");
      localStorage.removeItem("token");
      setLocation("/"); // Redirect to landing page
    }, 3000);
  };

  const handleCreateBackup = () => {
    const newBackup = {
      id: Date.now(),
      name: "Manual Backup",
      date: new Date().toISOString().replace('T', ' ').split('.')[0],
      size: "2.4 GB",
      status: "Completed"
    };
    setBackups([newBackup, ...backups]);
    alert("Backup created successfully!");
  };

  const handleRestoreBackup = () => {
    const confirm = window.confirm("Are you sure you want to restore from the latest backup? This may overwrite current data.");
    if (confirm) alert("System restoring... (Mock)");
  };

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div className="min-h-screen bg-gradient-to-b from-[#080D14] to-[#0C1E2A] font-sans text-gray-100 flex relative backdrop-blur-md">
        
        {/* --- RESTART OVERLAY --- */}
        {isRestarting && (
          <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-bold text-white animate-pulse">Restarting System...</h2>
            <p className="text-gray-400 text-sm mt-2">Please wait while we reboot services.</p>
          </div>
        )}

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* --- MODALS --- */}
        {isAddUserOpen && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-lg border border-gray-800 w-full max-w-md p-6 shadow-xl relative">
              <button onClick={() => setIsAddUserOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20} /></button>
              <h3 className="text-xl font-bold text-white mb-6">Add New User</h3>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label><input required type="text" className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:border-emerald-500 focus:outline-none" value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} /></div>
                <div><label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label><input required type="email" className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:border-emerald-500 focus:outline-none" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} /></div>
                {/* Added Password Field for API Requirement */}
                <div><label className="block text-sm font-medium text-gray-400 mb-1">Password</label><input required type="password" className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:border-emerald-500 focus:outline-none" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} /></div>
                <div><label className="block text-sm font-medium text-gray-400 mb-1">Account ID (Optional)</label><input type="text" className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:border-emerald-500 focus:outline-none" value={newUser.accountId} onChange={(e) => setNewUser({...newUser, accountId: e.target.value})} /></div>
                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded transition-colors mt-2">Create User</button>
              </form>
            </div>
          </div>
        )}

        {isAddWalletOpen && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-lg border border-gray-800 w-full max-w-md p-6 shadow-xl relative">
              <button onClick={() => setIsAddWalletOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20} /></button>
              <h3 className="text-xl font-bold text-white mb-6">Add New Wallet</h3>
              <form onSubmit={handleAddWallet} className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-400 mb-1">Coin Name</label><input required placeholder="e.g., Bitcoin" type="text" className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:border-emerald-500 focus:outline-none" value={newWallet.name} onChange={(e) => setNewWallet({...newWallet, name: e.target.value})} /></div>
                <div><label className="block text-sm font-medium text-gray-400 mb-1">Network</label><input required placeholder="e.g., ERC20" type="text" className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:border-emerald-500 focus:outline-none" value={newWallet.network} onChange={(e) => setNewWallet({...newWallet, network: e.target.value})} /></div>
                <div><label className="block text-sm font-medium text-gray-400 mb-1">Wallet Address</label><input required placeholder="0x..." type="text" className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:border-emerald-500 focus:outline-none" value={newWallet.address} onChange={(e) => setNewWallet({...newWallet, address: e.target.value})} /></div>
                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded transition-colors mt-2">Add Wallet</button>
              </form>
            </div>
          </div>
        )}

        {/* --- PROFILE SETTINGS MODAL --- */}
        {isProfileModalOpen && (
          <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-lg border border-gray-800 w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between p-6 border-b border-gray-800">
                <h3 className="text-xl font-bold text-white">Admin Profile</h3>
                <button onClick={() => setIsProfileModalOpen(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
              </div>
              
              {/* Tabs */}
              <div className="flex border-b border-gray-800 px-6">
                {['Profile', 'Password', 'Activity'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setProfileActiveTab(tab)}
                    className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${profileActiveTab === tab ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-gray-400 hover:text-white'}`}
                  >
                    {tab === 'Profile' && <UserCog size={16} />}
                    {tab === 'Password' && <Key size={16} />}
                    {tab === 'Activity' && <History size={16} />}
                    {tab === 'Profile' ? 'Profile Settings' : tab === 'Password' ? 'Change Password' : 'Activity Log'}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto custom-scrollbar">
                {profileActiveTab === 'Profile' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-6">
                      <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center text-emerald-500 text-3xl font-bold border-2 border-emerald-500/30">
                        AD
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-white">Admin User</h4>
                        <p className="text-gray-400">Super Administrator</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20">ACTIVE</span>
                          <span className="text-xs text-gray-500">Last login: Today, 10:42 AM</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div><label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label><input type="text" className="w-full bg-gray-800 border border-gray-700 rounded p-2.5 text-white focus:border-emerald-500 outline-none" defaultValue="Admin User" /></div>
                      <div><label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label><input type="email" className="w-full bg-gray-800 border border-gray-700 rounded p-2.5 text-white focus:border-emerald-500 outline-none" defaultValue="admin@tradingpro.com" /></div>
                      <div><label className="block text-sm font-medium text-gray-400 mb-2">Role</label><input type="text" className="w-full bg-gray-800 border border-gray-700 rounded p-2.5 text-gray-500 cursor-not-allowed" defaultValue="Super Admin" disabled /></div>
                      <div><label className="block text-sm font-medium text-gray-400 mb-2">Phone Number</label><input type="text" className="w-full bg-gray-800 border border-gray-700 rounded p-2.5 text-white focus:border-emerald-500 outline-none" defaultValue="+1 (555) 123-4567" /></div>
                    </div>
                    <div className="pt-4 flex justify-end">
                      <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">Save Changes</button>
                    </div>
                  </div>
                )}

                {profileActiveTab === 'Password' && (
                  <div className="space-y-6 max-w-lg">
                    <div><label className="block text-sm font-medium text-gray-400 mb-2">Current Password</label><input type="password" className="w-full bg-gray-800 border border-gray-700 rounded p-2.5 text-white focus:border-emerald-500 outline-none" placeholder="••••••••" /></div>
                    <div><label className="block text-sm font-medium text-gray-400 mb-2">New Password</label><input type="password" className="w-full bg-gray-800 border border-gray-700 rounded p-2.5 text-white focus:border-emerald-500 outline-none" placeholder="Enter new password" /></div>
                    <div><label className="block text-sm font-medium text-gray-400 mb-2">Confirm New Password</label><input type="password" className="w-full bg-gray-800 border border-gray-700 rounded p-2.5 text-white focus:border-emerald-500 outline-none" placeholder="Confirm new password" /></div>
                    <div className="pt-4">
                      <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">Update Password</button>
                    </div>
                  </div>
                )}

                {profileActiveTab === 'Activity' && (
                  <div className="space-y-4">
                    <h4 className="text-white font-medium mb-2">Recent Admin Actions</h4>
                    {[
                      { action: "Updated System Settings", time: "2 hours ago", type: "System" },
                      { action: "Approved Withdrawal #9921", time: "5 hours ago", type: "Payment" },
                      { action: "Banned User: bad_actor_99", time: "1 day ago", type: "User" },
                      { action: "Login from IP 192.168.1.1", time: "1 day ago", type: "Auth" },
                      { action: "Changed Trading Fees", time: "2 days ago", type: "Trading" },
                    ].map((log, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-800">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-800 rounded-full text-emerald-500"><Activity size={16} /></div>
                          <div>
                            <p className="text-sm text-white font-medium">{log.action}</p>
                            <p className="text-xs text-gray-500">{log.time}</p>
                          </div>
                        </div>
                        <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300">{log.type}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sidebar */}
        <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center"><Shield className="text-white" size={18} /></div>
              <div><h1 className="text-lg font-bold text-white leading-tight">Admin Panel</h1><p className="text-[10px] text-gray-400">Trading Management</p></div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400"><Menu size={20} /></button>
          </div>
          <nav className="px-4 space-y-2 mt-4">
            <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === "Dashboard"} onClick={() => setActiveTab("Dashboard")} />
            <SidebarItem icon={Users} label="User Management" active={activeTab === "Users"} onClick={() => setActiveTab("Users")} />
            <SidebarItem icon={CreditCard} label="Payment Gateway" active={activeTab === "Payments"} onClick={() => setActiveTab("Payments")} />
            <SidebarItem icon={BarChart3} label="Trading Settings" active={activeTab === "Trading"} onClick={() => setActiveTab("Trading")} />
            <SidebarItem icon={Activity} label="Analytics" active={activeTab === "Analytics"} onClick={() => setActiveTab("Analytics")} />
            <SidebarItem icon={Shield} label="Security" active={activeTab === "Security"} onClick={() => setActiveTab("Security")} />
            <SidebarItem icon={Settings} label="System Settings" active={activeTab === "Settings"} onClick={() => setActiveTab("Settings")} />
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          
          {/* Header */}
          <header className="bg-gray-900 border-b border-gray-800 h-16 flex items-center justify-between px-6 shrink-0 relative z-40">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-400 hover:text-white"><Menu size={24} /></button>
              <h2 className="text-xl font-bold hidden sm:block">{activeTab}</h2>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden lg:flex items-center gap-2"><div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div><span className="text-xs text-gray-400">System Online</span></div>
              <div className="relative cursor-pointer"><Bell className="text-gray-400 hover:text-white transition-colors" size={20} /><span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white">3</span></div>
              
              {/* --- ADMIN DROPDOWN --- */}
              <div className="relative" ref={profileMenuRef}>
                <div 
                  className="flex items-center gap-3 pl-6 border-l border-gray-800 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                >
                  <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center"><UserIcon size={16} className="text-white" /></div>
                  <div className="hidden sm:block"><p className="text-sm font-medium text-white">Admin</p></div>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                </div>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-gray-900 border border-gray-800 rounded-lg shadow-xl z-50 py-2 animate-in fade-in zoom-in-95 duration-100">
                    <button onClick={() => handleOpenProfileModal('Profile')} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white flex items-center gap-2">
                      <UserCog size={16} /> Profile Settings
                    </button>
                    <button onClick={() => handleOpenProfileModal('Password')} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white flex items-center gap-2">
                      <Key size={16} /> Change Password
                    </button>
                    <button onClick={() => handleOpenProfileModal('Activity')} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white flex items-center gap-2">
                      <History size={16} /> Activity Log
                    </button>
                    <div className="border-t border-gray-800 my-1"></div>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-2">
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>

            </div>
          </header>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            
            {/* --- DASHBOARD TAB --- */}
            {activeTab === "Dashboard" && (
              <>
                <section>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div><h3 className="text-xl font-bold text-white">Analytics Dashboard</h3><p className="text-sm text-gray-400">Platform performance and user insights</p></div>
                    <div className="flex bg-gray-900 p-1 rounded-lg border border-gray-800 self-start md:self-auto">{timeFilters.map((filter) => (<button key={filter} onClick={() => setTimeRange(filter)} className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${timeRange === filter ? "bg-emerald-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}>{filter}</button>))}</div>
                  </div>
                  {/* --- REAL DATA INTEGRATED INTO STAT CARDS --- */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Total Users" value={platformStats.totalUsers} subValue="+12.5%" icon={Users} colorClass="text-emerald-400" />
                    <StatCard title="Active Traders" value={platformStats.activeUsers} subValue="+8.2%" icon={Activity} colorClass="text-emerald-400" />
                    <StatCard title="Suspended" value={platformStats.suspendedUsers} subValue="+2" icon={Ban} colorClass="text-red-400" />
                    <StatCard title="Total Balance" value={platformStats.totalBalance} subValue="+5%" icon={Wallet} colorClass="text-yellow-400" />
                  </div>
                </section>
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-6"><ChartPlaceholder title="Revenue Overview" label="Revenue chart visualization" icon={BarChart3} color="text-emerald-500" /><ChartPlaceholder title="User Growth" label="User growth chart" icon={LineChart} color="text-blue-500" /></section>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><div className="bg-gray-900 rounded-lg border border-gray-800 p-6"><h3 className="text-lg font-bold text-white mb-6">Recent Activity</h3><div className="space-y-4"><ActivityItem icon={UserIcon} title="New user registered" sub="John Smith" time="2 min ago" color="bg-emerald-500" /><ActivityItem icon={DollarSign} title="Large trade executed: $50,000" sub="Sarah Johnson" time="5 min ago" color="bg-yellow-500" /><ActivityItem icon={Wallet} title="Withdrawal request: $10,000" sub="Mike Chen" time="8 min ago" color="bg-blue-500" /></div></div><div className="bg-gray-900 rounded-lg border border-gray-800 p-6"><h3 className="text-lg font-bold text-white mb-6">Top Traders</h3><div className="space-y-2"><TopTraderRow rank={1} name="Alex Thompson" trades="156" winRate="92" profit="$45,230" /><TopTraderRow rank={2} name="Maria Garcia" trades="134" winRate="89" profit="$38,920" /></div></div></div>
              </>
            )}

            {/* --- ANALYTICS TAB --- */}
            {activeTab === "Analytics" && (
              <>
                <section>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white">Analytics Dashboard</h3>
                      <p className="text-sm text-gray-400">Platform performance and user insights</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex bg-gray-900 p-1 rounded-lg border border-gray-800">
                        {timeFilters.map((filter) => (
                          <button key={filter} onClick={() => setTimeRange(filter)} className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${timeRange === filter ? "bg-emerald-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}>{filter}</button>
                        ))}
                      </div>
                      <button onClick={handleExportReport} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"><Download size={14} /> Export Data</button>
                    </div>
                  </div>
                  {/* --- REAL DATA INTEGRATED INTO ANALYTICS STAT CARDS --- */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Total Users" value={platformStats.totalUsers} subValue="+12.5%" icon={Users} colorClass="text-emerald-400" />
                    <StatCard title="Active Traders" value={platformStats.activeUsers} subValue="+8.2%" icon={Activity} colorClass="text-emerald-400" />
                    <StatCard title="Total Trades" value={platformStats.totalTrades} subValue="+15.7%" icon={BarChart3} colorClass="text-yellow-400" />
                    <StatCard title="Total Balance" value={platformStats.totalBalance} subValue="+22.1%" icon={Wallet} colorClass="text-purple-400" />
                  </div>
                </section>
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ChartPlaceholder title="Revenue Overview" label="Revenue chart visualization" icon={BarChart3} color="text-emerald-500" />
                  <ChartPlaceholder title="User Growth" label="User growth chart" icon={LineChart} color="text-blue-500" />
                </section>
                <section>
                    <h3 className="text-lg font-bold text-white mb-4">Trading Statistics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <TradingStatCard title="Arbitrage Trades" totalTrades="1,247" profit="+$12,847" icon={ArrowUpRight} color="bg-emerald-500" />
                      <TradingStatCard title="Futures Trades" totalTrades="892" profit="+$8,920" icon={TrendingUp} color="bg-blue-500" />
                      <TradingStatCard title="Forex Trades" totalTrades="456" profit="+$4,560" icon={Activity} color="bg-purple-500" />
                    </div>
                </section>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-900 rounded-lg border border-gray-800 p-6"><h3 className="text-lg font-bold text-white mb-6">Recent Activity</h3><div className="space-y-4"><ActivityItem icon={UserIcon} title="New user registered" sub="John Smith" time="2 min ago" color="bg-emerald-500" /><ActivityItem icon={DollarSign} title="Large trade executed: $50,000" sub="Sarah Johnson" time="5 min ago" color="bg-yellow-500" /><ActivityItem icon={Wallet} title="Withdrawal request: $10,000" sub="Mike Chen" time="8 min ago" color="bg-blue-500" /><ActivityItem icon={AlertTriangle} title="High volume detected on BTC/USDT" sub="System Alert" time="12 min ago" color="bg-red-500" /></div></div>
                  <div className="bg-gray-900 rounded-lg border border-gray-800 p-6"><h3 className="text-lg font-bold text-white mb-6">Top Traders</h3><div className="space-y-2"><TopTraderRow rank={1} name="Alex Thompson" trades="156" winRate="92" profit="$45,230" /><TopTraderRow rank={2} name="Maria Garcia" trades="134" winRate="89" profit="$38,920" /><TopTraderRow rank={3} name="David Kim" trades="98" winRate="87" profit="$32,150" /><TopTraderRow rank={4} name="Emma Wilson" trades="112" winRate="85" profit="$28,740" /></div></div>
                </div>
              </>
            )}

            {/* --- USER MANAGEMENT TAB --- */}
            {activeTab === "Users" && (
              <>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div><h3 className="text-xl font-bold text-white">User Management</h3><p className="text-sm text-gray-400">Manage user accounts and permissions</p></div>
                  <button onClick={() => setIsAddUserOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"><Plus size={18} /> Add New User</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard title="Total Users" value={userStats.total} icon={Users} colorClass="text-blue-400" />
                  <StatCard title="Active Users" value={userStats.active} icon={CheckCircle} colorClass="text-emerald-400" />
                  <StatCard title="Pending Verification" value={userStats.pending} icon={AlertTriangle} colorClass="text-yellow-400" />
                  <StatCard title="Suspended" value={userStats.suspended} icon={Ban} colorClass="text-red-400" />
                </div>
                <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="relative w-full md:w-96"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} /><input type="text" placeholder="Search users by name or email..." className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:border-emerald-500 focus:outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                  <div className="flex bg-gray-800 rounded-lg p-1">{["All", "Active", "Pending", "Suspended"].map((status) => (<button key={status} onClick={() => setFilterStatus(status)} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${filterStatus === status ? "bg-emerald-600 text-white" : "text-gray-400 hover:text-white"}`}>{status}</button>))}</div>
                </div>
                <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-800/50 border-b border-gray-800">
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Balance</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Trades</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Join Date</th>
                          <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {isLoadingUsers ? (
                          <tr>
                            <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                              <div className="flex justify-center items-center gap-2">
                                <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                Loading users...
                              </div>
                            </td>
                          </tr>
                        ) : filteredUsers.length === 0 ? (
                          <tr>
                             <td colSpan={6} className="px-6 py-10 text-center text-gray-400">No users found matching your criteria.</td>
                          </tr>
                        ) : (
                          filteredUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-800/30 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-emerald-900/50 text-emerald-500 flex items-center justify-center font-bold border border-emerald-500/20">{user.name.charAt(0)}</div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-white">{user.name}</div>
                                  <div className="text-sm text-gray-500 flex items-center gap-1">{user.email}{user.verified && <CheckCircle size={12} className="text-emerald-500" />}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={user.status} /></td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{user.balance}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{user.trades}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{user.joinDate}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end gap-2">
                                <button 
                                  onClick={() => handleUserAction(user.id, user.status)}
                                  className={`${user.status === 'Suspended' ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'} hover:opacity-80 px-3 py-1 rounded text-xs`}
                                >
                                  {user.status === 'Suspended' ? 'Activate' : 'Suspend'}
                                </button>
                                <button className="text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded text-xs">Edit</button>
                              </div>
                            </td>
                          </tr>
                        )))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4">
                    <button 
                        disabled={userPage === 1} 
                        onClick={() => setUserPage(p => p - 1)}
                        className="text-xs px-3 py-1 bg-gray-800 rounded disabled:opacity-50 text-gray-300 hover:text-white"
                    >
                        Previous
                    </button>
                    <span className="text-xs text-gray-500">Page {userPage}</span>
                    <button 
                        onClick={() => setUserPage(p => p + 1)}
                        className="text-xs px-3 py-1 bg-gray-800 rounded text-gray-300 hover:text-white"
                    >
                        Next
                    </button>
                </div>
              </>
            )}
            
            {/* --- PAYMENT GATEWAY TAB --- */}
            {activeTab === "Payments" && (
              <>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div><h3 className="text-xl font-bold text-white">Payment Gateway Settings</h3><p className="text-sm text-gray-400">Configure payment methods and wallet addresses</p></div>
                    <button onClick={handleSaveSettings} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-emerald-900/20"><Save size={18} /> Save All Settings</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Total Volume" value="$2.4M" subValue="+12.5%" icon={DollarSign} colorClass="text-emerald-400" />
                    <StatCard title="Successful" value="1,247" subValue="+8.2%" icon={CheckCircle} colorClass="text-emerald-400" />
                    <StatCard title="Failed Transactions" value="23" subValue="-15.3%" icon={X} colorClass="text-red-400" />
                    <StatCard title="Pending Proofs" value="12" subValue="+5.1%" icon={AlertTriangle} colorClass="text-yellow-400" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div onClick={() => setActiveGateway('stripe')} className={`p-6 rounded-lg border cursor-pointer transition-all ${activeGateway === 'stripe' ? 'bg-gray-800 border-emerald-500 ring-1 ring-emerald-500' : 'bg-gray-900 border-gray-800 hover:bg-gray-800'}`}><div className="flex justify-between items-start mb-4"><div className="bg-blue-600/20 p-2 rounded-lg"><CreditCard className="text-blue-500" size={24} /></div><span className={`text-xs font-medium px-2 py-1 rounded ${gateways.stripe.enabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-gray-700 text-gray-400'}`}>{gateways.stripe.enabled ? 'Enabled' : 'Disabled'}</span></div><h4 className="text-lg font-bold text-white">Stripe</h4><p className="text-sm text-gray-400 mt-1">Credit/Debit Card payments</p></div>
                    <div onClick={() => setActiveGateway('paypal')} className={`p-6 rounded-lg border cursor-pointer transition-all ${activeGateway === 'paypal' ? 'bg-gray-800 border-emerald-500 ring-1 ring-emerald-500' : 'bg-gray-900 border-gray-800 hover:bg-gray-800'}`}><div className="flex justify-between items-start mb-4"><div className="bg-blue-400/20 p-2 rounded-lg"><CreditCard className="text-blue-400" size={24} /></div><span className={`text-xs font-medium px-2 py-1 rounded ${gateways.paypal.enabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-gray-700 text-gray-400'}`}>{gateways.paypal.enabled ? 'Enabled' : 'Disabled'}</span></div><h4 className="text-lg font-bold text-white">PayPal</h4><p className="text-sm text-gray-400 mt-1">PayPal account payments</p></div>
                    <div onClick={() => setActiveGateway('crypto')} className={`p-6 rounded-lg border cursor-pointer transition-all ${activeGateway === 'crypto' ? 'bg-gray-800 border-emerald-500 ring-1 ring-emerald-500' : 'bg-gray-900 border-gray-800 hover:bg-gray-800'}`}><div className="flex justify-between items-start mb-4"><div className="bg-orange-500/20 p-2 rounded-lg"><Coins className="text-orange-500" size={24} /></div><span className={`text-xs font-medium px-2 py-1 rounded ${gateways.crypto.enabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-gray-700 text-gray-400'}`}>{gateways.crypto.enabled ? 'Enabled' : 'Disabled'}</span></div><h4 className="text-lg font-bold text-white">Cryptocurrency</h4><p className="text-sm text-gray-400 mt-1">BTC, ETH, USDT, and more</p></div>
                  </div>
                  <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                    {activeGateway === 'stripe' && (<div className="space-y-6"><div className="flex items-center justify-between border-b border-gray-800 pb-4"><div><h3 className="text-lg font-bold text-white">Stripe Configuration</h3></div><div className="flex items-center gap-2"><span className="text-sm text-gray-400">Enable Stripe</span><Switch checked={gateways.stripe.enabled} onChange={(v) => setGateways({...gateways, stripe: {...gateways.stripe, enabled: v}})} /></div></div><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><label className="block text-sm font-medium text-gray-400 mb-2">Public Key</label><input type="text" className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:border-emerald-500 outline-none" defaultValue={gateways.stripe.publicKey} /></div><div><label className="block text-sm font-medium text-gray-400 mb-2">Secret Key</label><input type="password" className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:border-emerald-500 outline-none" placeholder="sk_test_..." /></div><div><label className="block text-sm font-medium text-gray-400 mb-2">Webhook Secret</label><input type="password" className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:border-emerald-500 outline-none" placeholder="whsec_..." /></div><div><label className="block text-sm font-medium text-gray-400 mb-2">Default Currency</label><div className="flex gap-2"><select className="flex-1 bg-gray-800 border border-gray-700 rounded p-2 text-white focus:border-emerald-500 outline-none">{currencies.map(c => <option key={c}>{c}</option>)}</select><div className="relative group"><input type="text" placeholder="Add" className="w-20 bg-gray-800 border border-gray-700 rounded-l p-2 text-white text-sm focus:border-emerald-500 outline-none" value={newCurrency} onChange={e => setNewCurrency(e.target.value.toUpperCase())} /><button onClick={handleAddCurrency} className="absolute right-0 top-0 h-full px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-r"><Plus size={14} /></button></div></div></div></div></div>)}
                    {activeGateway === 'paypal' && (<div className="space-y-6"><div className="flex items-center justify-between border-b border-gray-800 pb-4"><div><h3 className="text-lg font-bold text-white">PayPal Configuration</h3></div><div className="flex items-center gap-2"><span className="text-sm text-gray-400">Enable PayPal</span><Switch checked={gateways.paypal.enabled} onChange={(v) => setGateways({...gateways, paypal: {...gateways.paypal, enabled: v}})} /></div></div><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><label className="block text-sm font-medium text-gray-400 mb-2">Client ID</label><input type="text" className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:border-emerald-500 outline-none" placeholder="Enter Client ID" /></div><div><label className="block text-sm font-medium text-gray-400 mb-2">Client Secret</label><input type="password" className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:border-emerald-500 outline-none" placeholder="Enter Client Secret" /></div><div className="md:col-span-2"><label className="block text-sm font-medium text-gray-400 mb-2">Environment</label><select className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:border-emerald-500 outline-none"><option>Sandbox</option><option>Production</option></select></div></div></div>)}
                    {activeGateway === 'crypto' && (<div className="space-y-6"><div className="flex items-center justify-between border-b border-gray-800 pb-4"><div><h3 className="text-lg font-bold text-white">Cryptocurrency Configuration</h3></div><div className="flex items-center gap-2"><span className="text-sm text-gray-400">Enable Cryptocurrency</span><Switch checked={gateways.crypto.enabled} onChange={(v) => setGateways({...gateways, crypto: {...gateways.crypto, enabled: v}})} /></div></div><div className="flex gap-4 border-b border-gray-800"><button onClick={() => setCryptoTab('wallets')} className={`pb-2 px-1 text-sm font-medium transition-colors ${cryptoTab === 'wallets' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-gray-400 hover:text-white'}`}>Wallet Addresses</button><button onClick={() => setCryptoTab('proofs')} className={`pb-2 px-1 text-sm font-medium transition-colors ${cryptoTab === 'proofs' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-gray-400 hover:text-white'}`}>Payment Proofs</button></div>{cryptoTab === 'wallets' && (<><div className="flex justify-between items-center"><h4 className="text-white font-bold">Manage Wallet Addresses</h4><button onClick={() => setIsAddWalletOpen(true)} className="text-xs bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded border border-gray-700 flex items-center gap-1"><Plus size={14} /> Add Wallet</button></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{wallets.map(wallet => (<div key={wallet.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 relative group"><div className="flex items-center gap-3 mb-4"><div className={`w-10 h-10 rounded-full ${wallet.color} flex items-center justify-center text-white font-bold`}>{wallet.name[0]}</div><div><h5 className="text-white font-medium">{wallet.name}</h5><span className="text-xs text-gray-400">{wallet.network}</span></div></div><div className="bg-gray-900 p-2 rounded border border-gray-800 mb-2"><p className="text-xs text-gray-400 break-all font-mono">{wallet.address}</p></div><div className="flex justify-center py-2"><div className="bg-white p-1 rounded"><QrCode size={64} className="text-black" /></div></div><button className="absolute top-2 right-2 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button></div>))}</div></>)}{cryptoTab === 'proofs' && (<><div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="text-xs text-gray-400 uppercase bg-gray-800/50"><tr><th className="px-4 py-3">Proof ID</th><th className="px-4 py-3">User</th><th className="px-4 py-3">Crypto</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Actions</th></tr></thead><tbody className="divide-y divide-gray-800">{paymentProofs.map(proof => (<tr key={proof.id} className="hover:bg-gray-800/30"><td className="px-4 py-3 font-medium text-white">{proof.id}</td><td className="px-4 py-3 text-gray-300">{proof.user}</td><td className="px-4 py-3 text-gray-300">{proof.crypto}</td><td className="px-4 py-3 text-emerald-400">{proof.amount}</td><td className="px-4 py-3"><StatusBadge status={proof.status} /></td><td className="px-4 py-3 text-gray-500">{proof.date}</td><td className="px-4 py-3"><div className="flex gap-2"><button className="px-2 py-1 bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30 rounded text-xs font-medium">Approve</button><button className="px-2 py-1 bg-red-500/20 text-red-500 hover:bg-red-500/30 rounded text-xs font-medium">Reject</button><button className="px-2 py-1 bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 rounded text-xs font-medium">View</button></div></td></tr>))}</tbody></table></div><div className="mt-4 pt-4 border-t border-gray-800"><h4 className="text-sm font-medium text-gray-400 mb-3">Supported Networks</h4><div className="flex gap-2 mb-6">{["BTC", "ETH", "USDT", "BNB", "ADA", "SOL"].map(net => (<button key={net} className="px-4 py-2 bg-gray-800 border border-gray-700 hover:border-emerald-500 rounded text-sm text-gray-300 hover:text-white transition-all">{net}</button>))}</div><div className="grid grid-cols-2 gap-4"><div><label className="text-xs text-gray-500 mb-1 block">Minimum Deposit ($)</label><input type="number" defaultValue={10} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white text-sm" /></div><div><label className="text-xs text-gray-500 mb-1 block">Maximum Deposit ($)</label><input type="number" defaultValue={50000} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white text-sm" /></div></div></div></>)}</div>)}
                  </div>
                  <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden"><div className="p-4 flex justify-between items-center border-b border-gray-800"><h3 className="text-lg font-bold text-white">Recent Transactions</h3><button className="text-sm text-emerald-500 hover:text-emerald-400 flex items-center gap-1"><ArrowUpRight size={14} /> View All Transactions</button></div><div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="text-xs text-gray-400 uppercase bg-gray-800/50"><tr><th className="px-6 py-3">Transaction ID</th><th className="px-6 py-3">User</th><th className="px-6 py-3">Type</th><th className="px-6 py-3">Method</th><th className="px-6 py-3">Amount</th><th className="px-6 py-3">Fee</th><th className="px-6 py-3">Status</th><th className="px-6 py-3">Date</th><th className="px-6 py-3">Proof</th></tr></thead><tbody className="divide-y divide-gray-800">{recentTransactions.map(tx => (<tr key={tx.id} className="hover:bg-gray-800/30"><td className="px-6 py-4 font-medium text-white">{tx.id}</td><td className="px-6 py-4 text-gray-300">{tx.user}</td><td className="px-6 py-4 text-gray-400">{tx.type}</td><td className="px-6 py-4 text-gray-300">{tx.method}</td><td className="px-6 py-4 text-emerald-400 font-medium">{tx.amount}</td><td className="px-6 py-4 text-gray-400">{tx.fee}</td><td className="px-6 py-4"><StatusBadge status={tx.status} /></td><td className="px-6 py-4 text-gray-500">{tx.date}</td><td className="px-6 py-4">{tx.proof ? <button className="text-blue-400 hover:text-blue-300 text-xs">View Proof</button> : <span className="text-gray-600 text-xs">N/A</span>}</td></tr>))}</tbody></table></div></div>
              </>
            )}
            
            {/* --- TRADING TAB --- */}
            {activeTab === "Trading" && (
              <>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div><h3 className="text-xl font-bold text-white">Trading Settings</h3><p className="text-sm text-gray-400">Configure trading parameters and risk management</p></div>
                  <button onClick={handleSaveSettings} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-emerald-900/20"><Save size={18} /> Save All Settings</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard title="Active Strategies" value="24" icon={Zap} colorClass="text-blue-400" />
                  <StatCard title="Total Volume" value="$12.4M" icon={DollarSign} colorClass="text-emerald-400" />
                  <StatCard title="Success Rate" value="87.5%" icon={TrendingUp} colorClass="text-yellow-400" />
                  <StatCard title="Risk Score" value="Low" icon={Shield} colorClass="text-emerald-400" />
                </div>
                <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                  <div className="flex border-b border-gray-800 overflow-x-auto">
                    {["Arbitrage", "Futures", "Forex", "Risk Management"].map(tab => (
                      <button 
                        key={tab} 
                        onClick={() => setTradingTab(tab)}
                        className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${tradingTab === tab ? 'border-emerald-500 text-emerald-500 bg-emerald-500/5' : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800'}`}
                      >
                        {tab === 'Arbitrage' && <Activity size={16} />}
                        {tab === 'Futures' && <TrendingUp size={16} />}
                        {tab === 'Forex' && <Globe size={16} />}
                        {tab === 'Risk Management' && <Shield size={16} />}
                        {tab}
                      </button>
                    ))}
                  </div>
                  <div className="p-6">
                    {tradingTab === "Arbitrage" && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between"><div><h4 className="text-lg font-bold text-white">Arbitrage Trading</h4><p className="text-sm text-gray-400">Configure cross-exchange arbitrage parameters</p></div><Switch checked={tradingConfig.arbitrage.enabled} onChange={v => setTradingConfig({...tradingConfig, arbitrage: {...tradingConfig.arbitrage, enabled: v}})} /></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><label className="block text-sm font-medium text-gray-400 mb-2">Minimum Profit Threshold (%)</label><input type="number" className="w-full bg-gray-800 border border-gray-700 rounded p-2.5 text-white focus:border-emerald-500 outline-none" value={tradingConfig.arbitrage.minProfit} onChange={e => setTradingConfig({...tradingConfig, arbitrage: {...tradingConfig.arbitrage, minProfit: parseFloat(e.target.value)}})} /></div><div><label className="block text-sm font-medium text-gray-400 mb-2">Maximum Position Size ($)</label><input type="number" className="w-full bg-gray-800 border border-gray-700 rounded p-2.5 text-white focus:border-emerald-500 outline-none" value={tradingConfig.arbitrage.maxPosition} onChange={e => setTradingConfig({...tradingConfig, arbitrage: {...tradingConfig.arbitrage, maxPosition: parseFloat(e.target.value)}})} /></div></div>
                        <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-800"><div><h5 className="text-white font-medium">Auto Execute Trades</h5><p className="text-xs text-gray-400">Automatically execute arbitrage opportunities when threshold is met</p></div><Switch checked={tradingConfig.arbitrage.autoExecute} onChange={v => setTradingConfig({...tradingConfig, arbitrage: {...tradingConfig.arbitrage, autoExecute: v}})} /></div>
                        <div><label className="block text-sm font-medium text-gray-400 mb-3">Supported Exchanges</label><div className="flex flex-wrap gap-3">{allExchanges.map(ex => (<button key={ex} onClick={() => toggleItem('arbitrage', 'exchanges', ex)} className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${tradingConfig.arbitrage.exchanges.includes(ex) ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'}`}>{ex}</button>))}</div></div>
                      </div>
                    )}
                    {tradingTab === "Futures" && (
                      <div className="space-y-6">
                          <div className="flex items-center justify-between"><div><h4 className="text-lg font-bold text-white">Futures Trading</h4><p className="text-sm text-gray-400">Configure leverage and margin requirements</p></div><Switch checked={tradingConfig.futures.enabled} onChange={v => setTradingConfig({...tradingConfig, futures: {...tradingConfig.futures, enabled: v}})} /></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><label className="block text-sm font-medium text-gray-400 mb-2">Maximum Leverage</label><select className="w-full bg-gray-800 border border-gray-700 rounded p-2.5 text-white focus:border-emerald-500 outline-none" value={tradingConfig.futures.leverage} onChange={e => setTradingConfig({...tradingConfig, futures: {...tradingConfig.futures, leverage: e.target.value}})}>{["5x", "10x", "20x", "50x", "100x", "125x"].map(x => <option key={x} value={x}>{x}</option>)}</select></div><div><label className="block text-sm font-medium text-gray-400 mb-2">Margin Requirement (%)</label><input type="number" className="w-full bg-gray-800 border border-gray-700 rounded p-2.5 text-white focus:border-emerald-500 outline-none" value={tradingConfig.futures.margin} onChange={e => setTradingConfig({...tradingConfig, futures: {...tradingConfig.futures, margin: parseFloat(e.target.value)}})} /></div><div className="md:col-span-1"><label className="block text-sm font-medium text-gray-400 mb-2">Liquidation Threshold (%)</label><input type="number" className="w-full bg-gray-800 border border-gray-700 rounded p-2.5 text-white focus:border-emerald-500 outline-none" value={tradingConfig.futures.liquidation} onChange={e => setTradingConfig({...tradingConfig, futures: {...tradingConfig.futures, liquidation: parseFloat(e.target.value)}})} /></div></div>
                        <div><label className="block text-sm font-medium text-gray-400 mb-3">Allowed Trading Pairs</label><div className="grid grid-cols-2 md:grid-cols-4 gap-3">{allPairs.map(pair => (<button key={pair} onClick={() => toggleItem('futures', 'pairs', pair)} className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${tradingConfig.futures.pairs.includes(pair) ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'}`}>{pair}</button>))}</div></div>
                      </div>
                    )}
                    {tradingTab === "Forex" && (
                      <div className="space-y-6">
                          <div className="flex items-center justify-between"><div><h4 className="text-lg font-bold text-white">Forex Trading</h4><p className="text-sm text-gray-400">Configure forex trading parameters and sessions</p></div><Switch checked={tradingConfig.forex.enabled} onChange={v => setTradingConfig({...tradingConfig, forex: {...tradingConfig.forex, enabled: v}})} /></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><label className="block text-sm font-medium text-gray-400 mb-2">Maximum Leverage</label><select className="w-full bg-gray-800 border border-gray-700 rounded p-2.5 text-white focus:border-emerald-500 outline-none" value={tradingConfig.forex.leverage} onChange={e => setTradingConfig({...tradingConfig, forex: {...tradingConfig.forex, leverage: e.target.value}})}>{["50:1", "100:1", "200:1", "500:1"].map(x => <option key={x} value={x}>{x}</option>)}</select></div><div><label className="block text-sm font-medium text-gray-400 mb-2">Spread Markup (pips)</label><input type="number" className="w-full bg-gray-800 border border-gray-700 rounded p-2.5 text-white focus:border-emerald-500 outline-none" value={tradingConfig.forex.spread} onChange={e => setTradingConfig({...tradingConfig, forex: {...tradingConfig.forex, spread: parseFloat(e.target.value)}})} /></div></div>
                        <div><h5 className="text-sm font-medium text-gray-400 mb-4">Trading Sessions</h5><div className="space-y-4">{Object.entries(tradingConfig.forex.sessions).map(([session, times]) => (<div key={session} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"><div className="text-white font-medium capitalize pb-2 md:pb-0">{session} Session</div><div><label className="text-xs text-gray-500 mb-1 block">Start Time</label><div className="relative"><Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" /><input type="time" className="w-full bg-gray-800 border border-gray-700 rounded p-2 pl-10 text-white text-sm focus:border-emerald-500 outline-none" value={times.start} onChange={(e) => { const newSessions = {...tradingConfig.forex.sessions, [session]: {...times, start: e.target.value}}; setTradingConfig({...tradingConfig, forex: {...tradingConfig.forex, sessions: newSessions}}); }} /></div></div><div><label className="text-xs text-gray-500 mb-1 block">End Time</label><div className="relative"><Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" /><input type="time" className="w-full bg-gray-800 border border-gray-700 rounded p-2 pl-10 text-white text-sm focus:border-emerald-500 outline-none" value={times.end} onChange={(e) => { const newSessions = {...tradingConfig.forex.sessions, [session]: {...times, end: e.target.value}}; setTradingConfig({...tradingConfig, forex: {...tradingConfig.forex, sessions: newSessions}}); }} /></div></div></div>))}</div></div>
                      </div>
                    )}
                    {tradingTab === "Risk Management" && (
                      <div className="space-y-6">
                        <div><h4 className="text-lg font-bold text-white">Risk Management</h4><p className="text-sm text-gray-400">Configure global risk parameters and limits</p></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><label className="block text-sm font-medium text-gray-400 mb-2">Maximum Daily Loss ($)</label><input type="number" className="w-full bg-gray-800 border border-gray-700 rounded p-2.5 text-white focus:border-emerald-500 outline-none" value={tradingConfig.risk.maxDailyLoss} onChange={e => setTradingConfig({...tradingConfig, risk: {...tradingConfig.risk, maxDailyLoss: parseFloat(e.target.value)}})} /></div><div><label className="block text-sm font-medium text-gray-400 mb-2">Max Positions Per User</label><input type="number" className="w-full bg-gray-800 border border-gray-700 rounded p-2.5 text-white focus:border-emerald-500 outline-none" value={tradingConfig.risk.maxPositions} onChange={e => setTradingConfig({...tradingConfig, risk: {...tradingConfig.risk, maxPositions: parseFloat(e.target.value)}})} /></div></div>
                        <div className="space-y-4 pt-4 border-t border-gray-800"><div className="flex items-center justify-between"><div><h5 className="text-white font-medium">Require Stop Loss</h5><p className="text-xs text-gray-400">Force users to set stop loss on all trades</p></div><Switch checked={tradingConfig.risk.requireStopLoss} onChange={v => setTradingConfig({...tradingConfig, risk: {...tradingConfig.risk, requireStopLoss: v}})} /></div><div className="flex items-center justify-between"><div><h5 className="text-white font-medium">Require Take Profit</h5><p className="text-xs text-gray-400">Force users to set take profit on all trades</p></div><Switch checked={tradingConfig.risk.requireTakeProfit} onChange={v => setTradingConfig({...tradingConfig, risk: {...tradingConfig.risk, requireTakeProfit: v}})} /></div></div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* --- SECURITY TAB --- */}
            {activeTab === "Security" && (
              <>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                   <div><h3 className="text-xl font-bold text-white">Security Settings</h3><p className="text-sm text-gray-400">Configure security policies and monitoring</p></div>
                   <button onClick={handleSaveSettings} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-emerald-900/20"><Save size={18} /> Save All Settings</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard title="Security Score" value="98%" icon={Shield} colorClass="text-emerald-400" />
                  <StatCard title="Active Sessions" value="1,234" icon={Users} colorClass="text-blue-400" />
                  <StatCard title="Blocked Attempts" value="45" icon={Ban} colorClass="text-red-400" />
                  <StatCard title="API Requests" value="12.4K" icon={Code} colorClass="text-purple-400" />
                </div>
                <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                  <div className="flex border-b border-gray-800 overflow-x-auto">
                    {["Authentication", "API Security", "Monitoring", "Security Logs"].map(tab => (
                      <button key={tab} onClick={() => setSecurityTab(tab)} className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${securityTab === tab ? 'border-emerald-500 text-emerald-500 bg-emerald-500/5' : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800'}`}>{tab === 'Authentication' && <Lock size={16} />}{tab === 'API Security' && <Code size={16} />}{tab === 'Monitoring' && <Eye size={16} />}{tab === 'Security Logs' && <FileText size={16} />}{tab}</button>
                    ))}
                  </div>
                  <div className="p-6">
                    {securityTab === "Authentication" && (<div className="space-y-6"><h4 className="text-white font-medium mb-4">Two-Factor Authentication</h4><div className="flex items-center justify-between pb-4 border-b border-gray-800"><div><h5 className="text-sm text-white font-medium">Enable 2FA</h5><p className="text-xs text-gray-400">Allow users to enable two-factor authentication</p></div><Switch checked={securityConfig.auth.enable2FA} onChange={v => setSecurityConfig({...securityConfig, auth: {...securityConfig.auth, enable2FA: v}})} /></div><div className="flex items-center justify-between pb-4 border-b border-gray-800"><div><h5 className="text-sm text-white font-medium">Require 2FA</h5><p className="text-xs text-gray-400">Force all users to enable 2FA</p></div><Switch checked={securityConfig.auth.require2FA} onChange={v => setSecurityConfig({...securityConfig, auth: {...securityConfig.auth, require2FA: v}})} /></div><h4 className="text-white font-medium mt-6 mb-4">Login Security</h4><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><label className="block text-xs text-gray-400 mb-1">Max Login Attempts</label><input type="number" className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white text-sm focus:border-emerald-500 outline-none" value={securityConfig.auth.maxLoginAttempts} onChange={e => setSecurityConfig({...securityConfig, auth: {...securityConfig.auth, maxLoginAttempts: parseInt(e.target.value)}})} /></div><div><label className="block text-xs text-gray-400 mb-1">Lockout Duration (minutes)</label><input type="number" className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white text-sm focus:border-emerald-500 outline-none" value={securityConfig.auth.lockoutDuration} onChange={e => setSecurityConfig({...securityConfig, auth: {...securityConfig.auth, lockoutDuration: parseInt(e.target.value)}})} /></div><div><label className="block text-xs text-gray-400 mb-1">Session Timeout (hours)</label><input type="number" className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white text-sm focus:border-emerald-500 outline-none" value={securityConfig.auth.sessionTimeout} onChange={e => setSecurityConfig({...securityConfig, auth: {...securityConfig.auth, sessionTimeout: parseInt(e.target.value)}})} /></div><div className="flex items-end justify-between h-full pb-2"><div><label className="block text-xs text-white font-medium">Strong Password Required</label><p className="text-[10px] text-gray-500">Enforce strong password policy</p></div><Switch checked={securityConfig.auth.strongPassword} onChange={v => setSecurityConfig({...securityConfig, auth: {...securityConfig.auth, strongPassword: v}})} /></div></div></div>)}
                    {securityTab === "API Security" && (<div className="space-y-6"><h4 className="text-white font-medium mb-4">API Rate Limiting</h4><div className="flex items-center justify-between pb-4"><div><h5 className="text-sm text-white font-medium">Enable Rate Limiting</h5><p className="text-xs text-gray-400">Limit API requests per user</p></div><Switch checked={securityConfig.api.rateLimiting} onChange={v => setSecurityConfig({...securityConfig, api: {...securityConfig.api, rateLimiting: v}})} /></div><div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end"><div><label className="block text-xs text-gray-400 mb-1">Requests Per Minute</label><input type="number" className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white text-sm focus:border-emerald-500 outline-none" value={securityConfig.api.reqPerMin} onChange={e => setSecurityConfig({...securityConfig, api: {...securityConfig.api, reqPerMin: parseInt(e.target.value)}})} /></div><div className="flex items-center justify-between bg-gray-800/50 p-2 rounded border border-gray-800"><div><h5 className="text-sm text-white font-medium">Require API Key</h5><p className="text-xs text-gray-400">Force API key authentication</p></div><Switch checked={securityConfig.api.requireApiKey} onChange={v => setSecurityConfig({...securityConfig, api: {...securityConfig.api, requireApiKey: v}})} /></div></div><h4 className="text-white font-medium mt-6 mb-4">IP Whitelist</h4><div><label className="block text-xs text-gray-400 mb-1">Allowed IP Addresses</label><textarea className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white text-sm focus:border-emerald-500 outline-none h-24" placeholder="Enter IP addresses, one per line..." value={securityConfig.api.ipWhitelist} onChange={e => setSecurityConfig({...securityConfig, api: {...securityConfig.api, ipWhitelist: e.target.value}})}></textarea><button className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded transition-colors">Add IP Address</button></div></div>)}
                    {securityTab === "Monitoring" && (<div className="space-y-6"><h4 className="text-white font-medium mb-4">Activity Monitoring</h4><div className="space-y-4"><div className="flex items-center justify-between pb-4 border-b border-gray-800"><div><h5 className="text-sm text-white font-medium">Suspicious Activity Detection</h5><p className="text-xs text-gray-400">Monitor for unusual user behavior</p></div><Switch checked={securityConfig.monitoring.suspiciousDetection} onChange={v => setSecurityConfig({...securityConfig, monitoring: {...securityConfig.monitoring, suspiciousDetection: v}})} /></div><div className="flex items-center justify-between pb-4 border-b border-gray-800"><div><h5 className="text-sm text-white font-medium">Large Transaction Alerts</h5><p className="text-xs text-gray-400">Alert on transactions above threshold</p></div><Switch checked={securityConfig.monitoring.largeTxAlerts} onChange={v => setSecurityConfig({...securityConfig, monitoring: {...securityConfig.monitoring, largeTxAlerts: v}})} /></div><div className="flex items-center justify-between pb-4 border-b border-gray-800"><div><h5 className="text-sm text-white font-medium">Multiple Login Alerts</h5><p className="text-xs text-gray-400">Alert on simultaneous logins</p></div><Switch checked={securityConfig.monitoring.multiLoginAlerts} onChange={v => setSecurityConfig({...securityConfig, monitoring: {...securityConfig.monitoring, multiLoginAlerts: v}})} /></div></div><div><label className="block text-xs text-gray-400 mb-1">Alert Threshold ($)</label><input type="number" className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white text-sm focus:border-emerald-500 outline-none" value={securityConfig.monitoring.alertThreshold} onChange={e => setSecurityConfig({...securityConfig, monitoring: {...securityConfig.monitoring, alertThreshold: parseInt(e.target.value)}})} /></div></div>)}
                    {securityTab === "Security Logs" && (<div className="space-y-4"><div className="flex justify-between items-center mb-4"><h4 className="text-white font-medium">Security Event Logs</h4><div className="flex gap-2"><button className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded border border-gray-700"><Download size={12} /> Export Logs</button><button className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs rounded border border-red-500/20"><Trash2 size={12} /> Clear Logs</button></div></div><div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="text-xs text-gray-400 uppercase bg-gray-800/50"><tr><th className="px-4 py-3">Severity</th><th className="px-4 py-3">Event</th><th className="px-4 py-3">User</th><th className="px-4 py-3">Timestamp</th><th className="px-4 py-3">Action Taken</th></tr></thead><tbody className="divide-y divide-gray-800">{securityLogs.map(log => (<tr key={log.id} className="hover:bg-gray-800/30"><td className="px-4 py-3"><SeverityBadge level={log.severity} /></td><td className="px-4 py-3 text-white font-medium">{log.event}</td><td className="px-4 py-3 text-gray-400">{log.user}</td><td className="px-4 py-3 text-gray-500">{log.timestamp}</td><td className={`px-4 py-3 ${log.actionColor}`}>{log.action}</td></tr>))}</tbody></table></div></div>)}
                  </div>
                </div>
              </>
            )}

            {/* --- SYSTEM SETTINGS TAB --- */}
            {activeTab === "Settings" && (
              <>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                   <div><h3 className="text-xl font-bold text-white">System Settings</h3><p className="text-sm text-gray-400">Configure platform settings and system preferences</p></div>
                   <div className="flex gap-2">
                     <button onClick={handleRestartSystem} className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors border border-gray-700"><RefreshCw size={18} /> Restart System</button>
                     <button onClick={handleSaveSettings} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-emerald-900/20"><Save size={18} /> Save Settings</button>
                   </div>
                </div>

                {/* System Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard title="Server Uptime" value="99.9%" icon={Server} colorClass="text-emerald-400" />
                  <StatCard title="CPU Usage" value="45%" icon={Cpu} colorClass="text-blue-400" />
                  <StatCard title="Memory Usage" value="62%" icon={HardDrive} colorClass="text-yellow-400" />
                  <StatCard title="Storage Used" value="78%" icon={Database} colorClass="text-purple-400" />
                </div>

                <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                  {/* Sub Navigation */}
                  <div className="flex border-b border-gray-800 overflow-x-auto">
                    {["General", "Notifications", "Performance", "Backup & Recovery"].map(tab => (
                      <button key={tab} onClick={() => setSystemTab(tab)} className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${systemTab === tab ? 'border-emerald-500 text-emerald-500 bg-emerald-500/5' : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800'}`}>{tab === 'General' && <Settings size={16} />}{tab === 'Notifications' && <Bell size={16} />}{tab === 'Performance' && <Zap size={16} />}{tab === 'Backup & Recovery' && <Database size={16} />}{tab}</button>
                    ))}
                  </div>

                  <div className="p-6">
                    {/* General Tab */}
                    {systemTab === "General" && (
                      <div className="space-y-6">
                        <h4 className="text-white font-medium mb-4">Site Configuration</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div><label className="block text-xs text-gray-400 mb-1">Site Name</label><input type="text" className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white text-sm focus:border-emerald-500 outline-none" value={systemConfig.general.siteName} onChange={e => setSystemConfig({...systemConfig, general: {...systemConfig.general, siteName: e.target.value}})} /></div>
                          <div><label className="block text-xs text-gray-400 mb-1">Site Description</label><input type="text" className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white text-sm focus:border-emerald-500 outline-none" value={systemConfig.general.siteDesc} onChange={e => setSystemConfig({...systemConfig, general: {...systemConfig.general, siteDesc: e.target.value}})} /></div>
                        </div>
                        <h4 className="text-white font-medium mt-6 mb-4">Platform Controls</h4>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between"><div><h5 className="text-sm text-white font-medium">Maintenance Mode</h5><p className="text-xs text-gray-400">Temporarily disable platform access</p></div><Switch checked={systemConfig.general.maintenance} onChange={v => setSystemConfig({...systemConfig, general: {...systemConfig.general, maintenance: v}})} /></div>
                          <div className="flex items-center justify-between"><div><h5 className="text-sm text-white font-medium">User Registration</h5><p className="text-xs text-gray-400">Allow new user registrations</p></div><Switch checked={systemConfig.general.registration} onChange={v => setSystemConfig({...systemConfig, general: {...systemConfig.general, registration: v}})} /></div>
                          <div className="flex items-center justify-between"><div><h5 className="text-sm text-white font-medium">Email Verification Required</h5><p className="text-xs text-gray-400">Require email verification for new accounts</p></div><Switch checked={systemConfig.general.emailVerify} onChange={v => setSystemConfig({...systemConfig, general: {...systemConfig.general, emailVerify: v}})} /></div>
                        </div>
                      </div>
                    )}

                    {/* Notifications Tab */}
                    {systemTab === "Notifications" && (
                      <div className="space-y-6">
                        <h4 className="text-white font-medium mb-4">Notification Preferences</h4>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between"><div><h5 className="text-sm text-white font-medium">Email Notifications</h5><p className="text-xs text-gray-400">Send notifications via email</p></div><Switch checked={systemConfig.notifications.email} onChange={v => setSystemConfig({...systemConfig, notifications: {...systemConfig.notifications, email: v}})} /></div>
                          <div className="flex items-center justify-between"><div><h5 className="text-sm text-white font-medium">SMS Notifications</h5><p className="text-xs text-gray-400">Send notifications via SMS</p></div><Switch checked={systemConfig.notifications.sms} onChange={v => setSystemConfig({...systemConfig, notifications: {...systemConfig.notifications, sms: v}})} /></div>
                          <div className="flex items-center justify-between"><div><h5 className="text-sm text-white font-medium">Push Notifications</h5><p className="text-xs text-gray-400">Send browser push notifications</p></div><Switch checked={systemConfig.notifications.push} onChange={v => setSystemConfig({...systemConfig, notifications: {...systemConfig.notifications, push: v}})} /></div>
                          <div className="flex items-center justify-between"><div><h5 className="text-sm text-white font-medium">Trading Alerts</h5><p className="text-xs text-gray-400">Send trading-related notifications</p></div><Switch checked={systemConfig.notifications.trading} onChange={v => setSystemConfig({...systemConfig, notifications: {...systemConfig.notifications, trading: v}})} /></div>
                          <div className="flex items-center justify-between"><div><h5 className="text-sm text-white font-medium">System Alerts</h5><p className="text-xs text-gray-400">Send system maintenance notifications</p></div><Switch checked={systemConfig.notifications.system} onChange={v => setSystemConfig({...systemConfig, notifications: {...systemConfig.notifications, system: v}})} /></div>
                        </div>
                      </div>
                    )}

                    {/* Performance Tab */}
                    {systemTab === "Performance" && (
                      <div className="space-y-6">
                        <h4 className="text-white font-medium mb-4">Performance Optimization</h4>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between"><div><h5 className="text-sm text-white font-medium">Enable Caching</h5><p className="text-xs text-gray-400">Cache frequently accessed data</p></div><Switch checked={systemConfig.performance.caching} onChange={v => setSystemConfig({...systemConfig, performance: {...systemConfig.performance, caching: v}})} /></div>
                          <div className="flex items-center justify-between"><div><h5 className="text-sm text-white font-medium">Enable Compression</h5><p className="text-xs text-gray-400">Compress responses to reduce bandwidth</p></div><Switch checked={systemConfig.performance.compression} onChange={v => setSystemConfig({...systemConfig, performance: {...systemConfig.performance, compression: v}})} /></div>
                          <div className="flex items-center justify-between"><div><h5 className="text-sm text-white font-medium">Enable CDN</h5><p className="text-xs text-gray-400">Use content delivery network</p></div><Switch checked={systemConfig.performance.cdn} onChange={v => setSystemConfig({...systemConfig, performance: {...systemConfig.performance, cdn: v}})} /></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                          <div><label className="block text-xs text-gray-400 mb-1">Max Concurrent Users</label><input type="number" className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white text-sm focus:border-emerald-500 outline-none" value={systemConfig.performance.maxUsers} onChange={e => setSystemConfig({...systemConfig, performance: {...systemConfig.performance, maxUsers: parseInt(e.target.value)}})} /></div>
                          <div><label className="block text-xs text-gray-400 mb-1">Session Timeout (hours)</label><input type="number" className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white text-sm focus:border-emerald-500 outline-none" value={systemConfig.performance.sessionTimeout} onChange={e => setSystemConfig({...systemConfig, performance: {...systemConfig.performance, sessionTimeout: parseInt(e.target.value)}})} /></div>
                        </div>
                      </div>
                    )}

                    {/* Backup & Recovery Tab */}
                    {systemTab === "Backup & Recovery" && (
                      <div className="space-y-6">
                        <h4 className="text-white font-medium mb-4">Backup Configuration</h4>
                        <div className="flex items-center justify-between mb-6"><div><h5 className="text-sm text-white font-medium">Auto Backup</h5><p className="text-xs text-gray-400">Automatically backup system data</p></div><Switch checked={systemConfig.backup.auto} onChange={v => setSystemConfig({...systemConfig, backup: {...systemConfig.backup, auto: v}})} /></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <div><label className="block text-xs text-gray-400 mb-1">Backup Frequency</label><select className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white text-sm focus:border-emerald-500 outline-none" value={systemConfig.backup.frequency} onChange={e => setSystemConfig({...systemConfig, backup: {...systemConfig.backup, frequency: e.target.value}})}><option>Hourly</option><option>Daily</option><option>Weekly</option></select></div>
                          <div><label className="block text-xs text-gray-400 mb-1">Retention Period (days)</label><input type="number" className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white text-sm focus:border-emerald-500 outline-none" value={systemConfig.backup.retention} onChange={e => setSystemConfig({...systemConfig, backup: {...systemConfig.backup, retention: parseInt(e.target.value)}})} /></div>
                        </div>
                        <div className="flex gap-4 mb-8">
                          <button onClick={handleCreateBackup} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded transition-colors text-sm font-medium"><Cloud size={16} /> Create Backup Now</button>
                          <button onClick={handleRestoreBackup} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors text-sm font-medium"><RotateCcw size={16} /> Restore from Backup</button>
                        </div>
                        <h4 className="text-white font-medium mb-4">Recent Backups</h4>
                        <div className="space-y-3">
                          {backups.map(backup => (
                            <div key={backup.id} className="flex items-center justify-between bg-gray-800/50 p-4 rounded border border-gray-800">
                              <div className="flex items-center gap-4">
                                <div className="bg-emerald-500/20 p-2 rounded"><Check size={16} className="text-emerald-500" /></div>
                                <div><h5 className="text-sm text-white font-medium">{backup.name}</h5><p className="text-xs text-gray-400">{backup.date}</p></div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-white font-bold">{backup.size}</p>
                                <p className="text-xs text-emerald-400">{backup.status}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

          </div>
        </main>
      </div>
    </>
  );
};

export default Admin;