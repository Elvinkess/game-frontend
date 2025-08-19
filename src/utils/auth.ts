import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  id: number;       // ← changed from userId
  username: string;
  exp: number;
}

export function getUserIdFromToken(): number | null {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.id ?? null;  // ← use `id` from token
  } catch (err) {
    console.error("Invalid token", err);
    return null;
  }
}
