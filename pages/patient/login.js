import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { AuthApi } from "../../lib/api";
import { saveToken, getUserFromToken } from "../../utils/auth";
import Layout from "../../components/Layout";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState(null);
  const [debug, setDebug] = useState({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Keep debug info across refreshes
  useEffect(() => {
    const saved = sessionStorage.getItem("login_debug");
    if (saved) {
      try {
        setDebug(JSON.parse(saved));
      } catch {}
    }
  }, []);

  async function submit(e) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const startedAt = new Date().toISOString();
    const requestPayload = { email: form.email, password: form.password };
    const debugInfo = { startedAt, requestPayload };
    setDebug(debugInfo);
    sessionStorage.setItem("login_debug", JSON.stringify(debugInfo));

    try {
      console.log("Login attempt", requestPayload);
      // Use AuthApi instead of direct api.post
      const res = await AuthApi.loginPatient(requestPayload);
      const status = res?.status;
      const token = res?.data?.token || "";

      // Save debug before any async operations
      const tokenPreview = token
        ? `${token.substring(0, 16)}...${token.substring(token.length - 8)}`
        : "(empty)";
      const updatedDebug = { ...debugInfo, status, tokenPreview };
      setDebug(updatedDebug);
      sessionStorage.setItem("login_debug", JSON.stringify(updatedDebug));

      console.log("Login response", { status, tokenPreview });
      saveToken(token);

      // Verify token was saved
      const savedToken = localStorage.getItem("token");
      const user = getUserFromToken();
      console.log("Token saved", { saved: !!savedToken, user });

      const finalDebug = { ...updatedDebug, tokenSaved: !!savedToken, user };
      setDebug(finalDebug);
      sessionStorage.setItem("login_debug", JSON.stringify(finalDebug));

      // Navigate after all debug is captured
      await router.replace("/patient/dashboard");
    } catch (ex) {
      const status = ex?.response?.status;
      const responseData = ex?.response?.data;
      const message = ex?.message;
      const errorDebug = { ...debugInfo, status, responseData, message };
      setDebug(errorDebug);
      sessionStorage.setItem("login_debug", JSON.stringify(errorDebug));
      setErr(responseData || message || "Login failed");
      console.error("Login error", { status, responseData, message });
    } finally {
      setLoading(false);
      const finalDebug = { ...debug, finishedAt: new Date().toISOString() };
      setDebug(finalDebug);
      sessionStorage.setItem("login_debug", JSON.stringify(finalDebug));
    }
  }

  return (
    <Layout>
      <h2>Patient Login</h2>
      {err && (
        <div className="error">
          {typeof err === "string" ? err : JSON.stringify(err)}
        </div>
      )}
      <form className="form" onSubmit={submit}>
        <input
          required
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          required
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <details style={{ marginTop: 16 }} open>
        <summary>Debug info (preserved across refresh)</summary>
        <pre
          style={{
            background: "#f3f4f6",
            padding: 12,
            borderRadius: 8,
            overflow: "auto",
          }}
        >
          {JSON.stringify(debug, null, 2)}
        </pre>
      </details>
    </Layout>
  );
}
