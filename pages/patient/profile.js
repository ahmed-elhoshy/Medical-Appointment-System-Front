import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { PatientApi } from "../../lib/api";
import Layout from "../../components/Layout";
import PrivateRoute from "../../components/PrivateRoute";
import { getUserFromToken } from "../../utils/auth";

export default function Profile() {
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [err, setErr] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const router = useRouter();

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setErr(null);
    try {
      const u = getUserFromToken();
      if (!u) return router.push("/patient/login");
      if (u.role !== "Patient") return setErr("Not allowed");

      const res = await PatientApi.getById(u.id);
      const data = res.data;

      // Format date for input field
      if (data.dateOfBirth) {
        data.dateOfBirth = new Date(data.dateOfBirth)
          .toISOString()
          .split("T")[0];
      }

      setProfile(data);
    } catch (ex) {
      if (ex?.response?.status === 401) router.push("/patient/login");
      else if (ex?.response?.status === 403) setErr("Not allowed");
      else setErr("Failed to load profile");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErr(null);
    setSuccessMessage(null);

    try {
      const u = getUserFromToken();
      if (!u) return router.push("/patient/login");

      await PatientApi.updateProfile(u.id, profile);
      setSuccessMessage("Profile updated successfully");
      setIsEditing(false);
    } catch (ex) {
      if (ex?.response?.status === 401) router.push("/patient/login");
      else if (ex?.response?.status === 403) setErr("Not allowed");
      else setErr("Failed to update profile");
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  return (
    <PrivateRoute role="Patient">
      <Layout>
        <div className="row">
          <h2>My Profile</h2>
        </div>

        {err && <div className="error">{err}</div>}
        {successMessage && <div className="success">{successMessage}</div>}

        <form onSubmit={handleSubmit} style={{ maxWidth: "500px" }}>
          <div className="form-group">
            <label>First Name:</label>
            <input
              type="text"
              name="firstName"
              value={profile.firstName}
              onChange={handleChange}
              disabled={!isEditing}
              required
            />
          </div>

          <div className="form-group">
            <label>Last Name:</label>
            <input
              type="text"
              name="lastName"
              value={profile.lastName}
              onChange={handleChange}
              disabled={!isEditing}
              required
            />
          </div>

          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              disabled={!isEditing}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number:</label>
            <input
              type="tel"
              name="phoneNumber"
              value={profile.phoneNumber || ""}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="form-group">
            <label>Date of Birth:</label>
            <input
              type="date"
              name="dateOfBirth"
              value={profile.dateOfBirth || ""}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="form-group" style={{ marginTop: "20px" }}>
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                style={{ background: "#2563eb" }}
              >
                Edit Profile
              </button>
            ) : (
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="submit" style={{ background: "#059669" }}>
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    loadProfile(); // Reset form
                  }}
                  style={{ background: "#dc2626" }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </form>
      </Layout>
    </PrivateRoute>
  );
}
