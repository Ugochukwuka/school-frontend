"use client";

import { useEffect, useState } from "react";
import { Card, Descriptions, Alert, Spin, Typography, Input, Button, Space, Modal, Form, Select, DatePicker, Upload, App } from "antd";
import { ArrowLeftOutlined, EditOutlined, SaveOutlined, CloseOutlined, UploadOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/app/lib/api";
import DashboardLayout from "@/app/components/DashboardLayout";
import dayjs from "dayjs";

const { Title } = Typography;
const { TextArea } = Input;

// Component to handle image loading with fallback and click to view
function BlogImage({ 
  src, 
  fallbackSrc, 
  alt, 
  onImageClick 
}: { 
  src: string; 
  fallbackSrc: string; 
  alt: string;
  onImageClick: () => void;
}) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError && fallbackSrc !== src) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <div 
      style={{ 
        width: "100%", 
        maxWidth: 600, 
        minHeight: 200,
        marginBottom: 8, 
        border: "1px solid #e8e8e8", 
        borderRadius: 4, 
        overflow: "hidden", 
        backgroundColor: "#fafafa",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all 0.3s ease"
      }}
      onClick={onImageClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#1890ff";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(24, 144, 255, 0.2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#e8e8e8";
        e.currentTarget.style.boxShadow = "none";
      }}
      title="Click to view full size"
    >
      <img
        src={imgSrc}
        alt={alt}
        style={{ 
          maxWidth: "100%", 
          maxHeight: "400px", 
          width: "auto",
          height: "auto",
          objectFit: "contain",
          display: "block"
        }}
        onError={handleError}
        onLoad={() => setHasError(false)}
      />
    </div>
  );
}

interface Blog {
  id: number;
  title: string;
  content: string;
  image: string;
  author_name: string;
  status: string;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export default function ViewSingleBlogPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const searchParams = useSearchParams();
  const blogId = searchParams.get("id");
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [inputId, setInputId] = useState(blogId || "");
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [fullImageUrl, setFullImageUrl] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [form] = Form.useForm();
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imageFileList, setImageFileList] = useState<UploadFile[]>([]);
  const [imageBase64, setImageBase64] = useState<string>("");
  const [hasNewImage, setHasNewImage] = useState(false);

  const fetchBlog = async (id: string) => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const response = await api.get<Blog>(`/viewSingleBlog/${id}`);
      setBlog(response.data);
    } catch (err: any) {
      console.error("Error fetching blog:", err);
      setError(err.response?.data?.message || "Failed to load blog. Please try again.");
      setBlog(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (blogId) {
      fetchBlog(blogId);
    }
  }, [blogId]);

  const handleView = () => {
    if (inputId) {
      setIsEditMode(false);
      fetchBlog(inputId);
    }
  };

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
        };
        reader.readAsDataURL(file);
      }
    } else {
      setImageBase64("");
      setHasNewImage(false);
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

  const handleEdit = async () => {
    if (!blogId) return;
    setLoadingEdit(true);
    setError("");
    try {
      const response = await api.get<Blog>(`/blogs/edit/${blogId}`);
      const blogData = response.data;
      form.setFieldsValue({
        title: blogData.title,
        content: blogData.content,
        author_name: blogData.author_name,
        status: blogData.status,
        published_at: blogData.published_at ? dayjs(blogData.published_at) : null,
      });
      // Reset image upload state
      setImageFileList([]);
      setImageBase64("");
      setHasNewImage(false);
      setIsEditMode(true);
    } catch (err: any) {
      console.error("Error fetching blog for edit:", err);
      setError(err.response?.data?.message || "Failed to load blog data for editing. Please try again.");
      message.error("Failed to load blog data for editing");
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    form.resetFields();
    setImageFileList([]);
    setImageBase64("");
    setHasNewImage(false);
  };

  const handleUpdate = async (values: any) => {
    if (!blogId) return;
    setSubmitting(true);
    setError("");
    try {
      // If a new image was uploaded, send as FormData with the file
      if (hasNewImage && imageFileList.length > 0 && imageFileList[0].originFileObj) {
        const formData = new FormData();
        formData.append("image", imageFileList[0].originFileObj);
        formData.append("title", values.title);
        formData.append("content", values.content);
        formData.append("author_name", values.author_name);
        formData.append("status", values.status);
        if (values.published_at) {
          formData.append("published_at", values.published_at.format("YYYY-MM-DD HH:mm:ss"));
        }

        const response = await api.put(`/updateBlog/${blogId}`, formData);
        message.success(response.data?.message || "Blog updated successfully!");
      } else {
        // If no new image, send as JSON with existing image path
        // Some backends don't handle FormData well for PUT without files
        const payload = {
          title: values.title,
          content: values.content,
          image: blog?.image || "",
          author_name: values.author_name,
          status: values.status,
          published_at: values.published_at ? values.published_at.format("YYYY-MM-DD HH:mm:ss") : null,
        };

        const response = await api.put(`/updateBlog/${blogId}`, payload);
        message.success(response.data?.message || "Blog updated successfully!");
      }
      
      setIsEditMode(false);
      setImageFileList([]);
      setImageBase64("");
      setHasNewImage(false);
      // Refresh the blog data
      await fetchBlog(blogId);
    } catch (err: any) {
      console.error("Error updating blog:", err);
      console.error("Error response data:", err.response?.data);
      console.error("Error status:", err.response?.status);
      console.error("Request config:", err.config);
      let errorMessage = "Failed to update blog. Please try again.";
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const errorMessages = Object.values(errors).flat() as string[];
        errorMessage = errorMessages.join(", ");
        console.error("Validation errors:", errors);
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Helper function to get the image URL
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "";
    
    // If the path is already a full URL, return it as is
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    
    // Remove 'public/' prefix if it exists
    let cleanPath = imagePath;
    if (cleanPath.startsWith("public/")) {
      cleanPath = cleanPath.replace(/^public\//, "");
    }
    
    // Convert /blog_images/ to /storage/blog_images/
    // Handle both /blog_images/ and blog_images/ formats
    if (cleanPath.startsWith("/blog_images/") || cleanPath.startsWith("blog_images/")) {
      cleanPath = cleanPath.replace(/^\/?blog_images\//, "/storage/blog_images/");
    }
    
    // Check if we should use backend URL for images
    // Images stored in backend's storage folder should use backend URL
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
    
    // Ensure the path starts with / for proper image path
    const normalizedPath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
    
    // Use backend URL for images (they're served from backend's storage folder)
    return `${backendUrl}${normalizedPath}`;
  };

  // Helper to get alternative URL (for fallback)
  const getAlternativeImageUrl = (imagePath: string) => {
    if (!imagePath) return "";
    let cleanPath = imagePath;
    if (cleanPath.startsWith("public/")) {
      cleanPath = cleanPath.replace(/^public\//, "");
    }
    return cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
  };

  return (
    <DashboardLayout role="admin">
      <Card style={{ boxShadow: "none" }}>
        <Title level={1} style={{ marginBottom: "24px" }}>
          View Single Blog
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

        <div style={{ marginBottom: 24 }}>
          <Input
            placeholder="Enter Blog ID"
            value={inputId}
            onChange={(e) => setInputId(e.target.value)}
            onPressEnter={handleView}
            style={{ width: 300, marginRight: 8 }}
          />
          <Button type="primary" onClick={handleView}>
            View
          </Button>
        </div>

        {loading || loadingEdit ? (
          <Spin size="large" style={{ display: "block", textAlign: "center", padding: 50 }} />
        ) : blog ? (
          <>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleUpdate}
              style={{ maxWidth: 800, display: isEditMode ? "block" : "none" }}
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
                      required: !hasNewImage && !blog?.image, 
                      message: "Please upload an image or keep existing image",
                      validator: () => {
                        if (hasNewImage || blog?.image) {
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
                {!hasNewImage && blog?.image && (
                  <div style={{ marginTop: -16, marginBottom: 16, color: "#666", fontSize: "12px" }}>
                    Current image: {blog.image}
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
                      type="primary" 
                      htmlType="submit" 
                      loading={submitting} 
                      size="large"
                      icon={<SaveOutlined />}
                    >
                      Update Blog
                    </Button>
                    <Button 
                      onClick={handleCancelEdit} 
                      size="large"
                      icon={<CloseOutlined />}
                    >
                      Cancel
                    </Button>
                  </Space>
                </Form.Item>
            </Form>
            {!isEditMode && (
              <>
                <Descriptions bordered column={1} style={{ marginBottom: 24 }}>
                  <Descriptions.Item label="ID">{blog.id}</Descriptions.Item>
                  <Descriptions.Item label="Title">{blog.title}</Descriptions.Item>
                  <Descriptions.Item label="Content">
                    <div style={{ whiteSpace: "pre-wrap", maxHeight: 300, overflow: "auto" }}>
                      {blog.content}
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item label="Image">
                    {blog.image ? (
                      <div style={{ marginTop: 8 }}>
                        <BlogImage 
                          src={getImageUrl(blog.image)}
                          fallbackSrc={getAlternativeImageUrl(blog.image)}
                          alt={blog.title}
                          onImageClick={() => {
                            setFullImageUrl(getImageUrl(blog.image));
                            setImageModalVisible(true);
                          }}
                        />
                      </div>
                    ) : (
                      <span style={{ color: "#999" }}>No image</span>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Author">{blog.author_name}</Descriptions.Item>
                  <Descriptions.Item label="Status">{blog.status}</Descriptions.Item>
                  <Descriptions.Item label="Published At">{blog.published_at}</Descriptions.Item>
                  <Descriptions.Item label="Created At">{blog.created_at}</Descriptions.Item>
                  <Descriptions.Item label="Updated At">{blog.updated_at}</Descriptions.Item>
                </Descriptions>
                <Space>
                  <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => router.back()}
                  >
                    Go Back
                  </Button>
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => router.push(`/admin/blog/update?id=${blog.id}`)}
                    loading={loadingEdit}
                  >
                    Edit
                  </Button>
                </Space>
              </>
            )}
          </>
        ) : null}
      </Card>

      {/* Image Modal for full-size viewing */}
      <Modal
        open={imageModalVisible}
        onCancel={() => setImageModalVisible(false)}
        footer={null}
        width="90%"
        style={{ top: 20 }}
        centered
        styles={{
          body: {
            padding: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#000",
            minHeight: "80vh"
          }
        }}
      >
        <img
          src={fullImageUrl}
          alt={blog?.title || "Blog image"}
          style={{
            maxWidth: "100%",
            maxHeight: "90vh",
            width: "auto",
            height: "auto",
            objectFit: "contain"
          }}
        />
      </Modal>
    </DashboardLayout>
  );
}
