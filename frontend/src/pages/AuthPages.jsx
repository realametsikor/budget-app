// src/pages/AuthPages.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Wallet, Sun, Moon } from "lucide-react";

const THEMES = {
  dark: {
    bgClass: "bg-[#050505]",
    meshClass: "mesh-bg-dark",
    card: "rgba(20,20,20,0.6)", cardBorder: "rgba(255,255,255,0.08)",
    text: "#f8fafc", textMuted: "#9ca3af", accent: "#D4AF37"
  },
  light: {
    bgClass: "bg-[#f4f4f5]",
    meshClass: "mesh-bg-light",
    card: "rgba(255,255,255,0.7)", cardBorder: "rgba(255,255,255,0.4)",
    text: "#18181b", textMuted: "#71717a", accent: "#4f46e5"
  }
};

function GoogleButton({ label = "Continue with Google", t, theme }) {
  const [loading, setLoading] = useState(false);
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleClick = () => {
    if (!window.google) return alert("Google Sign-In is not loaded.");
    
    setLoading(true);
    
    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: async ({ credential }) => {
        try {
          await loginWithGoogle(credential);
          navigate("/app");
        } catch (err) { 
          alert(err.message); 
        } finally { 
          setLoading(false); 
        }
      },
    });

    // FIX: Listen for prompt closures to stop the infinite spinner
    window.google.accounts.id.prompt((notification) => {
      if (
        notification.isNotDisplayed() || 
        notification.isSkippedMoment() || 
        notification.isDismissedMoment()
      ) {
        setLoading(false);
      }
    });
  };

  return (
    <button
      type="button" onClick={handleClick} disabled={loading}
      className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl text-sm font-semibold transition-all glass-card hover:scale-[1.02]"
      style={{ background: theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.8)", border: `1px solid ${t.cardBorder}`, color: t.text }}
    >
      {loading ? <span className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" /> : (
        <svg width="18" height="18" viewBox="0 0 48 48">
          <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 33.7 29.3 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 6 1.1 8.1 3l5.7-5.7C34.1 5.1 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.6 20-21 0-1.3-.1-2.7-.4-4z"/>
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3.1 0 6 1.1 8.1 3l5.7-5.7C34.1 5.1 29.3 3 24 3c-7.7 0-14.4 4.4-17.7 11.7z"/>
          <path fill="#4CAF50" d="M24 45c5.2 0 9.9-1.8 13.6-4.7l-6.3-5.2C29.5 36.8 26.9 38 24 38c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.4 41 16.2 45 24 45z"/>
          <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.8l6.3 5.2C41.3 35.3 44 30 44 24c0-1.3-.1-2.7-.4-4z"/>
        </svg>
      )}
      {!loading && label}
    </button>
  );
}

function Field({ label, type = "text", value, onChange, placeholder, t }) {
  const [show, setShow] = useState(false);
  const isPass = type === "password";
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: t.textMuted }}>{label}</label>
      <div className="relative">
        <input
          type={isPass && !show ? "password" : "text"} value={value} onChange={onChange} placeholder={placeholder}
          className="w-full rounded-xl px-4 py-3.5 text-sm outline-none transition-all glass-card"
          style={{ background: t.card, border: `1px solid ${t.cardBorder}`, color: t.text }}
          onFocus={e => e.target.style.borderColor = t.accent}
          onBlur={e  => e.target.style.borderColor = t.cardBorder}
        />
        {isPass && (
          <button type="button" onClick={() => setShow(s => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold uppercase" style={{ color: t.accent }}>
            {show ? "hide" : "show"}
          </button>
        )}
      </div>
    </div>
  );
}

function AuthLayout({ children, title, subtitle }) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useAuth();
  const t = THEMES[theme || "dark"];

  return (
    <div className={`min-h-screen flex flex-col ${t.bgClass} ${t.meshClass} transition-colors duration-700`} style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        .glass-card { backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }
        .mesh-bg-light { background-image: radial-gradient(at 0% 0%, hsla(199,89%,48%,0.15) 0px, transparent 50%), radial-gradient(at 100% 0%, hsla(253,91%,64%,0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, hsla(340,82%,52%,0.15) 0px, transparent 50%), radial-gradient(at 0% 100%, hsla(43,100%,50%,0.15) 0px, transparent 50%); }
        .mesh-bg-dark { background-image: radial-gradient(at 0% 0%, hsla(46,65%,52%,0.1) 0px, transparent 50%), radial-gradient(at 100% 0%, hsla(253,91%,64%,0.05) 0px, transparent 50%), radial-gradient(at 100% 100%, hsla(340,82%,52%,0.05) 0px, transparent 50%), radial-gradient(at 0% 100%, hsla(43,100%,50%,0.05) 0px, transparent 50%); }
      `}</style>
      <nav className="flex items-center justify-between px-6 py-6">
        <button onClick={() => navigate("/")} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded flex items-center justify-center text-white shadow-lg" style={{ background: t.accent }}>
            <Wallet size={16} strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: "'Playfair Display', serif", color: t.text, fontSize: "1.25rem", fontWeight: 700 }}>BudgetTracker</span>
        </button>
        <button onClick={toggleTheme} className="p-2.5 rounded-full transition-transform hover:scale-110 glass-card shadow-sm" style={{ background: t.card, color: t.text, border: `1px solid ${t.cardBorder}` }}>
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md relative">
          <div className="glass-card rounded-[2rem] p-8 md:p-10 shadow-2xl" style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}>
            <div className="text-center mb-8">
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.2rem", fontWeight: 700, color: t.text }}>{title}</h1>
              <p className="text-sm mt-3 leading-relaxed" style={{ color: t.textMuted }}>{subtitle}</p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, theme } = useAuth();
  const t = THEMES[theme || "dark"];
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setErr] = useState("");
  const [loading, setL] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    setErr("");
    if (!form.name.trim()) return setErr("Full name is required.");
    if (!form.email.trim() || !form.email.includes("@")) return setErr("Please enter a valid email.");
    if (form.password.length < 8) return setErr("Password must be at least 8 characters.");

    setL(true);
    try { await register(form.name.trim(), form.email.trim(), form.password); navigate("/app"); } 
    catch (err) { setErr(err.message); } 
    finally { setL(false); }
  };

  return (
    <AuthLayout title="Create Account" subtitle="Join thousands of Ghanaians tracking smarter.">
      <div className="space-y-5">
        <Field label="Full name" value={form.name} onChange={set("name")} placeholder="Kwame Asante" t={t} />
        <Field label="Email address" value={form.email} onChange={set("email")} placeholder="you@example.com" t={t} />
        <Field label="Password" type="password" value={form.password} onChange={set("password")} placeholder="Min. 8 characters" t={t} />

        {error && <div className="rounded-xl px-4 py-3 text-sm font-medium bg-red-500/10 border border-red-500/30 text-red-500">{error}</div>}

        <button onClick={handleSubmit} disabled={loading} className="w-full py-4 rounded-xl text-sm font-bold transition-all shadow-lg hover:scale-[1.02]" style={{ background: t.accent, color: theme === "dark" ? "#000" : "#fff" }}>
          {loading ? "Creating account..." : "Create free account"}
        </button>
      </div>
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px" style={{ background: t.cardBorder }} />
        <span className="text-xs uppercase font-bold" style={{ color: t.textMuted }}>or</span>
        <div className="flex-1 h-px" style={{ background: t.cardBorder }} />
      </div>
      <GoogleButton label="Sign up with Google" t={t} theme={theme} />
      <p className="text-center text-sm mt-8" style={{ color: t.textMuted }}>
        Already have an account? <Link to="/login" style={{ color: t.accent, fontWeight: 600 }}>Sign in</Link>
      </p>
    </AuthLayout>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const { login, theme } = useAuth();
  const t = THEMES[theme || "dark"];
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setErr] = useState("");
  const [loading, setL] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    setErr("");
    if (!form.email.trim() || !form.password) return setErr("Email and password required.");

    setL(true);
    try { await login(form.email.trim(), form.password); navigate("/app"); } 
    catch (err) { setErr(err.message); } 
    finally { setL(false); }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to access your financial dashboard.">
      <div className="space-y-5">
        <Field label="Email address" value={form.email} onChange={set("email")} placeholder="you@example.com" t={t} />
        <Field label="Password" type="password" value={form.password} onChange={set("password")} placeholder="Your password" t={t} />

        {error && <div className="rounded-xl px-4 py-3 text-sm font-medium bg-red-500/10 border border-red-500/30 text-red-500">{error}</div>}

        <button onClick={handleSubmit} disabled={loading} className="w-full py-4 rounded-xl text-sm font-bold transition-all shadow-lg hover:scale-[1.02]" style={{ background: t.accent, color: theme === "dark" ? "#000" : "#fff" }}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </div>
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px" style={{ background: t.cardBorder }} />
        <span className="text-xs uppercase font-bold" style={{ color: t.textMuted }}>or</span>
        <div className="flex-1 h-px" style={{ background: t.cardBorder }} />
      </div>
      <GoogleButton label="Continue with Google" t={t} theme={theme} />
      <p className="text-center text-sm mt-8" style={{ color: t.textMuted }}>
        Don't have an account? <Link to="/register" style={{ color: t.accent, fontWeight: 600 }}>Sign up free</Link>
      </p>
    </AuthLayout>
  );
}
