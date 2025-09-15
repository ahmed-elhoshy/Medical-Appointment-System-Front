import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  setAuthToken,
  getStoredToken,
  api,
  extractUserFromToken,
} from "../lib/api";
import "../styles/globals.css";
import Layout from "../components/Layout";

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export default function App({ Component, pageProps }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredToken();
    if (stored) {
      setToken(stored);
      setAuthToken(stored);
      const extracted = extractUserFromToken(stored) || {};
      const storedRole =
        typeof window !== "undefined"
          ? localStorage.getItem("auth_role")
          : null;
      const storedUserId =
        typeof window !== "undefined"
          ? localStorage.getItem("auth_user_id")
          : null;
      const resolvedRole = extracted.role || storedRole || null;
      const resolvedUserId = extracted.id || storedUserId || null;
      setUserId(resolvedUserId);
      setRole(resolvedRole);
      if (typeof window !== "undefined") {
        if (resolvedRole) localStorage.setItem("auth_role", resolvedRole);
        if (resolvedUserId)
          localStorage.setItem("auth_user_id", String(resolvedUserId));
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  const login = async ({ email, password, as }) => {
    const url = as === "doctor" ? "/api/doctors/login" : "/api/patients/login";
    const { data } = await api.post(url, { email, password });
    setToken(data.token);
    const extracted = extractUserFromToken(data.token) || {};
    const resolvedRole =
      extracted.role || (as === "doctor" ? "Doctor" : "Patient");
    const resolvedUserId = extracted.id || data.user?.id || null;
    setRole(resolvedRole);
    setUserId(resolvedUserId);
    setUser(data.user || null);
    if (typeof window !== "undefined") {
      if (resolvedRole) localStorage.setItem("auth_role", resolvedRole);
      if (resolvedUserId)
        localStorage.setItem("auth_user_id", String(resolvedUserId));
    }
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setRole(null);
    setUserId(null);
    setAuthToken(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_role");
      localStorage.removeItem("auth_user_id");
    }
  };

  const value = useMemo(
    () => ({
      token,
      user,
      role,
      userId,
      setUser,
      setRole,
      setUserId,
      login,
      logout,
    }),
    [token, user, role, userId]
  );

  return (
    <AuthContext.Provider value={value}>
      <Layout loading={loading}>
        <Component {...pageProps} />
      </Layout>
    </AuthContext.Provider>
  );
}
