// src/api/socket.ts
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL || "http://localhost:8080", {
  auth: {
    token: localStorage.getItem("token"),
  },
});

export default socket;
