// src/pages/AuthPages.jsx
import { useState, useRef, useEffect } from "react";
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

function GoogleButton({ label = "Continue with Google", theme }) {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const btnContainerRef = useRef(null);

  useEffect(() => {
    if (!window.google) return;

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: async ({ credential }) => {
        try {
          await loginWithGoogle(credential);
          setTimeout(() => navigate("/app"), 600);
        } catch (err) {
          alert(err.message);
        }
      },
    });

    window.google.accounts.id.renderButton(
      btnContainerRef.current,
      { 
        theme: theme === "dark" ? "filled_black" : "outline", 
        size: "large", 
        shape: "rectangular",
        text: label.includes("up") ? "signup_with" : "continue_with",
        logo_alignment: "left"
      }
    );
  }, [theme, loginWithGoogle, navigate, label]);

  return (
    <div className="w-full flex justify-center">
      <div ref={btnContainerRef} className="w-full flex justify-center overflow-hidden rounded-xl shadow-md transition-transform hover:scale-[1.02]"></div>
    </div>
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
  const [success, setSuccess] = useState("");
  const [loading, setL] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    setErr("");
    setSuccess("");
    if (!form.name.trim()) return setErr("Full name is required.");
    if (!form.email.trim() || !form.email.includes("@")) return setErr("Please enter a valid email.");
    if (form.password.length < 8) return setErr("Password must be at least 8 characters.");

    setL(true);
    try { 
      const data = await register(form.name.trim(), form.email.trim(), form.password); 
      
      if (data?.session) {
        // Logged in instantly! Wait 600ms before navigating so the app doesn't kick us out.
        setSuccess("Account created successfully! Redirecting...");
        setTimeout(() => navigate("/app"), 600);
      } else {
        // Account created, but Supabase requires them to click the email link.
        setSuccess("Registration successful! Please check your email to verify your account.");
        setForm({ name: "", email: "", password: "" }); // Clear the form
      }
    } 
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
        {success && <div className="rounded-xl px-4 py-3 text-sm font-medium bg-green-500/10 border border-green-500/30 text-green-500">{success}</div>}

        <button onClick={handleSubmit} disabled={loading} className="w-full py-4 rounded-xl text-sm font-bold transition-all shadow-lg hover:scale-[1.02]" style={{ background: t.accent, color: theme === "dark" ? "#000" : "#fff" }}>
          {loading ? "Creating account..." : "Create free account"}
        </button>
      </div>
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px" style={{ background: t.cardBorder }} />
        <span className="text-xs uppercase font-bold" style={{ color: t.textMuted }}>or</span>
        <div className="flex-1 h-px" style={{ background: t.cardBorder }} />
      </div>
      
      <GoogleButton label="Sign up with Google" theme={theme} />
      
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
    try { 
      await login(form.email.trim(), form.password); 
      // Add a tiny delay to ensure the App sees the login state
      setTimeout(() => navigate("/app"), 600);
    } 
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
      
      <GoogleButton label="Continue with Google" theme={theme} />
      
      <p className="text-center text-sm mt-8" style={{ color: t.textMuted }}>
        Don't have an account? <Link to="/register" style={{ color: t.accent, fontWeight: 600 }}>Sign up free</Link>
      </p>
    </AuthLayout>
  );
}
