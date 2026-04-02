// src/pages/HomePage.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  PieChart, Wallet, Target, CreditCard, HeartHandshake, 
  BarChart3, ShieldCheck, Smartphone, Users, 
  Sun, Moon, CheckCircle2, ArrowRight
} from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [activeFaq, setActiveFaq] = useState(null);
  const [visibleTestimonial, setVisibleTestimonial] = useState(0);
  
  // Theme State
  const [theme, setTheme] = useState(localStorage.getItem("budget_theme") || "dark");

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("budget_theme", newTheme);
  };

  const THEMES = {
    dark: {
      bg: "#030712", navBg: "rgba(3,7,18,0.85)", text: "#f9fafb", textMuted: "#9ca3af",
      card: "rgba(255,255,255,0.03)", cardBorder: "rgba(255,255,255,0.08)",
      accent: "#D4AF37", accentHover: "#e8c84a", accentBg: "rgba(212,175,55,0.1)",
      green: "#4ade80", red: "#f87171"
    },
    light: {
      bg: "#f8fafc", navBg: "rgba(248,250,252,0.85)", text: "#0f172a", textMuted: "#64748b",
      card: "#ffffff", cardBorder: "rgba(0,0,0,0.06)",
      accent: "#0284c7", accentHover: "#0369a1", accentBg: "rgba(2,132,199,0.1)",
      green: "#16a34a", red: "#dc2626"
    }
  };

  const t = THEMES[theme];

  const FEATURES = [
    { icon: <PieChart size={22} />, title: "Expected vs. Actual", desc: "Plan every category in advance. Watch real spending fill in automatically as the month progresses." },
    { icon: <Wallet size={22} />, title: "Smart Cash Flow", desc: "Income minus bills, debts, expenses, and savings — your real balance calculated instantly." },
    { icon: <Target size={22} />, title: "Savings & Investments", desc: "Track liquidity funds and stock purchases separately. See exactly what you saved." },
    { icon: <CreditCard size={22} />, title: "Bills & Due Dates", desc: "Internet, Wi-Fi, dues, airtime — set due dates per bill so nothing ever catches you off guard." },
    { icon: <HeartHandshake size={22} />, title: "Tithe & Giving", desc: "Enter 10% once. It auto-calculates from your income budget every month — no manual math." },
    { icon: <BarChart3 size={22} />, title: "Visual Reports", desc: "Beautiful charts and progress bars for every category. Understand your money in seconds." },
    { icon: <ShieldCheck size={22} />, title: "Private by Default", desc: "Your data belongs to you. No ads, no data selling, no third-party access. Ever." },
    { icon: <Smartphone size={22} />, title: "Works Everywhere", desc: "Optimised for mobile and desktop. Open it on your phone at the market, your laptop at home." },
    { icon: <Users size={22} />, title: "Multi-User Ready", desc: "Each account is completely isolated. Share the app with friends — everyone's data stays private." },
  ];

  const TESTIMONIALS = [
    { name: "Abena K.", role: "Small business owner, Accra", text: "I finally understand where my money goes every month. The expected vs. actual view changed everything for me. I saved ₵1,200 in my first month." },
    { name: "Kwame A.", role: "Graduate student, KNUST", text: "Set up my April budget in 10 minutes. By the end of the month I had saved ₵800 more than I ever had before. The tithe calculator alone is genius." },
    { name: "Efua M.", role: "Marketing manager, Kumasi", text: "The bills due-date tracker is worth every minute of setup. No more late fees, no more forgotten subscriptions. I'm in control now." },
  ];

  const HOW_IT_WORKS = [
    { step: "01", title: "Set your budget plan", desc: "Enter your expected income, savings targets, and spending limits for each category at the start of the month." },
    { step: "02", title: "Log your transactions", desc: "Add expenses as you go. Takes 10 seconds per entry. Categorised exactly the way you think about money." },
    { step: "03", title: "Watch your balance", desc: "Your cash flow updates in real time. See exactly how much is left, where you're overspending, and how close you are to your goals." },
  ];

  // Auto-cycle testimonials
  useEffect(() => {
    const timer = setInterval(() => setVisibleTestimonial(v => (v + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(timer);
  }, []);

  // Animated background effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W = canvas.width = canvas.offsetWidth;
    let H = canvas.height = canvas.offsetHeight;
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.3 + 0.1,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = theme === "dark" ? `rgba(212,175,55,${p.alpha})` : `rgba(2,132,199,${p.alpha})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    const resize = () => { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; };
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [theme]);

  const faqs = [
    { q: "Is BudgetTracker really free?", a: "Yes — completely free to use with no hidden charges, no credit card required, and no ads." },
    { q: "Is my financial data safe?", a: "Your data is stored securely in an encrypted database. We never sell or share your data." },
    { q: "Can I use it for GHS and other currencies?", a: "BudgetTracker defaults to Ghana Cedis (₵) but works perfectly for any currency globally." },
    { q: "What if my income varies each month?", a: "Just update your paycheck entries at the start of each month. Everything recalculates instantly." },
  ];

  return (
    <div className="min-h-screen transition-colors duration-500 overflow-x-hidden" style={{ background: t.bg, color: t.text, fontFamily: "'DM Sans', sans-serif" }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 transition-colors duration-500" style={{ background: t.navBg, backdropFilter: "blur(16px)", borderBottom: `1px solid ${t.cardBorder}` }}>
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ background: t.accent }}>
            <Wallet size={18} strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.25rem", fontWeight: 700, color: t.text }}>BudgetTracker</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: t.textMuted }}>
          <a href="#features" className="hover:opacity-70 transition-opacity">Features</a>
          <a href="#how-it-works" className="hover:opacity-70 transition-opacity">How it works</a>
          <a href="#testimonials" className="hover:opacity-70 transition-opacity">Reviews</a>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="p-2 rounded-full transition-all" style={{ background: t.card, color: t.text, border: `1px solid ${t.cardBorder}` }}>
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button onClick={() => navigate("/login")} className="hidden sm:block text-sm font-medium transition-opacity hover:opacity-70" style={{ color: t.textMuted }}>
            Sign in
          </button>
          <button
            onClick={() => navigate("/register")}
            className="text-sm px-5 py-2.5 rounded-full font-semibold transition-transform hover:-translate-y-0.5 shadow-lg"
            style={{ background: t.accent, color: theme === "dark" ? "#000" : "#fff" }}
          >
            Get started
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20 overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none", opacity: 0.6 }} />
        
        {/* Subtle Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px]" style={{ background: t.accent, opacity: theme === "dark" ? 0.15 : 0.08 }} />

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8 shadow-sm" style={{ background: t.accentBg, border: `1px solid ${t.accent}40`, color: t.accent }}>
            <CheckCircle2 size={14} /> Free forever · Built for clarity
          </div>

          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.5rem, 8vw, 5.5rem)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em", color: t.text }}>
            Your money,{" "}
            <span style={{ color: t.accent, fontStyle: "italic" }}>finally</span>
            <br />under control.
          </h1>

          <p className="mt-6 text-lg max-w-2xl mx-auto" style={{ color: t.textMuted, fontWeight: 400, lineHeight: 1.7 }}>
            A professional financial dashboard that gives you a crystal clear view of where every cedi goes. Plan, track, and build wealth with confidence.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <button
              onClick={() => navigate("/register")}
              className="w-full sm:w-auto px-8 py-4 rounded-full text-base font-semibold transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-xl"
              style={{ background: t.accent, color: theme === "dark" ? "#000" : "#fff" }}
            >
              Start tracking for free <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="px-6 py-24" style={{ background: theme === "dark" ? "rgba(255,255,255,0.01)" : "#ffffff", borderTop: `1px solid ${t.cardBorder}` }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700, color: t.text }}>
              Simplicity by design.
            </h2>
            <p className="mt-3 text-sm" style={{ color: t.textMuted }}>Master your finances in three elegant steps.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className="relative p-8 rounded-2xl transition-transform hover:-translate-y-1" style={{ background: t.card, border: `1px solid ${t.cardBorder}`, boxShadow: "0 10px 30px rgba(0,0,0,0.02)" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold mb-6" style={{ background: t.accentBg, color: t.accent }}>
                  {step.step}
                </div>
                <h3 className="text-lg font-bold mb-3" style={{ color: t.text }}>{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: t.textMuted }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="px-6 py-24 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 700, color: t.text }}>
            Professional tools.<br />
            <span style={{ fontStyle: "italic", color: t.accent }}>Personal</span> insights.
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(f => (
            <div
              key={f.title}
              className="group rounded-2xl p-8 transition-all duration-300"
              style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110" style={{ background: t.accentBg, color: t.accent }}>
                {f.icon}
              </div>
              <h3 className="text-base font-bold mb-3" style={{ color: t.text }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: t.textMuted }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-6 py-12" style={{ borderTop: `1px solid ${t.cardBorder}`, background: theme === "dark" ? "#000" : "#f1f5f9" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded flex items-center justify-center text-white" style={{ background: t.accent }}>
              <Wallet size={12} strokeWidth={3} />
            </div>
            <span style={{ fontFamily: "'Playfair Display', serif", color: t.text, fontWeight: 700 }}>BudgetTracker</span>
          </div>
          <p className="text-sm" style={{ color: t.textMuted }}>© {new Date().getFullYear()} BudgetTracker. Built for clarity.</p>
        </div>
      </footer>
    </div>
  );
}
