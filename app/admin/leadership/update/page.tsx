"use client";

import { useEffect, useState } from "react";
import { Card, Form, Input, Button, Alert, App, Typography, Space, Upload } from "antd";
import { ArrowLeftOutlined, UploadOutlined } from "@ant-design/icons";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/app/lib/api";
import SimpleLayout from "@/app/components/SimpleLayout";
import type { UploadFile, UploadProps } from "antd";

const { Title } = Typography;
const { TextArea } = Input;

interface LeaderData {
  id: number;
  name: string;
  position: string;
  photo_path: string;
  bio: string;
}

export default function UpdateLeaderPage() {
  const { message } = App.useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const leaderId = searchParams.get("id");
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [leaderData, setLeaderData] = useState<LeaderData | null>(null);
  const [photoFileList, setPhotoFileList] = useState<UploadFile[]>([]);
  const [photoBase64, setPhotoBase64] = useState<string>("");
  const [hasNewPhoto, setHasNewPhoto] = useState(false);

  useEffect(() => {
    if (leaderId) {
      fetchLeaderData();
    } else {
      setError("Leader ID is required");
      setLoadingData(false);
    }
  }, [leaderId]);

  useEffect(() => {
    if (leaderData && !loadingData) {
      form.setFieldsValue({
        bio: leaderData.bio,
      });
      if (leaderData.photo_path) {
        setPhotoBase64("");
        setHasNewPhoto(false);
      }
    }
  }, [leaderData, loadingData, form]);

  const handlePhotoChange: UploadProps["onChange"] = ({ fileList }) => {
    setPhotoFileList(fileList);
    
    if (fileList.length > 0) {
      const file = fileList[0].originFileObj;
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setPhotoBase64(base64String);
          setHasNewPhoto(true);
          form.setFieldsValue({ photo_path: base64String });
        };
        reader.readAsDataURL(file);
      }
    } else {
      setPhotoBase64("");
      setHasNewPhoto(false);
      if (leaderData?.photo_path) {
        form.setFieldsValue({ photo_path: leaderData.photo_path });
      } else {
        form.setFieldsValue({ photo_path: undefined });
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
    return false;
  };

  const fetchLeaderData = async () => {
    if (!leaderId) return;
    setLoadingData(true);
    setError("");
    try {
      const response = await api.get<LeaderData>(`/editLeader/${leaderId}`);
      setLeaderData(response.data);
    } catch (err: any) {
      console.error("Error fetching leader data:", err);
      setError(err.response?.data?.message || "Failed to load leader data. Please try again.");
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    setError("");

    try {
      const payload: any = {
        bio: values.bio,
      };
      
      // Include photo_path if a new photo was uploaded
      if (hasNewPhoto && photoBase64) {
        payload.photo_path = photoBase64;
      }

      await api.put(`/updateLeader/${leaderId}`, payload);
      message.success("Leader updated successfully!");
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (err: any) {
      console.error("Error updating leader:", err);
      let errorMessage = "Failed to update leader. Please try again.";
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
    <SimpleLayout>
      <Card style={{ boxShadow: "none" }}>
        <Title level={1} style={{ marginBottom: "24px" }}>
          Update Leader
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
            name="photo_path"
            label="Photo"
            rules={[
              { 
                required: !hasNewPhoto && !leaderData?.photo_path, 
                message: "Please upload a photo or keep existing photo",
                validator: () => {
                  if (hasNewPhoto || leaderData?.photo_path) {
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
                setHasNewPhoto(false);
                if (leaderData?.photo_path) {
                  form.setFieldsValue({ photo_path: leaderData.photo_path });
                } else {
                  form.setFieldsValue({ photo_path: undefined });
                }
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
          {!hasNewPhoto && leaderData?.photo_path && (
            <div style={{ marginTop: -16, marginBottom: 16, color: "#666", fontSize: "12px" }}>
              Current photo: {leaderData.photo_path}
            </div>
          )}

          <Form.Item
            name="bio"
            label="Biography"
            rules={[{ required: true, message: "Please enter biography" }]}
          >
            <TextArea rows={6} placeholder="Enter biography" />
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
                Update Leader
              </Button>
            </Space>
          </Form.Item>
        </Form>
        )}
      </Card>
    </SimpleLayout>
  );
}
