import { createContext, useContext, useState, useEffect, useCallback } from "react";

// Hardcoded your live Render backend
const API = "https://budget-app-backend-gn8r.onrender.com/api";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);  // checking stored token on mount

  // ── Token storage ─────────────────────────────────────────────────────────
  const getAccess  = ()    => localStorage.getItem("bt_access");
  const getRefresh = ()    => localStorage.getItem("bt_refresh");
  const storeTokens = (a, r) => {
    localStorage.setItem("bt_access",  a);
    if (r) localStorage.setItem("bt_refresh", r);
  };
  const clearTokens = () => {
    localStorage.removeItem("bt_access");
    localStorage.removeItem("bt_refresh");
  };

  // ── Auto-refresh access token using refresh token ─────────────────────────
  const refreshAccess = useCallback(async () => {
    const rt = getRefresh();
    if (!rt) return null;
    try {
      const res  = await fetch(`${API}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: rt }),
      });
      if (!res.ok) { clearTokens(); return null; }
      const { accessToken } = await res.json();
      localStorage.setItem("bt_access", accessToken);
      return accessToken;
    } catch {
      return null;
    }
  }, []);

  // ── Authenticated fetch — auto-refreshes on 401 ───────────────────────────
  const authFetch = useCallback(async (url, options = {}) => {
    let token = getAccess();
    const doFetch = (t) => fetch(url, {
      ...options,
      headers: { ...options.headers, Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
    });

    let res = await doFetch(token);
    if (res.status === 401) {
      token = await refreshAccess();
      if (!token) { setUser(null); clearTokens(); return res; }
      res = await doFetch(token);
    }
    return res;
  }, [refreshAccess]);

  // ── Restore session on mount ──────────────────────────────────────────────
  useEffect(() => {
    const restore = async () => {
      let token = getAccess();
      if (!token) token = await refreshAccess();
      if (!token) { setLoading(false); return; }
      try {
        const res = await fetch(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setUser(await res.json());
        else { clearTokens(); }
      } catch { clearTokens(); }
      setLoading(false);
    };
    restore();
  }, [refreshAccess]);

  // ── Auth actions ──────────────────────────────────────────────────────────
  const register = async (name, email, password) => {
    const res  = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed.");
    storeTokens(data.accessToken, data.refreshToken);
    setUser(data.user);
    return data.user;
  };

  const login = async (email, password) => {
    const res  = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed.");
    storeTokens(data.accessToken, data.refreshToken);
    setUser(data.user);
    return data.user;
  };

  const loginWithGoogle = async (credential) => {
    const res  = await fetch(`${API}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Google login failed.");
    storeTokens(data.accessToken, data.refreshToken);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    const rt = getRefresh();
    await fetch(`${API}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: rt }),
    }).catch(() => {});
    clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, loginWithGoogle, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
