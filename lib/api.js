import axios from "axios";
import jwtDecode from "jwt-decode";

// Use Next.js rewrite proxy in dev to avoid CORS: /api-backend/* -> backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api-backend";

let authToken = null;

export function setAuthToken(token) {
  authToken = token;
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("auth_token", token);
    } else {
      localStorage.removeItem("auth_token");
    }
  }
}

export function getStoredToken() {
  if (authToken) return authToken;
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

export function decodeToken(token) {
  try {
    return jwtDecode(token);
  } catch (_) {
    return null;
  }
}

function findClaimInsensitive(decoded, contains) {
  if (!decoded) return null;
  const target = contains.toLowerCase();
  for (const key of Object.keys(decoded)) {
    if (key.toLowerCase().includes(target)) {
      return decoded[key];
    }
  }
  return null;
}

export function extractUserFromToken(token) {
  const decoded = decodeToken(token);
  if (!decoded) return { id: null, role: null };
  const id =
    decoded.nameid ||
    decoded.sub ||
    decoded.Id ||
    decoded.uid ||
    decoded[
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
    ] ||
    decoded["NameIdentifier"] ||
    findClaimInsensitive(decoded, "nameidentifier") ||
    null;
  const role =
    decoded.role ||
    decoded.Role ||
    decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
    findClaimInsensitive(decoded, "role") ||
    null;
  return { id, role };
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
  loginPatient: (data) => api.post("/api/patients/login", data),
  registerPatient: (data) => api.post("/api/patients/register", data),
  loginDoctor: (data) => api.post("/api/doctors/login", data),
  registerDoctor: (data) => api.post("/api/doctors/register", data),
};

export const PatientApi = {
  getById: (id) => api.get(`/api/patients/${id}`),
  updateById: (id, data) => api.put(`/api/patients/${id}`, data),
  getAppointmentsByPatient: (patientId) =>
    api.get(`/api/appointments/patient/${patientId}`),
  scheduleAppointment: (data) => api.post("/api/appointments", data),
};

export const DoctorApi = {
  getById: (id) => api.get(`/api/doctors/${id}`),
  updateById: (id, data) => api.put(`/api/doctors/${id}`, data),
  getAppointmentsByDoctor: (doctorId) =>
    api.get(`/api/appointments/doctor/${doctorId}`),
};

export const AppointmentsApi = {
  getById: (id) => api.get(`/api/appointments/${id}`),
  cancel: (id) => api.put(`/api/appointments/${id}/cancel`),
};
