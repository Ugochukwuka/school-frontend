"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, Descriptions, Alert, Spin, Typography, Button, Space } from "antd";
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import api from "@/app/lib/api";
import DashboardLayout from "@/app/components/DashboardLayout";

const { Title } = Typography;

function getLogoImageUrl(logoPath: string | null): string | null {
  if (!logoPath) return null;
  if (logoPath.startsWith("http://") || logoPath.startsWith("https://")) return logoPath;
  const cleanPath = logoPath.replace(/^storage\//, "");
  return `/storage/${cleanPath}`;
}

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
  created_at: string;
  updated_at: string;
}

interface SchoolProfileResponse {
  status: boolean;
  data: SchoolProfile;
}

export default function ViewSchoolProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<SchoolProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get<SchoolProfileResponse>("/school/viewprofile");
      if (response.data.status && response.data.data) {
        setProfile(response.data.data);
        setLogoError(false);
      } else {
        setError("Failed to load school profile.");
      }
    } catch (err: any) {
      console.error("Error fetching school profile:", err);
      setError(err.response?.data?.message || "Failed to load school profile. Please try again.");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="admin">
      <Card style={{ boxShadow: "none" }}>
        <Title level={1} style={{ marginBottom: "24px" }}>
          View School Profile
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

        {loading ? (
          <Spin size="large" style={{ display: "block", textAlign: "center", padding: 50 }} />
        ) : profile ? (
          <>
            <Descriptions bordered column={1} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="ID">{profile.id}</Descriptions.Item>
              <Descriptions.Item label="School Name">{profile.school_name}</Descriptions.Item>
              <Descriptions.Item label="Motto">{profile.motto}</Descriptions.Item>
              <Descriptions.Item label="Mission">
                <div style={{ whiteSpace: "pre-wrap" }}>{profile.mission}</div>
              </Descriptions.Item>
              <Descriptions.Item label="Vision">
                <div style={{ whiteSpace: "pre-wrap" }}>{profile.vision}</div>
              </Descriptions.Item>
              <Descriptions.Item label="About Us">
                <div style={{ whiteSpace: "pre-wrap" }}>{profile.about_us}</div>
              </Descriptions.Item>
              <Descriptions.Item label="Logo">
                {profile.logo_path && getLogoImageUrl(profile.logo_path) && !logoError ? (
                  <div style={{ padding: "8px 0" }}>
                    <Image
                      src={getLogoImageUrl(profile.logo_path)!}
                      alt="School Logo"
                      width={120}
                      height={120}
                      style={{ objectFit: "contain", borderRadius: 8 }}
                      unoptimized
                      onError={() => setLogoError(true)}
                    />
                  </div>
                ) : (
                  "Not set"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Address">{profile.address}</Descriptions.Item>
              <Descriptions.Item label="Email">{profile.email}</Descriptions.Item>
              <Descriptions.Item label="Phone">{profile.phone}</Descriptions.Item>
              <Descriptions.Item label="Website">
                {profile.website ? (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer">
                    {profile.website}
                  </a>
                ) : (
                  "Not set"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Established Year">{profile.established_year}</Descriptions.Item>
              <Descriptions.Item label="Created At">{profile.created_at}</Descriptions.Item>
              <Descriptions.Item label="Updated At">{profile.updated_at}</Descriptions.Item>
            </Descriptions>
            <Space>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => router.push("/admin/dashboard")}
              >
                Go Back
              </Button>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => router.push("/admin/schoolprofile/edit")}
              >
                Edit
              </Button>
            </Space>
          </>
        ) : !loading && !error ? (
          <Alert
            title="No school profile found"
            description="Please add a school profile first."
            type="info"
            action={
              <Button type="primary" onClick={() => router.push("/admin/schoolprofile/add")}>
                Add School Profile
              </Button>
            }
          />
        ) : null}
      </Card>
    </DashboardLayout>
  );
}
