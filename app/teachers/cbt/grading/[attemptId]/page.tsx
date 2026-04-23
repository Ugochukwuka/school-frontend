"use client";

import { useEffect, useState } from "react";
import { Card, Spin, Alert, Button, Form, Input, InputNumber } from "antd";
import Link from "next/link";
import { useParams } from "next/navigation";
import DashboardLayout from "@/app/components/DashboardLayout";
import { cbtTeacher } from "@/app/lib/cbtApi";

export default function TeacherCBTGradingAttemptPage() {
  const params = useParams();
  const attemptId = Number(params.attemptId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [script, setScript] = useState<any>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (!attemptId) return;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await cbtTeacher.getAttempt(attemptId);
        const data = (res.data as any)?.data ?? res.data;
        setScript(data);
        const theoryAnswers = (data?.answers ?? []).filter((a: any) => a.question_type === "theory");
        if (theoryAnswers.length > 0) {
          const vals: Record<string, number | string> = {};
          theoryAnswers.forEach((a: any) => {
            const qid = a.question_id ?? a.questionId;
            if (qid != null) {
              vals[`mark_${qid}`] = a.mark_awarded ?? a.marks_awarded ?? 0;
              if (a.remark != null) vals[`remark_${qid}`] = a.remark;
            }
          });
          form.setFieldsValue(vals);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load script.");
      } finally {
        setLoading(false);
      }
    })();
  }, [attemptId]);

  const theoryQuestions = script?.answers?.filter((a: any) => a.question_type === "theory") ?? [];

  const onMarkTheory = async (values: any) => {
    const theoryMarks = theoryQuestions.map((a: any) => ({
      question_id: a.question_id ?? a.questionId,
      mark_awarded: values[`mark_${a.question_id ?? a.questionId}`] ?? 0,
      remark: values[`remark_${a.question_id ?? a.questionId}`],
    }));
    try {
      await cbtTeacher.markTheory(attemptId, { marks: theoryMarks });
      setError("");
      const res = await cbtTeacher.getAttempt(attemptId);
      const data = (res.data as any)?.data ?? res.data;
      setScript(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save marks.");
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="teacher">
        <div style={{ display: "flex", justifyContent: "center", minHeight: 280, alignItems: "center" }}>
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  const examId = script?.exam_id ?? script?.exam?.id;

  return (
    <DashboardLayout role="teacher">
      <Card
        title={`Script / Attempt #${attemptId}`}
        extra={
          examId ? (
            <Link href={`/teachers/cbt/exams/${examId}`}>
              <Button size="small">Back to exam</Button>
            </Link>
          ) : (
            <Link href="/teachers/cbt/grading">
              <Button size="small">Back to grading</Button>
            </Link>
          )
        }
      >
        {error && <Alert type="error" message={error} closable onClose={() => setError("")} style={{ marginBottom: 16 }} />}
        {script && (
          <>
            <pre style={{ background: "#f5f5f5", padding: 12, borderRadius: 8, marginBottom: 24, whiteSpace: "pre-wrap" }}>
              {JSON.stringify(script, null, 2)}
            </pre>
            {theoryQuestions.length > 0 && (
              <Form form={form} onFinish={onMarkTheory}>
                <h4>Mark theory questions</h4>
                {theoryQuestions.map((a: any) => {
                  const qid = a.question_id ?? a.questionId;
                  return (
                    <div key={qid} style={{ marginBottom: 12 }}>
                      <Form.Item name={`mark_${qid}`} label={`Q${qid} mark`}>
                        <InputNumber min={0} />
                      </Form.Item>
                      <Form.Item name={`remark_${qid}`} label="Remark">
                        <Input.TextArea rows={1} placeholder="Optional" />
                      </Form.Item>
                    </div>
                  );
                })}
                <Button type="primary" htmlType="submit">Save theory marks</Button>
              </Form>
            )}
          </>
        )}
      </Card>
    </DashboardLayout>
  );
}
