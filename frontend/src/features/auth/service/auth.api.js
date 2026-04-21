import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export async function register({ username, password }) {
  const response = await api.post("/api/auth/register", { username, password });
  return response.data;
}

export async function login({ username, password }) {
  const response = await api.post("/api/auth/login", { username, password });
  return response.data;
}

export async function getMe() {
  const response = await api.get("/api/auth/get-me");
  return response.data;
}