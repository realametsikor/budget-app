// src/pages/AuthPages.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ── Google Sign-In button ─────────────────────────────────────────────────────
function GoogleButton({ label = "Continue with Google" }) {
  const [loading, setLoading] = useState(false);
  const { loginWithGoogle }   = useAuth();
  const navigate              = useNavigate();

  const handleClick = () => {
    if (!window.google) return alert("Google Sign-In is not loaded. Check your GOOGLE_CLIENT_ID setup.");
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
    window.google.accounts.id.prompt();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-60"
      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#e5e5e5" }}
      onMouseEnter={e => !loading && (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
      onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-gray-500 border-t-white rounded-full animate-spin" />
      ) : (
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

// ── Shared layout wrapper ─────────────────────────────────────────────────────
function AuthLayout({ children, title, subtitle }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#080808", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="[https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap](https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap)" rel="stylesheet" />

      <nav className="flex items-center justify-between px-6 py-5">
        <button onClick={() => navigate("/")} className="flex items-center gap-2">
          <span>💰</span>
          <span style={{ fontFamily: "'Playfair Display', serif", color: "#D4AF37", fontSize: "1.1rem", fontWeight: 700 }}>
            BudgetTracker
          </span>
        </button>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="relative rounded-2xl p-8 md:p-10" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212,175,55,0.2)" }}>
            <div className="text-center mb-8">
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.9rem", fontWeight: 700, color: "#fff" }}>
                {title}
              </h1>
              <p className="text-gray-500 text-sm mt-2" style={{ fontWeight: 300 }}>{subtitle}</p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Input field component ─────────────────────────────────────────────────────
// NOTE: type="text" for all fields to avoid browser native validation
// We validate manually in handleSubmit instead
function Field({ label, type = "text", value, onChange, placeholder, autoComplete }) {
  const [show, setShow] = useState(false);
  const isPass = type === "password";
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>
        {label}
      </label>
      <div className="relative">
        <input
          type={isPass && !show ? "password" : "text"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#e5e5e5",
          }}
          onFocus={e => (e.target.style.borderColor = "rgba(212,175,55,0.6)")}
          onBlur={e  => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
        />
        {isPass && (
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-600 hover:text-gray-400"
          >
            {show ? "hide" : "show"}
          </button>
        )}
      </div>
    </div>
  );
}

// ── REGISTER PAGE ─────────────────────────────────────────────────────────────
export function RegisterPage() {
  const navigate       = useNavigate();
  const { register }   = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setErr] = useState("");
  const [loading, setL] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  // Manual validation — no browser native form validation involved
  const handleSubmit = async () => {
    setErr("");
    if (!form.name.trim())     return setErr("Full name is required.");
    if (!form.email.trim())    return setErr("Email address is required.");
    if (!form.email.includes("@")) return setErr("Please enter a valid email address.");
    if (!form.password)        return setErr("Password is required.");
    if (form.password.length < 8) return setErr("Password must be at least 8 characters.");

    setL(true);
    try {
      await register(form.name.trim(), form.email.trim(), form.password);
      navigate("/app");
    } catch (err) {
      setErr(err.message);
    } finally {
      setL(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Start managing your money in minutes — free forever.">
      <div className="space-y-4">
        <Field label="Full name"      value={form.name}     onChange={set("name")}     placeholder="Kwame Asante"        autoComplete="name" />
        <Field label="Email address"  value={form.email}    onChange={set("email")}    placeholder="you@example.com"     autoComplete="email" />
        <Field label="Password" type="password" value={form.password} onChange={set("password")} placeholder="Min. 8 characters" autoComplete="new-password" />

        {error && (
          <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}>
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 mt-2"
          style={{ background: "#D4AF37", color: "#080808" }}
        >
          {loading ? "Creating account..." : "Create free account"}
        </button>
      </div>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
        <span className="text-xs text-gray-600">or</span>
        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
      </div>

      <GoogleButton label="Sign up with Google" />

      <p className="text-center text-sm text-gray-600 mt-6">
        Already have an account?{" "}
        <Link to="/login" style={{ color: "#D4AF37" }} className="hover:underline">Sign in</Link>
      </p>
    </AuthLayout>
  );
}

// ── LOGIN PAGE ────────────────────────────────────────────────────────────────
export function LoginPage() {
  const navigate        = useNavigate();
  const { login }       = useAuth();
  const [form, setForm]  = useState({ email: "", password: "" });
  const [error, setErr]  = useState("");
  const [loading, setL]  = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    setErr("");
    if (!form.email.trim())    return setErr("Email address is required.");
    if (!form.email.includes("@")) return setErr("Please enter a valid email address.");
    if (!form.password)        return setErr("Password is required.");

    setL(true);
    try {
      await login(form.email.trim(), form.password);
      navigate("/app");
    } catch (err) {
      setErr(err.message);
    } finally {
      setL(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your BudgetTracker account.">
      <div className="space-y-4">
        <Field label="Email address" value={form.email}    onChange={set("email")}    placeholder="you@example.com" autoComplete="email" />
        <Field label="Password" type="password" value={form.password} onChange={set("password")} placeholder="Your password" autoComplete="current-password" />

        {error && (
          <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}>
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 mt-2"
          style={{ background: "#D4AF37", color: "#080808" }}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </div>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
        <span className="text-xs text-gray-600">or</span>
        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
      </div>

      <GoogleButton label="Continue with Google" />

      <p className="text-center text-sm text-gray-600 mt-6">
        Don't have an account?{" "}
        <Link to="/register" style={{ color: "#D4AF37" }} className="hover:underline">Sign up free</Link>
      </p>
    </AuthLayout>
  );
}

