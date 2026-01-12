import React, { useState, useEffect } from "react";
import { Link } from "wouter";
// Import Framer Motion
import { motion, Variants } from "framer-motion";
import { 
  Zap, 
  TrendingUp, 
  DollarSign, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Menu, 
  X,
  Activity,
  ShieldCheck,
  Globe
} from "lucide-react";

// --- TYPES & INTERFACES ---
interface FeatureItem {
  title: string;
  icon: React.ReactNode;
  color: string;
  items: string[];
}

interface StatItem {
  label: string;
  value: string;
  icon: React.ReactNode;
}

// --- ANIMATION VARIANTS ---
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: "easeOut" } 
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
};

const scaleOnHover: Variants = {
  hover: { scale: 1.05, transition: { duration: 0.3 } },
  tap: { scale: 0.98 }
};

// --- DATA CONFIGURATION ---
const FEATURES: FeatureItem[] = [
  {
    title: "Arbitrage Engine",
    icon: <Zap className="w-6 h-6 text-emerald-400" />,
    color: "emerald",
    items: ['15+ Supported Exchanges', 'Real-time Scanning', 'Cross-exchange & Triangular', 'Automated Execution']
  },
  {
    title: "Futures Trading",
    icon: <TrendingUp className="w-6 h-6 text-blue-400" />,
    color: "blue",
    items: ['Up to 10x Leverage', 'Integrated Risk Controls', 'Dynamic SL/TP', 'Margin Management']
  },
  {
    title: "Forex Strategies",
    icon: <DollarSign className="w-6 h-6 text-purple-400" />,
    color: "purple",
    items: ['ICT/SMC Methodology', 'Liquidity Zone Detection', 'Automated Order Blocks', 'Precision Entry/Exit']
  }
];

const STATS: StatItem[] = [
  { label: "Uptime", value: "99.99%", icon: <Activity className="w-4 h-4 text-emerald-500" /> },
  { label: "Volume Traded", value: "$12M+", icon: <DollarSign className="w-4 h-4 text-emerald-500" /> },
  { label: "Active Users", value: "2,400+", icon: <Globe className="w-4 h-4 text-emerald-500" /> },
  { label: "Security", value: "Audited", icon: <ShieldCheck className="w-4 h-4 text-emerald-500" /> },
];

const TICKER_ITEMS: string[] = ["BTC/USDT +1.2%", "ETH/USDT +0.8%", "SOL/USDT +2.1%", "XRP/USDT -0.4%", "BNB/USDT +0.5%", "ADA/USDT +1.1%"];

function LandingPage() {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const tradingBackgroundUrl = "/images/trading.png"; 

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // FIXED: Added type annotation for 'id'
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 antialiased font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      
      {/* CSS Animations for continuous background movement */}
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 20s linear infinite;
        }
        @keyframes blob-float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob-float 20s infinite ease-in-out alternate;
        }
      `}</style>

      {/* --- FLOATING NAVBAR --- */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-gray-950/80 backdrop-blur-md border-b border-white/5 py-4" : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-2">
             <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.5 }} className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center border border-emerald-500/50">
                <Zap className="w-5 h-5 text-emerald-400 fill-emerald-400" />
             </motion.div>
             <span className="text-xl font-extrabold tracking-widest text-white">GAT</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('features-section')} className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Features</button>
            <button onClick={() => scrollToSection('pricing-section')} className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Pricing</button>
            <div className="h-4 w-px bg-gray-700"></div>
            <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Login</Link>
            <Link href="/register">
              <motion.button whileHover="hover" whileTap="tap" variants={scaleOnHover} className="px-5 py-2 text-sm font-bold bg-white text-gray-950 rounded-full hover:bg-emerald-400 transition-colors">
                Get Started
              </motion.button>
            </Link>
          </div>

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
            <button onClick={() => scrollToSection('features-section')} className="text-left text-gray-300 py-2">Features</button>
            <button onClick={() => scrollToSection('pricing-section')} className="text-left text-gray-300 py-2">Pricing</button>
            <Link href="/login" className="text-gray-300 py-2">Login</Link>
            <Link href="/register" className="bg-emerald-600 text-white text-center py-3 rounded-lg font-bold">Sign Up Now</Link>
           </div>
        </motion.div>
      </motion.nav>

      {/* --- HERO SECTION --- */}
      <main className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gray-950/90 z-10" />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[128px] opacity-50 z-0 animate-blob" style={{ animationDelay: "0s" }} />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px] opacity-30 z-0 animate-blob" style={{ animationDelay: "5s" }} />
            <div 
              className="absolute inset-0 z-0 opacity-40 mix-blend-overlay"
              style={{ backgroundImage: `url(${tradingBackgroundUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            />
        </div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center"
        >
          
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/30 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide uppercase mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
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
              <motion.button whileHover="hover" whileTap="tap" variants={scaleOnHover} className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-lg font-bold bg-emerald-500 text-gray-950 rounded-lg hover:bg-emerald-400 transition-colors shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                Start Trading Now 
                <ArrowRight className="w-5 h-5 ml-2" />
              </motion.button>
            </Link>
            <motion.button 
              whileHover="hover" whileTap="tap" variants={scaleOnHover}
              onClick={() => scrollToSection('features-section')}
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-lg font-bold bg-white/5 text-white border border-white/10 rounded-lg hover:bg-white/10 transition-colors backdrop-blur-sm"
            >
              Explore Features
            </motion.button>
          </motion.div>

          <motion.div 
             variants={staggerContainer}
             initial="hidden"
             animate="visible"
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
      </main>

      {/* --- LIVE TICKER --- */}
      <div className="bg-gray-900 border-y border-gray-800 overflow-hidden py-3 relative flex">
         <div className="flex animate-scroll whitespace-nowrap">
           {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
             <span key={i} className="mx-8 text-sm font-mono text-emerald-400 flex items-center gap-2">
               <TrendingUp className="w-3 h-3" /> {item}
             </span>
           ))}
         </div>
      </div>
      
      {/* --- FEATURES SECTION --- */}
      <section id="features-section" className="py-24 bg-gray-950 relative">
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
              <motion.div 
                key={idx} 
                variants={fadeInUp}
                whileHover={{ y: -5 }} 
                className={`group bg-gray-900/40 backdrop-blur-sm p-8 rounded-3xl border border-gray-800 hover:border-${feature.color}-500/50 transition-colors duration-300 relative overflow-hidden`}
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-${feature.color}-500/10 blur-[50px] rounded-full group-hover:bg-${feature.color}-500/20 transition-colors duration-500`} />

                <div className="w-14 h-14 bg-gray-800 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300 border border-gray-700 relative z-10">
                  {feature.icon}
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-4 relative z-10">{feature.title}</h3>
                
                <ul className="space-y-3 text-gray-400 relative z-10">
                  {feature.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-medium">
                      <CheckCircle2 className={`w-4 h-4 text-${feature.color}-500 flex-shrink-0`} /> 
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- PRICING SECTION --- */}
      <section id="pricing-section" className="py-24 bg-gray-950 border-t border-gray-900 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-900/20 blur-[100px] rounded-full -z-10 animate-blob" style={{ animationDuration: '25s' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true }}
             variants={fadeInUp}
             className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-gray-400">Join the elite traders today.</p>
          </motion.div>

          <motion.div 
             variants={staggerContainer}
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true, margin: "-50px" }}
             className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto"
          >
            {/* Monthly Card */}
            <motion.div variants={fadeInUp} className="bg-gray-900/80 rounded-3xl p-8 sm:p-12 border border-gray-800 hover:border-gray-600 transition-all">
              <h3 className="text-xl font-bold text-gray-300 mb-2">Monthly Access</h3>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-4xl sm:text-5xl font-extrabold text-white">$299</span>
                <span className="text-gray-500">/mo</span>
              </div>
              
              <ul className="space-y-4 mb-10 text-gray-300">
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-gray-500" /> Automated Arbitrage</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-gray-500" /> Futures Trading Access</li>
                <li className="flex items-center gap-3 text-gray-600"><XCircle className="w-5 h-5" /> Priority Support</li>
              </ul>
              
              <Link href="/login">
                <motion.button whileHover="hover" whileTap="tap" variants={scaleOnHover} className="w-full py-4 rounded-xl bg-gray-800 text-white font-bold hover:bg-gray-700 transition-colors border border-gray-700">
                   Get Started
                </motion.button>
              </Link>
            </motion.div>

            {/* Annual Card */}
            <motion.div 
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
              className="bg-gray-900/80 rounded-3xl p-8 sm:p-12 border-2 border-emerald-500/50 relative overflow-hidden shadow-2xl shadow-emerald-900/20 transition-all"
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
                <motion.button whileHover="hover" whileTap="tap" variants={scaleOnHover} className="w-full py-4 rounded-xl bg-emerald-500 text-gray-950 font-bold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/25">
                   Start Annual Plan
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
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
          </div>
          <div>
            &copy; {new Date().getFullYear()} Godslove Automated Trading.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;