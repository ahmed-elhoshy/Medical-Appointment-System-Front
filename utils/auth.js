import { jwtDecode } from "jwt-decode";

export function saveToken(token) {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
    console.log("Token saved to localStorage", {
      token: token?.substring(0, 20),
    });
  }
}

export function removeToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
}

export function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("token") : null;
}

export function getUserFromToken() {
  const token = getToken();
  if (!token) {
    console.log("No token found");
    return null;
  }
  try {
    console.log("Decoding token", { token: token?.substring(0, 20) });
    const decoded = jwtDecode(token); // Using named import
    console.log("Decoded claims", decoded);

    // Extract id from common claim names
    const id =
      decoded.nameid ||
      decoded.sub ||
      decoded.Id ||
      decoded.id ||
      decoded[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ] ||
      null;

    // Extract role, handle array of roles
    let role =
      decoded.role ||
      decoded.Role ||
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      null;

    if (Array.isArray(role)) {
      role = role[0];
    }

    // Extract email from common claim names
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
  } catch (error) {
    console.error("Failed to decode token", error);
    return null;
  }
}
