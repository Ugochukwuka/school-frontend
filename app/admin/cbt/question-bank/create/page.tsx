"use client";

import { useState } from "react";
import { Card, Form, Input, InputNumber, Button, Alert, App } from "antd";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/app/components/DashboardLayout";
import { cbtAdmin } from "@/app/lib/cbtApi";

export default function AdminCBTQuestionBankCreatePage() {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form] = Form.useForm();
  const router = useRouter();

  const onFinish = async (values: any) => {
    setLoading(true);
    setError("");
    try {
      await cbtAdmin.createQuestionBank({
        subject_id: values.subject_id,
        question_type: values.question_type || "mcq",
        question_text: values.question_text,
        marks: values.marks,
        options: values.options || [],
      });
      message.success("Question added to bank.");
      router.push("/admin/cbt/question-bank");
    } catch (err: any) {
      setError(err.response?.data?.message || "Create failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="admin">
      <Card title="Create question (Question Bank)">
        {error && <Alert type="error" title={error} closable onClose={() => setError("")} style={{ marginBottom: 16 }} />}
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="subject_id" label="Subject ID" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="question_type" label="Type" initialValue="mcq">
            <Input placeholder="mcq or theory" />
          </Form.Item>
          <Form.Item name="question_text" label="Question text" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="marks" label="Marks" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>Create</Button>
            <Link href="/admin/cbt/question-bank" style={{ marginLeft: 8 }}><Button>Cancel</Button></Link>
          </Form.Item>
        </Form>
      </Card>
    </DashboardLayout>
  );
}
