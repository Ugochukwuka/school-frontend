"use client";

import { useEffect, useState } from "react";
import { Card, Select, Spin, Alert, Descriptions, Typography } from "antd";
import Link from "next/link";
import DashboardLayout from "@/app/components/DashboardLayout";
import { cbtAdmin, getAdminSchools } from "@/app/lib/cbtApi";
import { getApiErrorMessage } from "@/app/lib/api";

const { Text } = Typography;

export default function AdminCBTSettingsPage() {
  const [schools, setSchools] = useState<{ id: number; name: string }[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | number | null>(null);
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [error, setError] = useState("");
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    (async () => {
      setLoadingSchools(true);
      setError("");
      try {
        const res = await getAdminSchools();
        const data = (res.data as any)?.data ?? res.data;
        const list = Array.isArray(data) ? data : data?.schools ?? [];
        setSchools(
          list.map((s: any) => ({
            id: s.id,
            name: s.name ?? s.school_name ?? s.schoolName ?? `School ${s.id}`,
          }))
        );
      } catch (err: any) {
        setError(getApiErrorMessage(err, "Failed to load schools."));
      } finally {
        setLoadingSchools(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (selectedSchoolId == null || selectedSchoolId === "") {
      setSettings(null);
      return;
    }
    (async () => {
      setLoadingSettings(true);
      setError("");
      try {
        const res = await cbtAdmin.getSettings({
          school_id: typeof selectedSchoolId === "string" ? parseInt(selectedSchoolId, 10) : selectedSchoolId,
        });
        const data = (res.data as any)?.data ?? res.data;
        setSettings(data ?? null);
      } catch (err: any) {
        if (err?.response?.status === 422) {
          setError(getApiErrorMessage(err, "School context is missing. Select a school to load CBT settings."));
        } else {
          setError(getApiErrorMessage(err, "Failed to load CBT settings."));
        }
        setSettings(null);
      } finally {
        setLoadingSettings(false);
      }
    })();
  }, [selectedSchoolId]);

  const schoolOptions = schools.map((s) => ({ value: s.id, label: s.name }));

  return (
    <DashboardLayout role="admin">
      <Card
        title="Get CBT Settings"
        extra={
          <Link href="/admin/cbt/settings/save" style={{ marginLeft: 8 }}>Save settings</Link>
        }
      >
        {error && (
          <Alert
            type="error"
            title={error}
            closable
            onClose={() => setError("")}
            style={{ marginBottom: 16 }}
          />
        )}
        <div style={{ marginBottom: 16 }}>
          <Text strong style={{ marginRight: 8 }}>School</Text>
          <Select
            placeholder="Select a school"
            style={{ width: 280 }}
            value={selectedSchoolId ?? undefined}
            onChange={(v) => setSelectedSchoolId(v)}
            options={schoolOptions}
            loading={loadingSchools}
            allowClear
          />
        </div>
        {loadingSettings && (
          <div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
            <Spin />
          </div>
        )}
        {!loadingSettings && settings && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="School ID">{settings.school_id ?? "—"}</Descriptions.Item>
            <Descriptions.Item label="Shuffle questions">{settings.shuffle_questions ? "Yes" : "No"}</Descriptions.Item>
            <Descriptions.Item label="Shuffle options">{settings.shuffle_options ? "Yes" : "No"}</Descriptions.Item>
            <Descriptions.Item label="Autosave interval (seconds)">{settings.autosave_interval_seconds ?? "—"}</Descriptions.Item>
            <Descriptions.Item label="Max attempts">{settings.max_attempts ?? "—"}</Descriptions.Item>
            <Descriptions.Item label="Allow late entry">{settings.allow_late_entry ? "Yes" : "No"}</Descriptions.Item>
            <Descriptions.Item label="Show results immediately">{settings.show_results_immediately ? "Yes" : "No"}</Descriptions.Item>
            {settings.updated_at != null && (
              <Descriptions.Item label="Updated at">{settings.updated_at}</Descriptions.Item>
            )}
            {settings.created_at != null && (
              <Descriptions.Item label="Created at">{settings.created_at}</Descriptions.Item>
            )}
          </Descriptions>
        )}
        {!loadingSettings && selectedSchoolId != null && selectedSchoolId !== "" && !settings && !error && (
          <Text type="secondary">No settings found for this school.</Text>
        )}
      </Card>
    </DashboardLayout>
  );
}
