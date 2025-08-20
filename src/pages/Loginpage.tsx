// src/pages/LoginPage.tsx
import { useState } from "react";
import api from "../api/client";
import { useNavigate,Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../utils/LoginPage.css"

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      const { data } = await api.post("/user/signin", { username });
      console.log("Login response:", data);
      localStorage.setItem("token", data.token)
      login(username, data.token);
      navigate("/home");
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div className="main_login">
      <h1 className="text-2xl font-bold">Login</h1>
      <input
        type="text"
        placeholder="Enter username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="border p-2 rounded"
      />
      <button onClick={handleLogin} className="bg-blue-500 text-white px-4 py-2 rounded">
        Login
      </button>
      <p>
        Don’t have an account?{" "}
        <Link
        to="/register"
          className="text-green-500 cursor-pointer"
        >
          Register
        </Link>
      </p>
    </div>
  );
}
