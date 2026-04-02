// src/pages/HomePage.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  Wallet, ShieldCheck, PieChart, Target, ArrowRight, BookOpen,
  CreditCard, BarChart3, Lock, CheckCircle2, ChevronRight, Sun, Moon, Goal, ReceiptText, Users, Award, Zap, TrendingUp, TrendingDown
} from "lucide-react";

const THEMES = {
  dark: {
    bgClass: "bg-[#050505]", meshClass: "mesh-bg-dark",
    navBg: "rgba(5,5,5,0.8)", text: "#f8fafc", textMuted: "#9ca3af",
    card: "rgba(20,20,20,0.65)", cardBorder: "rgba(255,255,255,0.08)", accent: "#D4AF37", accentBg: "rgba(212,175,55,0.1)",
    green: "#34d399", red: "#f87171"
  },
  light: {
    bgClass: "bg-[#f4f4f5]", meshClass: "mesh-bg-light",
    navBg: "rgba(244,244,245,0.8)", text: "#18181b", textMuted: "#71717a",
    card: "rgba(255,255,255,0.75)", cardBorder: "rgba(255,255,255,0.6)", accent: "#4f46e5", accentBg: "rgba(79,70,229,0.1)",
    green: "#10b981", red: "#ef4444"
  }
};

function StarRating({ count }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} style={{ color: "#D4AF37", fontSize: "1rem" }}>★</span>
      ))}
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { user, theme, toggleTheme } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const t = THEMES[theme || "dark"];
  const isDark = theme === "dark";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={`min-h-screen ${t.bgClass} ${t.meshClass} transition-colors duration-700 overflow-x-hidden`} style={{ color: t.text, fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      
      <style>{`
        .glass-card { backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
        
        @keyframes float-1 { 0%, 100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-12px) rotate(-3deg); } }
        @keyframes float-2 { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-8px) scale(1.02); } }
        @keyframes float-3 { 0%, 100% { transform: translateY(0) rotate(2deg); } 50% { transform: translateY(-16px) rotate(3deg); } }
        @keyframes pulse-glow { 0%, 100% { opacity: 0.4; transform: scale(1); } 50% { opacity: 0.7; transform: scale(1.05); } }
        
        .animate-float-1 { animation: float-1 7s ease-in-out infinite; }
        .animate-float-2 { animation: float-2 6s ease-in-out infinite; }
        .animate-float-3 { animation: float-3 8s ease-in-out infinite; }
        .animate-pulse-glow { animation: pulse-glow 4s ease-in-out infinite; }
        
        .mesh-bg-light { background-image: radial-gradient(at 0% 0%, hsla(199,89%,48%,0.12) 0px, transparent 50%), radial-gradient(at 100% 0%, hsla(253,91%,64%,0.12) 0px, transparent 50%), radial-gradient(at 100% 100%, hsla(340,82%,52%,0.12) 0px, transparent 50%), radial-gradient(at 0% 100%, hsla(43,100%,50%,0.12) 0px, transparent 50%); }
        .mesh-bg-dark { background-image: radial-gradient(at 0% 0%, hsla(46,65%,52%,0.12) 0px, transparent 50%), radial-gradient(at 100% 0%, hsla(253,91%,64%,0.04) 0px, transparent 50%), radial-gradient(at 100% 100%, hsla(340,82%,52%,0.04) 0px, transparent 50%), radial-gradient(at 0% 100%, hsla(43,100%,50%,0.04) 0px, transparent 50%); }
      `}</style>

      {/* ── NAVIGATION ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "py-3 glass-card border-b shadow-xl" : "py-6 border-transparent"}`} style={{ background: scrolled ? t.navBg : "transparent", borderColor: t.cardBorder }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo(0, 0)}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform" style={{ background: t.accent }}>
              <Wallet size={18} strokeWidth={2.5} />
            </div>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", fontWeight: 700, letterSpacing: "0.5px" }}>BudgetTracker</span>
          </div>
          
          <div className="hidden md:flex items-center gap-10 text-sm font-bold uppercase tracking-wider" style={{ color: t.textMuted }}>
            <a href="#features" className="hover:text-current transition-colors">Features</a>
            <a href="#philosophy" className="hover:text-current transition-colors">Philosophy</a>
            <a href="#security" className="hover:text-current transition-colors">Security</a>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-3 rounded-full transition-transform hover:scale-110 glass-card shadow-md" style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}>
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {user ? (
              <button onClick={() => navigate("/app")} className="text-sm px-6 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform" style={{ background: t.accent, color: isDark ? "#000" : "#fff" }}>
                Dashboard
              </button>
            ) : (
              <>
                <button onClick={() => navigate("/login")} className="hidden sm:block text-sm font-bold transition-colors hover:opacity-70">Sign in</button>
                <button onClick={() => navigate("/register")} className="text-sm px-6 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform" style={{ background: t.accent, color: isDark ? "#000" : "#fff" }}>
                  Get Started Free
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section className="relative pt-40 pb-20 md:pt-48 md:pb-32 px-6 flex flex-col lg:flex-row items-center justify-between max-w-7xl mx-auto gap-16 lg:gap-8">
        
        {/* Left Content */}
        <div className="flex-1 text-center lg:text-left z-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-8 text-xs font-bold uppercase tracking-wider shadow-sm glass-card" style={{ borderColor: t.cardBorder, color: t.accent, background: t.card }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: t.accent }} /> Premium Financial Clarity
          </div>

          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(3.5rem, 8vw, 6.5rem)", fontWeight: 700, lineHeight: 1.05, letterSpacing: "-0.02em" }}>
            Master your money with<br />
            <span className="italic" style={{ color: t.accent }}>absolute clarity.</span>
          </h1>

          <p className="mt-8 text-lg md:text-xl max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed" style={{ color: t.textMuted }}>
            A deeply personal, elegantly designed financial dashboard. Built to give you absolute control over your income, expenses, and wealth creation.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center lg:justify-start">
            {user ? (
              <button onClick={() => navigate("/app")} className="group px-10 py-4 rounded-full font-bold shadow-2xl flex items-center justify-center gap-3 transition-transform hover:scale-105" style={{ background: t.accent, color: isDark ? "#000" : "#fff" }}>
                Enter Dashboard <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <>
                <button onClick={() => navigate("/register")} className="group px-10 py-4 rounded-full font-bold shadow-2xl flex items-center justify-center gap-3 transition-transform hover:scale-105" style={{ background: t.accent, color: isDark ? "#000" : "#fff" }}>
                  Create free account <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button onClick={() => navigate("/login")} className="px-8 py-4 rounded-full font-bold transition-colors border" style={{ borderColor: t.cardBorder, background: t.card }}>
                  Sign In
                </button>
              </>
            )}
          </div>
          
          <div className="mt-10 flex items-center justify-center lg:justify-start gap-6 text-sm font-bold uppercase tracking-wider opacity-60" style={{ color: t.text }}>
            <span>🇬🇭 Ghana Native</span>
            <span>•</span>
            <span>Bank-Level Security</span>
          </div>
        </div>

        {/* Right Floating Cards Animation */}
        <div className="flex-1 w-full relative h-[400px] md:h-[550px] flex items-center justify-center z-10 perspective-1000 mt-10 lg:mt-0">
          
          {/* Ambient Glow behind cards */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full blur-[80px] animate-pulse-glow" style={{ background: t.accentBg }} />

          {/* Card 1: Main Balance (Center) */}
          <div className="absolute z-20 w-72 md:w-80 p-6 md:p-8 rounded-[2rem] border shadow-2xl glass-card animate-float-2" style={{ background: t.card, borderColor: t.cardBorder }}>
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: t.accentBg, color: t.accent }}><Wallet size={24} /></div>
              <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: `${t.green}20`, color: t.green }}>+14.2%</span>
            </div>
            <p className="text-sm font-bold uppercase tracking-widest mb-2" style={{ color: t.textMuted }}>Total Balance</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">₵12,450.00</h2>
          </div>

          {/* Card 2: Savings Goal (Top Left) */}
          <div className="absolute z-10 -left-4 md:-left-12 top-4 md:top-10 w-64 p-6 rounded-[2rem] border shadow-xl glass-card animate-float-1" style={{ background: t.card, borderColor: t.cardBorder }}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${t.accent}20`, color: t.accent }}><Target size={20}/></div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: t.textMuted }}>Petra Fund</p>
                <p className="font-bold text-lg">₵4,000.00</p>
              </div>
            </div>
            <div className="h-2.5 w-full rounded-full overflow-hidden" style={{ background: t.cardBorder }}>
               <div className="h-full rounded-full" style={{ width: "75%", background: t.accent }} />
            </div>
          </div>

          {/* Card 3: Recent Activity (Bottom Right) */}
          <div className="absolute z-30 -right-4 md:-right-8 bottom-4 md:bottom-10 w-64 p-6 rounded-[2rem] border shadow-2xl glass-card animate-float-3" style={{ background: t.card, borderColor: t.cardBorder }}>
             <h4 className="font-bold mb-4 uppercase tracking-wider text-xs" style={{ color: t.textMuted }}>Recent Activity</h4>
             <div className="flex items-center justify-between mb-4">
               <div className="flex gap-3 items-center">
                 <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${t.red}20`, color: t.red }}><TrendingDown size={16} /></div>
                 <div>
                   <p className="text-sm font-bold">Groceries</p>
                   <p className="text-xs font-medium" style={{ color: t.textMuted }}>Today</p>
                 </div>
               </div>
               <div className="text-sm font-bold" style={{ color: t.text }}>-₵850</div>
             </div>
             <div className="flex items-center justify-between">
               <div className="flex gap-3 items-center">
                 <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${t.green}20`, color: t.green }}><TrendingUp size={16} /></div>
                 <div>
                   <p className="text-sm font-bold">Paycheck</p>
                   <p className="text-xs font-medium" style={{ color: t.textMuted }}>Yesterday</p>
                 </div>
               </div>
               <div className="text-sm font-bold" style={{ color: t.green }}>+₵5k</div>
             </div>
          </div>
        </div>
      </section>

      {/* ── PHILOSOPHY SECTION ── */}
      <section id="philosophy" className="py-32 px-6 border-y" style={{ borderColor: t.cardBorder, background: isDark ? "rgba(255,255,255,0.01)" : "rgba(0,0,0,0.01)" }}>
        <div className="max-w-4xl mx-auto text-center">
           <BookOpen size={40} className="mx-auto mb-8" style={{ color: t.accent }} />
           <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: t.accent }}>The Philosophy</p>
           <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 700, lineHeight: 1.2 }}>
             Financial anxiety vanishes when you have <span className="italic" style={{ color: t.accent }}>total visibility</span>.
           </h2>
           <p className="mt-8 text-xl font-medium leading-relaxed max-w-3xl mx-auto" style={{ color: t.textMuted }}>
             Most budgeting apps are either too complex—requiring an accounting degree—or too simple, lacking the depth needed to truly grow wealth. We built BudgetTracker to be the perfect middle ground: deeply powerful, yet profoundly intuitive.
           </p>
        </div>
      </section>

      {/* ── BENTO BOX FEATURES ── */}
      <section id="features" className="py-32 px-6 max-w-7xl mx-auto">
        <div className="mb-20 text-center md:text-left">
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 700 }}>
            Precision tools for<br />
            <span className="italic" style={{ color: t.accent }}>disciplined</span> wealth building.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 rounded-[2rem] p-10 md:p-12 border shadow-lg glass-card group transition-transform hover:scale-[1.02]" style={{ background: t.card, borderColor: t.cardBorder }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-md mb-8 transition-transform group-hover:-translate-y-2" style={{ background: t.accent, color: isDark ? "#000" : "#fff" }}>
              <PieChart size={28} strokeWidth={2} />
            </div>
            <h3 className="text-3xl font-bold mb-4">Zero-Based Budgeting</h3>
            <p className="text-lg leading-relaxed font-medium max-w-lg" style={{ color: t.textMuted }}>
              Assign every cedi a job before the month begins. Compare your planned budget against actual spending in real-time, side by side.
            </p>
          </div>

          <div className="rounded-[2rem] p-10 border shadow-lg glass-card group transition-transform hover:scale-[1.02]" style={{ background: t.card, borderColor: t.cardBorder }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:-translate-y-2" style={{ background: `${t.accent}20`, color: t.accent }}>
              <Target size={24} strokeWidth={2} />
            </div>
            <h3 className="text-xl font-bold mb-3">Goal Tracking</h3>
            <p className="font-medium leading-relaxed" style={{ color: t.textMuted }}>
              Isolate your liquidity funds, stock purchases, and emergency savings from your daily spending.
            </p>
          </div>

          <div className="rounded-[2rem] p-10 border shadow-lg glass-card group transition-transform hover:scale-[1.02]" style={{ background: t.card, borderColor: t.cardBorder }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:-translate-y-2" style={{ background: `${t.accent}20`, color: t.accent }}>
              <CreditCard size={24} strokeWidth={2} />
            </div>
            <h3 className="text-xl font-bold mb-3">Bill Defenses</h3>
            <p className="font-medium leading-relaxed" style={{ color: t.textMuted }}>
              Log fixed bills like Wi-Fi, dues, and utilities. Never get caught off guard by an auto-renewal again.
            </p>
          </div>

          <div className="md:col-span-2 rounded-[2rem] p-10 md:p-12 border shadow-lg glass-card group transition-transform hover:scale-[1.02]" style={{ background: t.card, borderColor: t.cardBorder }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-md mb-8 transition-transform group-hover:-translate-y-2" style={{ background: t.accent, color: isDark ? "#000" : "#fff" }}>
              <BarChart3 size={28} strokeWidth={2} />
            </div>
            <h3 className="text-3xl font-bold mb-4">Live Cash Flow Analytics</h3>
            <p className="text-lg leading-relaxed font-medium max-w-lg" style={{ color: t.textMuted }}>
              Beautiful, distraction-free charts that explain your financial health in seconds. Instantly see your savings rate and burn rate.
            </p>
          </div>
        </div>
      </section>

      {/* ── SECURITY / TRUST ── */}
      <section id="security" className="py-32 border-t" style={{ borderColor: t.cardBorder }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center shadow-xl mb-10" style={{ background: t.accent, color: isDark ? "#000" : "#fff" }}>
            <ShieldCheck size={36} strokeWidth={2} />
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.5rem, 6vw, 4rem)", fontWeight: 700 }}>
            Uncompromising Privacy.
          </h2>
          <p className="mt-8 text-xl font-medium leading-relaxed max-w-2xl mx-auto" style={{ color: t.textMuted }}>
            Your financial data is deeply personal. We utilize bank-grade encryption to secure your records. We do not run ads, we do not sell data, and we do not connect to third-party trackers.
          </p>
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <span className="px-6 py-3 rounded-full border font-bold text-sm shadow-sm glass-card flex items-center gap-2" style={{ borderColor: t.cardBorder, color: t.text, background: t.card }}>
              <Lock size={16} style={{ color: t.accent }} /> End-to-end isolation
            </span>
            <span className="px-6 py-3 rounded-full border font-bold text-sm shadow-sm glass-card flex items-center gap-2" style={{ borderColor: t.cardBorder, color: t.text, background: t.card }}>
              <CheckCircle2 size={16} style={{ color: t.accent }} /> Ad-free experience
            </span>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA SECTION ── */}
      <section className="px-6 py-32 text-center relative overflow-hidden border-t" style={{ borderColor: t.cardBorder }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full animate-pulse-glow" style={{ background: `radial-gradient(circle, ${t.accentBg} 0%, transparent 70%)`, filter: "blur(60px)" }} />
        
        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(3rem, 8vw, 5.5rem)", fontWeight: 900, lineHeight: 1.1 }}>
            Ready to design your<br />
            <span className="italic" style={{ color: t.accent }}>financial future</span>?
          </h2>
          <p className="mt-8 mb-12 text-xl font-medium" style={{ color: t.textMuted }}>
             No obligation, profoundly simple to start. GHS native support, secure connections, and total clarity. Free to use forever.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            {user ? (
              <button onClick={() => navigate("/app")} className="w-full sm:w-auto px-12 py-5 rounded-full text-lg font-bold transition-all hover:scale-105 shadow-2xl flex items-center justify-center gap-2" style={{ background: t.accent, color: isDark ? "#000" : "#fff" }}>
                Go to Dashboard <ChevronRight size={20} />
              </button>
            ) : (
              <button onClick={() => navigate("/register")} className="w-full sm:w-auto px-12 py-5 rounded-full text-lg font-bold transition-all hover:scale-105 shadow-2xl flex items-center justify-center gap-2" style={{ background: t.accent, color: isDark ? "#000" : "#fff" }}>
                Create Your Free Account <ArrowRight size={20} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-6 py-12 border-t" style={{ borderColor: t.cardBorder, background: t.bg }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded flex items-center justify-center text-white" style={{ background: t.accent }}>
              <Wallet size={16} strokeWidth={2.5} />
            </div>
            <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.2rem" }}>BudgetTracker</span>
          </div>
          <p className="font-medium text-sm" style={{ color: t.textMuted }}>
            © {new Date().getFullYear()} BudgetTracker. Built native in Ghana 🇬🇭.
          </p>
        </div>
      </footer>
    </div>
  );
}
