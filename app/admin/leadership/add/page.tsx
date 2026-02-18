"use client";

import { useState } from "react";
import { Card, Form, Input, Button, Alert, message, Typography, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import api from "@/app/lib/api";
import DashboardLayout from "@/app/components/DashboardLayout";
import type { UploadFile, UploadProps } from "antd";

const { Title } = Typography;
const { TextArea } = Input;

export default function AddLeaderPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [photoFileList, setPhotoFileList] = useState<UploadFile[]>([]);
  const [photoBase64, setPhotoBase64] = useState<string>("");

  const handlePhotoChange: UploadProps["onChange"] = ({ fileList }) => {
    setPhotoFileList(fileList);
    
    if (fileList.length > 0) {
      const file = fileList[0].originFileObj;
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setPhotoBase64(base64String);
          form.setFieldsValue({ photo_path: base64String });
        };
        reader.readAsDataURL(file);
      }
    } else {
      setPhotoBase64("");
      form.setFieldsValue({ photo_path: undefined });
    }
  };

  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
  const beforeUpload = (file: File) => {
    if (!allowedTypes.includes(file.type)) {
      message.error("Only JPG, JPEG and PNG images are allowed.");
      return Upload.LIST_IGNORE;
    }
    // Backend often limits to 2048 KB (2MB) for photo_path
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
      const file = photoFileList[0]?.originFileObj;
      if (!file) {
        message.error("Please upload a photo");
        setLoading(false);
        return;
      }

      // Backend expects multipart/form-data with image file (not base64) so validation passes (image, jpg/jpeg/png, size)
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("position", values.position);
      formData.append("photo_path", file);
      formData.append("bio", values.bio);

      await api.post("/addLeader", formData);
      message.success("Leader added successfully!");
      form.resetFields();
      setPhotoFileList([]);
      setPhotoBase64("");
      setTimeout(() => {
        router.push("/admin/leadership/viewall");
      }, 2000);
    } catch (err: any) {
      console.error("Error adding leader:", err);
      let errorMessage = "Failed to add leader. Please try again.";
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
          Add Leader
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
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please enter leader name" }]}
          >
            <Input placeholder="Enter leader name" />
          </Form.Item>

          <Form.Item
            name="position"
            label="Position"
            rules={[{ required: true, message: "Please enter position" }]}
          >
            <Input placeholder="e.g., School Principal, Vice Principal" />
          </Form.Item>

          <Form.Item
            name="photo_path"
            label="Photo"
            rules={[
              { 
                required: true, 
                message: "Please upload a photo",
                validator: () => {
                  if (photoBase64) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Please upload a photo"));
                }
              }
            ]}
          >
            <Upload
              name="photo"
              listType="picture-card"
              maxCount={1}
              beforeUpload={beforeUpload}
              onChange={handlePhotoChange}
              fileList={photoFileList}
              onRemove={() => {
                setPhotoFileList([]);
                setPhotoBase64("");
                form.setFieldsValue({ photo_path: undefined });
                return true;
              }}
            >
              {photoFileList.length < 1 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item
            name="bio"
            label="Biography"
            rules={[{ required: true, message: "Please enter biography" }]}
          >
            <TextArea rows={6} placeholder="Enter biography" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} size="large">
              Add Leader
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </DashboardLayout>
  );
}
