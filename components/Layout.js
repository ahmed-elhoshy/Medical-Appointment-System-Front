import Link from "next/link";
import { useAuth } from "../pages/_app";

export default function Layout({ children, loading }) {
  const { role, logout } = useAuth() || {};

  return (
    <div>
      <header
        style={{
          background: "#111827",
          color: "white",
          padding: "12px 20px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            maxWidth: 1100,
            margin: "0 auto",
          }}
        >
          <Link
            href="/"
            style={{ color: "white", fontWeight: 700, fontSize: 18 }}
          >
            Medical Appointments
          </Link>
          <nav style={{ display: "flex", gap: 12, marginLeft: "auto" }}>
            {role === "Patient" && (
              <Link href="/patient/dashboard" style={{ color: "white" }}>
                Patient Dashboard
              </Link>
            )}
            {role === "Doctor" && (
              <Link href="/doctor/dashboard" style={{ color: "white" }}>
                Doctor Dashboard
              </Link>
            )}
            {role ? (
              <button onClick={logout} style={{ background: "#ef4444" }}>
                Logout
              </button>
            ) : (
              <>
                <Link href="/patient/login" style={{ color: "white" }}>
                  Patient Login
                </Link>
                <Link href="/doctor/login" style={{ color: "white" }}>
                  Doctor Login
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main style={{ padding: 20, maxWidth: 1100, margin: "0 auto" }}>
        {loading ? <div>Loading...</div> : children}
      </main>
    </div>
  );
}
