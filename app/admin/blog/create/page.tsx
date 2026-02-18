"use client";

import { useState } from "react";
import { Card, Form, Input, Button, Alert, message, Typography, Select, DatePicker, Upload } from "antd";
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
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageFileList, setImageFileList] = useState<UploadFile[]>([]);
  const [imageBase64, setImageBase64] = useState<string>("");

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
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("You can only upload image files!");
      return Upload.LIST_IGNORE;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error("Image must be smaller than 5MB!");
      return Upload.LIST_IGNORE;
    }
    return false; // Prevent auto upload
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    setError("");

    try {
      // If image is base64, we might need to handle it differently
      // For now, we'll send it as is (base64 string)
      // If backend expects a path, you may need to upload the file first
      const payload = {
        title: values.title,
        content: values.content,
        image: values.image, // This will be base64 string or path
        author_name: values.author_name,
        status: values.status,
        published_at: values.published_at ? values.published_at.format("YYYY-MM-DD HH:mm:ss") : null,
      };

      await api.post("/createBlog", payload);
      message.success("Blog created successfully!");
      form.resetFields();
      setImageFileList([]);
      setImageBase64("");
      setTimeout(() => {
        router.push("/admin/viewAllBlogs");
      }, 5000);
    } catch (err: any) {
      console.error("Error creating blog:", err);
      let errorMessage = "Failed to create blog. Please try again.";
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
          Create Blog
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
            name="title"
            label="Title"
            rules={[{ required: true, message: "The title field is required." }]}
          >
            <Input placeholder="Enter blog title" />
          </Form.Item>

          <Form.Item
            name="content"
            label="Content"
            rules={[{ required: true, message: "The content field is required." }]}
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
            rules={[{ required: true, message: "The author name field is required." }]}
          >
            <Input placeholder="Enter author name" />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: "The status field is required." }]}
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
