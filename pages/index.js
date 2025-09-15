import Link from "next/link";

export default function Home() {
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <section
        style={{
          background: "white",
          padding: 20,
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
        <h1 style={{ marginTop: 0 }}>
          Welcome to the Medical Appointment System
        </h1>
        <p>Register or log in to manage appointments and your profile.</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/patient/register">
            <button>Patient Registration</button>
          </Link>
          <Link href="/patient/login">
            <button>Patient Login</button>
          </Link>
          <Link href="/doctor/register">
            <button>Doctor Registration</button>
          </Link>
          <Link href="/doctor/login">
            <button>Doctor Login</button>
          </Link>
        </div>
      </section>
    </div>
  );
}
