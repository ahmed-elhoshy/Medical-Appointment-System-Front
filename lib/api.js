import axios from "axios";
import { jwtDecode } from "jwt-decode";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:7081";

let authToken = null;

export function setAuthToken(token) {
  authToken = token;
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("token", token);
      console.log("Token saved to localStorage", {
        token: token?.substring(0, 20),
      });
    } else {
      localStorage.removeItem("token");
    }
  }
}

export function getStoredToken() {
  if (authToken) return authToken;
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function decodeToken(token) {
  try {
    return jwtDecode(token);
  } catch (_) {
    return null;
  }
}

export function extractUserFromToken(token) {
  const decoded = decodeToken(token);
  if (!decoded) return { id: null, role: null };
  const id =
    decoded.nameid ||
    decoded.sub ||
    decoded.Id ||
    decoded.id ||
    decoded[
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
    ] ||
    null;

  let role =
    decoded.role ||
    decoded.Role ||
    decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
    null;

  if (Array.isArray(role)) {
    role = role[0];
  }

  const email =
    decoded.email ||
    decoded.Email ||
    decoded[
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
    ] ||
    null;

  const user = { id, role, email };
  console.log("Extracted user info", user);
  return user;
}

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const AuthApi = {
  loginPatient: (data) => api.post("/api/Patients/login", data),
  registerPatient: (data) => api.post("/api/Patients/register", data),
  loginDoctor: (data) => api.post("/api/Doctors/login", data),
  registerDoctor: (data) => api.post("/api/Doctors/register", data),
};

export const PatientApi = {
  getById: (id) => api.get(`/api/Patients/${id}`),
  updateProfile: (id, data) => api.put(`/api/Patients/${id}`, data),
  getAppointmentsByPatient: (patientId) =>
    api.get(`/api/Appointments/patient/${patientId}`),
  scheduleAppointment: (data) => api.post("/api/Appointments", data),
};

export const DoctorApi = {
  getById: (id) => api.get(`/api/Doctors/${id}`),
  updateProfile: (id, data) => api.put(`/api/Doctors/${id}`, data),
  getAppointmentsByDoctor: (doctorId) =>
    api.get(`/api/Appointments/doctor/${doctorId}`),
};

export const AppointmentsApi = {
  getById: (id) => api.get(`/api/Appointments/${id}`),
  cancel: (id) => api.put(`/api/Appointments/${id}/cancel`),
  complete: (id) => api.put(`/api/Appointments/${id}/complete`),
};
