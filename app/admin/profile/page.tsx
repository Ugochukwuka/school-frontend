"use client";

import { useEffect, useState } from "react";
import { Card, Spin, Alert, Descriptions, Button, Form, Input, Modal, message } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getAuthHeaders } from "@/app/lib/auth";
import DashboardLayout from "@/app/components/DashboardLayout";

interface Profile {
  id?: number;
  uuid: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
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

export default function AdminProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Get UUID from localStorage (stored during login)
  const getAdminUuid = () => {
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

  const adminUuid = getAdminUuid();

  useEffect(() => {
    if (adminUuid) {
      fetchProfile();
    } else {
      setError("Admin UUID not found. Please login again.");
      setLoading(false);
    }
  }, [adminUuid]);

  // Sync form values when profile changes and modal is open
  useEffect(() => {
    if (profile && isEditModalVisible) {
      form.setFieldsValue({
        name: profile.name,
        email: profile.email,
        phone: profile.phone || "",
      });
    }
  }, [profile, isEditModalVisible, form]);

  const fetchProfile = async () => {
    if (!adminUuid) {
      setError("Admin UUID not found. Please login again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.get<ProfileResponse>(
        `http://127.0.0.1:8000/api/me?uuid=${adminUuid}`,
        getAuthHeaders()
      );

      if (response.data.status && response.data.data) {
        setProfile(response.data.data);
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
    if (!adminUuid || !profile) {
      message.error("Admin UUID not found. Please login again.");
      return;
    }

    setUpdating(true);
    setError("");

    try {
      // Build request payload - only include password if provided
      const payload: any = {
        uuid: adminUuid,
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
        setIsEditModalVisible(false);
        
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

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <DashboardLayout role="admin">
      <Card
        title="My Profile"
        extra={
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => setIsEditModalVisible(true)}
          >
            Edit Profile
          </Button>
        }
      >
        {error && (
          <Alert
            title={error}
            type="error"
            showIcon
            closable
            onClose={() => setError("")}
            style={{ marginBottom: 20 }}
          />
        )}

        {profile && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Name">{profile.name}</Descriptions.Item>
            <Descriptions.Item label="Email">{profile.email}</Descriptions.Item>
            <Descriptions.Item label="Phone">{profile.phone || "N/A"}</Descriptions.Item>
            <Descriptions.Item label="Role">{profile.role || "Admin"}</Descriptions.Item>
          </Descriptions>
        )}

        <Modal
          title="Update Profile"
          open={isEditModalVisible}
          onCancel={() => setIsEditModalVisible(false)}
          footer={null}
          afterOpenChange={(open) => {
            // Set form values when modal opens
            if (open && profile) {
              form.setFieldsValue({
                name: profile.name,
                email: profile.email,
                phone: profile.phone || "",
              });
            }
          }}
        >
          <Form form={form} onFinish={handleUpdate} layout="vertical">
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: "Please enter your name" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
            >
              <Input disabled readOnly style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }} />
            </Form.Item>
            <div style={{ fontSize: "12px", color: "#999", marginTop: "-16px", marginBottom: "16px" }}>
              Email cannot be changed
            </div>
            <Form.Item name="phone" label="Phone">
              <Input />
            </Form.Item>
            <Form.Item
              name="password"
              label="New Password"
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
            >
              <Input.Password placeholder="Enter new password (leave empty to keep current)" />
            </Form.Item>
            <Form.Item
              name="password_confirmation"
              label="Confirm Password"
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
            >
              <Input.Password placeholder="Confirm new password" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={updating}>
                Update Profile
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </DashboardLayout>
  );
}

