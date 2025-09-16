import { useState, useEffect } from "react";
import Link from "next/link";
import { getUserFromToken } from "../utils/auth";

export default function Layout({ children }) {
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setUser(getUserFromToken());
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering auth-dependent UI until client-side
  if (!mounted) {
    return (
      <div>
        <header className="header">
          <Link className="brand" href="/">
            MedApp
          </Link>
          <nav>
            <Link href="/">Home</Link>
          </nav>
        </header>
        <main className="container">{children}</main>
      </div>
    );
  }

  return (
    <div>
      <header className="header">
        <Link className="brand" href="/">
          MedApp
        </Link>
        <nav>
          <Link href="/">Home</Link>
          {user ? (
            <>
              {user.role === "Patient" && (
                <>
                  <Link href="/patient/dashboard">Patient Dashboard</Link>
                  <Link href="/patient/profile">My Profile</Link>
                </>
              )}
              {user.role === "Doctor" && (
                <>
                  <Link href="/doctor/dashboard">Doctor Dashboard</Link>
                  <Link href="/doctor/profile">My Profile</Link>
                </>
              )}
            </>
          ) : (
            <>
              <Link href="/patient/register">Patient Reg</Link>
              <Link href="/patient/login">Patient Login</Link>
              <Link href="/doctor/register">Doctor Reg</Link>
              <Link href="/doctor/login">Doctor Login</Link>
            </>
          )}
        </nav>
      </header>
      <main className="container">{children}</main>
    </div>
  );
}
