import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { AuthApi } from "../../lib/api";
import { saveToken } from "../../utils/auth";
import Layout from "../../components/Layout";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const res = await AuthApi.loginDoctor(form);
      const token = res?.data?.token;
      if (token) {
        saveToken(token);
        await router.replace("/doctor/dashboard");
      }
    } catch (ex) {
      setErr(ex?.response?.data || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="auth-container">
        <div className="auth-card">
          <h2>Doctor Login</h2>
          {err && <div className="error">{typeof err === "string" ? err : "An error occurred during login"}</div>}
          <form className="auth-form" onSubmit={submit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                required
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                required
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <button type="submit" disabled={loading} className="auth-button">
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
          <div className="auth-footer">
            Don't have an account? <Link href="/doctor/register">Register here</Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
