/**
 * Utility to test backend server connection
 * This helps diagnose connection issues
 */

export async function testBackendConnection(): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
  const testUrl = `${backendUrl}/api/login`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout for test

    const response = await fetch(testUrl, {
      method: "OPTIONS", // Use OPTIONS to test connection without sending data
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    clearTimeout(timeoutId);

    return {
      success: true,
      message: `Backend server is reachable at ${backendUrl}`,
      details: {
        status: response.status,
        statusText: response.statusText,
        url: testUrl,
      },
    };
  } catch (error: any) {
    if (error.name === "AbortError") {
      return {
        success: false,
        message: `Connection timeout: Backend server at ${backendUrl} is not responding within 5 seconds`,
        details: {
          error: "Timeout",
          url: testUrl,
        },
      };
    }

    return {
      success: false,
      message: `Cannot connect to backend server at ${backendUrl}`,
      details: {
        error: error.message,
        url: testUrl,
        code: error.code,
      },
    };
  }
}
