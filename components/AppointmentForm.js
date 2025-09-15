import { useState } from "react";

export default function AppointmentForm({
  doctors = [],
  onSubmit,
  submitting = false,
}) {
  const [form, setForm] = useState({
    doctorId: "",
    appointmentDate: "",
    reason: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.doctorId || !form.appointmentDate || !form.reason) {
      setError("All fields are required");
      return;
    }
    await onSubmit({
      doctorId: form.doctorId,
      appointmentDate: form.appointmentDate,
      reason: form.reason,
    });
  };

  const hasDoctorList = Array.isArray(doctors) && doctors.length > 0;

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "grid", gap: 12, maxWidth: 480 }}
    >
      <label>
        Doctor
        {hasDoctorList ? (
          <select name="doctorId" value={form.doctorId} onChange={handleChange}>
            <option value="">Select a doctor</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.firstName} {d.lastName} - {d.specialization}
              </option>
            ))}
          </select>
        ) : (
          <input
            name="doctorId"
            placeholder="Enter Doctor ID (GUID)"
            value={form.doctorId}
            onChange={handleChange}
          />
        )}
      </label>
      <label>
        Appointment Date (UTC)
        <input
          type="datetime-local"
          name="appointmentDate"
          value={form.appointmentDate}
          onChange={handleChange}
        />
      </label>
      <label>
        Reason
        <input
          type="text"
          name="reason"
          value={form.reason}
          onChange={handleChange}
        />
      </label>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <button type="submit" disabled={submitting}>
        {submitting ? "Scheduling..." : "Schedule Appointment"}
      </button>
    </form>
  );
}
