"use client";

import { useEffect, useState } from "react";
import { Card, Form, Switch, InputNumber, Button, Alert, App, Select } from "antd";
import Link from "next/link";
import DashboardLayout from "@/app/components/DashboardLayout";
import { cbtAdmin, getAdminSchools } from "@/app/lib/cbtApi";

export default function AdminCBTSettingsSavePage() {
  const { message } = App.useApp();
  const [schools, setSchools] = useState<{ id: number; name: string }[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form] = Form.useForm();

  useEffect(() => {
    (async () => {
      setLoadingSchools(true);
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
      } catch (_) {
        setSchools([]);
      } finally {
        setLoadingSchools(false);
      }
    })();
  }, []);

  const onFinish = async (values: any) => {
    setSaving(true);
    setError("");
    try {
      await cbtAdmin.saveSettings({
        school_id: values.school_id,
        shuffle_questions: values.shuffle_questions,
        shuffle_options: values.shuffle_options,
        autosave_interval_seconds: values.autosave_interval_seconds,
        max_attempts: values.max_attempts,
        allow_late_entry: values.allow_late_entry,
        show_results_immediately: values.show_results_immediately,
      });
      message.success("Settings saved.");
      form.resetFields();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.errors || "Failed to save settings.";
      setError(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setSaving(false);
    }
  };

  const schoolOptions = schools.map((s) => ({ value: s.id, label: s.name }));

  return (
    <DashboardLayout role="admin">
      <Card
        title="Save CBT Settings"
        extra={
          <Link href="/admin/cbt/settings">Get settings</Link>
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
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            shuffle_questions: true,
            shuffle_options: true,
            autosave_interval_seconds: 60,
            max_attempts: 1,
            allow_late_entry: false,
            show_results_immediately: false,
          }}
        >
          <Form.Item name="school_id" label="School" rules={[{ required: true, message: "Select a school" }]}>
            <Select
              placeholder="Select school"
              style={{ width: "100%" }}
              options={schoolOptions}
              loading={loadingSchools}
            />
          </Form.Item>
          <Form.Item name="shuffle_questions" label="Shuffle questions" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="shuffle_options" label="Shuffle options" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item
            name="autosave_interval_seconds"
            label="Autosave interval (seconds)"
            rules={[{ required: true }]}
          >
            <InputNumber min={10} max={300} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="max_attempts" label="Max attempts per exam" rules={[{ required: true }]}>
            <InputNumber min={1} max={10} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="allow_late_entry" label="Allow late entry" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="show_results_immediately" label="Show results immediately" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={saving}>
              Save settings
            </Button>
            <Link href="/admin/cbt/settings" style={{ marginLeft: 8 }}>
              <Button>Cancel</Button>
            </Link>
          </Form.Item>
        </Form>
      </Card>
    </DashboardLayout>
  );
}
