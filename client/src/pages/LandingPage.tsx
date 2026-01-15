import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, type Variants } from "framer-motion";
import { 
  Zap, TrendingUp, DollarSign, CheckCircle2, XCircle, 
  ArrowRight, Menu, X, Activity, ShieldCheck, Globe
} from "lucide-react";
import { cn } from "@/lib/utils"; // Ensure you have this utility

// --- TYPES ---
type ColorTheme = "emerald" | "blue" | "purple";

interface FeatureItem {
  title: string;
  icon: React.ReactNode;
  theme: ColorTheme;
  items: string[];
}

interface StatItem {
  label: string;
  value: string;
  icon: React.ReactNode;
}

// --- CONFIGURATION ---
const COLOR_VARIANTS: Record<ColorTheme, { border: string, bg: string, iconBg: string, text: string }> = {
  emerald: {
    border: "group-hover:border-emerald-500/50",
    bg: "group-hover:bg-emerald-500/10",
    iconBg: "text-emerald-400",
    text: "text-emerald-500"
  },
  blue: {
    border: "group-hover:border-blue-500/50",
    bg: "group-hover:bg-blue-500/10",
    iconBg: "text-blue-400",
    text: "text-blue-500"
  },
  purple: {
    border: "group-hover:border-purple-500/50",
    bg: "group-hover:bg-purple-500/10",
    iconBg: "text-purple-400",
    text: "text-purple-500"
  }
};

const FEATURES: FeatureItem[] = [
  {
    title: "Arbitrage Engine",
    icon: <Zap className="w-6 h-6" />,
    theme: "emerald",
    items: ['15+ Supported Exchanges', 'Real-time Scanning', 'Cross-exchange & Triangular', 'Automated Execution']
  },
  {
    title: "Futures Trading",
    icon: <TrendingUp className="w-6 h-6" />,
    theme: "blue",
    items: ['Up to 10x Leverage', 'Integrated Risk Controls', 'Dynamic SL/TP', 'Margin Management']
  },
  {
    title: "Forex Strategies",
    icon: <DollarSign className="w-6 h-6" />,
    theme: "purple",
    items: ['ICT/SMC Methodology', 'Liquidity Zone Detection', 'Automated Order Blocks', 'Precision Entry/Exit']
  }
];

const STATS: StatItem[] = [
  { label: "Uptime", value: "99.99%", icon: <Activity className="w-4 h-4 text-emerald-500" /> },
  { label: "Volume Traded", value: "$12M+", icon: <DollarSign className="w-4 h-4 text-emerald-500" /> },
  { label: "Active Users", value: "2,400+", icon: <Globe className="w-4 h-4 text-emerald-500" /> },
  { label: "Security", value: "Audited", icon: <ShieldCheck className="w-4 h-4 text-emerald-500" /> },
];

const TICKER_ITEMS = ["BTC/USDT +1.2%", "ETH/USDT +0.8%", "SOL/USDT +2.1%", "XRP/USDT -0.4%", "BNB/USDT +0.5%", "ADA/USDT +1.1%"];

// --- ANIMATIONS ---
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};

// --- SUB-COMPONENTS ---

const FeatureCard = ({ feature }: { feature: FeatureItem }) => {
  const colors = COLOR_VARIANTS[feature.theme];
  
  return (
    <motion.div 
      variants={fadeInUp}
      whileHover={{ y: -5 }} 
      className={cn(
        "group bg-gray-900/40 backdrop-blur-sm p-8 rounded-3xl border border-gray-800 transition-all duration-300 relative overflow-hidden",
        colors.border
      )}
    >
      {/* Background Glow */}
      <div className={cn("absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full transition-colors duration-500 opacity-0 group-hover:opacity-100", colors.bg)} />

      <div className="w-14 h-14 bg-gray-800 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300 border border-gray-700 relative z-10">
        <div className={colors.iconBg}>{feature.icon}</div>
      </div>
      
      <h3 className="text-2xl font-bold text-white mb-4 relative z-10">{feature.title}</h3>
      
      <ul className="space-y-3 text-gray-400 relative z-10">
        {feature.items.map((item, i) => (
          <li key={i} className="flex items-center gap-3 text-sm font-medium">
            <CheckCircle2 className={cn("w-4 h-4 flex-shrink-0", colors.text)} /> 
            {item}
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

const Ticker = () => {
  return (
    <div className="bg-gray-900 border-y border-gray-800 overflow-hidden py-3 relative flex">
      <motion.div 
        className="flex whitespace-nowrap"
        animate={{ x: [0, -1000] }}
        transition={{ repeat: Infinity, ease: "linear", duration: 25 }}
      >
        {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
          <span key={i} className="mx-8 text-sm font-mono text-emerald-400 flex items-center gap-2">
            <TrendingUp className="w-3 h-3" /> {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
};

// --- MAIN COMPONENT ---

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      
      {/* --- NAVBAR --- */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled ? "bg-gray-950/80 backdrop-blur-md border-b border-white/5 py-4" : "bg-transparent py-6"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
             <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center border border-emerald-500/50">
                <Zap className="w-5 h-5 text-emerald-400 fill-emerald-400" />
             </div>
             <span className="text-xl font-extrabold tracking-widest text-white">GAT</span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('features')} className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Features</button>
            <button onClick={() => scrollToSection('pricing')} className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Pricing</button>
            <div className="h-4 w-px bg-gray-700" />
            <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Login</Link>
            <Link href="/register">
              <button className="px-5 py-2 text-sm font-bold bg-white text-gray-950 rounded-full hover:bg-emerald-400 transition-colors">
                Get Started
              </button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-gray-300" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <motion.div 
           initial={false}
           animate={mobileMenuOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
           className="md:hidden overflow-hidden bg-gray-950 border-b border-gray-800 absolute top-full left-0 right-0 shadow-2xl"
        >
           <div className="p-4 flex flex-col gap-4">
            <button onClick={() => scrollToSection('features')} className="text-left text-gray-300 py-2">Features</button>
            <button onClick={() => scrollToSection('pricing')} className="text-left text-gray-300 py-2">Pricing</button>
            <Link href="/login" className="text-gray-300 py-2">Login</Link>
            <Link href="/register" className="bg-emerald-600 text-white text-center py-3 rounded-lg font-bold">Sign Up Now</Link>
           </div>
        </motion.div>
      </motion.nav>

      {/* --- HERO --- */}
      <main className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden min-h-[90vh] flex items-center">
        {/* Animated Background Blobs (Replaces CSS Animation) */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-gray-950/90 z-10" />
            <motion.div 
              animate={{ x: [0, 30, 0], y: [0, -50, 0], scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
              className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[128px] opacity-50 z-0" 
            />
            <motion.div 
              animate={{ x: [0, -30, 0], y: [0, 50, 0], scale: [1, 0.9, 1] }}
              transition={{ repeat: Infinity, duration: 12, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px] opacity-30 z-0" 
            />
            {/* Optional: Add a static subtle grid background pattern here if desired */}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/30 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide uppercase mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              System Operational
            </motion.div>

            <motion.h1 variants={fadeInUp} className="text-5xl sm:text-6xl md:text-8xl font-extrabold tracking-tight mb-6 text-white leading-tight">
              Institutional Grade <br />
              <span className="bg-gradient-to-r from-emerald-400 via-emerald-200 to-teal-500 text-transparent bg-clip-text">
                Automated Trading
              </span>
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Stop watching charts. Start profiting. Advanced arbitrage, futures leverage, and ICT strategies executed with millisecond precision.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-center gap-4 w-full max-w-md mx-auto sm:max-w-none mb-16">
              <Link href="/register">
                <button className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-lg font-bold bg-emerald-500 text-gray-950 rounded-lg hover:bg-emerald-400 transition-all shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)]">
                  Start Trading Now 
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </Link>
              <button 
                onClick={() => scrollToSection('features')}
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-lg font-bold bg-white/5 text-white border border-white/10 rounded-lg hover:bg-white/10 transition-colors backdrop-blur-sm"
              >
                Explore Features
              </button>
            </motion.div>

            <motion.div 
               variants={staggerContainer}
               className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto border-t border-gray-800 pt-8"
            >
              {STATS.map((stat, i) => (
                <motion.div variants={fadeInUp} key={i} className="flex flex-col items-center">
                  <div className="flex items-center gap-2 mb-1 text-gray-400 text-xs uppercase tracking-widest font-semibold">
                    {stat.icon} {stat.label}
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </main>

      <Ticker />
      
      {/* --- FEATURES --- */}
      <section id="features" className="py-24 bg-gray-950 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true, margin: "-100px" }}
             variants={fadeInUp}
             className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">
              Engineered for <span className="text-emerald-500">Alpha</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
               Our infrastructure handles the complexity so you can focus on the results.
            </p>
          </motion.div>

          <motion.div 
             variants={staggerContainer}
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true, margin: "-100px" }}
             className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {FEATURES.map((feature, idx) => (
              <FeatureCard key={idx} feature={feature} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- PRICING --- */}
      <section id="pricing" className="py-24 bg-gray-950 border-t border-gray-900 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true }}
             variants={fadeInUp}
             className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">
              Transparent Pricing
            </h2>
            <p className="text-gray-400">Join the elite traders today.</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
            {/* Monthly */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gray-900/80 rounded-3xl p-8 sm:p-12 border border-gray-800 hover:border-gray-600 transition-all"
            >
              <h3 className="text-xl font-bold text-gray-300 mb-2">Monthly Access</h3>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-4xl sm:text-5xl font-extrabold text-white">$299</span>
                <span className="text-gray-500">/mo</span>
              </div>
              <ul className="space-y-4 mb-10 text-gray-300">
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Automated Arbitrage</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Futures Trading Access</li>
                <li className="flex items-center gap-3 text-gray-600"><XCircle className="w-5 h-5" /> Priority Support</li>
              </ul>
              <Link href="/login">
                <button className="w-full py-4 rounded-xl bg-gray-800 text-white font-bold hover:bg-gray-700 transition-colors border border-gray-700">
                   Get Started
                </button>
              </Link>
            </motion.div>

            {/* Annual */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gray-900/80 rounded-3xl p-8 sm:p-12 border-2 border-emerald-500/50 relative overflow-hidden shadow-2xl shadow-emerald-900/20"
            >
              <div className="absolute top-0 right-0 bg-emerald-500 text-gray-950 text-xs font-black px-4 py-2 rounded-bl-xl">
                BEST VALUE
              </div>
              <h3 className="text-xl font-bold text-emerald-400 mb-2">Annual License</h3>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-4xl sm:text-5xl font-extrabold text-white">$2,999</span>
                <span className="text-gray-500">/yr</span>
              </div>
              <ul className="space-y-4 mb-10 text-gray-300">
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-400" /> All Monthly Features</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-400" /> <span className="text-white font-bold">2 Months Free</span></li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-400" /> Priority Support</li>
              </ul>
              <Link href="/login">
                <button className="w-full py-4 rounded-xl bg-emerald-500 text-gray-950 font-bold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/25">
                   Start Annual Plan
                </button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 bg-black text-gray-500 text-sm border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
             <div className="w-6 h-6 bg-emerald-900 rounded-md flex items-center justify-center">
                <Zap className="w-3 h-3 text-emerald-400" />
             </div>
             <span className="font-bold text-gray-300">GAT</span>
          </div>
          <div className="flex gap-8">
             <Link href="/terms" className="hover:text-emerald-400 transition-colors">Terms</Link>
             <Link href="/privacy" className="hover:text-emerald-400 transition-colors">Privacy</Link>
             <Link href="/support" className="hover:text-emerald-400 transition-colors">Support</Link>
             <Link href="/admin-login" className="hover:text-emerald-400 transition-colors">Admin</Link>
          </div>
          <div>
            &copy; {new Date().getFullYear()} Godslove Automated Trading.
          </div>
        </div>
      </footer>
    </div>
  );
}