"use client";

import { useEffect, useState } from "react";
import { Card, Spin, Alert, Typography, Descriptions, Divider, Empty } from "antd";
import { ClockCircleOutlined, FileTextOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { useParams } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/app/components/DashboardLayout";
import { cbtTeacher } from "@/app/lib/cbtApi";

const { Title, Text, Paragraph } = Typography;

interface ExamPreview {
  exam: {
    id: number;
    title: string;
    description?: string;
    instructions?: string;
    duration_minutes: number;
    total_marks: number;
  };
  questions: Array<{
    id?: number;
    question_text?: string;
    question_type?: string;
    marks?: number;
    options?: Array<{ option_label?: string; option_text?: string; is_correct?: boolean }>;
  }>;
}

export default function TeacherCBTExamPreviewPage() {
  const params = useParams();
  const id = Number(params.id);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<ExamPreview | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await cbtTeacher.previewExam(id);
        const payload = (res.data as any)?.data ?? res.data;
        setData(payload);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load preview.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout role="teacher">
        <div style={{ display: "flex", justifyContent: "center", minHeight: 280, alignItems: "center" }}>
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  const exam = data?.exam;
  const questions = data?.questions ?? [];

  return (
    <DashboardLayout role="teacher">
      {error && (
        <Alert
          type="error"
          message={error}
          closable
          onClose={() => setError("")}
          style={{ marginBottom: 16 }}
        />
      )}
      {data && exam && (
        <>
          <Card>
            <div style={{ marginBottom: 8 }}>
              <Link href={`/teachers/cbt/exams/${id}`}>← Back to exam</Link>
            </div>
            <Title level={3} style={{ marginTop: 0 }}>
              {exam.title}
            </Title>
            {exam.description && (
              <Paragraph type="secondary" style={{ marginBottom: 16 }}>
                {exam.description}
              </Paragraph>
            )}
            <Descriptions column={{ xs: 1, sm: 2 }} size="small">
              <Descriptions.Item label={<><ClockCircleOutlined /> Duration</>}>
                {exam.duration_minutes} minutes
              </Descriptions.Item>
              <Descriptions.Item label={<><FileTextOutlined /> Total marks</>}>
                {exam.total_marks}
              </Descriptions.Item>
            </Descriptions>
            {exam.instructions && (
              <>
                <Divider titlePlacement="left">Instructions</Divider>
                <Paragraph style={{ marginBottom: 0, whiteSpace: "pre-wrap" }}>
                  {exam.instructions}
                </Paragraph>
              </>
            )}
          </Card>

          <Card
            title={
              <span>
                <UnorderedListOutlined /> Questions ({questions.length})
              </span>
            }
            style={{ marginTop: 16 }}
          >
            {questions.length === 0 ? (
              <Empty description="No questions in this exam yet. Add or import questions from the exam page." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {questions.map((q, idx) => (
                  <Card key={q.id ?? idx} type="inner" size="small">
                    <Text strong>Question {idx + 1}</Text>
                    {q.marks != null && (
                      <Text type="secondary" style={{ marginLeft: 8 }}>
                        ({q.marks} mark{q.marks !== 1 ? "s" : ""})
                      </Text>
                    )}
                    {q.question_type && (
                      <Text type="secondary" style={{ marginLeft: 8 }}>
                        · {q.question_type}
                      </Text>
                    )}
                    <Paragraph style={{ marginTop: 8, marginBottom: q.options?.length ? 12 : 0 }}>
                      {q.question_text ?? "(No text)"}
                    </Paragraph>
                    {q.options && q.options.length > 0 && (
                      <ul style={{ margin: 0, paddingLeft: 20 }}>
                        {q.options.map((opt, oidx) => (
                          <li key={oidx}>
                            <Text>{opt.option_label ?? String.fromCharCode(65 + oidx)}. {opt.option_text}</Text>
                            {opt.is_correct && (
                              <Text type="success" style={{ marginLeft: 6 }}>✓ Correct</Text>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </DashboardLayout>
  );
}
