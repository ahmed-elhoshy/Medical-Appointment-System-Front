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
    switch (status) {
      case 0:
        return <span className="status-scheduled">Scheduled</span>;
      case 1:
        return <span className="status-completed">Completed</span>;
      case 2:
        return <span className="status-cancelled">Cancelled</span>;
      default:
        return status;
    }
  }

  function logout() {
    removeToken();
    router.push("/");
  }

  return (
    <PrivateRoute role="Patient">
      <Layout>
        <div className="dashboard-header">
          <div>
            <h2>Patient Dashboard</h2>
            <p className="welcome-text">
              Welcome back! Manage your appointments below.
            </p>
          </div>
          <button onClick={logout} className="btn-secondary">
            Sign Out
          </button>
        </div>

        {err && <div className="error">{err}</div>}

        <div className="dashboard-grid">
          <section className="appointments-section">
            <h3>Your Appointments</h3>
            <div className="appointment-list">
              {appointments.length === 0 ? (
                <div className="no-appointments">
                  No appointments scheduled yet.
                </div>
              ) : (
                appointments.map((a) => (
                  <div key={a.id} className="appointment-card">
                    <div className="appointment-header">
                      <div className="appointment-date">
                        {new Date(a.appointmentDate).toLocaleString()}
                      </div>
                      {getStatusDisplay(a.status)}
                    </div>

                    <div className="appointment-doctor">
                      <strong>Doctor:</strong> Dr.{" "}
                      {a.doctorName ||
                        `${a.doctor?.firstName} ${a.doctor?.lastName}`}
                      {a.doctor?.specialization && (
                        <span className="doctor-specialization">
                          {a.doctor.specialization}
                        </span>
                      )}
                    </div>

                    <div className="appointment-reason">
                      <strong>Reason:</strong> {a.reason}
                    </div>

                    {a.status !== 2 && (
                      <button
                        onClick={() => cancel(a.id)}
                        className="btn-danger"
                      >
                        Cancel Appointment
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="schedule-section">
            <div className="appointment-form">
              <h3>Schedule New Appointment</h3>
              <form onSubmit={schedule}>
                <div className="form-group">
                  <label>Select Doctor</label>
                  <select
                    required
                    value={form.doctorId}
                    onChange={(e) =>
                      setForm({ ...form, doctorId: e.target.value })
                    }
                  >
                    <option value="">Choose a doctor</option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        Dr. {d.firstName} {d.lastName} - {d.specialization}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Appointment Date & Time</label>
                  <input
                    required
                    type="datetime-local"
                    value={form.appointmentDate}
                    onChange={(e) =>
                      setForm({ ...form, appointmentDate: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Reason for Visit</label>
                  <input
                    required
                    placeholder="Brief description of your visit"
                    value={form.reason}
                    onChange={(e) =>
                      setForm({ ...form, reason: e.target.value })
                    }
                  />
                </div>

                <button type="submit" className="btn-primary">
                  Schedule Appointment
                </button>
              </form>
            </div>
          </section>
        </div>
      </Layout>
    </PrivateRoute>
  );
}
