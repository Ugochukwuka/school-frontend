"use client";

import { useEffect, useState } from "react";
import { Card, Spin, Alert, Button, Form, Input, Space, Typography, Avatar, Divider, message } from "antd";
import { EditOutlined, UserOutlined, MailOutlined, PhoneOutlined, SaveOutlined, CloseOutlined, LockOutlined } from "@ant-design/icons";
import axios from "axios";
import { getAuthHeaders } from "@/app/lib/auth";
import DashboardLayout from "@/app/components/DashboardLayout";
import { useResponsive } from "@/app/lib/responsive";
import { useRouter } from "next/navigation";

const { Title, Text } = Typography;

interface Profile {
  id: number;
  uuid: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  parent_id?: number;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

interface ProfileResponse {
  status: boolean;
  data: Profile;
}

interface UpdateProfileResponse {
  status: boolean;
  message: string;
  data: Profile;
}

export default function ProfilePage() {
  const { isMobile } = useResponsive();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [form] = Form.useForm();

  // Get UUID from localStorage (stored during login)
  const getStudentUuid = () => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          return user?.uuid || null;
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  };

  const studentUuid = getStudentUuid();

  useEffect(() => {
    if (studentUuid) {
      fetchProfile();
    } else {
      setError("Student UUID not found. Please login again.");
      setLoading(false);
    }
  }, [studentUuid]);

  // Sync form values when profile changes (after Form has mounted)
  useEffect(() => {
    if (profile) {
      form.setFieldsValue({
        name: profile.name,
        email: profile.email,
        phone: profile.phone || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const fetchProfile = async () => {
    if (!studentUuid) {
      setError("Student UUID not found. Please login again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.get<ProfileResponse>(
        `http://127.0.0.1:8000/api/me?uuid=${studentUuid}`,
        getAuthHeaders()
      );

      if (response.data.status && response.data.data) {
        const profileData = response.data.data;
        setProfile(profileData);
        // Form values will be set via useEffect when profile state updates
      } else {
        setError("Failed to load profile data.");
      }
    } catch (err: any) {
      console.error("Error fetching profile:", err);
      let errorMessage = "Failed to load profile. Please try again.";
      
      if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
        errorMessage = "Network Error: Please check if the backend server is running";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 401) {
        errorMessage = "Unauthorized. Please login again.";
      } else if (err.response?.status === 404) {
        errorMessage = "Profile not found.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (values: {
    name: string;
    email: string;
    phone?: string;
    password?: string;
    password_confirmation?: string;
  }) => {
    if (!studentUuid || !profile) {
      message.error("Student UUID not found. Please login again.");
      return;
    }

    setUpdating(true);
    setError("");

    try {
      // Build request payload - only include password if provided
      const payload: any = {
        uuid: studentUuid,
        name: values.name,
        email: profile.email, // Use email from profile state (readonly)
        phone: values.phone || "",
      };

      // Only add password fields if password is provided and not empty
      if (values.password && values.password.trim() !== "") {
        payload.password = values.password;
        if (values.password_confirmation) {
          payload.password_confirmation = values.password_confirmation;
        }
      }

      const response = await axios.post<UpdateProfileResponse>(
        `http://127.0.0.1:8000/api/updateprofile`,
        payload,
        getAuthHeaders()
      );

      if (response.data.status && response.data.data) {
        const updatedProfile = response.data.data;
        setProfile(updatedProfile);
        setIsEditMode(false);
        
        // Check if password was changed
        const passwordChanged = values.password && values.password.trim() !== "";
        
        if (passwordChanged) {
          message.success(response.data.message || "Profile updated successfully. Please login again with your new password.");
          // Logout after password change
          setTimeout(() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            router.push("/login");
          }, 2000); // Give user time to see the success message
        } else {
          message.success(response.data.message || "Profile updated successfully");
          // Clear password fields
          form.setFieldsValue({
            password: undefined,
            password_confirmation: undefined,
          });
        }
      } else {
        message.error(response.data.message || "Failed to update profile");
      }
    } catch (err: any) {
      console.error("Error updating profile:", err);
      console.error("Error response:", err.response?.data);
      let errorMessage = "Failed to update profile. Please try again.";
      
      if (err.response?.status === 422) {
        // Validation errors
        const validationErrors = err.response?.data?.errors;
        if (validationErrors) {
          const firstError = Array.isArray(Object.values(validationErrors).flat()[0]) 
            ? Object.values(validationErrors).flat()[0][0]
            : Object.values(validationErrors).flat()[0];
          errorMessage = firstError || errorMessage;
          // Set form field errors
          Object.keys(validationErrors).forEach((field) => {
            const fieldErrors = Array.isArray(validationErrors[field]) 
              ? validationErrors[field] 
              : [validationErrors[field]];
            form.setFields([
              {
                name: field,
                errors: fieldErrors,
              },
            ]);
          });
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 401) {
        errorMessage = "Unauthorized. Please login again.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    setIsEditMode(false);
    // Reset form to original values
    if (profile) {
      form.setFieldsValue({
        name: profile.name,
        email: profile.email,
        phone: profile.phone || "",
        password: undefined,
        password_confirmation: undefined,
      });
    }
    form.resetFields();
    setError("");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <DashboardLayout role="student">
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student">
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <Card
          style={{
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            borderRadius: "8px",
          }}
        >
          {/* Header Section */}
          <div style={{ marginBottom: "32px" }}>
            <Space
              orientation={isMobile ? "vertical" : "horizontal"}
              size="large"
              style={{ width: "100%", justifyContent: "space-between" }}
            >
              <Space size="large" style={{ width: isMobile ? "100%" : "auto" }}>
                <Avatar
                  size={isMobile ? 64 : 80}
                  icon={<UserOutlined />}
                  style={{
                    backgroundColor: "#667eea",
                    fontSize: isMobile ? "32px" : "40px",
                  }}
                >
                  {profile?.name ? getInitials(profile.name) : ""}
                </Avatar>
                <div>
                  <Title level={2} style={{ margin: 0, fontSize: isMobile ? "24px" : "28px" }}>
                    {profile?.name || "Profile"}
                  </Title>
                  <Text type="secondary" style={{ fontSize: "14px" }}>
                    {profile?.email || ""}
                  </Text>
                </div>
              </Space>
              {!isEditMode && (
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => setIsEditMode(true)}
                  size={isMobile ? "middle" : "large"}
                  style={{ minWidth: "120px" }}
                >
                  Edit Profile
                </Button>
              )}
            </Space>
          </div>

          {error && !updating && (
            <Alert
              title={error}
              type="error"
              showIcon
              closable
              onClose={() => setError("")}
              style={{ marginBottom: "24px" }}
            />
          )}

          {/* Profile Form */}
          {profile && (
            <Form
              form={form}
              onFinish={handleUpdate}
              layout="vertical"
              requiredMark={false}
              style={{ maxWidth: "600px" }}
            >
              <Divider style={{ margin: "24px 0" }} />

              <Form.Item
                name="name"
                label={
                  <Space>
                    <UserOutlined />
                    <span>Full Name</span>
                  </Space>
                }
                rules={[
                  { required: true, message: "Name is required" },
                  { min: 2, message: "Name must be at least 2 characters" },
                ]}
                hasFeedback
                validateStatus={form.getFieldError("name").length > 0 ? "error" : ""}
              >
                <Input
                  size="large"
                  placeholder="Enter your full name"
                  disabled={!isEditMode}
                  style={{
                    borderColor: form.getFieldError("name").length > 0 ? "#ff4d4f" : undefined,
                  }}
                />
              </Form.Item>

              {/* Email field - readonly but included in form for submission */}
              <Form.Item
                name="email"
                label={
                  <Space>
                    <MailOutlined />
                    <span>Email Address</span>
                  </Space>
                }
              >
                <Input
                  size="large"
                  placeholder="Email address"
                  prefix={<MailOutlined />}
                  disabled={true}
                  readOnly
                  style={{
                    backgroundColor: "#f5f5f5",
                    cursor: "not-allowed",
                  }}
                />
              </Form.Item>
              <Text type="secondary" style={{ fontSize: "12px", marginTop: "-16px", marginBottom: "24px", display: "block" }}>
                Email cannot be changed
              </Text>

              <Form.Item
                name="phone"
                label={
                  <Space>
                    <PhoneOutlined />
                    <span>Phone Number</span>
                  </Space>
                }
                rules={[
                  {
                    validator: (_, value) => {
                      if (!value || value.trim() === "") {
                        return Promise.resolve();
                      }
                      if (!/^[0-9]*$/.test(value)) {
                        return Promise.reject(new Error("Phone number must contain only digits"));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
                hasFeedback
                validateStatus={form.getFieldError("phone").length > 0 ? "error" : ""}
              >
                <Input
                  size="large"
                  placeholder="Enter your phone number (optional)"
                  prefix={<PhoneOutlined />}
                  disabled={!isEditMode}
                  allowClear
                  style={{
                    borderColor: form.getFieldError("phone").length > 0 ? "#ff4d4f" : undefined,
                  }}
                />
              </Form.Item>

              {isEditMode && (
                <>
                  <Divider style={{ margin: "32px 0" }}>
                    <Text type="secondary" style={{ fontSize: "14px" }}>
                      Change Password (Optional)
                    </Text>
                  </Divider>

                  <Form.Item
                    name="password"
                    label={
                      <Space>
                        <LockOutlined />
                        <span>New Password</span>
                      </Space>
                    }
                    rules={[
                      {
                        validator: (_, value) => {
                          if (!value || value.trim() === "") {
                            return Promise.resolve();
                          }
                          if (value.length < 6) {
                            return Promise.reject(new Error("Password must be at least 6 characters"));
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                    hasFeedback
                    validateStatus={form.getFieldError("password").length > 0 ? "error" : ""}
                  >
                    <Input.Password
                      size="large"
                      placeholder="Enter new password (leave empty to keep current)"
                      prefix={<LockOutlined />}
                      style={{
                        borderColor: form.getFieldError("password").length > 0 ? "#ff4d4f" : undefined,
                      }}
                    />
                  </Form.Item>

                  <Form.Item
                    name="password_confirmation"
                    label={
                      <Space>
                        <LockOutlined />
                        <span>Confirm New Password</span>
                      </Space>
                    }
                    dependencies={["password"]}
                    rules={[
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          const password = getFieldValue("password");
                          if (!password) {
                            return Promise.resolve();
                          }
                          if (!value) {
                            return Promise.reject(new Error("Please confirm your password"));
                          }
                          if (value !== password) {
                            return Promise.reject(new Error("Passwords do not match"));
                          }
                          return Promise.resolve();
                        },
                      }),
                    ]}
                    hasFeedback
                    validateStatus={form.getFieldError("password_confirmation").length > 0 ? "error" : ""}
                  >
                    <Input.Password
                      size="large"
                      placeholder="Confirm new password"
                      prefix={<LockOutlined />}
                      style={{
                        borderColor: form.getFieldError("password_confirmation").length > 0 ? "#ff4d4f" : undefined,
                      }}
                    />
                  </Form.Item>
                </>
              )}

              {isEditMode && (
                <Form.Item style={{ marginTop: "32px", marginBottom: 0 }}>
                  <Space size="middle" style={{ width: "100%", justifyContent: isMobile ? "stretch" : "flex-end" }}>
                    <Button
                      size="large"
                      onClick={handleCancel}
                      disabled={updating}
                      style={{ minWidth: "120px" }}
                    >
                      <CloseOutlined /> Cancel
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      loading={updating}
                      icon={<SaveOutlined />}
                      style={{ minWidth: "120px" }}
                    >
                      Save Changes
                    </Button>
                  </Space>
                </Form.Item>
              )}
            </Form>
          )}

          {/* Additional Info (Read-only) */}
          {!isEditMode && profile && (
            <>
              <Divider style={{ margin: "32px 0" }} />
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: "16px" }}>
                <div>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    Role
                  </Text>
                  <div style={{ fontSize: "16px", fontWeight: 500, marginTop: "4px" }}>
                    {profile.role || "Student"}
                  </div>
                </div>
                {profile.created_at && (
                  <div>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      Member Since
                    </Text>
                    <div style={{ fontSize: "16px", fontWeight: 500, marginTop: "4px" }}>
                      {new Date(profile.created_at).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
