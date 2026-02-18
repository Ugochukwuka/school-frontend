"use client";

import { useState, useEffect } from "react";
import { Card, Form, Input, Button, Alert, Typography, Select, DatePicker, Upload, App } from "antd";
import { useRouter } from "next/navigation";
import api from "@/app/lib/api";
import DashboardLayout from "@/app/components/DashboardLayout";
import dayjs from "dayjs";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";

const { Title } = Typography;
const { TextArea } = Input;

export default function CreateBlogPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageFileList, setImageFileList] = useState<UploadFile[]>([]);
  const [imageBase64, setImageBase64] = useState<string>("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleImageChange: UploadProps["onChange"] = ({ fileList }) => {
    setImageFileList(fileList);
    
    if (fileList.length > 0) {
      const file = fileList[0].originFileObj;
      if (file) {
        // Convert file to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setImageBase64(base64String);
          form.setFieldsValue({ image: base64String });
        };
        reader.readAsDataURL(file);
      }
    } else {
      setImageBase64("");
      form.setFieldsValue({ image: undefined });
    }
  };

  const beforeUpload = (file: File) => {
    // Check file type - only allow jpg, jpeg, png
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    const isValidType = allowedTypes.includes(file.type.toLowerCase());
    if (!isValidType) {
      message.error("You can only upload JPG, JPEG, or PNG files!");
      return Upload.LIST_IGNORE;
    }
    // Check file size - 2MB limit (2048 KB)
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Image must be smaller than 2MB!");
      return Upload.LIST_IGNORE;
    }
    return false; // Prevent auto upload
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    setError("");

    try {
      // Check if we have a file
      if (!imageFileList.length || !imageFileList[0].originFileObj) {
        setError("Please upload an image file");
        message.error("Please upload an image file");
        setLoading(false);
        return;
      }

      const file = imageFileList[0].originFileObj;

      // Try sending as multipart/form-data (preferred method for file uploads)
      const formData = new FormData();
      formData.append("image", file);
      formData.append("title", values.title);
      formData.append("content", values.content);
      formData.append("author_name", values.author_name);
      formData.append("status", values.status);
      if (values.published_at) {
        formData.append("published_at", values.published_at.format("YYYY-MM-DD HH:mm:ss"));
      }

      // Send as multipart/form-data (preferred method for file uploads)
      // The API interceptor will handle removing Content-Type for FormData
      // Don't set Content-Type manually - browser needs to set it with boundary
      await api.post("/createBlog", formData);

      message.success("Blog created successfully!");
      form.resetFields();
      setImageFileList([]);
      setImageBase64("");
      setTimeout(() => {
        router.push("/admin/viewAllBlogs");
      }, 2000);
    } catch (err: any) {
      console.error("Error creating blog:", err);
      console.error("Error response:", err.response?.data);
      
      let errorMessage = "Failed to create blog. Please try again.";
      
      if (err.response?.status === 500) {
        const serverError = err.response?.data?.message || err.response?.data?.error;
        errorMessage = "Server error: " + (serverError || "Internal server error. Please check backend logs and ensure storage/blog_images directory exists with write permissions.");
      } else if (err.response?.data?.errors) {
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

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <DashboardLayout role="admin">
      <Card style={{ boxShadow: "none" }}>
        <Title level={1} style={{ marginBottom: "24px" }}>
          Create Blog
        </Title>

        {error && (
          <Alert
            title={error}
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
            name="title"
            label="Title"
            rules={[{ required: true, message: "Please enter blog title" }]}
          >
            <Input placeholder="Enter blog title" />
          </Form.Item>

          <Form.Item
            name="content"
            label="Content"
            rules={[{ required: true, message: "Please enter blog content" }]}
          >
            <TextArea rows={10} placeholder="Enter blog content" />
          </Form.Item>

          <Form.Item
            name="image"
            label="Image"
            rules={[
              { 
                required: true, 
                message: "Please upload an image",
                validator: () => {
                  if (imageBase64) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Please upload an image"));
                }
              }
            ]}
          >
            <Upload
              name="image"
              listType="picture-card"
              maxCount={1}
              beforeUpload={beforeUpload}
              onChange={handleImageChange}
              fileList={imageFileList}
              onRemove={() => {
                setImageFileList([]);
                setImageBase64("");
                form.setFieldsValue({ image: undefined });
                return true;
              }}
            >
              {imageFileList.length < 1 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item
            name="author_name"
            label="Author Name"
            rules={[{ required: true, message: "Please enter author name" }]}
          >
            <Input placeholder="Enter author name" />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: "Please select status" }]}
            initialValue="published"
          >
            <Select
              options={[
                { value: "published", label: "Published" },
                { value: "draft", label: "Draft" },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="published_at"
            label="Published At"
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} size="large">
              Create Blog
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </DashboardLayout>
  );
}
