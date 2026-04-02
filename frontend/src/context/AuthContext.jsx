// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

// ── THIS IS THE MAGIC LINK TO YOUR LIVE BACKEND ──
const API = "https://budget-app-backend-gn8r.onrender.com/api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in when the app loads
  useEffect(() => {
    const storedUser = localStorage.getItem("budget_user");
    const storedToken = localStorage.getItem("budget_token");
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Helper to save session
  const saveAuth = (userData, token) => {
    localStorage.setItem("budget_user", JSON.stringify(userData));
    localStorage.setItem("budget_token", token);
    setUser(userData);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("budget_user");
    localStorage.removeItem("budget_token");
    setUser(null);
  };

  // 1. Email Registration
  const register = async (name, email, password) => {
    const res = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");
    saveAuth(data.user, data.accessToken);
  };

  // 2. Email Login
  const login = async (email, password) => {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    saveAuth(data.user, data.accessToken);
  };

  // 3. Google Login
  const loginWithGoogle = async (token) => {
    const res = await fetch(`${API}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Google login failed");
    saveAuth(data.user, data.accessToken);
  };

  // 4. Secure Fetch Wrapper (used by your forms and tables)
  const authFetch = async (url, options = {}) => {
    const token = localStorage.getItem("budget_token");
    const headers = {
      ...options.headers,
      "Content-Type": "application/json",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const response = await fetch(url, { ...options, headers });
    
    // Auto-logout if the security token expires
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
