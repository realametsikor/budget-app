// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext();

const THEME_COLORS = {
  dark: { bg: "#050505" },
  light: { bg: "#f4f4f5" }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const register = async (name, email, password) => {
    const { error } = await supabase.auth.signUp({
      email, password, options: { data: { name } }
    });
    if (error) throw error;
  };

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/app' }
    });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, theme, toggleTheme, register, login, loginWithGoogle, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
