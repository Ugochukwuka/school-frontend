"use client";

import { useState, useEffect } from "react";
import { Form, Input, Button, Card, Alert, Typography, Divider } from "antd";
import { UserOutlined, LockOutlined, SafetyOutlined, EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import api from "@/app/lib/api";
import { useResponsive } from "@/app/lib/responsive";
import Logo from "@/app/components/Logo";
import { useSchoolProfile } from "@/app/lib/useSchoolProfile";
import styles from "./login.module.css";

const { Title, Text } = Typography;

// Demo login credentials (password is "password" for all):
// Admin:    admin@example.com
// Parent:   parent1@example.com
// Teacher:  johndoe@example.com
// Student:  studenta@example.com

interface LoginResponse {
  token: string;
  user?: {
    uuid: string;
    name: string;
    email: string;
    role: string;
  };
}

const normalizeServerError = (responseData: unknown): string => {
  if (typeof responseData === "string") {
    const trimmed = responseData.trim();
    if (
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
      return trimmed.slice(1, -1);
    }
    return trimmed;
  }

  if (responseData && typeof responseData === "object") {
    const candidate = (responseData as Record<string, unknown>).message
      ?? (responseData as Record<string, unknown>).error
      ?? (responseData as Record<string, unknown>).detail;
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  return "Unknown error";
};

export default function LoginPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const router = useRouter();
  const [form] = Form.useForm();
  const { isMobile } = useResponsive();
  const { schoolName, logoPath } = useSchoolProfile();

  // Defer form render until after mount to avoid hydration mismatch from
  // browser extensions (e.g. Dark Reader) or antd inline style serialization.
  useEffect(() => {
    setMounted(true);
  }, []);

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    setError("");

    try {
      const response = await api.post<LoginResponse>(
        "/login",
        {
          email: values.email,
          password: values.password,
        }
      );

      // Store token (you might want to use localStorage or cookies)
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        // Redirect based on role
        const role = response.data.user?.role || "student";
        if (role === "admin") {
          router.push("/admin/dashboard");
        } else if (role === "teacher") {
          router.push("/teachers/dashboard");
        } else if (role === "parent") {
          router.push("/parent/children");
        } else {
          router.push("/dashboard/student");
        }
      }
    } catch (err: unknown) {
      const error = err as {
        code?: string;
        message?: string;
        request?: unknown;
        response?: { status?: number; data?: unknown };
      };
      // Error details are already logged by the API interceptor in app/lib/api.ts
      // Only log a brief summary here if needed for debugging
      if (process.env.NODE_ENV === "development" && error.response) {
        const responseData = error.response.data;
        const errorMsg = normalizeServerError(responseData);
        // Don't log 401 (invalid credentials) - expected user error; log 500 and other server errors only
        const status = error.response.status;
        if (status !== 401 && !errorMsg.toLowerCase().includes("sqlstate") && !errorMsg.toLowerCase().includes("connection")) {
          if (status === 500 && responseData) {
            // Avoid Next.js dev error overlay for handled backend failures.
            console.warn("Login backend returned 500:", errorMsg);
          } else {
            console.warn("Login request failed:", status, errorMsg);
          }
        }
      }
      
      // Show more detailed error message
      let errorMessage = "Login failed. Please check your credentials.";
      
      if (error.response) {
        // Server responded with error
        const status = error.response.status;
        const responseData = error.response.data;
        
        if (status === 500) {
          // Check if it's a database connection error
          const normalizedError = normalizeServerError(responseData);
          const errorText = normalizedError.toLowerCase();
          
          // Detect MySQL/database connection errors
          if (errorText.includes("sqlstate") || 
              errorText.includes("mysql") ||
              (errorText.includes("connection") && 
               (errorText.includes("refused") || 
                errorText.includes("could not be made") || 
                errorText.includes("target machine actively refused") ||
                errorText.includes("hy000")))) {
            errorMessage = "Database Connection Error: The backend server cannot connect to MySQL. " +
                          "Please ensure MySQL is running in XAMPP (start MySQL from XAMPP Control Panel) " +
                          "and verify your backend database configuration. " +
                          "The backend server is running, but the database is not accessible.";
          } else {
            // Try to extract a meaningful error message from various possible response formats
            errorMessage = normalizedError === "Unknown error"
              ? "Server error. Please try again later or contact support."
              : normalizedError;
          }
        } else if (status === 401) {
          // 401 Unauthorized - could be invalid credentials or authentication required
          const unauthorizedMessage = responseData as { message?: string; error?: string } | null;
          errorMessage = unauthorizedMessage?.message || 
                        unauthorizedMessage?.error || 
                        "Invalid email or password. Please check your credentials and try again.";
        } else if (status === 422) {
          // Validation error
          const validationErrors = (responseData as { errors?: Record<string, unknown> } | null)?.errors;
          if (validationErrors) {
            const errorList = Object.entries(validationErrors)
              .map(([, messages]: [string, unknown]) => 
                Array.isArray(messages) ? messages.join(", ") : String(messages)
              )
              .join(". ");
            errorMessage =
              errorList ||
              (responseData as { message?: string } | null)?.message ||
              "Validation error. Please check your input.";
          } else {
            errorMessage =
              (responseData as { message?: string } | null)?.message ||
              "Validation error. Please check your input.";
          }
        } else if (status === 404) {
          errorMessage = "Login endpoint not found. Please contact support.";
        } else if (status === 403) {
          errorMessage = "Access forbidden. Please contact support.";
        } else if ((responseData as { message?: string } | null)?.message) {
          errorMessage = (responseData as { message: string }).message;
        } else if ((responseData as { error?: string } | null)?.error) {
          errorMessage = (responseData as { error: string }).error;
        }
      } else if (error.request) {
        // Request was made but no response received - this is a network/connectivity issue
        const errorCode = error.code;
        
        if (errorCode === "ERR_NETWORK" || error.message === "Network Error") {
          errorMessage = "Network error: Unable to connect to the server. Please ensure the backend server is running at http://127.0.0.1:8000 and check for CORS issues.";
        } else if (errorCode === "ECONNREFUSED") {
          errorMessage = "Connection refused: The server at http://127.0.0.1:8000 is not running or not accessible. Please start the backend server and try again.";
        } else if (errorCode === "ETIMEDOUT" || error.message?.includes("timeout")) {
          errorMessage = "Request timed out: The server took too long to respond (30 seconds). Please verify that the backend server is running at http://127.0.0.1:8000 and try again. If the server is running, it may be overloaded or experiencing issues.";
        } else if (errorCode === "ERR_INTERNET_DISCONNECTED") {
          errorMessage = "No internet connection. Please check your network connection and try again.";
        } else {
          errorMessage = "Unable to connect to server. The backend server may not be running. Please verify the server is running at http://127.0.0.1:8000 and check for CORS or network issues.";
        }
      } else {
        errorMessage = error.message || "An unexpected error occurred. Please try again.";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className={styles.root}>
        <div className={styles.overlay} aria-hidden />
        <div className={styles.cardSkeleton}>
          <div className={styles.cardSkeletonInner} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.overlay} aria-hidden />

      <Card
        className={styles.card}
        styles={{
          body: { padding: isMobile ? "24px" : "40px" },
        }}
      >
        {/* Header Section */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "20px",
            }}
          >
            <Logo
              width={isMobile ? 80 : 100}
              height={isMobile ? 80 : 100}
              showFallback={true}
              logoPath={logoPath}
            />
          </div>
          <Title level={isMobile ? 3 : 2} style={{ margin: 0, marginBottom: "8px", color: "#1a1a1a" }}>
            Welcome Back
          </Title>
          <Text type="secondary" style={{ fontSize: isMobile ? "14px" : "16px" }}>
            Sign in to your {schoolName} account
          </Text>
        </div>

        {error && (
          <Alert
            title={error}
            type="error"
            showIcon
            closable
            onClose={() => setError("")}
            style={{ marginBottom: 24, borderRadius: "8px" }}
          />
        )}

        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
          requiredMark={false}
          initialValues={{
            email: "johndoe@example.com",
            password: "password",
          }}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
            style={{ marginBottom: "20px" }}
          >
            <Input
              prefix={<UserOutlined style={{ color: "#667eea" }} />}
              placeholder="Email address"
              autoComplete="email"
              style={{
                height: "48px",
                borderRadius: "8px",
                fontSize: "15px",
              }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
            style={{ marginBottom: "8px" }}
          >
            <Input
              type={passwordVisible ? "text" : "password"}
              prefix={<LockOutlined style={{ color: "#667eea" }} />}
              placeholder="Password"
              autoComplete="current-password"
              style={{
                height: "48px",
                borderRadius: "8px",
                fontSize: "15px",
              }}
              suffix={
                <span
                  role="button"
                  tabIndex={0}
                  onClick={() => setPasswordVisible((v) => !v)}
                  onKeyDown={(e) => e.key === "Enter" && setPasswordVisible((v) => !v)}
                  style={{
                    cursor: "pointer",
                    color: "#667eea",
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                  aria-label={passwordVisible ? "Hide password" : "Show password"}
                >
                  {passwordVisible ? (
                    <EyeInvisibleOutlined style={{ fontSize: 18 }} />
                  ) : (
                    <EyeOutlined style={{ fontSize: 18 }} />
                  )}
                </span>
              }
            />
          </Form.Item>

          <div style={{ textAlign: "right", marginBottom: "24px" }}>
            <Button
              type="link"
              style={{ padding: 0, color: "#667eea", fontWeight: 500 }}
            >
              Forgot password?
            </Button>
          </div>

          <Form.Item style={{ marginBottom: "24px" }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              style={{
                height: "50px",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: 600,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
                boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </Form.Item>
        </Form>

        <Divider style={{ margin: "24px 0" }}>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            Secure Login
          </Text>
        </Divider>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            marginTop: "16px",
          }}
        >
          <SafetyOutlined style={{ color: "#52c41a", fontSize: "16px" }} />
          <Text type="secondary" style={{ fontSize: "13px" }}>
            Your data is protected with encryption
          </Text>
        </div>
      </Card>
    </div>
  );
}

