"use client";

import { useState, useEffect } from "react";
import { Card, Form, Input, InputNumber, Button, Alert, App, Select, DatePicker } from "antd";
import dayjs from "dayjs";
import { localToUtcIso } from "@/app/lib/dateUtils";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/app/components/DashboardLayout";
import api from "@/app/lib/api";
import { cbtTeacher, getTeacherSubjects, getSubjectsByTeacherForClass } from "@/app/lib/cbtApi";

interface Session {
  id: number;
  name: string;
  current?: boolean;
}

interface ClassOption {
  id: number;
  name: string;
  arm: string;
  displayName: string;
}

interface SubjectOption {
  id: number;
  name: string;
  code?: string;
}

export default function TeacherCBTExamNewPage() {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form] = Form.useForm();
  const router = useRouter();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  const selectedClassId = Form.useWatch("class_id", form);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingSessions(true);
      try {
        const res = await api.get<{ data?: Session[] } | Session[]>("/viewsessions");
        const data = Array.isArray(res.data) ? res.data : (res.data as any)?.data;
        if (!cancelled && Array.isArray(data)) {
          const sorted = [...data].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
          setSessions(sorted);
          const current = sorted.find((s) => (s as Session).current);
          if (current) setSelectedSessionId(current.id);
          else if (sorted.length) setSelectedSessionId(sorted[0].id);
        }
      } catch {
        if (!cancelled) setError("Failed to load sessions.");
      } finally {
        if (!cancelled) setLoadingSessions(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!selectedSessionId) {
      setClasses([]);
      setSubjects([]);
      form.setFieldsValue({ class_id: undefined, subject_id: undefined });
      return;
    }
    let cancelled = false;
    setLoadingClasses(true);
    setClasses([]);
    setSubjects([]);
    form.setFieldsValue({ class_id: undefined, subject_id: undefined });

    (async () => {
      try {
        const res = await getTeacherSubjects(selectedSessionId);
        if (cancelled) return;

        const raw = (res.data as any)?.data;
        const list = Array.isArray(raw) ? raw : [];

        const classMap = new Map<number, ClassOption>();
        list.forEach((item: any) => {
          const c = item?.class;
          if (c?.id) {
            if (!classMap.has(c.id))
              classMap.set(c.id, {
                id: c.id,
                name: c.name ?? "",
                arm: c.arm ?? "",
                displayName: `${c.name ?? ""}${c.arm ?? ""}`,
              });
          }
        });
        setClasses(Array.from(classMap.values()));
      } catch {
        if (!cancelled) setError("Failed to load classes.");
      } finally {
        if (!cancelled) setLoadingClasses(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedSessionId, form]);

  useEffect(() => {
    if (!selectedClassId) {
      setSubjects([]);
      form.setFieldsValue({ subject_id: undefined });
      return;
    }
    let cancelled = false;
    setLoadingSubjects(true);
    setSubjects([]);
    form.setFieldsValue({ subject_id: undefined });

    const teacherUuid =
      typeof window !== "undefined"
        ? (() => {
            try {
              const u = localStorage.getItem("user");
              return u ? (JSON.parse(u) as { uuid?: string })?.uuid : null;
            } catch {
              return null;
            }
          })()
        : null;

    if (!teacherUuid) {
      setError("Teacher session not found. Please log in again.");
      setLoadingSubjects(false);
      return;
    }

    (async () => {
      try {
        const res = await getSubjectsByTeacherForClass(selectedClassId, teacherUuid);
        if (cancelled) return;

        const list = (res.data as any)?.subjects;
        const arr = Array.isArray(list) ? list : [];
        setSubjects(
          arr.map((s: { subject_id: number; subject_name: string; subject_code?: string }) => ({
            id: s.subject_id,
            name: s.subject_name ?? "",
            code: s.subject_code,
          }))
        );
      } catch {
        if (!cancelled) setError("Failed to load subjects for this class.");
      } finally {
        if (!cancelled) setLoadingSubjects(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedClassId]);

  const onFinish = async (values: any) => {
    setLoading(true);
    setError("");
    try {
      const startTime = localToUtcIso(values.start_time) ?? "";
      const endTime = localToUtcIso(values.end_time) ?? "";
      const res = await cbtTeacher.createExam({
        class_id: values.class_id,
        subject_id: values.subject_id,
        title: values.title,
        description: values.description,
        instructions: values.instructions,
        duration_minutes: values.duration_minutes,
        total_marks: values.total_marks,
        start_time: startTime,
        end_time: endTime,
      });
      const data = (res.data as any)?.data ?? res.data;
      const id = data?.id ?? data?.exam_id;
      message.success("Exam created.");
      router.push(id ? `/teachers/cbt/exams/${id}` : "/teachers/cbt/exams");
    } catch (err: any) {
      setError(err.response?.data?.message || "Create failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="teacher">
      <Card title="Create exam">
        {error && <Alert type="error" message={error} closable onClose={() => setError("")} style={{ marginBottom: 16 }} />}
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item label="Session" required>
            <Select
              placeholder={loadingSessions ? "Loading sessions..." : "Select session"}
              value={selectedSessionId}
              onChange={setSelectedSessionId}
              loading={loadingSessions}
              options={sessions.map((s) => ({ label: s.name, value: s.id }))}
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item name="class_id" label="Class" rules={[{ required: true, message: "Select a class" }]}>
            <Select
              placeholder={loadingClasses ? "Loading classes..." : "Select class"}
              loading={loadingClasses}
              disabled={!selectedSessionId || classes.length === 0}
              options={classes.map((c) => ({
                label: c.displayName,
                value: c.id,
              }))}
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item name="subject_id" label="Subject" rules={[{ required: true, message: "Select a subject" }]}>
            <Select
              placeholder={loadingSubjects ? "Loading subjects..." : "Select subject"}
              loading={loadingSubjects}
              disabled={!selectedClassId || subjects.length === 0}
              options={subjects.map((s) => ({
                label: s.name,
                value: s.id,
              }))}
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="instructions" label="Instructions"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="duration_minutes" label="Duration (minutes)" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="total_marks" label="Total marks" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="start_time" label="Start time" rules={[{ required: true, message: "Select start date and time" }]}>
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              style={{ width: "100%" }}
              placeholder="Select start date and time"
            />
          </Form.Item>
          <Form.Item name="end_time" label="End time" rules={[{ required: true, message: "Select end date and time" }]}>
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              style={{ width: "100%" }}
              placeholder="Select end date and time"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>Create</Button>
            <Link href="/teachers/cbt/exams" style={{ marginLeft: 8 }}><Button>Cancel</Button></Link>
          </Form.Item>
        </Form>
      </Card>
    </DashboardLayout>
  );
}
