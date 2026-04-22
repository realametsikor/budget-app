// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext();
const API = "https://budget-app-backend-gn8r.onrender.com/api";

const THEME_COLORS = {
  dark: { bg: "#050505" },
  light: { bg: "#f4f4f5" }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Preserve your theme logic
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("budget_theme");
    if (saved === "light" || saved === "dark") return saved;
    localStorage.setItem("budget_theme", "dark");
    return "dark";
  });

  useEffect(() => {
    document.documentElement.style.backgroundColor = THEME_COLORS[theme].bg;
    document.body.style.backgroundColor = THEME_COLORS[theme].bg;
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("budget_theme", next);
  };

  // Map Supabase metadata to match what your Dashboard expects (user.name, user.avatar_url)
  const formatUser = (u) => {
    if (!u) return null;
    return {
      id: u.id,
      email: u.email,
      name: u.user_metadata?.name || u.user_metadata?.full_name || u.email.split('@')[0],
      avatar_url: u.user_metadata?.avatar_url || null
    };
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(formatUser(session?.user));
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(formatUser(session?.user));
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  // Preserve your authFetch so the Dashboard doesn't break, but power it with Supabase
  const authFetch = async (url, options = {}) => {
    const { data: { session } } = await supabase.auth.getSession();
    const headers = { "Content-Type": "application/json", ...options.headers };
    
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }

    const response = await fetch(url, { ...options, headers });
    if (response.status === 401 || response.status === 403) {
      logout();
      throw new Error("Session expired. Please log in again.");
    }
    return response;
  };

  return (
    <AuthContext.Provider value={{ user, loading, theme, toggleTheme, logout, authFetch }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
