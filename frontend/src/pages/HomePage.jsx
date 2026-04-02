// src/pages/HomePage.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const FEATURES = [
  { icon: "⚖️", title: "Expected vs. Actual", desc: "Plan every category in advance. Watch real spending fill in automatically as the month progresses.", color: "#D4AF37" },
  { icon: "💸", title: "Smart Cash Flow",      desc: "Income minus bills, debts, expenses, and savings — your real balance calculated instantly.", color: "#4ade80" },
  { icon: "🏦", title: "Savings & Investments", desc: "Track Petra Savings, liquidity funds, and stock purchases separately. See what you actually saved.", color: "#60a5fa" },
  { icon: "📋", title: "Bills & Due Dates",    desc: "Internet, Wi-Fi, dues, airtime — set due dates per bill so nothing ever catches you off guard.", color: "#f87171" },
  { icon: "🙏", title: "Tithe & Giving",       desc: "Enter 10% once. It auto-calculates from your income budget every month — no manual math.", color: "#a78bfa" },
  { icon: "📊", title: "Visual Reports",        desc: "Bar charts and progress bars for every category. Understand your money in seconds, not hours.", color: "#fb923c" },
  { icon: "🔒", title: "Private by Default",   desc: "Your data belongs to you. No ads, no data selling, no third-party access. Ever.", color: "#34d399" },
  { icon: "📱", title: "Works Everywhere",      desc: "Optimised for mobile and desktop. Open it on your phone at the market, your laptop at home.", color: "#f472b6" },
  { icon: "✨", title: "Multi-User Ready",      desc: "Each account is completely isolated. Share the app with friends — everyone's data stays private.", color: "#D4AF37" },
];

const TESTIMONIALS = [
  { name: "Abena K.",  role: "Small business owner, Accra",    rating: 5, text: "I finally understand where my money goes every month. The expected vs. actual view changed everything for me. I saved ₵1,200 in my first month." },
  { name: "Kwame A.",  role: "Graduate student, KNUST",        rating: 5, text: "Set up my April budget in 10 minutes. By the end of the month I had saved ₵800 more than I ever had before. The tithe calculator alone is genius." },
  { name: "Efua M.",   role: "Marketing manager, Kumasi",      rating: 5, text: "The bills due-date tracker is worth every minute of setup. No more late fees, no more forgotten subscriptions. I'm in control now." },
  { name: "Kofi B.",   role: "Freelancer, Tema",               rating: 5, text: "My income varies every month. BudgetTracker handles that perfectly — I just update my paycheck fields and everything recalculates." },
  { name: "Ama S.",    role: "Nurse, Cape Coast",              rating: 5, text: "I used to dread checking my account balance. Now I check BudgetTracker every morning. It feels good to actually have a plan." },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Set your budget plan",    desc: "Enter your expected income, savings targets, and spending limits for each category at the start of the month." },
  { step: "02", title: "Log your transactions",   desc: "Add expenses as you go. Takes 10 seconds per entry. Categorised exactly the way you think about money." },
  { step: "03", title: "Watch your balance",      desc: "Your cash flow updates in real time. See exactly how much is left, where you're overspending, and how close you are to your goals." },
];

const STATS = [
  { val: "GH₵0",  label: "Cost to start" },
  { val: "< 5min", label: "Setup time" },
  { val: "100%",   label: "Data privacy" },
  { val: "12",     label: "Budget categories" },
];

function StarRating({ count }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} style={{ color: "#D4AF37", fontSize: "0.75rem" }}>★</span>
      ))}
    </div>
  );
}

export default function HomePage() {
  const navigate  = useNavigate();
  const canvasRef = useRef(null);
  const [activeFaq, setActiveFaq] = useState(null);
  const [visibleTestimonial, setVisibleTestimonial] = useState(0);

  // Auto-cycle testimonials on mobile
  useEffect(() => {
    const t = setInterval(() => setVisibleTestimonial(v => (v + 1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(t);
  }, []);

  // Animated particle background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W = canvas.width  = canvas.offsetWidth;
    let H = canvas.height = canvas.offsetHeight;
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 2 + 0.3,
      vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.4 + 0.05,
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
    const resize = () => { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; };
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  const faqs = [
    { q: "Is BudgetTracker really free?", a: "Yes — completely free to use with no hidden charges, no credit card required, and no ads. We believe everyone deserves financial clarity." },
    { q: "Is my financial data safe?", a: "Your data is stored securely in an encrypted database. We never sell or share your data with third parties. Each user account is fully isolated." },
    { q: "Can I use it for GHS and other currencies?", a: "BudgetTracker defaults to Ghana Cedis (₵/GHS) but works for any currency — just enter your amounts in whatever currency you use." },
    { q: "What if my income varies each month?", a: "Just update your paycheck entries at the start of each month. The cash flow summary recalculates everything automatically." },
    { q: "Can my spouse or partner use the same account?", a: "We recommend separate accounts for privacy and accuracy. Creating an account takes under 2 minutes." },
    { q: "Does it work on my phone?", a: "Yes — BudgetTracker is fully optimised for mobile. The entire app works perfectly on any smartphone browser." },
  ];

  return (
    <div className="min-h-screen bg-[#080808] text-white overflow-x-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <link rel="preconnect" href="[https://fonts.googleapis.com](https://fonts.googleapis.com)" />
      <link rel="preconnect" href="[https://fonts.gstatic.com](https://fonts.gstatic.com)" crossOrigin="anonymous" />
      <link href="[https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap](https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap)" rel="stylesheet" />

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 md:px-12 py-4" style={{ background: "rgba(8,8,8,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-center gap-2">
          <span className="text-xl">💰</span>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.15rem", fontWeight: 700, color: "#D4AF37" }}>BudgetTracker</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
          <a href="#features" className="hover:text-white transition-colors cursor-pointer">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors cursor-pointer">How it works</a>
          <a href="#testimonials" className="hover:text-white transition-colors cursor-pointer">Reviews</a>
          <a href="#faq" className="hover:text-white transition-colors cursor-pointer">FAQ</a>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/login")} className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-2">
            Sign in
          </button>
          <button
            onClick={() => navigate("/register")}
            className="text-sm px-5 py-2.5 rounded-full font-semibold transition-all hover:scale-105"
            style={{ background: "#D4AF37", color: "#080808" }}
          >
            Get started free
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden pt-20">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none", opacity: 0.5 }} />
        {/* Concentric rings */}
        {[600, 800, 1000].map((size, i) => (
          <div key={size} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ width: size, height: size, border: "1px solid rgba(212,175,55,0.06)", opacity: 1 - i * 0.02 }} />
        ))}
        {/* Gold glow blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full" style={{ background: "radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)", filter: "blur(40px)" }} />

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8" style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.3)", color: "#D4AF37" }}>
            ✦ Free forever · No credit card · Built for Ghana
          </div>

          <h1 className="text-white" style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.8rem, 8vw, 6rem)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.02em" }}>
            Your money,{" "}
            <span style={{ color: "#D4AF37", fontStyle: "italic" }}>finally</span>
            <br />under control.
          </h1>

          <p className="mt-6 text-lg md:text-xl max-w-2xl mx-auto" style={{ color: "#9ca3af", fontWeight: 300, lineHeight: 1.75 }}>
            BudgetTracker gives you a clear view of where every cedi goes — planned vs. actual spending, every month, every category. Built for how Ghanaians actually manage money.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <button
              onClick={() => navigate("/register")}
              className="w-full sm:w-auto px-8 py-4 rounded-full text-base font-semibold transition-all hover:scale-105"
              style={{ background: "#D4AF37", color: "#080808", boxShadow: "0 0 40px rgba(212,175,55,0.25)" }}
            >
              Start tracking for free →
            </button>
            <button
              onClick={() => navigate("/login")}
              className="w-full sm:w-auto px-8 py-4 rounded-full text-base font-medium transition-all"
              style={{ border: "1px solid rgba(255,255,255,0.15)", color: "#ccc" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(212,175,55,0.5)"; e.currentTarget.style.color = "#D4AF37"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "#ccc"; }}
            >
              I already have an account
            </button>
          </div>

          {/* Stats bar */}
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 mt-16 pt-10" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            {STATS.map(s => (
              <div key={s.label} className="text-center">
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.7rem", fontWeight: 700, color: "#D4AF37" }}>{s.val}</div>
                <div className="text-xs mt-1" style={{ color: "#6b7280" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DASHBOARD PREVIEW ── */}
      <section className="px-5 md:px-12 py-16 max-w-5xl mx-auto">
        <p className="text-center text-xs uppercase tracking-widest mb-8" style={{ color: "#D4AF37" }}>What it looks like inside</p>
        <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ border: "1px solid rgba(212,175,55,0.2)", background: "rgba(10,10,10,0.9)" }}>
          {/* Browser chrome */}
          <div className="px-4 py-3 flex items-center gap-2" style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="w-3 h-3 rounded-full" style={{ background: "#ff5f57" }} />
            <div className="w-3 h-3 rounded-full" style={{ background: "#ffbd2e" }} />
            <div className="w-3 h-3 rounded-full" style={{ background: "#28c840" }} />
            <div className="mx-auto px-6 py-1 rounded-md text-xs" style={{ background: "rgba(255,255,255,0.06)", color: "#6b7280" }}>budgettracker.app/app</div>
          </div>
          {/* Mock dashboard */}
          <div className="p-5 md:p-8">
            {/* KPI cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { l: "Income",  v: "₵4,500", c: "#4ade80", bg: "rgba(74,222,128,0.08)"  },
                { l: "Spent",   v: "₵2,180", c: "#f87171", bg: "rgba(248,113,113,0.08)" },
                { l: "Savings", v: "₵1,500", c: "#D4AF37", bg: "rgba(212,175,55,0.08)"  },
                { l: "Balance", v: "₵820",   c: "#4ade80", bg: "rgba(74,222,128,0.08)"  },
              ].map(c => (
                <div key={c.l} className="rounded-xl p-4" style={{ background: c.bg, border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="text-xs uppercase tracking-wide" style={{ color: "#6b7280" }}>{c.l}</div>
                  <div className="text-xl font-bold mt-1.5" style={{ color: c.c }}>{c.v}</div>
                </div>
              ))}
            </div>
            {/* Cash flow table */}
            <div className="rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="px-4 py-3 flex gap-4 text-xs uppercase tracking-wide" style={{ color: "#4b5563", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <span className="flex-1">Category</span><span className="w-20 text-right">Budget</span><span className="w-20 text-right">Actual</span><span className="flex-1 hidden md:block ml-4">Progress</span>
              </div>
              {[
                { l: "Income",   p: "₵4,500", a: "₵4,500", pct: 100, c: "#4ade80" },
                { l: "Expenses", p: "₵3,000", a: "₵2,180", pct: 73,  c: "#f87171" },
                { l: "Savings",  p: "₵1,500", a: "₵1,500", pct: 100, c: "#D4AF37" },
                { l: "Balance",  p: "—",      a: "₵820",   pct: null, c: "#4ade80" },
              ].map(r => (
                <div key={r.l} className="px-4 py-3 flex items-center gap-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <span className="flex-1 text-sm" style={{ color: "#d1d5db" }}>{r.l}</span>
                  <span className="w-20 text-right text-sm" style={{ color: "#6b7280" }}>{r.p}</span>
                  <span className="w-20 text-right text-sm font-semibold" style={{ color: r.c }}>{r.a}</span>
                  <div className="flex-1 hidden md:flex items-center gap-2 ml-4">
                    {r.pct != null && (
                      <>
                        <div className="flex-1 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                          <div className="h-1.5 rounded-full transition-all" style={{ width: `${r.pct}%`, background: r.pct >= 100 ? "#D4AF37" : "#6366f1" }} />
                        </div>
                        <span className="text-xs w-8 text-right" style={{ color: "#6b7280" }}>{r.pct}%</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="text-center text-xs mt-4" style={{ color: "#4b5563" }}>Live preview — your actual data populates this automatically</p>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="px-5 md:px-12 py-20" style={{ background: "rgba(255,255,255,0.015)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#D4AF37" }}>Simple by design</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700 }}>
              Up and running in <span style={{ color: "#D4AF37", fontStyle: "italic" }}>three steps</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className="relative">
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px" style={{ background: "linear-gradient(to right, rgba(212,175,55,0.3), transparent)", zIndex: 0 }} />
                )}
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold mb-5" style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.3)", color: "#D4AF37", fontFamily: "'Playfair Display', serif" }}>
                    {step.step}
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-sm" style={{ color: "#6b7280", lineHeight: 1.75 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section id="features" className="px-5 md:px-12 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#D4AF37" }}>Everything you need</p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 700 }}>
            Built around how you <span style={{ fontStyle: "italic", color: "#D4AF37" }}>actually</span> budget
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-sm" style={{ color: "#6b7280", lineHeight: 1.75 }}>
            Every feature was designed with the Ghanaian context in mind — from tithe tracking to mobile data costs.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(f => (
            <div
              key={f.title}
              className="rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 cursor-default"
              style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${f.color}44`; e.currentTarget.style.background = `rgba(255,255,255,0.04)`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "rgba(255,255,255,0.025)"; }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-4" style={{ background: `${f.color}18` }}>
                {f.icon}
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm" style={{ color: "#6b7280", lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className="px-5 md:px-12 py-20" style={{ background: "rgba(212,175,55,0.02)", borderTop: "1px solid rgba(212,175,55,0.08)", borderBottom: "1px solid rgba(212,175,55,0.08)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#D4AF37" }}>What people say</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 700 }}>
              Real people. Real results.
            </h2>
            {/* Stars */}
            <div className="flex items-center justify-center gap-1 mt-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} style={{ color: "#D4AF37", fontSize: "1.1rem" }}>★</span>
              ))}
              <span className="ml-2 text-sm" style={{ color: "#6b7280" }}>5.0 from our users</span>
            </div>
          </div>

          {/* Desktop grid */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-5">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="rounded-2xl p-6 flex flex-col" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <StarRating count={t.rating} />
                <p className="text-sm mt-4 flex-1" style={{ color: "#9ca3af", lineHeight: 1.8 }}>"{t.text}"</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "rgba(212,175,55,0.2)", color: "#D4AF37" }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{t.name}</div>
                    <div className="text-xs" style={{ color: "#4b5563" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile carousel */}
          <div className="md:hidden">
            <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <StarRating count={TESTIMONIALS[visibleTestimonial].rating} />
              <p className="text-sm mt-4" style={{ color: "#9ca3af", lineHeight: 1.8 }}>"{TESTIMONIALS[visibleTestimonial].text}"</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "rgba(212,175,55,0.2)", color: "#D4AF37" }}>
                  {TESTIMONIALS[visibleTestimonial].name[0]}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{TESTIMONIALS[visibleTestimonial].name}</div>
                  <div className="text-xs" style={{ color: "#4b5563" }}>{TESTIMONIALS[visibleTestimonial].role}</div>
                </div>
              </div>
            </div>
            {/* Dots */}
            <div className="flex justify-center gap-2 mt-4">
              {TESTIMONIALS.map((_, i) => (
                <button key={i} onClick={() => setVisibleTestimonial(i)} className="w-2 h-2 rounded-full transition-all" style={{ background: i === visibleTestimonial ? "#D4AF37" : "rgba(255,255,255,0.2)" }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="px-5 md:px-12 py-20 max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#D4AF37" }}>Got questions?</p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 700 }}>
            Frequently asked
          </h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-xl overflow-hidden transition-all" style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
              <button
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-4"
              >
                <span className="text-sm font-medium text-white">{faq.q}</span>
                <span className="text-lg flex-shrink-0 transition-transform" style={{ color: "#D4AF37", transform: activeFaq === i ? "rotate(45deg)" : "rotate(0deg)" }}>+</span>
              </button>
              {activeFaq === i && (
                <div className="px-5 pb-4">
                  <p className="text-sm" style={{ color: "#9ca3af", lineHeight: 1.75 }}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="px-5 py-24 text-center" style={{ background: "rgba(212,175,55,0.03)", borderTop: "1px solid rgba(212,175,55,0.08)" }}>
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8" style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.3)", color: "#D4AF37" }}>
            ✦ Join people who track smarter
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.2rem, 6vw, 4rem)", fontWeight: 900, lineHeight: 1.1 }}>
            Take control of your<br />
            <span style={{ color: "#D4AF37", fontStyle: "italic" }}>financial future</span> today.
          </h2>
          <p className="mt-5 mb-10 text-lg" style={{ color: "#6b7280", fontWeight: 300 }}>
            Free to use. No ads. No credit card. Just clarity.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate("/register")}
              className="w-full sm:w-auto px-10 py-4 rounded-full text-base font-semibold transition-all hover:scale-105"
              style={{ background: "#D4AF37", color: "#080808", boxShadow: "0 0 50px rgba(212,175,55,0.25)" }}
            >
              Create your free account →
            </button>
            <button
              onClick={() => navigate("/login")}
              className="w-full sm:w-auto px-8 py-4 rounded-full text-sm transition-all"
              style={{ border: "1px solid rgba(255,255,255,0.12)", color: "#9ca3af" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(212,175,55,0.4)"; e.currentTarget.style.color = "#D4AF37"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "#9ca3af"; }}
            >
              Sign in instead
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-5 md:px-12 py-10" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span>💰</span>
                <span style={{ fontFamily: "'Playfair Display', serif", color: "#D4AF37", fontSize: "1rem", fontWeight: 700 }}>BudgetTracker</span>
              </div>
              <p className="text-xs" style={{ color: "#4b5563", maxWidth: 260, lineHeight: 1.7 }}>
                A personal budget tracker built for clarity, not complexity. Made in Ghana 🇬🇭
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm" style={{ color: "#6b7280" }}>
              <button onClick={() => navigate("/register")} className="text-left hover:text-white transition-colors">Get started</button>
              <button onClick={() => navigate("/login")}    className="text-left hover:text-white transition-colors">Sign in</button>
              <a href="#features"     className="hover:text-white transition-colors">Features</a>
              <a href="#faq"          className="hover:text-white transition-colors">FAQ</a>
              <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
              <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <p className="text-xs" style={{ color: "#374151" }}>© {new Date().getFullYear()} BudgetTracker. All rights reserved.</p>
            <div className="flex gap-5 text-xs" style={{ color: "#374151" }}>
              <span className="cursor-pointer hover:text-gray-400 transition">Privacy Policy</span>
              <span className="cursor-pointer hover:text-gray-400 transition">Terms of Service</span>
              <span className="cursor-pointer hover:text-gray-400 transition">Contact</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
