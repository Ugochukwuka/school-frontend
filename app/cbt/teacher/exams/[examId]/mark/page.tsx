"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Textarea } from "../../../../components/ui/textarea";
import { Badge } from "../../../../components/ui/badge";
import { Progress } from "../../../../components/ui/progress";
import { Save, CheckCircle, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cbtTeacher } from "@/app/lib/cbtApi";

const CBT_BASE = "/cbt";

interface TheoryItem {
  question_id: number;
  question_text?: string;
  marks?: number;
  answer_text?: string;
  mark_awarded?: number | null;
}

interface AttemptInfo {
  attemptId: number;
  studentName: string;
  studentId?: string;
  theoryQuestions: TheoryItem[];
}

export default function TeacherMarkTheoryPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params?.examId as string;
  const id = examId ? parseInt(examId, 10) : NaN;

  const [attempts, setAttempts] = useState<AttemptInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [marks, setMarks] = useState<Record<number, { mark: number; remark: string }>>({});

  useEffect(() => {
    if (!id || isNaN(id)) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await cbtTeacher.getExamAttempts(id);
        const list = (res.data as { data?: Array<{ id: number; student?: { name?: string; uuid?: string }; user?: { name?: string } }> })?.data ?? [];
        const attemptList: AttemptInfo[] = [];
        for (const a of list.slice(0, 50)) {
          if (cancelled) break;
          try {
            const scriptRes = await cbtTeacher.getAttempt(a.id);
            const script = (scriptRes.data as {
              data?: {
                answers?: Array<{
                  question_id: number;
                  question?: { question_text?: string; marks?: number; question_type?: string };
                  answer_text?: string;
                  mark_awarded?: number | null;
                }>;
                student?: { name?: string; uuid?: string };
                user?: { name?: string };
              };
            })?.data;
            const answers = script?.answers ?? [];
            const theoryOnly = answers.filter(
              (an: { question?: { question_type?: string } }) => (an.question?.question_type ?? "").toLowerCase() === "theory"
            );
            if (theoryOnly.length === 0) continue;
            const studentName = script?.student?.name ?? script?.user?.name ?? "Student";
            const studentId = script?.student?.uuid ?? (a as { student?: { uuid?: string } }).student?.uuid;
            attemptList.push({
              attemptId: a.id,
              studentName,
              studentId,
              theoryQuestions: theoryOnly.map((an: {
                question_id: number;
                question?: { question_text?: string; marks?: number };
                answer_text?: string;
                mark_awarded?: number | null;
              }) => ({
                question_id: an.question_id,
                question_text: an.question?.question_text,
                marks: an.question?.marks ?? 0,
                answer_text: an.answer_text,
                mark_awarded: an.mark_awarded,
              })),
            });
          } catch {
            // skip this attempt
          }
        }
        if (!cancelled) setAttempts(attemptList);
      } catch {
        if (!cancelled) toast.error("Failed to load attempts.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true };
  }, [id]);

  const currentSubmission = attempts[currentIndex];
  const totalSubmissions = attempts.length;

  const handleMarkQuestion = (questionId: number, mark: number, remark: string) => {
    setMarks((prev) => ({ ...prev, [questionId]: { mark, remark } }));
  };

  const handleSave = async () => {
    if (!currentSubmission || saving) return;
    const payload = currentSubmission.theoryQuestions.map((q) => ({
      question_id: q.question_id,
      mark_awarded: marks[q.question_id]?.mark ?? 0,
      remark: marks[q.question_id]?.remark,
    }));
    setSaving(true);
    try {
      await cbtTeacher.markTheory(currentSubmission.attemptId, { marks: payload });
      toast.success("Marks saved successfully");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to save marks";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndNext = async () => {
    if (!currentSubmission || saving) return;
    const payload = currentSubmission.theoryQuestions.map((q) => ({
      question_id: q.question_id,
      mark_awarded: marks[q.question_id]?.mark ?? 0,
      remark: marks[q.question_id]?.remark,
    }));
    setSaving(true);
    try {
      await cbtTeacher.markTheory(currentSubmission.attemptId, { marks: payload });
      if (currentIndex < totalSubmissions - 1) {
        toast.success("Marks saved successfully");
        setMarks({});
        setCurrentIndex(currentIndex + 1);
      } else {
        toast.success("All submissions marked!");
        setTimeout(() => {
          router.push(`${CBT_BASE}/teacher/exams`);
        }, 5000);
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to save marks";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (totalSubmissions === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Mark Theory Questions</h1>
        <p className="text-slate-600">No attempts with theory questions to mark for this exam.</p>
        <Link href={`${CBT_BASE}/teacher/exams/${id}`}>
          <Button variant="outline">Back to Exam</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Mark Theory Questions</h1>
        <p className="text-slate-600 mt-1">Review and grade student submissions</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Marking Progress</span>
            <span className="text-sm text-slate-600">
              {currentIndex + 1} of {totalSubmissions} submissions
            </span>
          </div>
          <Progress value={((currentIndex + 1) / totalSubmissions) * 100} className="h-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{currentSubmission.studentName}</CardTitle>
              <CardDescription>Attempt ID: {currentSubmission.attemptId}{currentSubmission.studentId ? ` · ${currentSubmission.studentId}` : ""}</CardDescription>
            </div>
            <Badge className="bg-blue-100 text-blue-700">
              {currentSubmission.theoryQuestions.length} Theory Questions
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-6">
        {currentSubmission.theoryQuestions.map((question, idx) => (
          <Card key={question.question_id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Question {idx + 1}</CardTitle>
                  <CardDescription>Maximum marks: {question.marks ?? 0}</CardDescription>
                </div>
                {(marks[question.question_id]?.mark != null && marks[question.question_id].mark !== "") && (
                  <Badge className="bg-green-100 text-green-700">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Marked
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="font-semibold text-sm text-slate-600 mb-2">Question:</p>
                <p className="text-slate-900">{question.question_text ?? "—"}</p>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-semibold text-sm text-blue-900 mb-2">Student&apos;s Answer:</p>
                <p className="text-blue-800 whitespace-pre-wrap">{question.answer_text ?? "—"}</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor={`mark-${question.question_id}`}>Award Marks (out of {question.marks ?? 0})</Label>
                  <Input
                    id={`mark-${question.question_id}`}
                    type="number"
                    min={0}
                    max={question.marks ?? 0}
                    value={marks[question.question_id]?.mark ?? ""}
                    onChange={(e) =>
                      handleMarkQuestion(
                        question.question_id,
                        parseFloat(e.target.value) || 0,
                        marks[question.question_id]?.remark ?? ""
                      )
                    }
                    placeholder="Enter marks"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`remark-${question.question_id}`}>Remark (Optional)</Label>
                  <Textarea
                    id={`remark-${question.question_id}`}
                    value={marks[question.question_id]?.remark ?? ""}
                    onChange={(e) =>
                      handleMarkQuestion(
                        question.question_id,
                        marks[question.question_id]?.mark ?? 0,
                        e.target.value
                      )
                    }
                    placeholder="Add feedback..."
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => {
            setMarks({});
            setCurrentIndex(Math.max(0, currentIndex - 1));
          }}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous Student
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Progress
          </Button>
          <Button onClick={handleSaveAndNext} className="bg-green-600 hover:bg-green-700" disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {currentIndex < totalSubmissions - 1 ? (
              <>
                Save & Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Save & Finish
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
