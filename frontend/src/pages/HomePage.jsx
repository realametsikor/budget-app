// src/pages/HomePage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Wallet, ShieldCheck, PieChart, Target, ArrowRight, 
  CreditCard, BarChart3, Lock, CheckCircle2, ChevronRight 
} from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  // Add blur to navbar on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 overflow-x-hidden selection:bg-[#D4AF37] selection:text-black" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500;1,600&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />

      {/* ── AMBIENT BACKGROUND GLOWS ── */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#D4AF37]/5 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#D4AF37]/5 blur-[120px] pointer-events-none" />

      {/* ── NAVIGATION ── */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "py-4 bg-[#050505]/80 backdrop-blur-md border-b border-white/5 shadow-2xl" : "py-6 bg-transparent border-transparent"}`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo(0, 0)}>
            <div className="w-8 h-8 rounded flex items-center justify-center bg-gradient-to-br from-[#D4AF37] to-[#B5952F] text-black shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-transform group-hover:scale-105">
              <Wallet size={16} strokeWidth={2.5} />
            </div>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.25rem", fontWeight: 600, color: "#fff", letterSpacing: "0.5px" }}>BudgetTracker</span>
          </div>
          
          <div className="hidden md:flex items-center gap-10 text-sm font-medium text-gray-400">
            <a href="#features" className="hover:text-[#D4AF37] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#D4AF37] transition-colors">How it works</a>
            <a href="#security" className="hover:text-[#D4AF37] transition-colors">Security</a>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => navigate("/login")} className="hidden sm:block text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Sign in
            </button>
            <button
              onClick={() => navigate("/register")}
              className="text-sm px-6 py-2.5 rounded-full font-semibold bg-white text-black hover:bg-[#D4AF37] transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(212,175,55,0.4)]"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-32 px-6 flex flex-col items-center text-center max-w-7xl mx-auto">
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-8 text-xs font-medium text-gray-300">
          <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
          The new standard for personal finance
        </div>

        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(3rem, 8vw, 6rem)", fontWeight: 500, lineHeight: 1.05, color: "#fff", letterSpacing: "-0.02em" }}>
          Master your money with<br />
          <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB]">quiet confidence.</span>
        </h1>

        <p className="mt-8 text-lg md:text-xl max-w-2xl text-gray-400 font-light leading-relaxed">
          A deeply personal, elegantly designed financial dashboard. Built to give you absolute clarity over your income, expenses, and wealth creation.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button
            onClick={() => navigate("/register")}
            className="group px-8 py-4 rounded-full font-semibold text-black bg-gradient-to-r from-[#D4AF37] to-[#B5952F] flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-[0_0_30px_rgba(212,175,55,0.25)]"
          >
            Create free account <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* ── HERO APP PREVIEW (CSS MOCKUP) ── */}
        <div className="mt-24 w-full max-w-5xl relative perspective-1000">
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-10 top-1/2" />
          <div className="rounded-2xl md:rounded-[2rem] border border-white/10 bg-[#0A0A0A]/80 backdrop-blur-xl shadow-2xl overflow-hidden transform translate-y-4 hover:translate-y-0 transition-transform duration-700">
            {/* Mockup Header */}
            <div className="h-12 border-b border-white/5 flex items-center px-6 gap-2 bg-white/5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            {/* Mockup Body */}
            <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-1 md:col-span-2 rounded-xl border border-white/5 bg-white/5 p-6">
                <div className="w-32 h-4 rounded bg-white/10 mb-8" />
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center justify-between border-b border-white/5 pb-4">
                      <div className="flex gap-4 items-center">
                        <div className="w-10 h-10 rounded-full bg-white/5" />
                        <div className="space-y-2">
                          <div className="w-24 h-3 rounded bg-white/20" />
                          <div className="w-16 h-2 rounded bg-white/10" />
                        </div>
                      </div>
                      <div className="w-20 h-4 rounded bg-white/10" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-span-1 space-y-6">
                <div className="rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-6 relative overflow-hidden">
                  <div className="w-24 h-3 rounded bg-[#D4AF37]/40 mb-4" />
                  <div className="w-32 h-8 rounded bg-[#D4AF37]/80 mb-2" />
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-xl translate-x-1/2 -translate-y-1/2" />
                </div>
                <div className="rounded-xl border border-white/5 bg-white/5 p-6 h-48 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full border-[12px] border-white/5 border-t-[#D4AF37] border-r-[#D4AF37]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BENTO BOX FEATURES ── */}
      <section id="features" className="py-32 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="mb-20">
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 500, color: "#fff" }}>
            Precision tools for<br />
            <span className="italic text-[#D4AF37]">disciplined</span> wealth building.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bento Item 1 - Large */}
          <div className="md:col-span-2 rounded-3xl p-8 md:p-12 border border-white/10 bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/0 to-[#D4AF37]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-[#D4AF37] mb-8 border border-white/5">
              <PieChart size={24} strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-4">Zero-Based Budgeting</h3>
            <p className="text-gray-400 leading-relaxed max-w-md">
              Assign every cedi a job before the month begins. Compare your planned budget against actual spending in real-time, side by side.
            </p>
          </div>

          {/* Bento Item 2 - Small */}
          <div className="rounded-3xl p-8 border border-white/10 bg-gradient-to-b from-white/5 to-transparent">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white mb-6 border border-white/5">
              <Target size={20} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Goal Tracking</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Isolate your liquidity funds, stock purchases, and emergency savings from your daily spending.
            </p>
          </div>

          {/* Bento Item 3 - Small */}
          <div className="rounded-3xl p-8 border border-white/10 bg-gradient-to-b from-white/5 to-transparent">
            <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] mb-6 border border-[#D4AF37]/20">
              <CreditCard size={20} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Bill Defenses</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Log fixed bills like Wi-Fi, dues, and utilities. Never get caught off guard by an auto-renewal again.
            </p>
          </div>

          {/* Bento Item 4 - Large */}
          <div className="md:col-span-2 rounded-3xl p-8 md:p-12 border border-white/10 bg-gradient-to-tr from-white/5 to-transparent">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white mb-8 border border-white/5">
              <BarChart3 size={24} strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-4">Live Cash Flow Analytics</h3>
            <p className="text-gray-400 leading-relaxed max-w-md">
              Beautiful, distraction-free charts that explain your financial health in seconds. Instantly see your savings rate and burn rate.
            </p>
          </div>
        </div>
      </section>

      {/* ── SECURITY / TRUST ── */}
      <section id="security" className="py-24 border-t border-white/5 bg-gradient-to-b from-transparent to-white/[0.02]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-white/5 flex items-center justify-center text-[#D4AF37] mb-8 border border-white/10">
            <ShieldCheck size={32} strokeWidth={1.5} />
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 500, color: "#fff" }}>
            Uncompromising Privacy.
          </h2>
          <p className="mt-6 text-gray-400 text-lg leading-relaxed">
            Your financial data is deeply personal. We utilize bank-grade encryption to secure your records. We do not run ads, we do not sell data, and we do not connect to third-party trackers.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <span className="px-4 py-2 rounded-full border border-white/10 text-sm text-gray-300 flex items-center gap-2 bg-white/5">
              <Lock size={14} /> End-to-end isolation
            </span>
            <span className="px-4 py-2 rounded-full border border-white/10 text-sm text-gray-300 flex items-center gap-2 bg-white/5">
              <CheckCircle2 size={14} /> Ad-free experience
            </span>
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="py-32 px-6 border-t border-white/5 relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-[#D4AF37]/5" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 500, color: "#fff", lineHeight: 1.1 }}>
            Ready to design your financial life?
          </h2>
          <div className="mt-12 flex justify-center">
            <button
              onClick={() => navigate("/register")}
              className="group px-10 py-5 rounded-full font-semibold text-black bg-white flex items-center gap-3 transition-all hover:bg-[#D4AF37] hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              Get Started Now <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-6 py-12 border-t border-white/10 bg-[#050505]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <Wallet size={16} />
            <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>BudgetTracker</span>
          </div>
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} BudgetTracker. Crafted for clarity.
          </p>
        </div>
      </footer>
    </div>
  );
}
