// src/pages/HomePage.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  Scale, Banknote, Landmark, CalendarClock, HeartHandshake, 
  PieChart, ShieldCheck, Smartphone, Users, Wallet, Sun, Moon 
} from "lucide-react";

export default function HomePage() {
  const navigate  = useNavigate();
  const { user, theme, toggleTheme, t } = useAuth();
  const canvasRef = useRef(null);

  const FEATURES = [
    { icon: <Scale size={20} />, title: "Expected vs. Actual", desc: "Plan every category in advance. Watch real spending fill in automatically as the month progresses." },
    { icon: <Banknote size={20} />, title: "Smart Cash Flow", desc: "Income minus bills, debts, expenses, and savings — your real balance calculated instantly." },
    { icon: <Landmark size={20} />, title: "Savings & Investments", desc: "Track Petra Savings, liquidity funds, and stock purchases separately. See what you actually saved." },
    { icon: <CalendarClock size={20} />, title: "Bills & Due Dates", desc: "Internet, Wi-Fi, dues, airtime — set due dates per bill so nothing ever catches you off guard." },
    { icon: <HeartHandshake size={20} />, title: "Tithe & Giving", desc: "Enter 10% once. It auto-calculates from your income budget every month — no manual math." },
    { icon: <PieChart size={20} />, title: "Visual Reports", desc: "Bar charts and progress bars for every category. Understand your money in seconds, not hours." },
    { icon: <ShieldCheck size={20} />, title: "Private by Default", desc: "Your data belongs to you. No ads, no data selling, no third-party access. Ever." },
    { icon: <Smartphone size={20} />, title: "Works Everywhere", desc: "Optimised for mobile and desktop. Open it on your phone at the market, your laptop at home." },
    { icon: <Users size={20} />, title: "Multi-User Ready", desc: "Each account is completely isolated. Share the app with friends — everyone's data stays private." },
  ];

  // Animated background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W = canvas.width  = canvas.offsetWidth;
    let H = canvas.height = canvas.offsetHeight;
    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * W, y: Math.random() * H, r: Math.random() * 2 + 0.3,
      vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25, alpha: Math.random() * 0.4 + 0.05,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = theme === "dark" ? `rgba(212,175,55,${p.alpha})` : `rgba(14,165,233,${p.alpha})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    const resize = () => { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; };
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [theme]);

  return (
    <div className="min-h-screen transition-colors duration-500 overflow-x-hidden" style={{ background: t.bg, color: t.text, fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 md:px-12 py-4 transition-colors" style={{ background: t.navBg, backdropFilter: "blur(12px)", borderBottom: `1px solid ${t.cardBorder}` }}>
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
          <div className="w-8 h-8 rounded flex items-center justify-center text-white" style={{ background: t.accent }}>
             <Wallet size={16} strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.15rem", fontWeight: 700, color: t.text }}>BudgetTracker</span>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="p-2.5 rounded-full transition-all hover:scale-110" style={{ background: t.card, color: t.text, border: `1px solid ${t.cardBorder}` }}>
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          
          {user ? (
            <button onClick={() => navigate("/app")} className="text-sm px-5 py-2.5 rounded-full font-semibold transition-all hover:scale-105" style={{ background: t.accent, color: theme === "dark" ? "#000" : "#fff" }}>
              Go to Dashboard
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-3">
              <button onClick={() => navigate("/login")} className="text-sm font-medium transition-colors px-3 py-2" style={{ color: t.textMuted }}>Sign in</button>
              <button onClick={() => navigate("/register")} className="text-sm px-5 py-2.5 rounded-full font-semibold transition-all hover:scale-105" style={{ background: t.accent, color: theme === "dark" ? "#000" : "#fff" }}>
                Get started free
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden pt-20">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full" style={{ background: `radial-gradient(circle, ${t.accentBg} 0%, transparent 70%)`, filter: "blur(40px)" }} />

        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.8rem, 8vw, 6rem)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.02em" }}>
            Your money,{" "}
            <span style={{ color: t.accent, fontStyle: "italic" }}>finally</span>
            <br />under control.
          </h1>

          <p className="mt-6 text-lg md:text-xl max-w-2xl mx-auto" style={{ color: t.textMuted, fontWeight: 300, lineHeight: 1.75 }}>
            A professional personal budget tracker built for absolute clarity. Designed for the Ghanaian context to give you total command over your finances.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            {user ? (
              <button onClick={() => navigate("/app")} className="w-full sm:w-auto px-8 py-4 rounded-full text-base font-semibold transition-all hover:scale-105 shadow-xl" style={{ background: t.accent, color: theme === "dark" ? "#000" : "#fff" }}>
                Return to Dashboard →
              </button>
            ) : (
              <button onClick={() => navigate("/register")} className="w-full sm:w-auto px-8 py-4 rounded-full text-base font-semibold transition-all hover:scale-105 shadow-xl" style={{ background: t.accent, color: theme === "dark" ? "#000" : "#fff" }}>
                Start tracking for free →
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section className="px-5 md:px-12 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 700 }}>
            Professional tools for <span style={{ fontStyle: "italic", color: t.accent }}>precision</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(f => (
            <div key={f.title} className="rounded-2xl p-6 transition-transform hover:-translate-y-1" style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: t.accentBg, color: t.accent }}>
                {f.icon}
              </div>
              <h3 className="text-sm font-semibold mb-2" style={{ color: t.text }}>{f.title}</h3>
              <p className="text-sm" style={{ color: t.textMuted, lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
      
      {/* ── FOOTER ── */}
      <footer className="px-5 md:px-12 py-10 text-center" style={{ borderTop: `1px solid ${t.cardBorder}` }}>
        <p className="text-sm" style={{ color: t.textMuted }}>© {new Date().getFullYear()} BudgetTracker. Built for clarity.</p>
      </footer>
    </div>
  );
}
