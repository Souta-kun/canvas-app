import axios from "axios";
import { useMemo } from "react";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const useHttp = (apiKey: number | null = null) => {
  const http = useMemo(
    () =>
      axios.create({
        baseURL: API_URL,
        timeout: 10000,
        headers: {
          "Content-Type": "application/json",
          origin: window.location.origin,
          pin: 1234567,
          api_key: apiKey,
        },
      }),
    [apiKey],
  );

  return { http };
};

export default useHttp;
