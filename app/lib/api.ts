import axios from "axios";

// Use environment variable for API URL, fallback to default
// In development, we use the Next.js proxy (/api) to avoid CORS issues
// Set NEXT_PUBLIC_API_URL to bypass proxy and connect directly
const getBaseURL = () => {
  // If NEXT_PUBLIC_API_URL is explicitly set, use it (direct connection)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // In browser, use relative path to Next.js API proxy (avoids CORS)
  // The proxy will forward requests to the backend
  if (typeof window !== "undefined") {
    return "/api";
  }
  
  // Server-side: use direct backend URL (proxy doesn't work server-side)
  return process.env.NEXT_PUBLIC_BACKEND_URL 
    ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`
    : "http://127.0.0.1:8000/api";
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  timeout: 30000, // 30 seconds timeout (increased for slower connections)
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // If data is FormData, remove Content-Type to let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Log network errors with helpful information (only in development)
    if (error.request && !error.response) {
      const isDevelopment = process.env.NODE_ENV === "development";
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
      const baseURL = error.config?.baseURL || getBaseURL();
      const relativePath = error.config?.url || "unknown";
      // Construct full URL for better debugging
      const fullURL = baseURL && relativePath !== "unknown"
        ? `${baseURL}${relativePath.startsWith('/') ? '' : '/'}${relativePath}`
        : relativePath;
      
      if (isDevelopment) {
        // Use console.warn instead of console.error to reduce console noise
        // These warnings are expected when the backend server is not running
        console.warn("⚠️ Backend Connection Error");
        console.warn(`   Full URL: ${fullURL}`);
        console.warn(`   Base URL: ${baseURL}`);
        console.warn(`   Path: ${relativePath}`);
        console.warn(`   Expected backend: ${backendUrl}`);
        console.warn(`   Error code: ${error.code || "unknown"}`);
        console.warn(`   Error message: ${error.message || "No response from server"}`);
        console.warn("");
        console.warn("🔧 Troubleshooting steps:");
        console.warn("   1. Verify the backend server is running at " + backendUrl);
        console.warn("   2. Test the backend directly: Open " + backendUrl + "/api/login in your browser");
        console.warn("   3. Check if .env.local exists with NEXT_PUBLIC_BACKEND_URL=" + backendUrl);
        console.warn("   4. Restart Next.js dev server after creating/updating .env.local");
        console.warn("   5. If using proxy (/api), verify Next.js rewrites are working");
        console.warn("   6. Try direct connection: Set NEXT_PUBLIC_API_URL=" + backendUrl + "/api in .env.local");
        console.warn("   7. Check Windows Firewall isn't blocking port 8000");
        console.warn("   8. Verify backend CORS settings allow requests from your frontend origin");
      } else {
        // In production, log a simpler message
        console.error("Backend connection error: Unable to reach server");
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Helper function to get axios instance with auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };
};
