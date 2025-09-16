import { useEffect, useState, useMemo } from "react";
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
  const [originalProfile, setOriginalProfile] = useState(null);

  // Debug effect to monitor state changes
  useEffect(() => {
    console.log("Edit mode changed:", isEditing);
  }, [isEditing]);
  const [err, setErr] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const router = useRouter();

  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (initialLoad) {
      loadProfile();
      setInitialLoad(false);
    }
  }, [initialLoad]);

  const user = useMemo(() => getUserFromToken(), []);

  async function loadProfile() {
    if (!user) {
      router.push("/patient/login");
      return;
    }

    if (user.role !== "Patient") {
      setErr("Not allowed");
      return;
    }

    setErr(null);
    try {
      const res = await PatientApi.getById(user.id);
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
    if (!isEditing) return; // Prevent submission if not in edit mode

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

        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {profile.firstName ? profile.firstName[0].toUpperCase() : "P"}
            </div>
            <div className="profile-info">
              <h1>
                {profile.firstName} {profile.lastName}
              </h1>
              <p>{profile.email}</p>
            </div>
          </div>

          <div className={`form-container ${isEditing ? "editing" : ""}`}>
            {!isEditing ? (
              <>
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={profile.firstName}
                    disabled
                    placeholder="Enter your first name"
                  />
                </div>

                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={profile.lastName}
                    disabled
                    placeholder="Enter your last name"
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    disabled
                    placeholder="Enter your email"
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={profile.phoneNumber || ""}
                    disabled
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={profile.dateOfBirth || ""}
                    disabled
                  />
                </div>

                <div className="button-group">
                  <button
                    type="button"
                    onClick={() => {
                      console.log("Enabling edit mode");
                      setOriginalProfile({ ...profile });
                      setIsEditing(true);
                    }}
                  >
                    Edit Profile
                  </button>
                </div>
              </>
            ) : (
              <form id="profileForm" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={profile.firstName}
                    onChange={handleChange}
                    required
                    placeholder="Enter your first name"
                  />
                </div>

                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={profile.lastName}
                    onChange={handleChange}
                    required
                    placeholder="Enter your last name"
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email"
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={profile.phoneNumber || ""}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={profile.dateOfBirth || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="button-group">
                  <button type="submit">Save Changes</button>
                  <button
                    type="button"
                    className="danger"
                    onClick={() => {
                      setProfile(originalProfile);
                      setIsEditing(false);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </Layout>
    </PrivateRoute>
  );
}
