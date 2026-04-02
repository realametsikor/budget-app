// src/components/Dashboard.jsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend,
} from "chart.js";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useAuth } from "../context/AuthContext";
import TransactionTable from "./TransactionTable";
import TransactionForm  from "./TransactionForm";
import BudgetPlanEditor from "./BudgetPlanEditor";
import { 
  ArrowLeft, Wallet, FileText, Plus, PieChart, Receipt,
  ArrowUpRight, ArrowDownRight, Star, Scale, Activity, Sun, Moon, LogOut, Target, LayoutDashboard, DownloadCloud
} from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);
const API = "https://budget-app-backend-gn8r.onrender.com/api";

const MONTHS       = ["","January","February","March","April","May","June","July","August","September","October","November","December"];
const SHORT_MONTHS = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const THEMES = {
  dark: {
    bgClass: "bg-[#050505]", meshClass: "mesh-bg-dark",
    navBg: "rgba(5,5,5,0.7)", text: "#f8fafc", textMuted: "#9ca3af",
    card: "rgba(20,20,20,0.6)", cardBorder: "rgba(255,255,255,0.08)",
    accent: "#D4AF37", accentBg: "rgba(212,175,55,0.1)",
    green: "#34d399", red: "#f87171", warning: "#fbbf24", blue: "#3b82f6", chartGrid: "rgba(255,255,255,0.05)"
  },
  light: {
    bgClass: "bg-[#f4f4f5]", meshClass: "mesh-bg-light",
    navBg: "rgba(244,244,245,0.7)", text: "#18181b", textMuted: "#71717a",
    card: "rgba(255,255,255,0.7)", cardBorder: "rgba(255,255,255,0.4)",
    accent: "#4f46e5", accentBg: "rgba(79,70,229,0.1)",
    green: "#10b981", red: "#ef4444", warning: "#f59e0b", blue: "#2563eb", chartGrid: "rgba(0,0,0,0.05)"
  }
};

function healthScore(s) {
  if (!s) return { score: 0, label: "No data", color: "textMuted" };
  const income = s.income?.actual || 0;
  if (income === 0) return { score: 0, label: "No income", color: "textMuted" };
  const savingsRate = income > 0 ? (s.savings?.actual || 0) / income : 0;
  const spendRate   = income > 0 ? (s.spent?.actual   || 0) / income : 0;
  const hasBalance  = (s.balance?.actual || 0) >= 0;
  
  let score = 0;
  if (savingsRate >= 0.2) score += 40; else if (savingsRate >= 0.1) score += 20;
  if (spendRate <= 0.6) score += 30; else if (spendRate <= 0.8) score += 15;
  if (hasBalance) score += 30;
  
  if (score >= 80) return { score, label: "Excellent", color: "green" };
  if (score >= 55) return { score, label: "Good",      color: "accent" };
  if (score >= 30) return { score, label: "Fair",      color: "warning" };
  return { score, label: "Needs work", color: "red" };
}

function greeting(name) {
  const h = new Date().getHours();
  const first = name?.split(" ")[0] || "there";
  if (h < 12) return `Good morning, ${first}`;
  if (h < 17) return `Good afternoon, ${first}`;
  return `Good evening, ${first}`;
}

export default function Dashboard() {
  const { user, logout, authFetch, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();
  const now = new Date();

  const currentTheme = theme || "dark";
  const t = THEMES[currentTheme];

  const [month, setMonth]       = useState(now.getMonth() + 1);
  const [year,  setYear]        = useState(now.getFullYear());
  const [summary, setSummary]   = useState(null);
  const [transactions, setTx]   = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showPlan, setShowPlan] = useState(false);
  const [showMenu, setMenu]     = useState(false);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setTab]     = useState("overview");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, txRes] = await Promise.all([
        authFetch(`${API}/summary?year=${year}&month=${month}`),
        authFetch(`${API}/transactions?year=${year}&month=${month}`),
      ]);
      const sumData = await sumRes.json();
      const txData  = await txRes.json();
      setSummary(sumData.error ? null : sumData);
      setTx(Array.isArray(txData) ? txData : []);
    } catch (e) { console.error("Fetch error:", e); }
    setLoading(false);
  }, [month, year, authFetch]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    if (!showMenu) return;
    const close = () => setMenu(false);
    setTimeout(() => document.addEventListener("click", close), 0);
    return () => document.removeEventListener("click", close);
  }, [showMenu]);

  // Standard formatter for the UI (uses Cedi symbol)
  const fmt = (n) => new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(n ?? 0);
  
  // Safe formatter for the PDF (uses GHS text to prevent font encoding errors)
  const pdfFmt = (n) => {
    const val = Number(n) || 0;
    return "GHS " + val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const s = summary || {};
  const healthInfo = healthScore(s);
  const hColor = t[healthInfo.color] || t.textMuted;
  const initials = user?.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";

  const barOptions = {
    responsive: true, maintainAspectRatio: true,
    plugins: { legend: { labels: { color: t.textMuted, font: { size: 11, family: "'DM Sans', sans-serif", weight: "bold" } } }, tooltip: { callbacks: { label: ctx => " " + fmt(ctx.raw) } } },
    scales: {
      x: { ticks: { color: t.textMuted, font: { family: "'DM Sans', sans-serif" } }, grid: { color: t.chartGrid } },
      y: { ticks: { color: t.textMuted, font: { family: "'DM Sans', sans-serif" } }, grid: { color: t.chartGrid } },
    },
  };

  const doughnutOptions = {
    responsive: true, maintainAspectRatio: false, cutout: "75%",
    plugins: { 
      legend: { position: "top", labels: { color: t.textMuted, font: { size: 11, family: "'DM Sans', sans-serif", weight: "bold" }, padding: 20 } }, 
      tooltip: { callbacks: { label: ctx => " " + fmt(ctx.raw) } } 
    }
  };

  const doughnutData = {
    labels: ["Bills", "Variable", "Savings", "Balance"],
    datasets: [{
      data: [ s.bills?.actual || 0, s.variableExpenses?.actual || 0, s.savings?.actual || 0, Math.max(0, (s.balance?.actual || 0)) ],
      backgroundColor: [t.red, t.blue, t.accent, t.green], 
      borderWidth: 0, hoverOffset: 4,
    }],
  };

  const barData = {
    labels: ["Income","Bills","Variable","Savings"],
    datasets: [
      { label: "Planned", data: [s.income?.planned, s.bills?.planned, s.variableExpenses?.planned, s.savings?.planned], backgroundColor: currentTheme==="dark"?"rgba(148,163,184,0.3)":"rgba(148,163,184,0.5)", borderRadius: 6 },
      { label: "Actual",  data: [s.income?.actual,  s.bills?.actual,  s.variableExpenses?.actual,  s.savings?.actual],  backgroundColor: t.accent, borderRadius: 6 },
    ],
  };

  const cashFlowRows = [
    { label: "Start Balance", planned: s.startBalance, actual: s.startBalance, neutral: true },
    { label: "Income", planned: s.income?.planned, actual: s.income?.actual, positive: true },
    { label: "Expenses", planned: s.totalExpenses?.planned, actual: s.totalExpenses?.actual, negative: true },
    { label: "↳ Bills", planned: s.bills?.planned, actual: s.bills?.actual, negative: true, indent: true },
    { label: "↳ Variable", planned: s.variableExpenses?.planned, actual: s.variableExpenses?.actual, negative: true, indent: true },
    { label: "Savings", planned: s.savings?.planned, actual: s.savings?.actual, savings: true },
    { label: "Balance", planned: s.balance?.planned, actual: s.balance?.actual, balance: true },
  ];

  // ── FIX: PDF GENERATION WITH "GHS" TEXT INSTEAD OF SYMBOL ──
  const exportPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text("Monthly Financial Report", 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`BudgetTracker • ${SHORT_MONTHS[month]} ${year} • ${user?.name || "Account Statement"}`, 14, 30);

    // KPI Summary Section
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Account Summary", 14, 45);

    doc.autoTable({
      startY: 50,
      head: [["Start Balance", "Total Income", "Total Spent", "Total Saved", "End Balance"]],
      body: [[
        pdfFmt(s.startBalance),
        pdfFmt(s.income?.actual),
        pdfFmt(s.spent?.actual),
        pdfFmt(s.savings?.actual),
        pdfFmt(s.balance?.actual)
      ]],
      theme: "grid",
      headStyles: { fillColor: [40, 40, 40], halign: 'center' },
      bodyStyles: { halign: 'center', fontStyle: 'bold' }
    });

    // Cash Flow Table Section
    let finalY = doc.lastAutoTable.finalY;
    doc.setFontSize(14);
    doc.text("Cash Flow Details", 14, finalY + 15);
    
    const cfBody = cashFlowRows.map(row => {
      const diff = (row.actual ?? 0) - (row.planned ?? 0);
      const sign = diff > 0 ? "+" : "";
      return [
        row.label.replace("↳ ", "  - "),
        pdfFmt(row.planned),
        pdfFmt(row.actual),
        `${sign}${pdfFmt(diff)}`
      ];
    });

    doc.autoTable({
      startY: finalY + 20,
      head: [["Category", "Planned", "Actual", "Variance"]],
      body: cfBody,
      theme: "striped",
      headStyles: { fillColor: currentTheme === "dark" ? [212, 175, 55] : [79, 70, 229] }
    });

    // Transactions Table Section
    finalY = doc.lastAutoTable.finalY;
    if (finalY > 230) {
      doc.addPage();
      finalY = 20;
    } else {
      finalY += 15;
    }

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Transaction History", 14, finalY);

    if (transactions.length > 0) {
      const txBody = transactions.map(tx => {
        const isInc = (tx.section || "").toLowerCase().includes("income");
        const sign = isInc ? "+" : "-";
        const date = new Date(tx.transaction_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
        return [
          date,
          tx.description || "—",
          tx.sub_category || tx.category || "—",
          `${sign}${pdfFmt(tx.amount)}`
        ];
      });

      doc.autoTable({
        startY: finalY + 5,
        head: [["Date", "Description", "Category", "Amount"]],
        body: txBody,
        theme: "grid",
        headStyles: { fillColor: [100, 100, 100] }
      });
    } else {
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text("No transactions logged for this month.", 14, finalY + 10);
    }

    doc.save(`BudgetTracker_Report_${SHORT_MONTHS[month]}_${year}.pdf`);
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors ${t.bgClass}`}>
        <div className="w-10 h-10 rounded-full border-4 border-transparent animate-spin" style={{ borderTopColor: t.accent }} />
      </div>
    );
  }

  const isEmpty = !s.income?.actual && !s.spent?.actual && transactions.length === 0;

  return (
    <div className={`min-h-screen transition-colors duration-700 ${t.bgClass} ${t.meshClass}`} style={{ color: t.text, fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        .glass-card { backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }
        .mesh-bg-light { background-image: radial-gradient(at 0% 0%, hsla(199,89%,48%,0.15) 0px, transparent 50%), radial-gradient(at 100% 0%, hsla(253,91%,64%,0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, hsla(340,82%,52%,0.15) 0px, transparent 50%), radial-gradient(at 0% 100%, hsla(43,100%,50%,0.15) 0px, transparent 50%); }
        .mesh-bg-dark { background-image: radial-gradient(at 0% 0%, hsla(46,65%,52%,0.1) 0px, transparent 50%), radial-gradient(at 100% 0%, hsla(253,91%,64%,0.05) 0px, transparent 50%), radial-gradient(at 100% 100%, hsla(340,82%,52%,0.05) 0px, transparent 50%), radial-gradient(at 0% 100%, hsla(43,100%,50%,0.05) 0px, transparent 50%); }
      `}</style>

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-40 border-b glass-card transition-colors" style={{ background: t.navBg, borderColor: t.cardBorder }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => navigate("/")} className="p-1.5 md:p-2 rounded-lg transition-colors hover:scale-110" style={{ color: t.textMuted }}>
              <ArrowLeft size={20} />
            </button>
            <div onClick={() => navigate("/")} className="flex items-center gap-2 md:gap-3 cursor-pointer group hover:opacity-80 transition-opacity">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-105" style={{ background: t.accent }}>
                <Wallet size={14} strokeWidth={2.5} />
              </div>
              <span className="hidden sm:block font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif", color: t.text }}>BudgetTracker</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-1 max-w-[200px] md:max-w-sm">
            <select value={month} onChange={e => setMonth(Number(e.target.value))} className="flex-1 rounded-xl px-2 md:px-4 py-2 md:py-2.5 text-xs md:text-sm font-bold focus:outline-none appearance-none shadow-sm glass-card" style={{ background: t.card, border: `1px solid ${t.cardBorder}`, color: t.text }}>
              {MONTHS.slice(1).map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
            </select>
            <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} className="w-16 md:w-20 rounded-xl px-2 md:px-4 py-2 md:py-2.5 text-xs md:text-sm font-bold focus:outline-none text-center shadow-sm glass-card" style={{ background: t.card, border: `1px solid ${t.cardBorder}`, color: t.text }} />
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button onClick={toggleTheme} className="hidden sm:flex p-2 md:p-2.5 rounded-full transition-transform hover:scale-110 shadow-sm glass-card" style={{ background: t.card, color: t.text, border: `1px solid ${t.cardBorder}` }}>
              {currentTheme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <button onClick={exportPDF} className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] shadow-sm glass-card" style={{ background: t.card, border: `1px solid ${t.cardBorder}`, color: t.text }}>
              <DownloadCloud size={16} /> Report
            </button>

            <button onClick={() => setShowPlan(true)} className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] shadow-sm glass-card" style={{ background: t.card, border: `1px solid ${t.cardBorder}`, color: t.text }}>
              <Target size={16} /> Plan
            </button>

            <button onClick={() => setShowForm(true)} className="flex items-center gap-1 px-3 md:px-5 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-bold shadow-lg transition-transform hover:scale-[1.02]" style={{ background: t.accent, color: currentTheme === "dark" ? "#000" : "#fff" }}>
              <Plus size={16} strokeWidth={3} /> <span className="hidden sm:inline">Transaction</span>
            </button>

            <div className="relative ml-1 md:ml-2">
              <button onClick={e => { e.stopPropagation(); setMenu(m => !m); }} className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs font-bold shadow-md" style={{ background: t.accentBg, color: t.accent, border: `2px solid ${t.accent}40` }}>
                {user?.avatar_url ? <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" /> : initials}
              </button>
              {showMenu && (
                <div className="absolute right-0 top-12 w-56 md:w-60 rounded-2xl shadow-2xl overflow-hidden z-50 border glass-card" style={{ background: currentTheme === "dark" ? "rgba(10,10,10,0.95)" : "rgba(255,255,255,0.95)", borderColor: t.cardBorder }}>
                  <div className="px-4 py-3 border-b" style={{ borderColor: t.cardBorder }}>
                    <p className="text-sm font-bold truncate" style={{ color: t.text }}>{user?.name}</p>
                    <p className="text-xs font-semibold truncate mt-1" style={{ color: t.textMuted }}>{user?.email}</p>
                  </div>
                  <div className="p-2">
                    <button onClick={exportPDF} className="md:hidden w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors" style={{ color: t.text }}>
                      <DownloadCloud size={16} style={{ color: t.textMuted }}/> Download PDF
                    </button>
                    <button onClick={() => setShowPlan(true)} className="md:hidden w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors" style={{ color: t.text }}>
                      <Target size={16} style={{ color: t.textMuted }}/> Edit Budget Plan
                    </button>
                    <button onClick={toggleTheme} className="sm:hidden w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors" style={{ color: t.text }}>
                      {currentTheme === "dark" ? <Sun size={16} style={{ color: t.textMuted }} /> : <Moon size={16} style={{ color: t.textMuted }} />} Switch Theme
                    </button>
                    <button onClick={logout} className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors mt-1" style={{ color: t.red }}>
                      <LogOut size={16} /> Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-8 md:space-y-10 relative z-10">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: t.text }}>
              {greeting(user?.name)}.
            </h2>
            <p className="text-xs md:text-sm mt-1 font-bold uppercase tracking-wider" style={{ color: t.textMuted }}>
              Viewing {SHORT_MONTHS[month]} {year} overview
            </p>
          </div>
          
          <div className="flex items-center gap-4 px-4 py-3 md:px-6 md:py-4 rounded-2xl shadow-sm border transition-colors glass-card w-full sm:w-auto" style={{ background: t.card, borderColor: t.cardBorder }}>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${hColor}15`, color: hColor }}>
              <Activity size={20} />
            </div>
            <div>
              <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest mb-0.5 md:mb-1" style={{ color: t.textMuted }}>Health Score</p>
              <div className="flex items-center gap-2">
                <span className="text-xl md:text-2xl font-bold leading-none" style={{ color: hColor }}>{healthInfo.score}</span>
                <span className="text-xs md:text-sm font-bold leading-none" style={{ color: hColor }}>({healthInfo.label})</span>
              </div>
            </div>
          </div>
        </div>

        {isEmpty && (
          <div className="rounded-[2rem] p-8 md:p-12 text-center border-2 border-dashed glass-card shadow-lg" style={{ background: t.accentBg, borderColor: `${t.accent}40` }}>
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md" style={{ background: t.card, color: t.accent, border: `1px solid ${t.cardBorder}` }}>
              <PieChart size={32} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl md:text-3xl font-bold mb-3 md:mb-4" style={{ color: t.text }}>Begin your {SHORT_MONTHS[month]} budget</h3>
            <p className="text-sm md:text-lg mb-6 md:mb-8 max-w-lg mx-auto font-medium leading-relaxed" style={{ color: t.textMuted }}>
              Set your planned income and limits first. Your dashboard will dynamically build itself as you log transactions.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={() => setShowPlan(true)} className="w-full sm:w-auto px-8 py-3.5 md:px-10 md:py-4 rounded-full text-sm md:text-base font-bold shadow-xl transition-transform hover:scale-105" style={{ background: t.accent, color: currentTheme === "dark" ? "#000" : "#fff" }}>
                Set Budget Plan
              </button>
            </div>
          </div>
        )}

        {!isEmpty && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
            {[
              { label: "Income", v: s.income?.actual, c: t.green, icon: <ArrowDownRight size={18} strokeWidth={3}/> },
              { label: "Spent", v: s.spent?.actual, c: t.red, icon: <ArrowUpRight size={18} strokeWidth={3}/> },
              { label: "Saved", v: s.savings?.actual, c: t.accent, icon: <Target size={18} strokeWidth={3}/> },
              { label: "Balance", v: s.balance?.actual, c: (s.balance?.actual ?? 0) >= 0 ? t.green : t.red, icon: <Wallet size={18} strokeWidth={3}/> }
            ].map((card, i) => (
              <div key={i} className="rounded-2xl md:rounded-3xl p-4 md:p-6 border shadow-sm md:shadow-lg transition-transform hover:-translate-y-1 md:hover:-translate-y-2 relative overflow-hidden glass-card" style={{ background: t.card, borderColor: t.cardBorder }}>
                <div className="absolute top-0 right-0 w-16 h-16 md:w-20 md:h-20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-20 pointer-events-none" style={{ background: card.c }} />
                <div className="flex flex-row md:flex-row items-center justify-between mb-4 md:mb-6">
                  <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest" style={{ color: t.textMuted }}>{card.label}</span>
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center shadow-inner" style={{ background: `${card.c}20`, color: card.c }}>{card.icon}</div>
                </div>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight truncate" style={{ color: t.text }}>{fmt(card.v)}</p>
              </div>
            ))}
          </div>
        )}

        {!isEmpty && (
          <div className="flex gap-1 md:gap-2 border-b" style={{ borderColor: t.cardBorder }}>
            {[
              { id: "overview", label: "Overview", icon: <LayoutDashboard size={16}/> },
              { id: "transactions", label: "Transactions", icon: <Receipt size={16}/> }
            ].map((tab) => (
              <button
                key={tab.id} onClick={() => setTab(tab.id)}
                className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-bold flex items-center gap-2 md:gap-3 transition-colors relative uppercase tracking-wider"
                style={{ color: activeTab === tab.id ? t.text : t.textMuted }}
              >
                <span style={{ color: activeTab === tab.id ? t.accent : t.textMuted }}>{tab.icon}</span> {tab.label}
                {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full shadow-[0_0_10px_rgba(212,175,55,0.5)]" style={{ background: t.accent }} />}
              </button>
            ))}
          </div>
        )}

        {activeTab === "overview" && !isEmpty && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Desktop Table View */}
            <div className="hidden lg:block lg:col-span-2 rounded-[2rem] border shadow-lg overflow-hidden glass-card" style={{ background: t.card, borderColor: t.cardBorder }}>
              <div className="px-8 py-6 border-b flex items-center justify-between" style={{ borderColor: t.cardBorder, background: currentTheme === "dark" ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.02)" }}>
                <h3 className="font-bold text-lg flex items-center gap-3" style={{ color: t.text }}><PieChart size={20} color={t.accent} /> Cash Flow Details</h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-widest" style={{ color: t.textMuted, borderBottom: `1px solid ${t.cardBorder}` }}>
                    <th className="text-left px-8 py-5 font-bold">Category</th>
                    <th className="text-right px-8 py-5 font-bold">Planned</th>
                    <th className="text-right px-8 py-5 font-bold">Actual</th>
                    <th className="text-right px-8 py-5 font-bold">Variance</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: t.cardBorder }}>
                  {cashFlowRows.map((row, i) => {
                    const diff = (row.actual ?? 0) - (row.planned ?? 0);
                    const isOver = row.negative ? diff > 0 : diff < 0;
                    return (
                      <tr key={i} className="hover:opacity-80 transition-opacity" style={{ background: row.balance ? (currentTheme==="dark"?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.03)") : "transparent" }}>
                        <td className="px-8 py-5 font-bold flex items-center gap-3" style={{ paddingLeft: row.indent ? "3.5rem" : "2rem", color: row.indent ? t.textMuted : t.text }}>
                          {row.indent && <div className="w-1.5 h-1.5 rounded-full" style={{ background: t.textMuted }}/>} {row.label}
                        </td>
                        <td className="text-right px-8 py-5 font-medium" style={{ color: t.textMuted }}>{fmt(row.planned)}</td>
                        <td className="text-right px-8 py-5 font-bold text-base" style={{ color: row.positive ? t.green : row.negative ? t.red : row.savings ? t.accent : t.text }}>{fmt(row.actual)}</td>
                        <td className="text-right px-8 py-5 font-bold" style={{ color: diff === 0 ? t.textMuted : (isOver && !row.neutral && !row.balance ? t.red : t.green) }}>
                          {diff > 0 ? "+" : ""}{fmt(diff)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile List View - Perfect Stacked Layout */}
            <div className="lg:hidden col-span-1 rounded-[2rem] border shadow-lg overflow-hidden glass-card" style={{ background: t.card, borderColor: t.cardBorder }}>
              <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: t.cardBorder, background: currentTheme === "dark" ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.02)" }}>
                <h3 className="font-bold text-sm flex items-center gap-2" style={{ color: t.text }}><PieChart size={16} color={t.accent} /> Cash Flow Details</h3>
              </div>
              <div className="divide-y" style={{ borderColor: t.cardBorder }}>
                {cashFlowRows.map((row, i) => {
                  const diff = (row.actual ?? 0) - (row.planned ?? 0);
                  const isOver = row.negative ? diff > 0 : diff < 0;
                  const actualColor = row.positive ? t.green : row.negative ? t.red : row.savings ? t.accent : t.text;
                  const diffColor = diff === 0 ? t.textMuted : (isOver && !row.neutral && !row.balance ? t.red : t.green);

                  return (
                    <div key={i} className="p-4" style={{ background: row.balance ? (currentTheme==="dark"?"rgba(255,255,255,0.02)":"rgba(0,0,0,0.02)") : "transparent" }}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-sm flex items-center gap-2 truncate" style={{ color: t.text, marginLeft: row.indent ? "1rem" : "0" }}>
                          {row.indent && <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: t.textMuted }}/>} {row.label}
                        </span>
                        <span className="font-bold text-sm" style={{ color: actualColor }}>{fmt(row.actual)}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider mt-1">
                        <span style={{ color: t.textMuted }}>PLAN: {fmt(row.planned)}</span>
                        <span style={{ color: diffColor }}>DIFF: {diff > 0 ? "+" : ""}{fmt(diff)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[2rem] border p-5 md:p-8 shadow-lg glass-card h-72 md:h-80 flex flex-col" style={{ background: t.card, borderColor: t.cardBorder }}>
                <h3 className="font-bold text-base md:text-lg mb-2 md:mb-4 flex-shrink-0" style={{ color: t.text }}>Spending Breakdown</h3>
                <div className="flex-1 relative min-h-0">
                  <Doughnut data={doughnutData} options={doughnutOptions} />
                </div>
              </div>
              <div className="rounded-[2rem] border p-5 md:p-8 shadow-lg glass-card" style={{ background: t.card, borderColor: t.cardBorder }}>
                <h3 className="font-bold text-base md:text-lg mb-4 md:mb-6" style={{ color: t.text }}>Plan vs Actual</h3>
                <Bar data={barData} options={barOptions} />
              </div>
            </div>
          </div>
        )}

        {activeTab === "transactions" && (
           <TransactionTable transactions={transactions} onDelete={fetchData} month={MONTHS[month]} year={year} authFetch={authFetch} />
        )}
      </main>

      {showForm && <TransactionForm month={month} year={year} onClose={() => setShowForm(false)} onSaved={fetchData} authFetch={authFetch} />}
      {showPlan  && <BudgetPlanEditor month={month} year={year} onClose={() => { setShowPlan(false); fetchData(); }} authFetch={authFetch} />}
    </div>
  );
}
