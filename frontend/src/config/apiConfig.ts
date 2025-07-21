export const API_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}:${
      import.meta.env.VITE_API_BASE_PORT
    }/api`
  : "http://localhost:3000/api";