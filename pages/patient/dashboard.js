import { useEffect, useMemo, useState } from "react";
import {
  PatientApi,
  api,
  extractUserFromToken,
  getStoredToken,
  decodeToken,
} from "../../lib/api";
import AppointmentForm from "../../components/AppointmentForm";
import { useAuth } from "../_app";
import Link from "next/link";

export default function PatientDashboard() {
  const { userId: ctxUserId, token, role } = useAuth();
  const rawToken = getStoredToken() || token || "";
  const derived = useMemo(
    () => extractUserFromToken(rawToken) || {},
    [rawToken]
  );
  const decoded = useMemo(() => decodeToken(rawToken) || {}, [rawToken]);

  const effectivePatientId = ctxUserId || derived.id || null;

  const [me, setMe] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setError("");
      try {
        if (!effectivePatientId) return;
        const [meRes, apptRes] = await Promise.all([
          PatientApi.getById(effectivePatientId),
          PatientApi.getAppointmentsByPatient(effectivePatientId),
        ]);
        setMe(meRes.data || {});
        setAppointments(apptRes.data || []);
        try {
          const docsRes = await api.get("/api/doctors");
          setDoctors(Array.isArray(docsRes.data) ? docsRes.data : []);
        } catch (_) {
          setDoctors([]);
        }
      } catch (e) {
        const msg =
          e?.response?.data?.message ||
          e?.response?.data ||
          e?.message ||
          "Failed to load";
        setError(String(msg));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [effectivePatientId]);

  const saveProfile = async () => {
    if (!effectivePatientId) return;
    setSaving(true);
    setError("");
    try {
      const { data } = await PatientApi.updateById(effectivePatientId, {
        firstName: me.firstName,
        lastName: me.lastName,
        dateOfBirth: me.dateOfBirth,
        email: me.email,
        phoneNumber: me.phoneNumber,
      });
      setMe(data || {});
      alert("Profile updated");
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data ||
        e?.message ||
        "Update failed";
      setError(String(msg));
    } finally {
      setSaving(false);
    }
  };

  const schedule = async ({ doctorId, appointmentDate, reason }) => {
    if (!effectivePatientId) return;
    setScheduling(true);
    setError("");
    try {
      const iso = new Date(appointmentDate).toISOString();
      await PatientApi.scheduleAppointment({
        patientId: effectivePatientId,
        doctorId,
        appointmentDate: iso,
        reason,
      });
      const { data } = await PatientApi.getAppointmentsByPatient(
        effectivePatientId
      );
      setAppointments(data || []);
      alert("Appointment scheduled");
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data ||
        e?.message ||
        "Schedule failed";
      setError(String(msg));
    } finally {
      setScheduling(false);
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
        <p>Please login as a patient to view this page.</p>
        <Link href="/patient/login">
          <button>Go to Patient Login</button>
        </Link>
      </div>
    );
  }

  if (!effectivePatientId) {
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
        <pre
          style={{
            background: "#f3f4f6",
            padding: 12,
            borderRadius: 8,
            overflow: "auto",
          }}
        >
          {JSON.stringify(decoded, null, 2)}
        </pre>
        <Link href="/patient/login">
          <button>Go to Patient Login</button>
        </Link>
      </div>
    );
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div
        style={{
          background: "#fff7ed",
          border: "1px solid #fed7aa",
          color: "#7c2d12",
          padding: 12,
          borderRadius: 8,
        }}
      >
        <div>
          <strong>Debug</strong> — role: {role || "n/a"}, NameIdentifier:{" "}
          {effectivePatientId || "n/a"}
        </div>
        {error ? <div>Last error: {error}</div> : null}
      </div>

      <section
        style={{
          background: "white",
          padding: 20,
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Patient Dashboard</h2>
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
            Date of Birth
            <input
              type="date"
              value={(me.dateOfBirth || "").substring(0, 10)}
              onChange={(e) => setMe({ ...me, dateOfBirth: e.target.value })}
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
        <h3 style={{ marginTop: 0 }}>Schedule Appointment</h3>
        <AppointmentForm
          doctors={doctors}
          onSubmit={schedule}
          submitting={scheduling}
        />
      </section>

      <section
        style={{
          background: "white",
          padding: 20,
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Upcoming Appointments</h3>
        {appointments.length === 0 ? (
          <div>No appointments.</div>
        ) : (
          <ul>
            {appointments.map((a) => (
              <li key={a.id}>
                {new Date(a.appointmentDate).toLocaleString()} with Dr. {""}
                {a.doctorName ||
                  `${a.doctor?.firstName || ""} ${a.doctor?.lastName || ""}`}
                {a.doctorSpecialization ? ` (${a.doctorSpecialization})` : ""} —{" "}
                {a.status}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
