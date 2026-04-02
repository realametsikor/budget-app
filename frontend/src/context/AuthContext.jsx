// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();
const API = "https://budget-app-backend-gn8r.onrender.com/api";

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

  // Safely handle API responses to prevent the "Unexpected Token T" crash
  const handleResponse = async (res) => {
    const text = await res.text();
    if (text.includes("Not Found") || text.includes("The page c")) {
      throw new Error("Backend connection failed. Please ensure your Render server is live.");
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

  return (
    <AuthContext.Provider value={{ user, loading, theme, toggleTheme, register, login, loginWithGoogle, logout, authFetch }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
