import { Link } from "wouter";
import { LogIn, UserPlus, Zap, TrendingUp, DollarSign, CheckCircle2, XCircle, ArrowRight } from "lucide-react";

function LandingPage() {
  // Using a darker placeholder or color fallback in case image is missing
  const tradingBackgroundUrl = "/images/trading.png"; 

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 antialiased font-sans selection:bg-emerald-500/30">
      
      {/* HERO SECTION */}
      {/* Changed min-h-screen to min-h-[90vh] for better mobile initial view */}
      <main 
        className="relative overflow-hidden flex flex-col justify-center pt-24 pb-20 md:pt-32 md:pb-32" 
        style={{ 
          backgroundImage: `url(${tradingBackgroundUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '90vh', // Slightly less than full screen to hint at scroll
        }}
      >
        {/* Overlays */}
        <div className="absolute inset-0 bg-gray-950/90 z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-emerald-900/20 to-gray-950 z-0"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* Branding */}
          <div className="mb-6 sm:mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <h3 
              className="text-5xl sm:text-6xl font-extrabold text-emerald-400 mb-2"
              style={{
                textShadow: '0 0 15px rgba(52, 211, 153, 0.5)',
                letterSpacing: '2px'
              }}
            >
              GAT
            </h3>
            <p className="text-sm sm:text-xl text-gray-400 font-bold tracking-[0.2em] uppercase">
              Godslove Automated Trading
            </p>
          </div>

          {/* Main Heading - Scaled down for mobile (text-4xl) up to desktop (text-7xl) */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight text-white">
            Professional <span className="text-emerald-400 inline-block">Automated</span> Trading
          </h1>
          
          <h2 className="text-lg sm:text-2xl font-medium text-gray-300 mb-8 max-w-3xl mx-auto">
            Advanced algorithmic trading system with institutional-grade tools
          </h2>
          
          <p className="text-base sm:text-lg text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed px-2">
            Experience cutting-edge technology: Arbitrage opportunities, Futures with 10x leverage, and ICT/SMC Forex strategies.
          </p>
          
          {/* Action Buttons - Stacked full width on mobile, side-by-side on desktop */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 w-full max-w-md mx-auto sm:max-w-none">
            <Link href="/login">
              <button className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-lg font-bold bg-emerald-600 text-white rounded-lg shadow-[0_0_20px_rgba(5,150,105,0.4)] hover:bg-emerald-500 hover:scale-105 transition-all duration-300 group">
                Start Trading Now 
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <button 
              onClick={() => document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' })} 
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-lg font-bold border border-emerald-500/50 text-emerald-400 rounded-lg hover:bg-emerald-950/50 transition-all duration-300"
            >
              View Features
            </button>
          </div>

          {/* Links */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 mt-12 text-sm sm:text-base">
            <Link href="/login" className="text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-2 py-2">
              <LogIn className="w-4 h-4" />
              Already a member? Login
            </Link>
            <Link href="/register" className="text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-2 py-2">
              <UserPlus className="w-4 h-4" />
              New User? Sign Up
            </Link>
          </div>
        </div>
      </main>
      
      {/* FEATURES SECTION */}
      <section id="features-section" className="py-16 sm:py-24 bg-gray-950 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">
              Advanced Trading Features
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
                Built for speed, accuracy, and profitability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-900/50 backdrop-blur p-8 rounded-2xl border border-gray-800 hover:border-emerald-500/50 transition-all duration-300 group">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Arbitrage Engine</h3>
              <ul className="space-y-3 text-gray-400">
                {['15+ Supported Exchanges', 'Real-time Scanning', 'Cross-exchange & Triangular', 'Automated Execution'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /> {item}
                    </li>
                ))}
              </ul>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-gray-900/50 backdrop-blur p-8 rounded-2xl border border-gray-800 hover:border-blue-500/50 transition-all duration-300 group">
              <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Futures Trading</h3>
              <ul className="space-y-3 text-gray-400">
                {['Up to 10x Leverage', 'Integrated Risk Controls', 'Dynamic SL/TP', 'Margin Management'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" /> {item}
                    </li>
                ))}
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-900/50 backdrop-blur p-8 rounded-2xl border border-gray-800 hover:border-purple-500/50 transition-all duration-300 group">
              <div className="w-14 h-14 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <DollarSign className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Forex Strategies</h3>
              <ul className="space-y-3 text-gray-400">
                 {['ICT/SMC Methodology', 'Liquidity Zone Detection', 'Automated Order Blocks', 'Precision Entry/Exit'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-purple-500 flex-shrink-0" /> {item}
                    </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section className="py-16 sm:py-24 bg-gray-950 border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">
              Flexible Plans
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
            
            {/* Monthly */}
            <div className="bg-gray-900 rounded-2xl p-8 sm:p-10 border border-gray-800 hover:border-gray-700 transition-colors">
              <h3 className="text-2xl font-bold text-white mb-2">Monthly Plan</h3>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl sm:text-5xl font-extrabold text-emerald-400">$299</span>
                <span className="text-gray-400">/month</span>
              </div>
              
              <ul className="space-y-4 mb-8 text-gray-300">
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Automated Arbitrage</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Futures Trading Access</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Forex Strategies</li>
                <li className="flex items-center gap-3 text-gray-500"><XCircle className="w-5 h-5" /> Priority Support</li>
              </ul>
              
              <Link href="/login">
                <button className="w-full py-4 rounded-xl bg-gray-800 text-white font-bold hover:bg-gray-700 transition-colors border border-gray-700">
                   Start Monthly
                </button>
              </Link>
            </div>

            {/* Annual */}
            <div className="bg-gray-900 rounded-2xl p-8 sm:p-10 border-2 border-emerald-600 relative overflow-hidden">
              <div className="absolute top-5 right-5 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                POPULAR
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2">Annual Plan</h3>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl sm:text-5xl font-extrabold text-emerald-400">$2,999</span>
                <span className="text-gray-400">/year</span>
              </div>

              <ul className="space-y-4 mb-8 text-gray-300">
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> All Monthly Features</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> 2 Months Free</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Priority Support</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Advanced Analytics</li>
              </ul>

              <Link href="/login">
                <button className="w-full py-4 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/20">
                   Start Annual Plan
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-950 border-t border-gray-900 text-gray-500 text-sm text-center px-4">
         &copy; {new Date().getFullYear()} GAT - GODSLOVE AUTOMATED TRADING. All rights reserved.
      </footer>
    </div>
  );
}

export default LandingPage;