"use client";

import { useEffect, useState } from "react";
import { Card, Form, Input, Button, Alert, message, Typography, Select, DatePicker, Space, Upload } from "antd";
import { ArrowLeftOutlined, UploadOutlined } from "@ant-design/icons";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/app/lib/api";
import DashboardLayout from "@/app/components/DashboardLayout";
import dayjs from "dayjs";
import type { UploadFile, UploadProps } from "antd";

const { Title } = Typography;
const { TextArea } = Input;

export default function UpdateBlogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const blogId = searchParams.get("id");
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [blogData, setBlogData] = useState<any>(null);
  const [imageFileList, setImageFileList] = useState<UploadFile[]>([]);
  const [imageBase64, setImageBase64] = useState<string>("");
  const [hasNewImage, setHasNewImage] = useState(false);

  useEffect(() => {
    if (blogId) {
      fetchBlogData();
    } else {
      setError("Blog ID is required");
      setLoadingData(false);
    }
  }, [blogId]);

  useEffect(() => {
    if (blogData && !loadingData) {
      form.setFieldsValue({
        title: blogData.title,
        content: blogData.content,
        image: blogData.image,
        author_name: blogData.author_name,
        status: blogData.status,
        published_at: blogData.published_at ? dayjs(blogData.published_at) : null,
      });
      // If there's an existing image, set it in the form but don't show in upload list
      if (blogData.image) {
        setImageBase64("");
        setHasNewImage(false);
      }
    }
  }, [blogData, loadingData, form]);

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
          setHasNewImage(true);
          form.setFieldsValue({ image: base64String });
        };
        reader.readAsDataURL(file);
      }
    } else {
      setImageBase64("");
      setHasNewImage(false);
      // Keep existing image if available
      if (blogData?.image) {
        form.setFieldsValue({ image: blogData.image });
      } else {
        form.setFieldsValue({ image: undefined });
      }
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

  const fetchBlogData = async () => {
    if (!blogId) return;
    setLoadingData(true);
    setError("");
    try {
      const response = await api.get<any>(`/blogs/edit/${blogId}`);
      setBlogData(response.data);
    } catch (err: any) {
      console.error("Error fetching blog data:", err);
      setError(err.response?.data?.message || "Failed to load blog data. Please try again.");
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    setError("");

    try {
      // Use new image if uploaded, otherwise use existing image
      const imageValue = hasNewImage && imageBase64 ? imageBase64 : (blogData?.image || values.image);
      
      const payload = {
        title: values.title,
        content: values.content,
        image: imageValue,
        author_name: values.author_name,
        status: values.status,
        published_at: values.published_at ? values.published_at.format("YYYY-MM-DD HH:mm:ss") : null,
      };

      await api.put(`/updateBlog/${blogId}`, payload);
      message.success("Blog updated successfully!");
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (err: any) {
      console.error("Error updating blog:", err);
      let errorMessage = "Failed to update blog. Please try again.";
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
          Update Blog
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

        {loadingData ? (
          <div style={{ textAlign: "center", padding: 50 }}>
            Loading...
          </div>
        ) : (
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
                required: !hasNewImage && !blogData?.image, 
                message: "Please upload an image or keep existing image",
                validator: () => {
                  if (hasNewImage || blogData?.image) {
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
                setHasNewImage(false);
                if (blogData?.image) {
                  form.setFieldsValue({ image: blogData.image });
                } else {
                  form.setFieldsValue({ image: undefined });
                }
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
          {!hasNewImage && blogData?.image && (
            <div style={{ marginTop: -16, marginBottom: 16, color: "#666", fontSize: "12px" }}>
              Current image: {blogData.image}
            </div>
          )}

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
            <Space>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => router.back()}
                size="large"
              >
                Go Back
              </Button>
              <Button type="primary" htmlType="submit" loading={loading} size="large">
                Update Blog
              </Button>
            </Space>
          </Form.Item>
        </Form>
        )}
      </Card>
    </DashboardLayout>
  );
}
