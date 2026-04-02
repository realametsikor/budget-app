// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

const API = "https://budget-app-backend-gn8r.onrender.com/api";

const THEME_COLORS = {
  dark: {
    bg: "#050505", navBg: "rgba(5,5,5,0.92)", text: "#f8fafc", textMuted: "#9ca3af",
    card: "rgba(255,255,255,0.03)", cardBorder: "rgba(255,255,255,0.08)",
    accent: "#D4AF37", accentBg: "rgba(212,175,55,0.1)",
    green: "#4ade80", red: "#f87171", warning: "#fb923c", chartGrid: "rgba(255,255,255,0.05)"
  },
  light: {
    bg: "#f8fafc", navBg: "rgba(248,250,252,0.92)", text: "#0f172a", textMuted: "#64748b",
    card: "#ffffff", cardBorder: "rgba(0,0,0,0.08)",
    accent: "#0ea5e9", accentBg: "rgba(14,165,233,0.1)",
    green: "#16a34a", red: "#dc2626", warning: "#d97706", chartGrid: "rgba(0,0,0,0.05)"
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem("budget_theme") || "dark");

  useEffect(() => {
    const storedUser = localStorage.getItem("budget_user");
    const storedToken = localStorage.getItem("budget_token");
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        localStorage.removeItem("budget_user");
        localStorage.removeItem("budget_token");
      }
    }
    setLoading(false);
  }, []);

  // Globally apply background color
  useEffect(() => {
    document.body.style.backgroundColor = THEME_COLORS[theme].bg;
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("budget_theme", next);
  };

  const saveAuth = (userData, token) => {
    localStorage.setItem("budget_user", JSON.stringify(userData));
    localStorage.setItem("budget_token", token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("budget_user");
    localStorage.removeItem("budget_token");
    setUser(null);
  };

  // Helper to safely parse JSON and catch HTML 404 errors (fixing laptop crash)
  const handleResponse = async (res) => {
    const text = await res.text();
    if (text.includes("Not Found") || text.includes("The page c")) {
      throw new Error("Backend connection failed. Check your API link or Render deployment.");
    }
    const data = JSON.parse(text);
    if (!res.ok) throw new Error(data.error || "Request failed");
    return data;
  };

  const register = async (name, email, password) => {
    const res = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await handleResponse(res);
    saveAuth(data.user, data.accessToken);
  };

  const login = async (email, password) => {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await handleResponse(res);
    saveAuth(data.user, data.accessToken);
  };

  const loginWithGoogle = async (credential) => {
    const res = await fetch(`${API}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential, token: credential }),
    });
    const data = await handleResponse(res);
    saveAuth(data.user, data.accessToken);
  };

  const authFetch = async (url, options = {}) => {
    const token = localStorage.getItem("budget_token");
    const headers = { "Content-Type": "application/json", ...options.headers };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(url, { ...options, headers });
    if (response.status === 401 || response.status === 403) {
      logout();
      throw new Error("Session expired. Please log in again.");
    }
    return response;
  };

  const t = THEME_COLORS[theme];

  return (
    <AuthContext.Provider value={{ user, loading, theme, toggleTheme, t, register, login, loginWithGoogle, logout, authFetch }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
