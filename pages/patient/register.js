import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { api } from "../../lib/api";
import Layout from "../../components/Layout";

export default function Register() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    email: "",
    phoneNumber: "",
    password: "",
  });
  const [err, setErr] = useState(null);
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    setErr(null);
    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        dateOfBirth: form.dateOfBirth,
        email: form.email,
        phoneNumber: form.phoneNumber,
        password: form.password,
      };
      const res = await api.post("/api/patients/register", payload);
      if (res.status === 201 || res.status === 200)
        router.push("/patient/login");
    } catch (ex) {
      setErr(ex?.response?.data || "Registration failed");
    }
  }

  return (
    <Layout>
      <div className="auth-container">
        <div className="auth-card">
          <h2>Patient Registration</h2>
          {err && (
            <div className="error">
              {typeof err === "string" ? err : "Registration failed"}
            </div>
          )}
          <form className="auth-form" onSubmit={submit}>
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                required
                placeholder="Enter your first name"
                value={form.firstName}
                onChange={(e) =>
                  setForm({ ...form, firstName: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                required
                placeholder="Enter your last name"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="dateOfBirth">Date of Birth</label>
              <input
                id="dateOfBirth"
                required
                type="date"
                value={form.dateOfBirth}
                onChange={(e) =>
                  setForm({ ...form, dateOfBirth: e.target.value })
                }
              />
            </div>
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
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                required
                placeholder="Enter your phone number"
                value={form.phoneNumber}
                onChange={(e) =>
                  setForm({ ...form, phoneNumber: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                required
                type="password"
                placeholder="Choose a password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <button type="submit" className="auth-button">
              Register
            </button>
          </form>
          <div className="auth-footer">
            Already have an account?{" "}
            <Link href="/patient/login">Login here</Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
