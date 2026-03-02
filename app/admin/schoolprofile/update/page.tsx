"use client";

import { useEffect, useState } from "react";
import { Card, Form, Input, Button, Alert, App, Typography, InputNumber, Space, Spin, Upload } from "antd";
import { ArrowLeftOutlined, UploadOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import api from "@/app/lib/api";
import DashboardLayout from "@/app/components/DashboardLayout";
import type { UploadFile, UploadProps } from "antd";

const { Title } = Typography;
const { TextArea } = Input;

interface SchoolProfile {
  id: number;
  school_name: string;
  motto: string;
  mission: string;
  vision: string;
  about_us: string;
  logo_path: string | null;
  address: string;
  email: string;
  phone: string;
  website: string;
  established_year: string;
}

interface SchoolProfileResponse {
  status: boolean;
  data: SchoolProfile;
}

export default function UpdateSchoolProfilePage() {
  const { message } = App.useApp();
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [profileData, setProfileData] = useState<SchoolProfile | null>(null);
  const [logoFileList, setLogoFileList] = useState<UploadFile[]>([]);
  const [logoBase64, setLogoBase64] = useState<string>("");
  const [hasNewLogo, setHasNewLogo] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  useEffect(() => {
    if (profileData && !loadingData) {
      form.setFieldsValue({
        school_name: profileData.school_name,
        motto: profileData.motto,
        mission: profileData.mission,
        vision: profileData.vision,
        about_us: profileData.about_us,
        address: profileData.address,
        email: profileData.email,
        phone: profileData.phone,
        website: profileData.website,
        established_year: profileData.established_year ? parseInt(profileData.established_year) : undefined,
      });
      if (profileData.logo_path) {
        setLogoBase64("");
        setHasNewLogo(false);
      }
    }
  }, [profileData, loadingData, form]);

  const handleLogoChange: UploadProps["onChange"] = ({ fileList }) => {
    setLogoFileList(fileList);
    
    if (fileList.length > 0) {
      const file = fileList[0].originFileObj;
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setLogoBase64(base64String);
          setHasNewLogo(true);
          form.setFieldsValue({ logo_path: base64String });
        };
        reader.readAsDataURL(file);
      }
    } else {
      setLogoBase64("");
      setHasNewLogo(false);
      if (profileData?.logo_path) {
        form.setFieldsValue({ logo_path: profileData.logo_path });
      } else {
        form.setFieldsValue({ logo_path: undefined });
      }
    }
  };

  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
  const beforeUpload = (file: File) => {
    if (!allowedTypes.includes(file.type)) {
      message.error("Only JPG, JPEG and PNG images are allowed.");
      return Upload.LIST_IGNORE;
    }
    const isLt2M = file.size / 1024 <= 2048;
    if (!isLt2M) {
      message.error("Image must be smaller than 2MB!");
      return Upload.LIST_IGNORE;
    }
    return false;
  };

  const fetchProfileData = async () => {
    setLoadingData(true);
    setError("");
    try {
      const response = await api.get<SchoolProfileResponse>("/school/profile/edit");
      if (response.data.status && response.data.data) {
        setProfileData(response.data.data);
      } else {
        setError("Failed to load school profile data.");
      }
    } catch (err: any) {
      console.error("Error fetching school profile data:", err);
      setError(err.response?.data?.message || "Failed to load school profile data. Please try again.");
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    setError("");

    try {
      const file = hasNewLogo ? logoFileList[0]?.originFileObj : null;

      if (file) {
        // Backend expects multipart/form-data with image file (not base64)
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

        await api.put("/school/profile/update", formData);
      } else {
        const payload: any = {
          school_name: values.school_name,
          motto: values.motto,
          mission: values.mission,
          vision: values.vision,
          about_us: values.about_us,
          address: values.address,
          email: values.email,
          phone: values.phone,
          website: values.website,
          established_year: values.established_year,
        };
        if (profileData?.logo_path) {
          payload.logo_path = profileData.logo_path;
        }
        await api.put("/school/profile/update", payload);
      }
      message.success("School profile updated successfully!");
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (err: any) {
      console.error("Error updating school profile:", err);
      let errorMessage = "Failed to update school profile. Please try again.";
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
          Update School Profile
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
            <Spin size="large" />
          </div>
        ) : (
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
            name="logo_path"
            label="Logo"
            tooltip="Upload the school logo (JPG, JPEG or PNG, max 2MB). Leave empty to keep existing."
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
                setHasNewLogo(false);
                if (profileData?.logo_path) {
                  form.setFieldsValue({ logo_path: profileData.logo_path });
                } else {
                  form.setFieldsValue({ logo_path: undefined });
                }
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
          {!hasNewLogo && profileData?.logo_path && (
            <div style={{ marginTop: -16, marginBottom: 16, color: "#666", fontSize: "12px" }}>
              Current logo: {profileData.logo_path}
            </div>
          )}

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
                Update School Profile
              </Button>
            </Space>
          </Form.Item>
        </Form>
        )}
      </Card>
    </DashboardLayout>
  );
}
