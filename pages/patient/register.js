import { useState } from "react";
import { useRouter } from "next/router";
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
      const res = await api.post("/patients/register", payload);
      if (res.status === 201 || res.status === 200)
        router.push("/patient/login");
    } catch (ex) {
      setErr(ex?.response?.data || "Registration failed");
    }
  }

  return (
    <Layout>
      <h2>Patient Register</h2>
      {err && <div className="error">{JSON.stringify(err)}</div>}
      <form className="form" onSubmit={submit}>
        <input
          required
          placeholder="First name"
          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
        />
        <input
          required
          placeholder="Last name"
          onChange={(e) => setForm({ ...form, lastName: e.target.value })}
        />
        <input
          required
          type="date"
          placeholder="DOB"
          onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
        />
        <input
          required
          type="email"
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          required
          placeholder="Phone"
          onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
        />
        <input
          required
          type="password"
          placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button type="submit">Register</button>
      </form>
    </Layout>
  );
}
