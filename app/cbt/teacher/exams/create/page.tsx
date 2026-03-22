"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Save, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/app/lib/api";
import { cbtTeacher, cbtTeacherListExams, getTeacherSubjects, getSubjectsByTeacherForClass } from "@/app/lib/cbtApi";

const CBT_BASE = "/cbt";

interface SessionOption {
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

interface TeacherExamOption {
  id: number;
  title: string;
  subject?: { id: number; name: string };
  class_level?: { id: number; name: string; arm?: string };
}

interface McqOption {
  option_label: string;
  option_text: string;
  is_correct: boolean;
}

export default function TeacherCreateExamPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState("details");
  const [examData, setExamData] = useState({
    sessionId: "",
    title: "",
    description: "",
    instructions: "Answer all questions carefully.",
    classId: "",
    subjectId: "",
    duration: 60,
    totalMarks: 50,
    startTime: "",
    endTime: "",
  });
  const [saving, setSaving] = useState(false);

  const [sessions, setSessions] = useState<SessionOption[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  // Questions tab: teacher exams for dropdown + add-question form
  const [teacherExams, setTeacherExams] = useState<TeacherExamOption[]>([]);
  const [loadingTeacherExams, setLoadingTeacherExams] = useState(false);
  const [selectedExamIdForQuestion, setSelectedExamIdForQuestion] = useState<string>("");
  const [questionType, setQuestionType] = useState<"mcq" | "theory">("mcq");
  const [questionText, setQuestionText] = useState("");
  const [questionMarks, setQuestionMarks] = useState(2);
  const [mcqOptions, setMcqOptions] = useState<McqOption[]>([
    { option_label: "A", option_text: "", is_correct: true },
    { option_label: "B", option_text: "", is_correct: false },
  ]);
  const [submittingQuestion, setSubmittingQuestion] = useState(false);

  // Fetch sessions on mount (same as teachers/cbt/exams/new)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingSessions(true);
      try {
        const res = await api.get<{ data?: SessionOption[] } | SessionOption[]>("/viewsessions");
        const data = Array.isArray(res.data) ? res.data : (res.data as { data?: SessionOption[] })?.data;
        if (!cancelled && Array.isArray(data)) {
          const sorted = [...data].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
          setSessions(sorted);
          const current = sorted.find((s) => (s as SessionOption).current);
          if (current) setSelectedSessionId(current.id);
          else if (sorted.length) setSelectedSessionId(sorted[0].id);
        }
      } catch {
        if (!cancelled) toast.error("Failed to load sessions.");
      } finally {
        if (!cancelled) setLoadingSessions(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // When session changes: fetch classes via getTeacherSubjects(session_id), clear class and subject
  useEffect(() => {
    if (!selectedSessionId) {
      setClasses([]);
      setSubjects([]);
      setExamData((prev) => ({ ...prev, classId: "", subjectId: "", sessionId: "" }));
      return;
    }
    setExamData((prev) => ({ ...prev, sessionId: String(selectedSessionId), classId: "", subjectId: "" }));
    let cancelled = false;
    setLoadingClasses(true);
    setClasses([]);
    setSubjects([]);

    (async () => {
      try {
        const res = await getTeacherSubjects(selectedSessionId);
        if (cancelled) return;
        const raw = (res.data as { data?: unknown[] })?.data;
        const list = Array.isArray(raw) ? raw : [];
        const classMap = new Map<number, ClassOption>();
        list.forEach((item: { class?: { id: number; name?: string; arm?: string } }) => {
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
        if (!cancelled) toast.error("Failed to load classes.");
      } finally {
        if (!cancelled) setLoadingClasses(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedSessionId]);

  // When class changes: fetch subjects by class + teacher (getSubjectsByTeacherForClass)
  useEffect(() => {
    const classId = examData.classId ? parseInt(examData.classId, 10) : 0;
    if (!classId) {
      setSubjects([]);
      return;
    }
    let cancelled = false;
    setLoadingSubjects(true);
    setSubjects([]);

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
      toast.error("Teacher session not found. Please log in again.");
      setLoadingSubjects(false);
      return;
    }

    (async () => {
      try {
        const res = await getSubjectsByTeacherForClass(classId, teacherUuid);
        if (cancelled) return;
        const list = (res.data as { subjects?: Array<{ subject_id: number; subject_name: string; subject_code?: string }> })?.subjects;
        const arr = Array.isArray(list) ? list : [];
        setSubjects(
          arr.map((s) => ({
            id: s.subject_id,
            name: s.subject_name ?? "",
            code: s.subject_code,
          }))
        );
      } catch {
        if (!cancelled) toast.error("Failed to load subjects for this class.");
      } finally {
        if (!cancelled) setLoadingSubjects(false);
      }
    })();
    return () => { cancelled = true; };
  }, [examData.classId]);

  // Fetch teacher exams for the "Add question" dropdown (Questions tab)
  useEffect(() => {
    let cancelled = false;
    setLoadingTeacherExams(true);
    cbtTeacherListExams({ per_page: 100 })
      .then((res) => {
        if (cancelled) return;
        const body = res.data as { data?: { exams?: { data?: TeacherExamOption[] }; data?: TeacherExamOption[] } };
        const examsWrap = body?.data?.exams ?? body?.data;
        const list = (examsWrap as { data?: TeacherExamOption[] })?.data ?? (Array.isArray(examsWrap) ? examsWrap : []);
        setTeacherExams(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (!cancelled) {
          toast.error("Failed to load your exams.");
          setTeacherExams([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingTeacherExams(false);
      });
    return () => { cancelled = true; };
  }, []);

  const buildCreateBody = () => {
    const classId = parseInt(examData.classId, 10);
    const subjectId = parseInt(examData.subjectId, 10);
    if (!examData.title?.trim()) return null;
    if (!classId || !subjectId) return null;
    if (!examData.duration || examData.duration < 1) return null;
    // API expects ISO strings; datetime-local gives "YYYY-MM-DDTHH:mm", backend may expect full ISO
    const startTime = examData.startTime ? `${examData.startTime}:00` : "";
    const endTime = examData.endTime ? `${examData.endTime}:00` : "";
    return {
      class_id: classId,
      subject_id: subjectId,
      title: examData.title.trim(),
      description: examData.description?.trim() || "",
      instructions: examData.instructions?.trim() || "Answer all questions carefully.",
      duration_minutes: examData.duration,
      total_marks: examData.totalMarks ?? 50,
      start_time: startTime,
      end_time: endTime,
    };
  };

  const handleSaveDraft = async () => {
    const body = buildCreateBody();
    if (!body) {
      toast.error("Please fill in Title, Class, Subject, and Duration.");
      return;
    }
    setSaving(true);
    try {
      await cbtTeacher.createExam(body);
      toast.success("Exam saved as draft");
      setTimeout(() => {
        router.push(`${CBT_BASE}/teacher/exams`);
      }, 5000);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to create exam.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    const body = buildCreateBody();
    if (!body) {
      toast.error("Please fill in Title, Class, Subject, and Duration.");
      return;
    }
    setSaving(true);
    try {
      const createRes = await cbtTeacher.createExam(body);
      const created = createRes.data as { id?: number; data?: { id?: number } };
      const examId = created?.data?.id ?? created?.id;
      if (examId == null) {
        toast.error("Exam was created but no ID returned.");
        setSaving(false);
        return;
      }
      await cbtTeacher.publishExam(examId);
      toast.success("Exam published successfully");
      setTimeout(() => {
        router.push(`${CBT_BASE}/teacher/exams`);
      }, 5000);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to create or publish exam.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // --- Add Question (Questions tab) ---
  const setMcqOptionCorrect = (index: number) => {
    setMcqOptions((prev) =>
      prev.map((opt, i) => ({ ...opt, is_correct: i === index }))
    );
  };

  const updateMcqOption = (index: number, field: keyof McqOption, value: string | boolean) => {
    setMcqOptions((prev) =>
      prev.map((opt, i) => (i === index ? { ...opt, [field]: value } : opt))
    );
  };

  const addMcqOption = () => {
    const labels = "ABCDEFGHIJ";
    const nextLabel = labels[mcqOptions.length] ?? String(mcqOptions.length + 1);
    setMcqOptions((prev) => [...prev, { option_label: nextLabel, option_text: "", is_correct: false }]);
  };

  const removeMcqOption = (index: number) => {
    if (mcqOptions.length <= 2) return;
    setMcqOptions((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.some((o) => o.is_correct)) return next;
      next[0]!.is_correct = true;
      return next;
    });
  };

  const handleAddQuestion = async () => {
    const examId = selectedExamIdForQuestion ? parseInt(selectedExamIdForQuestion, 10) : 0;
    if (!examId) {
      toast.error("Please select an exam.");
      return;
    }
    if (!questionText.trim()) {
      toast.error("Please enter the question text.");
      return;
    }
    if (questionMarks < 1) {
      toast.error("Marks must be at least 1.");
      return;
    }
    if (questionType === "mcq") {
      const validOptions = mcqOptions.filter((o) => o.option_text.trim() !== "");
      if (validOptions.length < 2) {
        toast.error("Add at least two options with text.");
        return;
      }
      if (!validOptions.some((o) => o.is_correct)) {
        toast.error("Mark one option as correct.");
        return;
      }
    }

    setSubmittingQuestion(true);
    try {
      const body =
        questionType === "mcq"
          ? {
              questions: [
                {
                  question_type: "mcq" as const,
                  question_text: questionText.trim(),
                  marks: questionMarks,
                  options: mcqOptions
                    .filter((o) => o.option_text.trim() !== "")
                    .map((o) => ({
                      option_label: o.option_label,
                      option_text: o.option_text.trim(),
                      is_correct: o.is_correct,
                    })),
                },
              ],
            }
          : {
              questions: [
                {
                  question_type: "theory" as const,
                  question_text: questionText.trim(),
                  marks: questionMarks,
                },
              ],
            };

      const res = await cbtTeacher.addQuestions(examId, body);
      const data = res.data as { message?: string; data?: unknown[] };
      toast.success(data?.message ?? "Question added successfully.");
      setQuestionText("");
      setQuestionMarks(2);
      setMcqOptions([
        { option_label: "A", option_text: "", is_correct: true },
        { option_label: "B", option_text: "", is_correct: false },
      ]);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to add question.";
      toast.error(msg);
    } finally {
      setSubmittingQuestion(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto min-w-0 w-full pb-8 bg-blue-50/40 rounded-xl p-6 sm:p-8 overflow-visible">
      <Tabs value={currentStep} onValueChange={setCurrentStep} className="w-full min-w-0 overflow-visible">
        {/* Header: title + subtitle left, Save Draft + Publish right (match img 2) */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Create New Exam</h1>
            <p className="text-slate-600 mt-1 text-sm">Set up your exam details and questions</p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={saving}
              className="border-slate-300 bg-white text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              <Save className="w-4 h-4 mr-2 shrink-0" />
              {saving ? "Saving…" : "Save Draft"}
            </Button>
            <Button onClick={handlePublish} disabled={saving} className="bg-green-600 hover:bg-green-700 text-white rounded-lg">
              {saving ? "Publishing…" : "Publish Exam"}
            </Button>
          </div>
        </div>

        {/* Tab bar: light grey container; active = white segment, inactive = light grey segment (img 2) */}
        <TabsList className="bg-slate-100 p-1 rounded-lg w-fit mt-4 h-auto border-0 shadow-none inline-flex">
          <TabsTrigger
            value="details"
            className="rounded-md bg-slate-200 text-slate-600 px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
          >
            Exam Details
          </TabsTrigger>
          <TabsTrigger
            value="questions"
            className="rounded-md bg-slate-200 text-slate-600 px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
          >
            Questions
          </TabsTrigger>
          <TabsTrigger
            value="preview"
            className="rounded-md bg-slate-200 text-slate-600 px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
          >
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6 mt-6 overflow-visible">
          <Card className="rounded-xl shadow-sm border-slate-200 bg-white overflow-visible">
            <CardHeader>
              <CardTitle className="text-slate-900">Basic Information</CardTitle>
              <CardDescription className="text-slate-500">Configure exam settings and schedule</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-700">Session *</Label>
                <Select
                  value={selectedSessionId != null ? String(selectedSessionId) : ""}
                  onValueChange={(value) => setSelectedSessionId(value ? parseInt(value, 10) : null)}
                  disabled={loadingSessions}
                >
                  <SelectTrigger className="bg-slate-50 border-slate-200">
                    <SelectValue placeholder={loadingSessions ? "Loading sessions..." : "Select session"} />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name}{s.current ? " (Current)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-700">Class *</Label>
                  <Select
                    value={examData.classId}
                    onValueChange={(value) => setExamData({ ...examData, classId: value, subjectId: "" })}
                    disabled={!selectedSessionId || loadingClasses || classes.length === 0}
                  >
                    <SelectTrigger className="bg-slate-50 border-slate-200">
                      <SelectValue placeholder={loadingClasses ? "Loading classes..." : "Select class"} />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={String(cls.id)}>{cls.displayName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">Subject *</Label>
                  <Select
                    value={examData.subjectId}
                    onValueChange={(value) => setExamData({ ...examData, subjectId: value })}
                    disabled={!examData.classId || loadingSubjects || subjects.length === 0}
                  >
                    <SelectTrigger className="bg-slate-50 border-slate-200">
                      <SelectValue placeholder={loadingSubjects ? "Loading subjects..." : "Select subject"} />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title" className="text-slate-700">Exam Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g. Mathematics Mid-Term Exam"
                  value={examData.title}
                  onChange={(e) => setExamData({ ...examData, title: e.target.value })}
                  className="bg-slate-50 border-slate-200 focus:bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-700">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the exam content"
                  value={examData.description}
                  onChange={(e) => setExamData({ ...examData, description: e.target.value })}
                  rows={3}
                  className="bg-slate-50 border-slate-200 focus:bg-white resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructions" className="text-slate-700">Instructions</Label>
                <Textarea
                  id="instructions"
                  placeholder="Answer all questions carefully."
                  value={examData.instructions}
                  onChange={(e) => setExamData({ ...examData, instructions: e.target.value })}
                  rows={4}
                  className="bg-slate-50 border-slate-200 focus:bg-white resize-none"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-slate-700">Duration (minutes) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    min={1}
                    value={examData.duration}
                    onChange={(e) => setExamData({ ...examData, duration: parseInt(e.target.value, 10) || 0 })}
                    className="bg-slate-50 border-slate-200 focus:bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalMarks" className="text-slate-700">Total marks</Label>
                  <Input
                    id="totalMarks"
                    type="number"
                    min={0}
                    value={examData.totalMarks}
                    onChange={(e) => setExamData({ ...examData, totalMarks: parseInt(e.target.value, 10) || 0 })}
                    className="bg-slate-50 border-slate-200 focus:bg-white"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime" className="text-slate-700">Start Time</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={examData.startTime}
                    onChange={(e) => setExamData({ ...examData, startTime: e.target.value })}
                    className="bg-slate-50 border-slate-200 focus:bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime" className="text-slate-700">End Time</Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    value={examData.endTime}
                    onChange={(e) => setExamData({ ...examData, endTime: e.target.value })}
                    className="bg-slate-50 border-slate-200 focus:bg-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="space-y-6 mt-6 overflow-visible">
          <Card className="rounded-xl shadow-sm border-slate-200 bg-white overflow-visible">
            <CardHeader>
              <CardTitle className="text-slate-900">Add Question</CardTitle>
              <CardDescription className="text-slate-500">Select an exam and add MCQ or theory questions. Questions are sent to the exam via the API.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-700">Exam *</Label>
                <Select
                  value={selectedExamIdForQuestion}
                  onValueChange={setSelectedExamIdForQuestion}
                  disabled={loadingTeacherExams}
                >
                  <SelectTrigger className="bg-slate-50 border-slate-200">
                    <SelectValue placeholder={loadingTeacherExams ? "Loading your exams…" : "Select exam"} />
                  </SelectTrigger>
                  <SelectContent>
                    {teacherExams.map((exam) => (
                      <SelectItem key={exam.id} value={String(exam.id)}>
                        {exam.title}
                        {(exam.subject?.name || exam.class_level?.name) &&
                          ` · ${[exam.class_level?.name, exam.class_level?.arm, exam.subject?.name].filter(Boolean).join(" ")}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-700">Question type</Label>
                  <Select
                    value={questionType}
                    onValueChange={(v) => setQuestionType(v as "mcq" | "theory")}
                  >
                    <SelectTrigger className="bg-slate-50 border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mcq">MCQ</SelectItem>
                      <SelectItem value="theory">Theory</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="q-marks" className="text-slate-700">Marks *</Label>
                  <Input
                    id="q-marks"
                    type="number"
                    min={1}
                    value={questionMarks}
                    onChange={(e) => setQuestionMarks(parseInt(e.target.value, 10) || 0)}
                    className="bg-slate-50 border-slate-200 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="q-text" className="text-slate-700">Question text *</Label>
                <Textarea
                  id="q-text"
                  placeholder="e.g. What is 2 + 2?"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  rows={3}
                  className="bg-slate-50 border-slate-200 focus:bg-white resize-none"
                />
              </div>

              {questionType === "mcq" && (
                <div className="space-y-3">
                  <Label className="text-slate-700">Options (mark one correct)</Label>
                  <div className="space-y-2">
                    {mcqOptions.map((opt, index) => (
                      <div key={index} className="flex items-center gap-2 flex-wrap">
                        <span className="w-6 font-medium text-slate-600">{opt.option_label}.</span>
                        <Input
                          placeholder="Option text"
                          value={opt.option_text}
                          onChange={(e) => updateMcqOption(index, "option_text", e.target.value)}
                          className="flex-1 min-w-[120px] bg-slate-50 border-slate-200 focus:bg-white"
                        />
                        <label className="flex items-center gap-1.5 whitespace-nowrap cursor-pointer">
                          <input
                            type="radio"
                            name="correct-option"
                            checked={opt.is_correct}
                            onChange={() => setMcqOptionCorrect(index)}
                            className="rounded-full border-slate-300"
                          />
                          <span className="text-sm text-slate-600">Correct</span>
                        </label>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="shrink-0 h-8 w-8 text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => removeMcqOption(index)}
                          disabled={mcqOptions.length <= 2}
                          aria-label="Remove option"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addMcqOption}
                    className="border-slate-300 text-slate-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add option
                  </Button>
                </div>
              )}

              <div className="pt-2">
                <Button
                  onClick={handleAddQuestion}
                  disabled={submittingQuestion || !selectedExamIdForQuestion || !questionText.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {submittingQuestion ? "Adding…" : "Add Question"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6 mt-6 overflow-visible">
          <Card className="rounded-xl shadow-sm border-slate-200 bg-white overflow-visible">
            <CardHeader>
              <CardTitle className="text-slate-900">Preview</CardTitle>
              <CardDescription className="text-slate-500">Review your exam before publishing</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="text-sm bg-slate-50 p-4 rounded-lg overflow-auto border border-slate-200">
                {JSON.stringify(examData, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
