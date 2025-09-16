import { useEffect } from "react";
import { useRouter } from "next/router";
import { getToken, getUserFromToken } from "../utils/auth";

export default function PrivateRoute({ children, role }) {
  const router = useRouter();
  useEffect(() => {
    const timer = setTimeout(() => {
      const token = getToken();
      if (!token) {
        router.replace(role === "Doctor" ? "/doctor/login" : "/patient/login");
        return;
      }
      if (role) {
        const u = getUserFromToken();
        if (u && u.role && role && u.role !== role) {
          router.replace("/");
        }
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);
  return children;
}
