"use client";

import { useState } from "react";
import { Card, Form, Input, Button, Alert, App, Typography, InputNumber, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import api from "@/app/lib/api";
import DashboardLayout from "@/app/components/DashboardLayout";
import type { UploadFile, UploadProps } from "antd";

const { Title } = Typography;
const { TextArea } = Input;

export default function AddSchoolProfilePage() {
  const { message } = App.useApp();
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [logoFileList, setLogoFileList] = useState<UploadFile[]>([]);
  const [logoBase64, setLogoBase64] = useState<string>("");

  const handleLogoChange: UploadProps["onChange"] = ({ fileList }) => {
    setLogoFileList(fileList);
    
    if (fileList.length > 0) {
      const file = fileList[0].originFileObj;
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setLogoBase64(base64String);
          form.setFieldsValue({ logo: base64String });
        };
        reader.readAsDataURL(file);
      }
    } else {
      setLogoBase64("");
      form.setFieldsValue({ logo: undefined });
    }
  };

  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
  const beforeUpload = (file: File) => {
    if (!allowedTypes.includes(file.type)) {
      message.error("Only JPG, JPEG and PNG images are allowed.");
      return Upload.LIST_IGNORE;
    }
    // Backend expects file; 2048 KB (2MB) limit
    const isLt2M = file.size / 1024 <= 2048;
    if (!isLt2M) {
      message.error("Image must be smaller than 2MB!");
      return Upload.LIST_IGNORE;
    }
    return false;
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    setError("");

    try {
      const file = logoFileList[0]?.originFileObj;
      if (!file) {
        message.error("Please upload a logo");
        setLoading(false);
        return;
      }

      // Backend expects multipart/form-data with image file (not base64) so validation passes
      const formData = new FormData();
      formData.append("school_name", values.school_name);
      formData.append("motto", values.motto);
      formData.append("mission", values.mission);
      formData.append("vision", values.vision);
      formData.append("about_us", values.about_us);
      formData.append("address", values.address);
      formData.append("email", values.email);
      formData.append("phone", values.phone);
      formData.append("website", values.website || "");
      formData.append("established_year", String(values.established_year));
      formData.append("logo", file);

      await api.post("/school/profile/save", formData);
      message.success("School profile added successfully!");
      form.resetFields();
      setLogoFileList([]);
      setLogoBase64("");
      setTimeout(() => {
        router.push("/admin/schoolprofile/view");
      }, 2000);
    } catch (err: any) {
      console.error("Error adding school profile:", err);
      let errorMessage = "Failed to add school profile. Please try again.";
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const errorMessages = Object.values(errors).flat() as string[];
        errorMessage = errorMessages.join(", ");
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
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
          Add School Profile
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
            style={{ maxWidth: 800 }}
          >
          <Form.Item
            name="school_name"
            label="School Name"
            rules={[{ required: true, message: "Please enter school name" }]}
          >
            <Input placeholder="Enter school name" />
          </Form.Item>

          <Form.Item
            name="motto"
            label="Motto"
            rules={[{ required: true, message: "Please enter motto" }]}
          >
            <Input placeholder="Enter school motto" />
          </Form.Item>

          <Form.Item
            name="mission"
            label="Mission"
            rules={[{ required: true, message: "Please enter mission" }]}
          >
            <TextArea
              rows={4}
              placeholder="Enter school mission"
            />
          </Form.Item>

          <Form.Item
            name="vision"
            label="Vision"
            rules={[{ required: true, message: "Please enter vision" }]}
          >
            <TextArea
              rows={4}
              placeholder="Enter school vision"
            />
          </Form.Item>

          <Form.Item
            name="about_us"
            label="About Us"
            rules={[{ required: true, message: "Please enter about us" }]}
          >
            <TextArea
              rows={6}
              placeholder="Enter about us information"
            />
          </Form.Item>

          <Form.Item
            name="address"
            label="Address"
            rules={[{ required: true, message: "Please enter address" }]}
          >
            <TextArea
              rows={2}
              placeholder="Enter school address"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input placeholder="Enter school email" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone"
            rules={[{ required: true, message: "Please enter phone number" }]}
          >
            <Input placeholder="Enter school phone number" />
          </Form.Item>

          <Form.Item
            name="website"
            label="Website"
            rules={[
              { type: "url", message: "Please enter a valid URL" },
            ]}
          >
            <Input placeholder="Enter school website URL" />
          </Form.Item>

          <Form.Item
            name="established_year"
            label="Established Year"
            rules={[{ required: true, message: "Please enter established year" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Enter established year"
              min={1800}
              max={new Date().getFullYear()}
            />
          </Form.Item>

          <Form.Item
            name="logo"
            label="Logo"
            tooltip="Upload the school logo (JPG, JPEG or PNG, max 2MB)"
            rules={[
              {
                required: true,
                message: "Please upload a logo",
                validator: () => {
                  if (logoFileList.length > 0) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Please upload a logo"));
                },
              },
            ]}
          >
            <Upload
              name="logo"
              listType="picture-card"
              maxCount={1}
              beforeUpload={beforeUpload}
              onChange={handleLogoChange}
              fileList={logoFileList}
              onRemove={() => {
                setLogoFileList([]);
                setLogoBase64("");
                form.setFieldsValue({ logo: undefined });
                return true;
              }}
            >
              {logoFileList.length < 1 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} size="large">
              Add School Profile
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </DashboardLayout>
  );
}
