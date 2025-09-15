import { useState } from "react";
import { AuthApi } from "../../lib/api";
import { useRouter } from "next/router";

export default function DoctorRegister() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    specialization: "",
    email: "",
    phoneNumber: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await AuthApi.registerDoctor({
        firstName: form.firstName,
        lastName: form.lastName,
        specialization: form.specialization,
        email: form.email,
        phoneNumber: form.phoneNumber,
        password: form.password,
      });
      router.push("/doctor/login");
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2>Doctor Registration</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "grid", gap: 12, maxWidth: 480 }}
      >
        <label>
          First Name
          <input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
          />
        </label>
        <label>
          Last Name
          <input
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
          />
        </label>
        <label>
          Specialization
          <input
            name="specialization"
            value={form.specialization}
            onChange={handleChange}
          />
        </label>
        <label>
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
        </label>
        <label>
          Phone Number
          <input
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={handleChange}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
          />
        </label>
        {error && <div style={{ color: "red" }}>{error}</div>}
        <button type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Register"}
        </button>
      </form>
    </div>
  );
}
