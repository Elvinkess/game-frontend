// src/pages/RegisterPage.tsx
import { useState } from "react";
import api from "../api/client";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../utils/Registerpage.css"

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRegister = async () => {
    try {
      const { data } = await api.post("/user/create", { username });
      login(username, data.token);
      navigate("/login");
    } catch (err) {
      alert("Registration failed");
    }
  };

  return (
    <div className="create_account">
      <h1 className="text-2xl font-bold">Create Account</h1>
      <input
        type="text"
        placeholder="Enter username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="border p-2 rounded"
      />
      <button onClick={handleRegister} className="bg-green-500 text-white px-4 py-2 rounded">
        Register
      </button>
      <p>
        Already have an account?{" "}
        <span
          onClick={() => navigate("/login")}
          className="text-blue-500 cursor-pointer"
        >
          <Link to="/login">Login</Link>
        </span>
      </p>
    </div>
  );
}
