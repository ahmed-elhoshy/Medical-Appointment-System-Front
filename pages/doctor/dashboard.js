import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { DoctorApi, AppointmentsApi } from "../../lib/api";
import Layout from "../../components/Layout";
import PrivateRoute from "../../components/PrivateRoute";
import { getUserFromToken, removeToken } from "../../utils/auth";

export default function Dashboard() {
  const [appointments, setAppointments] = useState([]);
  const [err, setErr] = useState(null);
  const router = useRouter();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setErr(null);
    try {
      const u = getUserFromToken();
      if (!u) return router.push("/doctor/login");
      if (u.role !== "Doctor") return setErr("Not allowed");
      const doctorId = u.id;
      const res = await DoctorApi.getAppointmentsByDoctor(doctorId);
      setAppointments(res.data || []);
    } catch (ex) {
      if (ex?.response?.status === 401) router.push("/doctor/login");
      else if (ex?.response?.status === 403) setErr("Not allowed");
      else setErr(ex?.response?.data || "Error");
    }
  }

  async function cancel(id) {
    try {
      await AppointmentsApi.cancel(id);
      load();
    } catch (ex) {
      if (ex?.response?.status === 401) router.push("/doctor/login");
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

  async function complete(id) {
    try {
      await AppointmentsApi.complete(id);
      load();
    } catch (ex) {
      if (ex?.response?.status === 401) router.push("/doctor/login");
      else if (ex?.response?.status === 403) setErr("Not allowed");
      else if (ex?.response?.status === 400) {
        setErr(
          "Cannot complete this appointment - it may be already completed or cancelled"
        );
      } else if (ex?.response?.status === 404) {
        setErr("Appointment not found");
      } else {
        setErr("Failed to mark as completed");
      }
    }
  }

  function getStatusDisplay(status) {
    switch (status) {
      case 0:
        return <span style={{ color: "#2563eb" }}>Scheduled</span>;
      case 1:
        return <span style={{ color: "#059669" }}>Completed</span>;
      case 2:
        return <span style={{ color: "#dc2626" }}>Cancelled</span>;
      default:
        return status;
    }
  }

  function getActionButtons(appointment) {
    if (appointment.status === 2) return null; // No actions for cancelled appointments

    const buttons = [];

    // Show Complete button only for scheduled appointments
    if (appointment.status === 0) {
      buttons.push(
        <button
          key="complete"
          onClick={() => complete(appointment.id)}
          style={{
            background: "#059669",
            marginLeft: "8px",
          }}
        >
          Mark Completed
        </button>
      );
    }

    // Show Cancel for non-completed appointments
    if (appointment.status !== 1) {
      buttons.push(
        <button
          key="cancel"
          onClick={() => cancel(appointment.id)}
          style={{
            background: "#dc2626",
            marginLeft: "8px",
          }}
        >
          Cancel
        </button>
      );
    }

    return buttons;
  }

  function logout() {
    removeToken();
    router.push("/");
  }

  return (
    <PrivateRoute role="Doctor">
      <Layout>
        <div className="row">
          <h2>Doctor Dashboard</h2>
          <button onClick={logout}>Logout</button>
        </div>
        {err && <div className="error">{err}</div>}
        <section>
          <h3>Scheduled Appointments</h3>
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
                  <strong>Patient:</strong>{" "}
                  {a.patientName ||
                    `${a.patient?.firstName} ${a.patient?.lastName}`}
                </div>
                <div style={{ marginBottom: "4px" }}>
                  <strong>Reason:</strong> {a.reason}
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <strong>Status:</strong> {getStatusDisplay(a.status)}
                  <div style={{ marginLeft: "auto" }}>
                    {getActionButtons(a)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </Layout>
    </PrivateRoute>
  );
}
