// src/pages/HomePage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  Wallet, ShieldCheck, PieChart, Target, ArrowRight, 
  CreditCard, BarChart3, Lock, CheckCircle2, ChevronRight, Sun, Moon 
} from "lucide-react";

const THEMES = {
  dark: {
    bgClass: "bg-[#050505]", meshClass: "mesh-bg-dark",
    navBg: "rgba(5,5,5,0.8)", text: "#f8fafc", textMuted: "#9ca3af",
    card: "rgba(20,20,20,0.6)", cardBorder: "rgba(255,255,255,0.08)", accent: "#D4AF37"
  },
  light: {
    bgClass: "bg-[#f4f4f5]", meshClass: "mesh-bg-light",
    navBg: "rgba(244,244,245,0.8)", text: "#18181b", textMuted: "#71717a",
    card: "rgba(255,255,255,0.7)", cardBorder: "rgba(255,255,255,0.4)", accent: "#4f46e5"
  }
};

export default function HomePage() {
  const navigate = useNavigate();
  const { user, theme, toggleTheme } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const t = THEMES[theme];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={`min-h-screen ${t.bgClass} ${t.meshClass} transition-colors duration-700 overflow-x-hidden`} style={{ color: t.text, fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      
      {/* Dynamic CSS injected for animations and mesh backgrounds */}
      <style>{`
        .glass-card { backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-15px); } 100% { transform: translateY(0px); } }
        @keyframes float-delayed { 0% { transform: translateY(0px); } 50% { transform: translateY(15px); } 100% { transform: translateY(0px); } }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
        
        .mesh-bg-light { background-image: radial-gradient(at 0% 0%, hsla(199,89%,48%,0.15) 0px, transparent 50%), radial-gradient(at 100% 0%, hsla(253,91%,64%,0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, hsla(340,82%,52%,0.15) 0px, transparent 50%), radial-gradient(at 0% 100%, hsla(43,100%,50%,0.15) 0px, transparent 50%); }
        .mesh-bg-dark { background-image: radial-gradient(at 0% 0%, hsla(46,65%,52%,0.15) 0px, transparent 50%), radial-gradient(at 100% 0%, hsla(253,91%,64%,0.05) 0px, transparent 50%), radial-gradient(at 100% 100%, hsla(340,82%,52%,0.05) 0px, transparent 50%), radial-gradient(at 0% 100%, hsla(43,100%,50%,0.05) 0px, transparent 50%); }
      `}</style>

      {/* ── NAVIGATION ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "py-4 glass-card border-b" : "py-6 border-transparent"}`} style={{ background: scrolled ? t.navBg : "transparent", borderColor: t.cardBorder }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => window.scrollTo(0, 0)}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-lg" style={{ background: t.accent }}>
              <Wallet size={18} strokeWidth={2.5} />
            </div>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", fontWeight: 700, letterSpacing: "0.5px" }}>BudgetTracker</span>
          </div>
          
          <div className="hidden md:flex items-center gap-10 text-sm font-semibold uppercase tracking-wider" style={{ color: t.textMuted }}>
            <a href="#features" className="hover:text-current transition-colors">Features</a>
            <a href="#security" className="hover:text-current transition-colors">Security</a>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2.5 rounded-full transition-transform hover:scale-110 glass-card shadow-sm" style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}>
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            {user ? (
              <button onClick={() => navigate("/app")} className="text-sm px-6 py-2.5 rounded-full font-bold shadow-lg hover:scale-105 transition-transform" style={{ background: t.accent, color: theme === "dark" ? "#000" : "#fff" }}>
                Dashboard
              </button>
            ) : (
              <>
                <button onClick={() => navigate("/login")} className="hidden sm:block text-sm font-bold transition-colors hover:opacity-70">Sign in</button>
                <button onClick={() => navigate("/register")} className="text-sm px-6 py-2.5 rounded-full font-bold shadow-lg hover:scale-105 transition-transform" style={{ background: t.accent, color: theme === "dark" ? "#000" : "#fff" }}>
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section className="relative pt-40 pb-20 md:pt-48 md:pb-32 px-6 flex flex-col items-center text-center max-w-7xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-8 text-xs font-bold uppercase tracking-wider shadow-sm glass-card" style={{ borderColor: t.cardBorder, color: t.accent, background: t.card }}>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: t.accent }} /> A New Standard for Personal Finance
        </div>

        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(3rem, 8vw, 6.5rem)", fontWeight: 700, lineHeight: 1.05, letterSpacing: "-0.02em" }}>
          Master your money with<br />
          <span className="italic" style={{ color: t.accent }}>absolute clarity.</span>
        </h1>

        <p className="mt-8 text-lg md:text-xl max-w-2xl text-gray-500 font-medium leading-relaxed" style={{ color: t.textMuted }}>
          A deeply personal, elegantly designed financial dashboard. Built to give you absolute control over your income, expenses, and wealth creation.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          {user ? (
            <button onClick={() => navigate("/app")} className="group px-10 py-4 rounded-full font-bold shadow-2xl flex items-center justify-center gap-2 transition-transform hover:scale-105" style={{ background: t.accent, color: theme === "dark" ? "#000" : "#fff" }}>
              Enter Dashboard <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          ) : (
            <button onClick={() => navigate("/register")} className="group px-10 py-4 rounded-full font-bold shadow-2xl flex items-center justify-center gap-2 transition-transform hover:scale-105" style={{ background: t.accent, color: theme === "dark" ? "#000" : "#fff" }}>
              Create free account <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>

        {/* ── INTERACTIVE 3D FLOATING MOCKUP ── */}
        <div className="mt-24 w-full max-w-5xl relative h-[400px] md:h-[500px]">
          {/* Main Window */}
          <div className="absolute top-0 left-[10%] right-[10%] h-full rounded-t-3xl border shadow-2xl glass-card z-10 animate-float overflow-hidden" style={{ background: t.card, borderColor: t.cardBorder }}>
            <div className="h-12 border-b flex items-center px-6 gap-2" style={{ borderColor: t.cardBorder, background: theme === "dark" ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)" }}>
              <div className="w-3 h-3 rounded-full bg-red-500/80" /><div className="w-3 h-3 rounded-full bg-yellow-500/80" /><div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <div className="p-8 grid grid-cols-3 gap-6 opacity-60">
              <div className="col-span-2 rounded-xl h-40 border" style={{ background: t.cardBorder, borderColor: t.cardBorder }} />
              <div className="col-span-1 rounded-xl h-40 border flex items-center justify-center" style={{ background: t.cardBorder, borderColor: t.cardBorder }}>
                <div className="w-24 h-24 rounded-full border-[8px] border-transparent" style={{ borderTopColor: t.accent, borderRightColor: t.accent }} />
              </div>
            </div>
          </div>
          {/* Floating Widget 1 */}
          <div className="absolute bottom-10 left-0 md:left-[-5%] w-64 p-6 rounded-2xl border shadow-2xl glass-card z-20 animate-float-delayed" style={{ background: t.card, borderColor: t.cardBorder }}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${t.accent}20`, color: t.accent }}><Target size={20}/></div>
              <div className="flex-1 h-3 rounded" style={{ background: t.cardBorder }} />
            </div>
            <div className="h-8 w-2/3 rounded mb-2" style={{ background: t.cardBorder }} />
            <div className="h-2 w-full rounded" style={{ background: t.cardBorder }} />
          </div>
          {/* Floating Widget 2 */}
          <div className="absolute top-20 right-0 md:right-[-5%] w-72 p-6 rounded-2xl border shadow-2xl glass-card z-20 animate-float" style={{ background: t.card, borderColor: t.cardBorder }}>
             <h4 className="font-bold mb-4" style={{ color: t.text }}>Recent Transactions</h4>
             {[1,2,3].map(i => (
               <div key={i} className="flex items-center justify-between mb-3 last:mb-0">
                 <div className="flex gap-3 items-center">
                   <div className="w-8 h-8 rounded-full" style={{ background: t.cardBorder }} />
                   <div className="w-16 h-2 rounded" style={{ background: t.cardBorder }} />
                 </div>
                 <div className="w-12 h-2 rounded" style={{ background: t.cardBorder }} />
               </div>
             ))}
          </div>
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
          {/* Feature 1 - Large */}
          <div className="md:col-span-2 rounded-[2rem] p-10 md:p-12 border shadow-lg glass-card group transition-transform hover:scale-[1.02]" style={{ background: t.card, borderColor: t.cardBorder }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-md mb-8 transition-transform group-hover:-translate-y-2" style={{ background: t.accent, color: theme === "dark" ? "#000" : "#fff" }}>
              <PieChart size={28} strokeWidth={2} />
            </div>
            <h3 className="text-3xl font-bold mb-4">Zero-Based Budgeting</h3>
            <p className="text-lg leading-relaxed font-medium max-w-lg" style={{ color: t.textMuted }}>
              Assign every cedi a job before the month begins. Compare your planned budget against actual spending in real-time, side by side.
            </p>
          </div>

          {/* Feature 2 - Small */}
          <div className="rounded-[2rem] p-10 border shadow-lg glass-card group transition-transform hover:scale-[1.02]" style={{ background: t.card, borderColor: t.cardBorder }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:-translate-y-2" style={{ background: `${t.accent}20`, color: t.accent }}>
              <Target size={24} strokeWidth={2} />
            </div>
            <h3 className="text-xl font-bold mb-3">Goal Tracking</h3>
            <p className="font-medium leading-relaxed" style={{ color: t.textMuted }}>
              Isolate your liquidity funds, stock purchases, and emergency savings from your daily spending.
            </p>
          </div>

          {/* Feature 3 - Small */}
          <div className="rounded-[2rem] p-10 border shadow-lg glass-card group transition-transform hover:scale-[1.02]" style={{ background: t.card, borderColor: t.cardBorder }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:-translate-y-2" style={{ background: `${t.accent}20`, color: t.accent }}>
              <CreditCard size={24} strokeWidth={2} />
            </div>
            <h3 className="text-xl font-bold mb-3">Bill Defenses</h3>
            <p className="font-medium leading-relaxed" style={{ color: t.textMuted }}>
              Log fixed bills like Wi-Fi, dues, and utilities. Never get caught off guard by an auto-renewal again.
            </p>
          </div>

          {/* Feature 4 - Large */}
          <div className="md:col-span-2 rounded-[2rem] p-10 md:p-12 border shadow-lg glass-card group transition-transform hover:scale-[1.02]" style={{ background: t.card, borderColor: t.cardBorder }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-md mb-8 transition-transform group-hover:-translate-y-2" style={{ background: t.accent, color: theme === "dark" ? "#000" : "#fff" }}>
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
          <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center shadow-xl mb-10" style={{ background: t.accent, color: theme === "dark" ? "#000" : "#fff" }}>
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

      {/* ── FOOTER ── */}
      <footer className="px-6 py-12 border-t" style={{ borderColor: t.cardBorder, background: theme === "dark" ? "#000" : "#fff" }}>
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
