// src/pages/HomePage.jsx
// Aesthetic: Dark luxury finance — deep blacks, gold accents, editorial typography
// Font: Playfair Display (display) + DM Sans (body) via Google Fonts

import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const FEATURES = [
  {
    icon: "◈",
    title: "Expected vs. Actual",
    desc: "Plan your month in advance, then track how reality compares — line by line, category by category.",
  },
  {
    icon: "◎",
    title: "Smart Cash Flow",
    desc: "Automatic balance calculation: income minus expenses, bills, debts, and savings — always up to date.",
  },
  {
    icon: "◐",
    title: "Savings Tracker",
    desc: "Separate tracking for investments and savings goals. Know exactly how much you've actually put away.",
  },
  {
    icon: "◑",
    title: "Bills & Debts",
    desc: "Dedicated sections for fixed obligations with due dates, so nothing slips through the cracks.",
  },
  {
    icon: "◒",
    title: "Tithe & Giving",
    desc: "Set your giving as a percentage of income. It recalculates automatically when your income changes.",
  },
  {
    icon: "◓",
    title: "Monthly Reports",
    desc: "Visual charts and progress bars for every budget category. See the full picture at a glance.",
  },
];

const TESTIMONIALS = [
  { name: "Abena K.", role: "Small business owner", text: "I finally understand where my money goes every month. The expected vs. actual view changed everything for me." },
  { name: "Kwame A.", role: "Graduate student", text: "Set up my April budget in 10 minutes. By the end of the month I had saved ₵800 more than before." },
  { name: "Efua M.", role: "Marketing manager", text: "The bills due-date tracker alone is worth it. No more late fees." },
];

export default function HomePage() {
  const navigate   = useNavigate();
  const heroRef    = useRef(null);
  const canvasRef  = useRef(null);

  // Animated particle background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W = canvas.width  = canvas.offsetWidth;
    let H = canvas.height = canvas.offsetHeight;
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.5 + 0.1,
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
        ctx.fillStyle = `rgba(212,175,55,${p.alpha})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();

    const resize = () => {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <div className="min-h-screen bg-[#080808] text-white overflow-x-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5" style={{ background: "linear-gradient(to bottom, rgba(8,8,8,0.95), transparent)" }}>
        <div className="flex items-center gap-2">
          <span className="text-xl">💰</span>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", fontWeight: 700, color: "#D4AF37" }}>
            BudgetTracker
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/login")}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Sign in
          </button>
          <button
            onClick={() => navigate("/register")}
            className="text-sm px-5 py-2 rounded-full font-medium transition-all"
            style={{ background: "#D4AF37", color: "#080808" }}
            onMouseEnter={e => e.target.style.background = "#e8c84a"}
            onMouseLeave={e => e.target.style.background = "#D4AF37"}
          >
            Get started free
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" style={{ pointerEvents: "none" }} />

        {/* Gold ring decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5" style={{ border: "1px solid #D4AF37" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-[0.03]" style={{ border: "1px solid #D4AF37" }} />

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8" style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.3)", color: "#D4AF37" }}>
            ✦ Free to use · No credit card required
          </div>

          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.8rem, 8vw, 6rem)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.02em" }}>
            Your money,{" "}
            <span style={{ color: "#D4AF37", fontStyle: "italic" }}>finally</span>
            <br />under control.
          </h1>

          <p className="mt-6 text-lg md:text-xl text-gray-400 max-w-xl mx-auto" style={{ fontWeight: 300, lineHeight: 1.7 }}>
            BudgetTracker gives you a clear view of where every cedi goes — planned vs. actual, every month, every category.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <button
              onClick={() => navigate("/register")}
              className="w-full sm:w-auto px-8 py-4 rounded-full text-base font-semibold transition-all hover:scale-105"
              style={{ background: "#D4AF37", color: "#080808" }}
            >
              Start tracking for free →
            </button>
            <button
              onClick={() => navigate("/login")}
              className="w-full sm:w-auto px-8 py-4 rounded-full text-base font-medium transition-all"
              style={{ border: "1px solid rgba(255,255,255,0.15)", color: "#ccc" }}
              onMouseEnter={e => { e.target.style.borderColor = "rgba(212,175,55,0.5)"; e.target.style.color = "#D4AF37"; }}
              onMouseLeave={e => { e.target.style.borderColor = "rgba(255,255,255,0.15)"; e.target.style.color = "#ccc"; }}
            >
              Sign in
            </button>
          </div>

          {/* Social proof numbers */}
          <div className="flex items-center justify-center gap-10 mt-14 pt-10" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            {[
              { val: "GH₵0", label: "Cost to start" },
              { val: "5 min", label: "Setup time" },
              { val: "100%", label: "Private & secure" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", fontWeight: 700, color: "#D4AF37" }}>{s.val}</div>
                <div className="text-xs text-gray-600 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DASHBOARD PREVIEW ── */}
      <section className="px-6 md:px-12 py-20 max-w-5xl mx-auto">
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(212,175,55,0.2)", background: "rgba(212,175,55,0.03)" }}>
          <div className="px-4 py-3 flex items-center gap-2" style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
            <span className="text-xs text-gray-600 ml-3">budgettracker.app — April 2026</span>
          </div>
          {/* Mini dashboard mockup */}
          <div className="p-5 md:p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { l: "Income", v: "₵4,500", c: "#4ade80" },
                { l: "Spent",  v: "₵2,180", c: "#f87171" },
                { l: "Savings",v: "₵1,500", c: "#D4AF37" },
                { l: "Balance",v: "₵820",   c: "#4ade80" },
              ].map(c => (
                <div key={c.l} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="text-xs text-gray-600 uppercase tracking-wide">{c.l}</div>
                  <div className="text-xl font-bold mt-1" style={{ color: c.c, fontFamily: "'DM Sans', sans-serif" }}>{c.v}</div>
                </div>
              ))}
            </div>
            {/* Cash flow rows */}
            {[
              { l: "Income",   p: "₵4,500", a: "₵4,500", pct: 100, pos: true  },
              { l: "Expenses", p: "₵3,000", a: "₵2,180", pct: 73,  neg: true  },
              { l: "Savings",  p: "₵1,500", a: "₵1,500", pct: 100, sav: true  },
              { l: "Balance",  p: "₵0",     a: "₵820",   pct: null, bal: true  },
            ].map(r => (
              <div key={r.l} className="flex items-center gap-3 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <span className="text-sm text-gray-400 w-24 flex-shrink-0">{r.l}</span>
                <span className="text-xs text-gray-600 w-20">{r.p}</span>
                <span className="text-sm font-medium w-20" style={{ color: r.pos ? "#4ade80" : r.neg ? "#f87171" : r.sav ? "#D4AF37" : "#4ade80" }}>{r.a}</span>
                {r.pct != null && (
                  <div className="flex-1 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <div className="h-1.5 rounded-full" style={{ width: `${r.pct}%`, background: r.pct >= 100 ? "#D4AF37" : "#6366f1" }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <p className="text-center text-xs text-gray-600 mt-4">Your actual dashboard will look like this — loaded with your real data.</p>
      </section>

      {/* ── FEATURES ── */}
      <section className="px-6 md:px-12 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#D4AF37" }}>Everything you need</p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 700 }}>
            Built around how you<br />
            <span style={{ fontStyle: "italic", color: "#D4AF37" }}>actually</span> budget
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(f => (
            <div key={f.title} className="rounded-2xl p-6 transition-all hover:-translate-y-1" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(212,175,55,0.3)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"}
            >
              <div className="text-2xl mb-4" style={{ color: "#D4AF37" }}>{f.icon}</div>
              <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500" style={{ lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="px-6 md:px-12 py-20" style={{ background: "rgba(212,175,55,0.03)", borderTop: "1px solid rgba(212,175,55,0.08)", borderBottom: "1px solid rgba(212,175,55,0.08)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#D4AF37" }}>What people say</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 700 }}>
              Real people. Real results.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p className="text-sm text-gray-400 mb-5" style={{ lineHeight: 1.8 }}>"{t.text}"</p>
                <div>
                  <div className="text-sm font-semibold text-white">{t.name}</div>
                  <div className="text-xs text-gray-600 mt-0.5">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="px-6 py-28 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.2rem, 6vw, 4rem)", fontWeight: 900, lineHeight: 1.1 }}>
            Take control of your<br />
            <span style={{ color: "#D4AF37", fontStyle: "italic" }}>financial future</span> today.
          </h2>
          <p className="text-gray-500 mt-5 mb-10 text-lg" style={{ fontWeight: 300 }}>
            Free to use. No ads. No credit card. Just clarity.
          </p>
          <button
            onClick={() => navigate("/register")}
            className="px-10 py-4 rounded-full text-base font-semibold transition-all hover:scale-105 hover:shadow-2xl"
            style={{ background: "#D4AF37", color: "#080808", boxShadow: "0 0 40px rgba(212,175,55,0.2)" }}
          >
            Create your free account →
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-6 md:px-12 py-8" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>💰</span>
            <span style={{ fontFamily: "'Playfair Display', serif", color: "#D4AF37", fontSize: "0.95rem" }}>BudgetTracker</span>
          </div>
          <p className="text-xs text-gray-700">© {new Date().getFullYear()} BudgetTracker. Built for Ghana, works everywhere.</p>
          <div className="flex gap-6 text-xs text-gray-700">
            <span className="cursor-pointer hover:text-gray-400 transition">Privacy</span>
            <span className="cursor-pointer hover:text-gray-400 transition">Terms</span>
            <span className="cursor-pointer hover:text-gray-400 transition">Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
