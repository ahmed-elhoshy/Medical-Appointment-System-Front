import Link from "next/link";
import Layout from "../components/Layout";

export default function Home() {
  return (
    <Layout>
      <div className="home-hero">
        <h1>Medical Appointment System</h1>
        <p className="hero-subtitle">Choose your role to get started</p>

        <div className="role-cards">
          <div className="role-card">
            <div className="role-icon">👤</div>
            <h2>Patient</h2>
            <p>Schedule appointments and manage your medical visits</p>
            <div className="role-actions">
              <Link href="/patient/login" className="btn-primary">
                Sign In
              </Link>
              <Link href="/patient/register" className="btn-secondary">
                Create Account
              </Link>
            </div>
          </div>

          <div className="role-card">
            <div className="role-icon">👨‍⚕️</div>
            <h2>Doctor</h2>
            <p>Manage your appointments and patient schedule</p>
            <div className="role-actions">
              <Link href="/doctor/login" className="btn-primary">
                Sign In
              </Link>
              <Link href="/doctor/register" className="btn-secondary">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
