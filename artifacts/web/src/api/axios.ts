import axios from "axios";

export const api = axios.create({
  baseURL: `${import.meta.env.BASE_URL}api/v1`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
