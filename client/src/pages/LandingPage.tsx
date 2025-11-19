import { Link } from "wouter";
import { LogIn, UserPlus, Zap, TrendingUp, DollarSign, CheckCircle2, XCircle, ArrowRight } from "lucide-react";

function LandingPage() {
 
  const tradingBackgroundUrl = "/images/trading.png"; 

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 antialiased font-sans">
      {/* Hero Section - Updated with image background, overlay, and moved branding */}
      <main 
        className="relative overflow-hidden pt-24 pb-36 md:pt-36 md:pb-48 bg-cover bg-center" 
        style={{ 
          backgroundImage: `url(${tradingBackgroundUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '100vh',
        }}
      >
        {/* Transparent Green Contrast Overlay */}
        <div className="absolute inset-0 bg-gray-950 opacity-90 z-0"></div>
        <div className="absolute inset-0 bg-emerald-900 opacity-20 z-0"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* STYLISH BRANDING UPDATE */}
          <div className="mb-4">
            <h3 
              className="text-5xl font-extrabold text-emerald-400"
              style={{
                // Custom CSS for a modern, slightly glowing effect
                textShadow: '0 0 10px rgba(52, 211, 153, 0.8), 0 0 20px rgba(52, 211, 153, 0.3)',
                letterSpacing: '2px'
              }}
            >
              GAT
            </h3>
            <p className="text-xl text-gray-400 font-semibold tracking-wider">GODSLOVE AUTOMATED TRADING</p>
          </div>

          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight mb-4 leading-tight text-white">
            Professional <span className="text-emerald-400">Automated</span> Trading Platform
          </h1>
          
          <h2 className="text-2xl font-semibold text-gray-300 mb-6">
            Advanced algorithmic trading system with institutional-grade tools
          </h2>
          
          <p className="text-lg text-gray-400 mb-12 max-w-xl mx-auto">
            Experience cutting-edge trading technology featuring arbitrage opportunities, futures trading with 10x leverage, and sophisticated forex strategies using ICT/SMC methodology. Built for serious traders who demand excellence.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link 
              href="/login" // Confirmed: Redirects to Login
              className="inline-flex items-center justify-center px-10 py-4 text-lg font-semibold bg-emerald-600 text-white rounded-lg shadow-2xl shadow-emerald-700/50 hover:bg-emerald-700 transform hover:scale-105 transition duration-300 gap-2"
            >
              Start Trading Now <ArrowRight className="w-5 h-5" />
            </Link>
            <button 
              onClick={() => { 
                document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' });
              }} 
              className="inline-flex items-center justify-center px-10 py-4 text-lg font-semibold border border-emerald-600 text-emerald-400 rounded-lg shadow-md hover:bg-emerald-900 hover:bg-opacity-20 transition duration-300 gap-2"
            >
              View Features
            </button>
          </div>

          {/* Login/Sign Up links moved from the removed header */}
          <div className="flex justify-center gap-8 mt-12 text-base">
            <Link 
              href="/login" 
              className="text-gray-400 hover:text-emerald-400 transition duration-150 flex items-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              Already a member? Login
            </Link>
            <Link 
              href="/register" 
              className="text-gray-400 hover:text-emerald-400 transition duration-150 flex items-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              New User? Sign Up
            </Link>
          </div>
        </div>
      </main>
      
      {/* Features Section (Content preserved) */}
      <section id="features-section" className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-5xl font-extrabold text-center mb-16 text-white leading-tight">
            Advanced Trading Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* Feature Card 1 */}
            <div className="bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700 hover:border-emerald-500 transform hover:-translate-y-2 transition duration-300">
              <div className="flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-full mb-6 mx-auto">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 text-center">Arbitrage Engine</h3>
              <ul className="text-gray-300 space-y-2 text-lg">
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-400" /> 15+ Supported Exchanges</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-400" /> Real-time Scanning</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-400" /> Cross-exchange & Triangular</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-400" /> Automated Execution</li>
              </ul>
            </div>
            
            {/* Feature Card 2 */}
            <div className="bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700 hover:border-blue-500 transform hover:-translate-y-2 transition duration-300">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-6 mx-auto">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 text-center">Futures Trading</h3>
              <ul className="text-gray-300 space-y-2 text-lg">
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-blue-400" /> Up to 10x Leverage</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-blue-400" /> Integrated Risk Controls</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-blue-400" /> Dynamic Stop-Loss/Take-Profit</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-blue-400" /> Margin Management</li>
              </ul>
            </div>

            {/* Feature Card 3 */}
            <div className="bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700 hover:border-purple-500 transform hover:-translate-y-2 transition duration-300">
              <div className="flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-6 mx-auto">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 text-center">Forex Strategies</h3>
              <ul className="text-gray-300 space-y-2 text-lg">
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-purple-400" /> ICT/SMC Methodology</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-purple-400" /> Liquidity Zone Detection</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-purple-400" /> Automated Order Blocks</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-purple-400" /> Precision Entry/Exit</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section (Content preserved) */}
      <section className="py-20 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-5xl font-extrabold text-center mb-16 text-white leading-tight">
            Flexible Plans for Every Trader
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Monthly Plan */}
            <div className="relative bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700 transform hover:scale-105 transition duration-300">
              <h3 className="text-3xl font-bold text-white mb-4">Monthly Plan</h3>
              <p className="text-5xl font-extrabold text-emerald-500 mb-6">
                $299<span className="text-xl font-normal text-gray-400">/month</span>
              </p>
              <ul className="text-gray-300 space-y-3 mb-8 text-lg">
                <li className="flex items-center gap-3"><CheckCircle2 className="w-6 h-6 text-emerald-400" /> Automated Arbitrage</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-6 h-6 text-emerald-400" /> Futures Trading Access</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-6 h-6 text-emerald-400" /> Forex Strategies</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-6 h-6 text-emerald-400" /> 24/7 Monitoring</li>
                <li className="flex items-center gap-3"><XCircle className="w-6 h-6 text-gray-500" /> Standard Support</li>
                <li className="flex items-center gap-3"><XCircle className="w-6 h-6 text-gray-500" /> 5% Withdrawal Fee</li>
              </ul>
              <Link 
                href="/login" 
                className="w-full inline-flex items-center justify-center px-8 py-4 text-xl font-bold bg-emerald-600 text-white rounded-lg shadow-lg hover:bg-emerald-700 transition duration-300"
              >
                Start Monthly Plan
              </Link>
            </div>

            {/* Annual Plan (Popular) */}
            <div className="relative bg-gray-800 p-8 rounded-xl shadow-2xl border-2 border-emerald-600 transform hover:scale-105 transition duration-300">
              <div className="absolute -top-4 right-4 bg-emerald-600 text-white text-sm font-bold px-4 py-1 rounded-full shadow-md">POPULAR</div>
              <h3 className="text-3xl font-bold text-white mb-4">Annual Plan</h3>
              <p className="text-5xl font-extrabold text-emerald-500 mb-6">
                $2,999<span className="text-xl font-normal text-gray-400">/year</span>
              </p>
              <ul className="text-gray-300 space-y-3 mb-8 text-lg">
                <li className="flex items-center gap-3"><CheckCircle2 className="w-6 h-6 text-emerald-400" /> All Monthly Features</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-6 h-6 text-emerald-400" /> 2 Months Free (Save $598)</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-6 h-6 text-emerald-400" /> Priority Support</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-6 h-6 text-emerald-400" /> Advanced Analytics Suite</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-6 h-6 text-emerald-400" /> 3% Withdrawal Fee</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-6 h-6 text-emerald-400" /> Early Access to New Features</li>
              </ul>
              <Link 
                href="/login" 
                className="w-full inline-flex items-center justify-center px-8 py-4 text-xl font-bold bg-emerald-600 text-white rounded-lg shadow-lg hover:bg-emerald-700 transition duration-300"
              >
                Start Annual Plan
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
          &copy; {new Date().getFullYear()} GAT - GODSLOVE AUTOMATED TRADING. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;