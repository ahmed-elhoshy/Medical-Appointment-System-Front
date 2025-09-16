import Link from "next/link";
import Layout from "../components/Layout";

export default function Home() {
  return (
    <Layout>
      <h1>Medical Appointment System</h1>
      <p>Select role to continue</p>
      <div className="grid">
        <div className="card">
          <h2>Patient</h2>
          <Link href="/patient/register">Register</Link>
          <Link href="/patient/login">Login</Link>
        </div>
        <div className="card">
          <h2>Doctor</h2>
          <Link href="/doctor/register">Register</Link>
          <Link href="/doctor/login">Login</Link>
        </div>
      </div>
    </Layout>
  );
}
