import type { Address } from "../types";

const RAW_API_BASE = import.meta.env.VITE_API_BASE_URL as string | undefined;
if (!RAW_API_BASE) {
  throw new Error("Missing VITE_API_BASE_URL env var");
}
const API_BASE = RAW_API_BASE.replace(/\/$/, "");

export const searchAddresses = async (
  query: string,
  signal: AbortSignal
): Promise<Address[]> => {
  const url = `${API_BASE}/search/${encodeURIComponent(query)}`;
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  return response.json();
};