import { useEffect, useMemo, useState } from "react";
import { DoctorApi, extractUserFromToken, getStoredToken } from "../../lib/api";
import { useAuth } from "../_app";
import Link from "next/link";

export default function DoctorDashboard() {
  const { userId: ctxUserId, token } = useAuth();
  const rawToken = getStoredToken() || token || "";
  const derived = useMemo(
    () => extractUserFromToken(rawToken) || {},
    [rawToken]
  );
  const effectiveDoctorId = ctxUserId || derived.id || null;

  const [me, setMe] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        if (!effectiveDoctorId) return;
        const [meRes, apptRes] = await Promise.all([
          DoctorApi.getById(effectiveDoctorId),
          DoctorApi.getAppointmentsByDoctor(effectiveDoctorId),
        ]);
        setMe(meRes.data || {});
        setAppointments(apptRes.data || []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [effectiveDoctorId]);

  const saveProfile = async () => {
    if (!effectiveDoctorId) return;
    setSaving(true);
    try {
      const { data } = await DoctorApi.updateById(effectiveDoctorId, {
        firstName: me.firstName,
        lastName: me.lastName,
        specialization: me.specialization,
        email: me.email,
        phoneNumber: me.phoneNumber,
      });
      setMe(data || {});
      alert("Profile updated");
    } finally {
      setSaving(false);
    }
  };

  if (!token) {
    return (
      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
        <h3>You are not logged in</h3>
        <p>Please login as a doctor to view this page.</p>
        <Link href="/doctor/login">
          <button>Go to Doctor Login</button>
        </Link>
      </div>
    );
  }

  if (!effectiveDoctorId) {
    return (
      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
        <h3>Missing identity</h3>
        <p>We couldn't derive your id from the token. Please re-login.</p>
        <Link href="/doctor/login">
          <button>Go to Doctor Login</button>
        </Link>
      </div>
    );
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <section
        style={{
          background: "white",
          padding: 20,
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Doctor Dashboard</h2>
        <div style={{ display: "grid", gap: 8, maxWidth: 520 }}>
          <label>
            First Name
            <input
              value={me.firstName || ""}
              onChange={(e) => setMe({ ...me, firstName: e.target.value })}
            />
          </label>
          <label>
            Last Name
            <input
              value={me.lastName || ""}
              onChange={(e) => setMe({ ...me, lastName: e.target.value })}
            />
          </label>
          <label>
            Specialization
            <input
              value={me.specialization || ""}
              onChange={(e) => setMe({ ...me, specialization: e.target.value })}
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={me.email || ""}
              onChange={(e) => setMe({ ...me, email: e.target.value })}
            />
          </label>
          <label>
            Phone Number
            <input
              value={me.phoneNumber || ""}
              onChange={(e) => setMe({ ...me, phoneNumber: e.target.value })}
            />
          </label>
          <button onClick={saveProfile} disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </section>

      <section
        style={{
          background: "white",
          padding: 20,
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Scheduled Appointments</h3>
        {appointments.length === 0 ? (
          <div>No appointments.</div>
        ) : (
          <ul>
            {appointments.map((a) => (
              <li key={a.id}>
                {new Date(a.appointmentDate).toLocaleString()} with{" "}
                {a.patient?.firstName} {a.patient?.lastName} — {a.status}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
