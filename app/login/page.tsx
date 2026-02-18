"use client";

import { useState, useEffect } from "react";
import { Form, Input, Button, Card, Alert, Typography, Divider } from "antd";
import { UserOutlined, LockOutlined, SafetyOutlined, BookOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import api from "@/app/lib/api";
import { useResponsive } from "@/app/lib/responsive";
import Logo from "@/app/components/Logo";
import { useSchoolProfile } from "@/app/lib/useSchoolProfile";

const { Title, Text } = Typography;

interface LoginResponse {
  token: string;
  user?: {
    uuid: string;
    name: string;
    email: string;
    role: string;
  };
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const [form] = Form.useForm();
  const { isMobile } = useResponsive();
  const { schoolName, logoPath } = useSchoolProfile();

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
    } catch (err: any) {
      // Error details are already logged by the API interceptor in app/lib/api.ts
      // Only log a brief summary here if needed for debugging
      if (process.env.NODE_ENV === "development" && err.response) {
        const responseData = err.response.data;
        const errorMsg = responseData?.message || responseData?.error || responseData?.detail || 
                        (typeof responseData === "string" ? responseData : null) || "Unknown error";
        // Don't log 401 (invalid credentials) - expected user error; log 500 and other server errors only
        const status = err.response.status;
        if (status !== 401 && !errorMsg.toLowerCase().includes("sqlstate") && !errorMsg.toLowerCase().includes("connection")) {
          if (status === 500 && responseData) {
            console.error("Login error (500):", JSON.stringify(responseData, null, 2));
          } else {
            console.error("Login error:", status, errorMsg);
          }
        }
      }
      
      // Show more detailed error message
      let errorMessage = "Login failed. Please check your credentials.";
      
      if (err.response) {
        // Server responded with error
        const status = err.response.status;
        const responseData = err.response.data;
        
        if (status === 500) {
          // Check if it's a database connection error
          const errorText = (responseData?.message || responseData?.error || responseData?.detail || "").toLowerCase();
          const fullErrorText = (responseData?.message || responseData?.error || responseData?.detail || "");
          
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
            errorMessage = responseData?.message || 
                          responseData?.error || 
                          responseData?.detail ||
                          (typeof responseData === "string" ? responseData : null) ||
                          "Server error. Please try again later or contact support.";
          }
        } else if (status === 401) {
          // 401 Unauthorized - could be invalid credentials or authentication required
          errorMessage = responseData?.message || 
                        responseData?.error || 
                        "Invalid email or password. Please check your credentials and try again.";
        } else if (status === 422) {
          // Validation error
          const validationErrors = responseData?.errors;
          if (validationErrors) {
            const errorList = Object.entries(validationErrors)
              .map(([field, messages]: [string, any]) => 
                Array.isArray(messages) ? messages.join(", ") : String(messages)
              )
              .join(". ");
            errorMessage = errorList || responseData?.message || "Validation error. Please check your input.";
          } else {
            errorMessage = responseData?.message || "Validation error. Please check your input.";
          }
        } else if (status === 404) {
          errorMessage = "Login endpoint not found. Please contact support.";
        } else if (status === 403) {
          errorMessage = "Access forbidden. Please contact support.";
        } else if (responseData?.message) {
          errorMessage = responseData.message;
        } else if (responseData?.error) {
          errorMessage = responseData.error;
        }
      } else if (err.request) {
        // Request was made but no response received - this is a network/connectivity issue
        const errorCode = err.code;
        
        if (errorCode === "ERR_NETWORK" || err.message === "Network Error") {
          errorMessage = "Network error: Unable to connect to the server. Please ensure the backend server is running at http://127.0.0.1:8000 and check for CORS issues.";
        } else if (errorCode === "ECONNREFUSED") {
          errorMessage = "Connection refused: The server at http://127.0.0.1:8000 is not running or not accessible. Please start the backend server and try again.";
        } else if (errorCode === "ETIMEDOUT" || err.message?.includes("timeout")) {
          errorMessage = "Request timed out: The server took too long to respond (30 seconds). Please verify that the backend server is running at http://127.0.0.1:8000 and try again. If the server is running, it may be overloaded or experiencing issues.";
        } else if (errorCode === "ERR_INTERNET_DISCONNECTED") {
          errorMessage = "No internet connection. Please check your network connection and try again.";
        } else {
          errorMessage = "Unable to connect to server. The backend server may not be running. Please verify the server is running at http://127.0.0.1:8000 and check for CORS or network issues.";
        }
      } else {
        errorMessage = err.message || "An unexpected error occurred. Please try again.";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
        backgroundImage: "url('/FrontEndImages/Login pic.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Overlay for better readability */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.3)",
          backdropFilter: "blur(1px)",
          zIndex: 0,
        }}
      />

      <Card
        style={{
          width: "100%",
          maxWidth: 450,
          borderRadius: "16px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
          border: "none",
          backdropFilter: "blur(20px)",
          background: "rgba(255, 255, 255, 0.95)",
          position: "relative",
          zIndex: 1,
        }}
        styles={{ body: { padding: isMobile ? "24px" : "40px" } }}
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
            email: "admin@example.com",
            password: "123457",
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
            <Input.Password
              prefix={<LockOutlined style={{ color: "#667eea" }} />}
              placeholder="Password"
              autoComplete="current-password"
              style={{
                height: "48px",
                borderRadius: "8px",
                fontSize: "15px",
              }}
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

