"use client";

import { useEffect, useState } from "react";
import { Card, Form, Input, Button, Alert, App, Typography, Select, Spin } from "antd";
import { useRouter } from "next/navigation";
import api from "@/app/lib/api";
import DashboardLayout from "@/app/components/DashboardLayout";

const { Title } = Typography;

interface Teacher {
  uuid: string;
  name: string;
  email: string;
  phone?: string;
  [key: string]: any;
}

interface TeacherResponse {
  message: string;
  data: Teacher;
}

export default function EditTeacherPage() {
  const { message } = App.useApp();
  const router = useRouter();
  const [form] = Form.useForm();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [selectedTeacherUuid, setSelectedTeacherUuid] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoadingTeachers(true);
    setError("");
    try {
      const response = await api.get<any>("/admin/teachers");
      console.log("Teachers response:", response.data);
      
      let teachersData: Teacher[] = [];
      if (Array.isArray(response.data)) {
        teachersData = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        teachersData = response.data.data;
      } else {
        console.warn("Unexpected teachers response format:", response.data);
      }
      
      console.log("Teachers data:", teachersData);
      setTeachers(teachersData);
    } catch (err: any) {
      console.error("Error fetching teachers:", err);
      setError(err.response?.data?.message || "Failed to load teachers. Please try again.");
    } finally {
      setLoadingTeachers(false);
    }
  };

  const handleTeacherChange = (teacherUuid: string) => {
    const teacher = teachers.find((t) => t.uuid === teacherUuid);
    if (teacher) {
      setSelectedTeacher(teacher);
      setSelectedTeacherUuid(teacherUuid);
      form.setFieldsValue({
        name: teacher.name,
        email: teacher.email,
        phone: teacher.phone || "",
      });
    }
  };

  const handleSubmit = async (values: {
    name: string;
    email?: string;
    phone?: string;
  }) => {
    if (!selectedTeacherUuid) {
      setError("Please select a teacher first");
      message.warning("Please select a teacher first");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.put<TeacherResponse>(
        `/admin/teachers/${selectedTeacherUuid}/edit`,
        values
      );

      console.log("Teacher updated successfully:", response.data);

      if (response.data && response.data.message) {
        message.success(response.data.message);
      } else {
        message.success("Teacher updated successfully!");
      }

      // Reset form and selection
      form.resetFields();
      setSelectedTeacher(null);
      setSelectedTeacherUuid(null);

      // Redirect to dashboard after 1.5 seconds
      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 1500);
    } catch (err: any) {
      console.error("Error updating teacher:", err);
      console.error("Error response:", err.response?.data);

      // Handle validation errors
      let errorMessage = "Failed to update teacher. Please try again.";

      if (err.response?.data) {
        // Laravel validation errors
        if (err.response.data.errors) {
          const errors = err.response.data.errors;
          const errorMessages = Object.values(errors).flat() as string[];
          errorMessage = errorMessages.join(", ");
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="admin">
      <Card style={{ boxShadow: "none" }}>
        <Title level={1} style={{ marginBottom: "24px" }}>
          Edit Teacher
        </Title>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            closable
            onClose={() => setError("")}
            style={{ marginBottom: 24 }}
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ maxWidth: 600 }}
        >
          <Form.Item
            label="Select Teacher"
            required
          >
            <Select
              placeholder="Select a teacher to edit"
              loading={loadingTeachers}
              value={selectedTeacherUuid}
              onChange={handleTeacherChange}
              style={{ width: "100%", maxWidth: 400 }}
              options={teachers.map((teacher) => ({
                value: teacher.uuid,
                label: `${teacher.name} (${teacher.email})`,
              }))}
            />
          </Form.Item>

          {selectedTeacher && (
            <>
              <Form.Item
                name="name"
                label="Name"
                rules={[{ required: true, message: "Please enter teacher name" }]}
              >
                <Input placeholder="Enter teacher name" />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { type: "email", message: "Please enter a valid email" },
                ]}
              >
                <Input
                  type="email"
                  placeholder="Enter email"
                  autoComplete="email"
                />
              </Form.Item>

              <Form.Item
                name="phone"
                label="Phone"
              >
                <Input placeholder="Enter phone number" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} size="large">
                  Update Teacher
                </Button>
              </Form.Item>
            </>
          )}
        </Form>
      </Card>
    </DashboardLayout>
  );
}
