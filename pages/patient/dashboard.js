import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { api } from "../../lib/api";
import Layout from "../../components/Layout";
import PrivateRoute from "../../components/PrivateRoute";
import { getUserFromToken, removeToken } from "../../utils/auth";

export default function Dashboard() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({
    doctorId: "",
    appointmentDate: "",
    reason: "",
  });
  const [err, setErr] = useState(null);
  const router = useRouter();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setErr(null);
    try {
      const u = getUserFromToken();
      if (!u) return router.push("/patient/login");
      if (u.role !== "Patient") return setErr("Not allowed");
      const patientId = u.id;
      const ap = await api.get(`/api/Appointments/patient/${patientId}`);
      setAppointments(ap.data || []);

      try {
        const docs = await api.get("/api/Doctors");
        setDoctors(docs.data || []);
      } catch (ex) {
        console.log("Doctors list not available", ex?.response?.status);
        setDoctors([]);
      }
    } catch (ex) {
      handleApiError(ex);
    }
  }

  function handleApiError(ex) {
    if (ex?.response?.status === 401) router.push("/patient/login");
    else if (ex?.response?.status === 403) setErr("Not allowed");
    else setErr(ex?.response?.data || "Error");
  }

  async function schedule(e) {
    e.preventDefault();
    setErr(null);
    try {
      const u = getUserFromToken();
      if (!u) return router.push("/patient/login");
      if (u.role !== "Patient") return setErr("Only patients can schedule");
      const patientId = u.id;
      const apDate = new Date(form.appointmentDate);
      if (isNaN(apDate.getTime())) return setErr("Invalid date");
      const now = new Date();
      if (apDate <= now)
        return setErr("Appointment date must be in the future (UTC)");
      const payload = {
        PatientId: patientId,
        DoctorId: form.doctorId,
        AppointmentDate: apDate.toISOString(),
        Reason: form.reason,
      };
      const res = await api.post("/api/Appointments", payload);
      if (res.status === 201 || res.status === 200) {
        setForm({ doctorId: "", appointmentDate: "", reason: "" });
        load();
      }
    } catch (ex) {
      if (ex?.response?.status === 400) setErr(ex.response.data);
      else handleApiError(ex);
    }
  }

  async function cancel(id) {
    try {
      await api.put(`/api/Appointments/${id}/cancel`);
      load();
    } catch (ex) {
      if (ex?.response?.status === 401) router.push("/patient/login");
      else if (ex?.response?.status === 403) setErr("Not allowed");
      else if (
        ex?.response?.status === 400 &&
        ex?.response?.data?.includes("already")
      ) {
        setErr("Appointment is already cancelled");
      } else {
        setErr("Cancel failed");
      }
    }
  }

  function getStatusDisplay(status) {
    if (status === 2) {
      return <span style={{ color: "#dc2626" }}>Cancelled</span>;
    }
    return status;
  }

  function logout() {
    removeToken();
    router.push("/");
  }

  return (
    <PrivateRoute role="Patient">
      <Layout>
        <div className="row">
          <h2>Patient Dashboard</h2>
          <button onClick={logout}>Logout</button>
        </div>
        {err && <div className="error">{err}</div>}
        <section>
          <h3>Upcoming Appointments</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {appointments.map((a) => (
              <li
                key={a.id}
                style={{
                  background: "#f8fafc",
                  padding: "12px",
                  marginBottom: "8px",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ marginBottom: "4px" }}>
                  <strong>Date:</strong>{" "}
                  {new Date(a.appointmentDate).toLocaleString()}
                </div>
                <div style={{ marginBottom: "4px" }}>
                  <strong>Doctor:</strong> Dr.{" "}
                  {a.doctorName ||
                    `${a.doctor?.firstName} ${a.doctor?.lastName}`}
                  {a.doctor?.specialization && ` (${a.doctor.specialization})`}
                </div>
                <div style={{ marginBottom: "4px" }}>
                  <strong>Reason:</strong> {a.reason}
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <strong>Status:</strong> {getStatusDisplay(a.status)}
                  {a.status !== 2 && (
                    <button
                      onClick={() => cancel(a.id)}
                      style={{ marginLeft: "auto" }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h3>Schedule Appointment</h3>
          <form className="form" onSubmit={schedule}>
            <select
              required
              value={form.doctorId}
              onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
            >
              <option value="">Select doctor</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.firstName} {d.lastName} - {d.specialization}
                </option>
              ))}
            </select>
            <input
              required
              type="datetime-local"
              value={form.appointmentDate}
              onChange={(e) =>
                setForm({ ...form, appointmentDate: e.target.value })
              }
            />
            <input
              required
              placeholder="Reason for visit"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
            />
            <button type="submit">Schedule</button>
          </form>
        </section>
      </Layout>
    </PrivateRoute>
  );
}
