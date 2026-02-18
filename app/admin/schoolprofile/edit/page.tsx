"use client";

import { useEffect, useState } from "react";
import { Card, Descriptions, Alert, Spin, Typography, Button } from "antd";
import { useRouter } from "next/navigation";
import api from "@/app/lib/api";
import DashboardLayout from "@/app/components/DashboardLayout";

const { Title } = Typography;

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

export default function EditSchoolProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<SchoolProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get<SchoolProfileResponse>("/school/profile/edit");
      if (response.data.status && response.data.data) {
        setProfile(response.data.data);
        router.push("/admin/schoolprofile/update");
      } else {
        setError("Failed to load school profile for editing.");
      }
    } catch (err: any) {
      console.error("Error fetching school profile:", err);
      setError(err.response?.data?.message || "Failed to load school profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: number) => {
    router.push(`/admin/schoolprofile/update`);
  };

  return (
    <DashboardLayout role="admin">
      <Card style={{ boxShadow: "none" }}>
        <Title level={1} style={{ marginBottom: "24px" }}>
          Edit School Profile
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

        {loading ? (
          <Spin size="large" style={{ display: "block", textAlign: "center", padding: 50 }} />
        ) : (
          <Alert
            message="Redirecting to update page..."
            type="info"
          />
        )}
      </Card>
    </DashboardLayout>
  );
}
