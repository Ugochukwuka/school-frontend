"use client";

import { useEffect, useState } from "react";
import { Card, Spin, Alert, Descriptions, Button, Form, Input, Modal } from "antd";
import { EditOutlined } from "@ant-design/icons";
import axios from "axios";
import { getAuthHeaders } from "@/app/lib/auth";
import DashboardLayout from "@/app/components/DashboardLayout";

interface Profile {
  uuid: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  [key: string]: any;
}

export default function ParentProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Get UUID from localStorage (stored during login)
  const getParentUuid = () => {
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

  const parentUuid = getParentUuid();

  useEffect(() => {
    if (parentUuid) {
      fetchProfile();
    } else {
      setError("Unable to load profile. Please log in again.");
      setLoading(false);
    }
  }, [parentUuid]);

  const fetchProfile = async () => {
    if (!parentUuid) return;

    setLoading(true);
    setError("");

    try {
      const response = await axios.get<{ data?: Profile } | Profile>(
        `http://127.0.0.1:8000/api/me?uuid=${parentUuid}`,
        getAuthHeaders()
      );

      const profileData = (response.data as any).data || response.data;
      setProfile(profileData);
    } catch (err: any) {
      console.error("Error fetching profile:", err);
      setError(
        err.response?.data?.message || "Failed to load profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (values: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    password_confirmation?: string;
  }) => {
    if (!parentUuid) {
      setError("Unable to update profile. Please log in again.");
      return;
    }

    try {
      const updateData: any = {
        uuid: parentUuid,
        name: values.name,
        email: values.email,
        phone: values.phone,
      };

      // Only include password fields if password is provided
      if (values.password) {
        updateData.password = values.password;
        updateData.password_confirmation = values.password_confirmation;
      }

      await axios.post(
        `http://127.0.0.1:8000/api/updateprofile`,
        updateData,
        getAuthHeaders()
      );

      setIsEditModalVisible(false);
      form.resetFields();
      fetchProfile();
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setError(
        err.response?.data?.message || "Failed to update profile. Please try again."
      );
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
    <DashboardLayout role="parent">
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
            <Descriptions.Item label="Role">{profile.role || "Parent"}</Descriptions.Item>
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
                phone: profile.phone,
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
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Please enter a valid email" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="phone" label="Phone">
              <Input />
            </Form.Item>
            <Form.Item name="password" label="New Password">
              <Input.Password />
            </Form.Item>
            <Form.Item
              name="password_confirmation"
              label="Confirm Password"
              dependencies={["password"]}
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!getFieldValue("password") || value === getFieldValue("password")) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Passwords do not match"));
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Update Profile
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </DashboardLayout>
  );
}

