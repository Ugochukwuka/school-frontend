"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, Spin, Alert, Button, Radio, Input, Space, Modal } from "antd";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/app/components/DashboardLayout";
import { cbtStudent } from "@/app/lib/cbtApi";

export default function StudentCBTAttemptPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = Number(params.attemptId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<number, { selected_option_id?: number; answer_text?: string }>>({});
  const [lockedQuestions, setLockedQuestions] = useState<Set<number>>(new Set());
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(3);

  const loadResume = useCallback(async () => {
    if (!attemptId) return;
    setLoading(true);
    setError("");
    try {
      const [statusRes, resumeRes] = await Promise.all([
        cbtStudent.getAttemptStatus(attemptId),
        cbtStudent.resumeAttempt(attemptId).catch(() => null),
      ]);
      const statusData = (statusRes.data as any)?.data ?? statusRes.data;
      setRemainingSeconds(statusData?.remaining_seconds ?? statusData?.remaining ?? null);
      if (resumeRes?.data) {
        const resumeData = (resumeRes.data as any)?.data ?? resumeRes.data;
        const saved: Record<number, any> = {};
        const locked = new Set<number>();
        (resumeData?.answers ?? []).forEach((a: any) => {
          if (a.question_id) {
            saved[a.question_id] = { selected_option_id: a.selected_option_id, answer_text: a.answer_text };
            locked.add(a.question_id);
          }
        });
        setAnswers(saved);
        setLockedQuestions(locked);
      }
      const qRes = await cbtStudent.getAttemptQuestions(attemptId);
      const raw = (qRes.data as any)?.data ?? qRes.data;
      const qs = Array.isArray(raw) ? raw : raw?.questions ?? [];
      setQuestions(qs);
      const pagination = raw?.pagination;
      if (pagination?.per_page != null) setPerPage(pagination.per_page);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load exam.");
    } finally {
      setLoading(false);
    }
  }, [attemptId]);

  useEffect(() => {
    loadResume();
  }, [loadResume]);

  useEffect(() => {
    if (remainingSeconds == null || remainingSeconds <= 0) return;
    const t = setInterval(() => setRemainingSeconds((s) => (s != null && s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [remainingSeconds]);

  const saveAnswer = async (questionId: number, selected_option_id?: number, answer_text?: string) => {
    if (lockedQuestions.has(questionId)) return;
    try {
      await cbtStudent.saveAnswers(attemptId, { question_id: questionId, selected_option_id, answer_text });
      setLockedQuestions((prev) => new Set(prev).add(questionId));
    } catch (_) {}
  };

  const isQuestionAnswered = (q: any): boolean => {
    const ans = answers[q.id];
    if (ans?.selected_option_id != null) return true;
    if (ans?.answer_text !== undefined && String(ans.answer_text).trim() !== "") return true;
    return false;
  };

  const handleSubmitClick = () => setSubmitConfirmOpen(true);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      await cbtStudent.submitAttempt(attemptId);
      router.push("/dashboard/student/cbt/results");
    } catch (err: any) {
      setError(err.response?.data?.message || "Submit failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="student">
        <div style={{ display: "flex", justifyContent: "center", minHeight: 280, alignItems: "center" }}>
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  const totalMins = remainingSeconds != null ? Math.floor(remainingSeconds / 60) : null;
  const secs = remainingSeconds != null ? remainingSeconds % 60 : 0;

  const totalPages = Math.max(1, Math.ceil(questions.length / perPage));
  const startIdx = (currentPage - 1) * perPage;
  const pageQuestions = questions.slice(startIdx, startIdx + perPage);
  const startNum = startIdx + 1;
  const endNum = Math.min(startIdx + perPage, questions.length);

  return (
    <DashboardLayout role="student">
      <Card title="Exam" extra={remainingSeconds != null && <span>Time: {totalMins}m {secs}s</span>}>
        {error && <Alert type="error" title={error} closable onClose={() => setError("")} style={{ marginBottom: 16 }} />}
        {questions.length === 0 ? (
          <Alert type="info" title="No questions loaded." />
        ) : (
          <>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>
              Questions {startNum}–{endNum} of {questions.length} (Page {currentPage} of {totalPages})
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 20,
                alignItems: "center",
              }}
            >
              {questions.map((q: any, idx: number) => {
                const answered = isQuestionAnswered(q);
                const pageForQuestion = Math.floor(idx / perPage) + 1;
                const isCurrentPage = currentPage === pageForQuestion;
                const circleStyle: React.CSSProperties = {
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: isCurrentPage ? "2px solid #1890ff" : "1px solid #d9d9d9",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  background: answered ? "#1890ff" : "#fff",
                  color: answered ? "#fff" : "#000",
                };
                return (
                  <button
                    key={q.id}
                    type="button"
                    style={circleStyle}
                    onClick={() => setCurrentPage(pageForQuestion)}
                    title={`Question ${idx + 1}${answered ? " (answered)" : ""}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            {pageQuestions.map((q: any, idx: number) => {
              const globalIdx = startIdx + idx;
              const isLocked = lockedQuestions.has(q.id);
              return (
                <Card key={q.id} size="small" style={{ marginBottom: 16 }}>
                  <p><strong>Q{globalIdx + 1}.</strong> {q.question_text}</p>
                  {q.question_type === "mcq" && q.options?.length ? (
                    <Radio.Group
                      value={answers[q.id]?.selected_option_id}
                      disabled={isLocked}
                      onChange={(e) => {
                        if (isLocked) return;
                        setAnswers((prev) => ({ ...prev, [q.id]: { selected_option_id: e.target.value } }));
                        saveAnswer(q.id, e.target.value);
                      }}
                      style={{ display: "flex", flexDirection: "column", gap: 8 }}
                    >
                      {[...(q.options || [])]
                        .sort((a: any, b: any) => (String(a.option_label || "").toUpperCase()).localeCompare(String(b.option_label || "").toUpperCase()))
                        .map((opt: any) => (
                          <Radio key={opt.id} value={opt.id}>{opt.option_label}. {opt.option_text}</Radio>
                        ))}
                    </Radio.Group>
                  ) : (
                    <Input.TextArea
                      placeholder="Your answer"
                      value={answers[q.id]?.answer_text ?? ""}
                      disabled={isLocked}
                      onChange={(e) => {
                        if (isLocked) return;
                        setAnswers((prev) => ({ ...prev, [q.id]: { answer_text: e.target.value } }));
                      }}
                      onBlur={(e) => {
                        if (isLocked) return;
                        const v = e.target.value?.trim();
                        if (v) saveAnswer(q.id, undefined, v);
                      }}
                      rows={3}
                    />
                  )}
                </Card>
              );
            })}
            <Space style={{ marginTop: 24 }} wrap>
              <Button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                type="primary"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
              {currentPage === totalPages && (
                <Button type="primary" size="large" onClick={handleSubmitClick} loading={submitting}>
                  Submit exam
                </Button>
              )}
            </Space>
            <Modal
              title="Submit exam"
              open={submitConfirmOpen}
              onCancel={() => setSubmitConfirmOpen(false)}
              okText="Submit"
              cancelText="Cancel"
              onOk={async () => {
                setSubmitConfirmOpen(false);
                await handleSubmit();
              }}
            >
              Are you sure you want to submit? You cannot change your answers after submitting.
            </Modal>
          </>
        )}
      </Card>
    </DashboardLayout>
  );
}
