import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Puedes configurar la URL base y otras opciones aquí
const api = axios.create({
  baseURL: API_URL, // Cambia esto según tu backend
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    origin: window.location.origin, // Agrega el origen para CORS
    pin: 1234567,
    api_key: 2879,
  },
});

export default api;
