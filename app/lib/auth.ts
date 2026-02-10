// Helper function to get axios instance with auth headers
export const getAuthHeaders = () => {
  if (typeof window === "undefined") {
    return {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };
  }

  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return { headers };
};

