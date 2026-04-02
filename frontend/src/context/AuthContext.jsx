// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

const API = "[https://budget-app-backend-gn8r.onrender.com/api](https://budget-app-backend-gn8r.onrender.com/api)";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on app load
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

  // ── Email Registration ────────────────────────────────────────
  const register = async (name, email, password) => {
    const res = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed. Please try again.");
    saveAuth(data.user, data.accessToken);
  };

  // ── Email Login ───────────────────────────────────────────────
  const login = async (email, password) => {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed. Please try again.");
    saveAuth(data.user, data.accessToken);
  };

  // ── Google Login ──────────────────────────────────────────────
  const loginWithGoogle = async (credential) => {
    const res = await fetch(`${API}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential, token: credential }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Google sign-in failed. Please try again.");
    saveAuth(data.user, data.accessToken);
  };

  // ── Authenticated fetch wrapper ───────────────────────────────
  const authFetch = async (url, options = {}) => {
    const token = localStorage.getItem("budget_token");
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401 || response.status === 403) {
      logout();
      throw new Error("Session expired. Please log in again.");
    }
    return response;
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, loginWithGoogle, logout, authFetch }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
