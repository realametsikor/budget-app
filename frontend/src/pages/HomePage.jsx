// src/pages/HomePage.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  Scale, Banknote, Landmark, CalendarClock, HeartHandshake, 
  PieChart, ShieldCheck, Smartphone, Users, Wallet, Sun, Moon, 
  ChevronRight, ArrowRight, Quote, BarChart3, Goal, Lock 
} from "lucide-react";

export default function HomePage() {
  const navigate  = useNavigate();
  const { user, theme, toggleTheme, t } = useAuth();
  const canvasRef = useRef(null);

  const FEATURES = [
    { icon: <Scale size={24} />, title: "Precision Budgeting", desc: "assign every cedi a job. watch real spending dynamically update as you go." },
    { icon: <PieChart size={24} />, title: "Live Cash Flow Visualization", desc: "instant analytics with clean, interactive bar charts and progress bars." },
    { icon: <Smartphone size={24} />, title: "Uninterrupted Mobile Access", desc: "fully optimized for mobile. open it on your phone at the market, your laptop at home." },
    { icon: <Lock size={24} />, title: "End-to-End Data Privacy", desc: "your numbers are yours. no ads, no selling, no third-party trackers. ever." },
    { icon: <Users size={24} />, title: "Collaborative Financial Views", desc: "each account is completely isolated, but share your success with friends." },
    { icon: <HeartHandshake size={24} />, title: "Automated Tithe & Giving", desc: "set 10% once. it auto-calculates from your income budget every month." },
  ];

  const TESTIMONIALS = [
    { name: "Nannette B.", role: "Kumasi nurse", text: "i used to dread checking my balance. now i look at BudgetTracker every morning. it's professional and gives me clarity on my income vs my fixed bills." },
    { name: "Nii O.", role: "Accra freelancer", text: "this app handles my varying income. i just update my paycheck entries and the entire month recalcs. it's simpler than spreadsheets but infinitely more powerful." },
    { name: "Ama K.", role: "KNUST graduate student", text: "set my april budget in 10 minutes. i saved ₵800 more than i ever did before because i could visualize where my money was actually going in real-time." },
  ];

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

  const roadmapSteps = [
    { icon: <Goal size={32} />, step: "Step 1: Set Your Plan", title: "assign every cedi a job.", desc: "Enter your planned income and spending limits for each category at the start of the month." },
    { icon: <ReceiptText size={32} />, step: "Step 2: Log Transactions", title: "track everything with ease.", desc: "Add expenses as you go. Categorized exactly the way you think about money, not just generic codes." },
    { icon: <PieChart size={32} />, step: "Step 3: Gain Insight", title: "master your finances.", desc: "Instant analytics build themselves, showing planned vs actual spending and your real-time cash flow." },
  ];

  return (
    <div className="min-h-screen transition-colors duration-500 overflow-x-hidden selection:bg-gold selection:text-black" style={{ background: t.bg, color: t.text, fontFamily: "'DM Sans', sans-serif" }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 md:px-12 py-4 transition-colors" style={{ background: t.navBg, backdropFilter: "blur(12px)", borderBottom: `1px solid ${t.cardBorder}` }}>
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => window.scrollTo(0, 0)}>
          <div className="w-8 h-8 rounded flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform" style={{ background: t.accent }}>
             <Wallet size={16} strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.15rem", fontWeight: 700, color: t.text, letterSpacing: "0.5px" }}>BudgetTracker</span>
        </div>
        <div className="hidden md:flex items-center gap-10 text-sm font-medium" style={{ color: t.textMuted }}>
          <a href="#features" className="hover:text-gold transition-colors cursor-pointer">Features</a>
          <a href="#how-it-works" className="hover:text-gold transition-colors cursor-pointer">How it works</a>
          <a href="#testimonials" className="hover:text-gold transition-colors cursor-pointer">Reviews</a>
          <a href="#security" className="hover:text-gold transition-colors cursor-pointer">Security</a>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="p-2.5 rounded-full transition-all hover:scale-110 shadow-lg" style={{ background: t.card, color: t.text, border: `1px solid ${t.cardBorder}` }}>
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          
          {user ? (
            <button
              onClick={() => navigate("/app")}
              className="text-sm px-6 py-2.5 rounded-full font-semibold transition-all hover:scale-105 shadow-[0_0_15px_rgba(212,175,55,0.2)] flex items-center gap-2"
              style={{ background: t.accent, color: theme === "dark" ? "#000" : "#fff" }}
            >
              Return to Dashboard
            </button>
          ) : (
            <>
              <button onClick={() => navigate("/login")} className="text-sm font-medium transition-colors px-3 py-2" style={{ color: t.textMuted }}>
                Sign in
              </button>
              <button
                onClick={() => navigate("/register")}
                className="text-sm px-6 py-2.5 rounded-full font-semibold transition-all hover:scale-105 shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                style={{ background: t.accent, color: theme === "dark" ? "#000" : "#fff" }}
              >
                Get Started Free
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden pt-20">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }} />
        {/* Concentric circles illustration - Illustrative depth */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full" style={{ background: `radial-gradient(circle, ${t.accentBg} 0%, transparent 70%)`, filter: "blur(40px)" }} />

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-10 transition-colors" style={{ background: t.accentBg, border: `1px solid ${t.accent}40`, color: t.accent }}>
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" /> ✦ Bank-level security · Ghana cedi native · Free forever
          </div>

          <h1 className="text-white" style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(3.5rem, 10vw, 7.5rem)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.02em" }}>
            Your money,{" "}
            <span className="text-gold italic">finally</span>
            <br />under control.
          </h1>

          <p className="mt-8 text-xl md:text-2xl max-w-3xl mx-auto font-light leading-relaxed" style={{ color: t.textMuted }}>
            A profoundly simple, bank-grade budget tracker built to make your financial status visually clear. assigning every cedi a job and watching your money grow has never been more intuitive.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12 w-full sm:w-auto">
            {user ? (
              <button
                onClick={() => navigate("/app")}
                className="w-full sm:w-auto px-10 py-5 rounded-full text-lg font-semibold transition-all hover:scale-105 shadow-[0_0_30px_rgba(212,175,55,0.25)] flex items-center justify-center gap-2"
                style={{ background: t.accent, color: theme === "dark" ? "#000" : "#fff" }}
              >
                Go to Dashboard <ChevronRight size={20} />
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate("/register")}
                  className="w-full sm:w-auto px-10 py-5 rounded-full text-lg font-semibold transition-all hover:scale-105 shadow-[0_0_30px_rgba(212,175,55,0.25)] flex items-center justify-center gap-2"
                  style={{ background: t.accent, color: theme === "dark" ? "#000" : "#fff" }}
                >
                  Start Tracking Free →
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="w-full sm:w-auto px-10 py-5 rounded-full text-base font-medium transition-all flex items-center justify-center gap-2"
                  style={{ border: `1px solid ${t.textMuted}`, color: t.textMuted }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#D4AF37"; e.currentTarget.style.color = "#D4AF37"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = t.textMuted; e.currentTarget.style.color = t.textMuted; }}
                >
                  I already have an account
                </button>
              </>
            )}
          </div>
          
          {/* Illustrative proof counter/logos - Placeholder */}
          <div className="mt-20 pt-10 flex items-center justify-center gap-6 text-sm" style={{ color: "#374151", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
             <span> Ghana native 🇬🇭 </span>
             <span> / </span>
             <span> ₵100M+ planned & tracked </span>
             <span> / </span>
             <span> rated 4.9/5 by 5,000+ users </span>
          </div>

          {/* DASHBOARD PROOF MOCKUP */}
          <div className="mt-16 w-full max-w-4xl relative perspective-1000">
            <div className="rounded-3xl shadow-2xl overflow-hidden transform-gpu hover:scale-105 hover:-translate-y-2 transition-transform duration-700" style={{ border: `2px solid ${t.accent}30`, background: "#0c0e14" }}>
               {/* Browser Chrome */}
               <div className="h-12 border-b border-white/5 flex items-center px-6 gap-2 bg-black/40">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <div className="w-40 h-4 rounded-md mx-auto" style={{ background: theme === "dark" ? "#111827" : "#e5e7eb" }} />
               </div>
               {/* Mock Dashboard Layout */}
               <div className="p-6 md:p-8 space-y-6">
                  {/* KPI cards and health score mockup - Placeholder */}
                  <div className="w-32 h-6 rounded bg-white/10" />
                  <div className="w-full h-24 rounded-2xl bg-white/5" />
                  <div className="w-40 h-6 rounded bg-white/10" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     <div className="h-20 rounded-2xl bg-white/10" />
                     <div className="h-20 rounded-2xl bg-white/10" />
                     <div className="h-20 rounded-2xl bg-white/10" />
                     <div className="h-20 rounded-2xl bg-white/10" />
                  </div>
                  <div className="w-full h-12 rounded-xl bg-white/5" />
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF LOGOS BANNER - ILLUSTRATIVE ── */}
      <section className="px-5 md:px-12 py-12 text-center" style={{ background: theme === "dark" ? "rgba(212,175,55,0.01)" : "rgba(14,165,233,0.01)", borderTop: `1px solid ${t.cardBorder}` }}>
         <p className="text-xs uppercase tracking-widest" style={{ color: "#4b5563" }}> featured & trusted by illustrative financial news </p>
         <div className="mt-6 flex flex-wrap items-center justify-center gap-10 md:gap-14 opacity-30 grayscale text-sm" style={{ color: t.textMuted }}>
             <span> Financial Times </span>
             <span> / </span>
             <span> Forbes </span>
             <span> / </span>
             <span> Reuters </span>
             <span> / </span>
             <span> Standard Chartered (illustrative example) </span>
             <span> / </span>
             <span> PwC (illustrative example) </span>
         </div>
      </section>

      {/* ── HOW IT WORKS Roadmap Section ── */}
      <section id="how-it-works" className="px-5 md:px-12 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#D4AF37" }}> profoundly simple by design </p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.5rem, 7vw, 5rem)", fontWeight: 700 }}>
             master your money in <span className="text-gold italic">three steps</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {roadmapSteps.map((item, i) => (
            <div key={item.step} className="rounded-3xl p-8 transition-all hover:scale-105 shadow-xl relative overflow-hidden" style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}>
               {/* Illustrative depth glow blob */}
               <div className="absolute top-10 right-10 w-40 h-40 rounded-full" style={{ background: `radial-gradient(circle, ${t.accentBg} 0%, transparent 70%)`, filter: "blur(40px)" }} />
               
               <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: t.accentBg, color: t.accent }}>
                    {item.icon}
                  </div>
                  <span className="text-xs uppercase tracking-widest mb-1.5" style={{ color: t.textMuted }}>{item.step}</span>
                  <h3 className="font-semibold text-lg text-white mb-2">{item.title}</h3>
                  <p className="text-sm font-light leading-relaxed" style={{ color: t.textMuted }}>{item.desc}</p>
               </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES GRID Bento Box ── */}
      <section id="features" className="px-5 md:px-12 py-24 max-w-7xl mx-auto" style={{ borderTop: `1px solid ${t.cardBorder}`, borderBottom: `1px solid ${t.cardBorder}` }}>
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#D4AF37" }}> everything you need, nothing you don't </p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.5rem, 8vw, 6rem)", fontWeight: 700 }}>
             pro tools for <span className="text-gold italic">absolute clarity</span>
          </h2>
          <p className="mt-5 max-w-xl mx-auto text-sm" style={{ color: t.textMuted, lineHeight: 1.75 }}>
            every feature designed for the Ghanaian context. assignments are clear, comparisons are dynamic, and visualizations are instant.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className={`rounded-3xl p-8 flex flex-col transition-all duration-300 hover:scale-105 hover:-translate-y-2 cursor-default relative overflow-hidden ${i === 0 || i === FEATURES.length - 1 ? 'md:col-span-2' : ''}`}
              style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${t.accent}44`; e.currentTarget.style.background = `${t.accentBg}`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = t.cardBorder; e.currentTarget.style.background = t.card; }}
            >
              {/* Illustrative depth glow */}
              <div className="absolute top-10 right-10 w-24 h-24 rounded-full" style={{ background: `radial-gradient(circle, ${t.accentBg} 0%, transparent 70%)`, filter: "blur(40px)" }} />
              
              <div className="relative z-10">
                 <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-6 shadow-md" style={{ background: t.accentBg, color: t.accent }}>
                    {f.icon}
                 </div>
                 <h3 className="font-semibold text-lg mb-2" style={{ color: t.text }}>{f.title}</h3>
                 <p className="text-sm font-light flex-1 leading-relaxed" style={{ color: t.textMuted }}>{f.desc}</p>
                 
                 {/* Illustrative chart/progress indicators within the box */}
                 <div className="mt-6 flex items-center gap-3">
                     <div className="h-1 flex-1 rounded-full" style={{ background: `${t.accent}20` }} >
                         <div className="h-1 rounded-full" style={{ background: t.accent, width: `${(i+1)*15}%` }} />
                     </div>
                     <span className="text-xs font-medium" style={{ color: t.textMuted }}>{(i+1)*15}% planned</span>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECURITY SECTION & Trust Badges ── */}
      <section id="security" className="px-5 md:px-12 py-24 max-w-4xl mx-auto text-center relative overflow-hidden">
         {/* Gold glow blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 rounded-full" style={{ background: `radial-gradient(circle, ${t.accentBg} 0%, transparent 70%)`, filter: "blur(40px)" }} />
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-8" style={{ background: t.accentBg, color: t.accent }}>
              <Lock size={32} />
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.5rem, 6vw, 4rem)", fontWeight: 700 }}>
             your data, secure.
          </h2>
          <p className="mt-6 text-xl" style={{ color: t.textMuted, fontWeight: 300, lineHeight: 1.75 }}>
            BudgetTracker uses bank-grade encryption to secure your data in an encrypted database. We strictly adhere to Ghanaian data protection regulations. We do not run ads, we do not sell data, and we do not connect to third-party data aggregators.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-5 text-sm" style={{ color: t.textMuted }}>
             <span className="flex items-center gap-1.5 p-3 rounded-xl" style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}><ShieldCheck size={16} /> Data protection compliant</span>
             <span className="flex items-center gap-1.5 p-3 rounded-xl" style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}><Lock size={16} /> Fully encrypted storage</span>
             <span className="flex items-center gap-1.5 p-3 rounded-xl" style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}><Users size={16} /> strictly user-controlled access</span>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS Carousel (Scrubbed Emojis) ── */}
      <section id="testimonials" className="px-5 md:px-12 py-20" style={{ background: theme === "dark" ? "rgba(212,175,55,0.02)" : "rgba(14,165,233,0.02)", borderTop: `1px solid ${t.cardBorder}`, borderBottom: `1px solid ${t.cardBorder}` }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#D4AF37" }}> visual evidence from our community </p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 6vw, 4rem)", fontWeight: 700 }}>
               real results. profoundly simple.
            </h2>
            {/* Illustrative stars for context - Placeholder */}
            <div className="flex items-center justify-center gap-1 mt-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} style={{ color: "#D4AF37", fontSize: "1.1rem" }}>★</span>
              ))}
              <span className="ml-2 text-sm" style={{ color: t.textMuted }}>5.0 star rated experience</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={t.name} className="rounded-2xl p-6 flex flex-col relative overflow-hidden group" style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}>
                {/* Illustrative gradient depth */}
                <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <StarRating count={t.rating} />
                <Quote size={20} className="text-gold mt-6 mb-4" />
                <p className="text-sm mt-1 flex-1 font-light leading-relaxed" style={{ color: t.textMuted }}>"{t.text}"</p>
                <div className="mt-8 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shadow-md" style={{ background: t.accentBg, color: t.accent }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{t.name}</div>
                    <div className="text-xs" style={{ color: t.textMuted }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ Section (Placeholder) ── */}
      <section id="faq" className="px-5 md:px-12 py-20 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#D4AF37" }}> got questions? </p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.5rem, 6vw, 4rem)", fontWeight: 700 }}>
             frequently asked.
          </h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-xl overflow-hidden transition-all duration-300" style={{ border: `1px solid ${t.cardBorder}`, background: t.card }}>
              <button
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-4"
              >
                <span className="text-sm font-medium text-white">{faq.q}</span>
                <ChevronRight size={18} className="text-gold flex-shrink-0 transition-transform" style={{ transform: activeFaq === i ? "rotate(90deg)" : "rotate(0deg)" }} />
              </button>
              {activeFaq === i && (
                <div className="px-5 pb-5">
                  <p className="text-sm font-light leading-relaxed" style={{ color: t.textMuted }}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA SECTION (Refined) ── */}
      <section className="px-5 py-24 text-center relative overflow-hidden" style={{ background: theme === "dark" ? "rgba(212,175,55,0.03)" : "rgba(14,165,233,0.03)", borderTop: `1px solid ${t.cardBorder}` }}>
         {/* Concentric depth circles illustration - Placeholder */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full" style={{ background: `radial-gradient(circle, ${t.accentBg} 0%, transparent 70%)`, filter: "blur(40px)" }} />
        
        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8" style={{ background: t.accentBg, border: `1px solid ${t.accent}40`, color: t.accent }}>
            ✦ ✦ ✦ join professional ghanaians tracking smarter
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.5rem, 8vw, 5rem)", fontWeight: 900, lineHeight: 1.1 }}>
            Ready to design your<br />
            <span className="text-gold italic">financial future</span>?
          </h2>
          <p className="mt-6 mb-12 text-xl max-w-2xl font-light" style={{ color: t.textMuted }}>
             No obligation, profoundly simple to start. GHS native support, secure connections, and total clarity. Free to use forever.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            {user ? (
              <button
                onClick={() => navigate("/app")}
                className="w-full sm:w-auto px-10 py-4 rounded-full text-base font-semibold transition-all hover:scale-105 shadow-[0_0_50px_rgba(212,175,55,0.25)] flex items-center justify-center gap-2"
                style={{ background: t.accent, color: theme === "dark" ? "#000" : "#fff" }}
              >
                Go to Dashboard <ChevronRight size={18} />
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate("/register")}
                  className="w-full sm:w-auto px-10 py-4 rounded-full text-base font-semibold transition-all hover:scale-105 shadow-[0_0_50px_rgba(212,175,55,0.25)] flex items-center justify-center gap-2"
                  style={{ background: t.accent, color: theme === "dark" ? "#000" : "#fff" }}
                >
                  Create Your Free Account <ArrowRight size={18} />
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="w-full sm:w-auto px-8 py-4 rounded-full text-sm transition-all"
                  style={{ border: `1px solid ${t.textMuted}`, color: t.textMuted }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#D4AF37"; e.currentTarget.style.color = "#D4AF37"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = t.textMuted; e.currentTarget.style.color = t.textMuted; }}
                >
                  I already have an account
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER (Refined) ── */}
      <footer className="px-5 md:px-12 py-10" style={{ borderTop: `1px solid ${t.cardBorder}` }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded flex items-center justify-center shadow-md" style={{ background: t.accent, color: "#fff" }}>
              <Wallet size={12} strokeWidth={2.5} />
            </div>
            <span style={{ fontFamily: "'Playfair Display', serif", color: t.text, fontSize: "1rem", fontWeight: 700, letterSpacing: "0.3px" }}>BudgetTracker</span>
          </div>
          <p className="text-sm font-light" style={{ color: t.textMuted }}>
            © {new Date().getFullYear()} BudgetTracker. Built native in Ghana 🇬🇭.
          </p>
        </div>
      </footer>
    </div>
  );
}
