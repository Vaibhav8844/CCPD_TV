import axios from "axios";
import { BACKEND_URL } from "../config";

const api = axios.create({
  baseURL: BACKEND_URL
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem("adminToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem("adminToken");
      window.location.reload();
    }
    return Promise.reject(err);
  }
);

export default api;
