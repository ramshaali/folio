import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": import.meta.env.VITE_APP_API_KEY,
    "x-browser-id": localStorage.getItem("folio_browser_id") || generateBrowserId(),
  },
});

export function generateBrowserId() {
  const id = crypto.randomUUID();
  localStorage.setItem("folio_browser_id", id);
  return id;
}
