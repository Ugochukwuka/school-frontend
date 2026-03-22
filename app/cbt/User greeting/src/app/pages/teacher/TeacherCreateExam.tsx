import { useState } from "react";
import { useNavigate } from "react-router";
import { DashboardLayout } from "../../components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { Switch } from "../../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Badge } from "../../components/ui/badge";
import { PlusCircle, Trash, Save, Eye, Upload } from "lucide-react";
import { toast } from "sonner";

export function TeacherCreateExam() {
  const navigate = useNavigate();
  const [examData, setExamData] = useState({
    title: "",
    description: "",
    instructions: "Answer all questions carefully.",
    classId: "",
    subjectId: "",
    duration: 60,
    totalMarks: 0,
    startTime: "",
    endTime: "",
  });

  const [questions, setQuestions] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState("details");

  // Mock data
  const classes = [
    { id: 1, name: "Grade 10A" },
    { id: 2, name: "Grade 10B" },
    { id: 3, name: "Grade 11A" },
  ];

  const subjects = [
    { id: 1, name: "Mathematics" },
    { id: 2, name: "Physics" },
    { id: 3, name: "Chemistry" },
    { id: 4, name: "Biology" },
  ];

  const addQuestion = (type: "mcq" | "theory") => {
    const newQuestion = {
      id: Date.now(),
      type,
      text: "",
      marks: 2,
      options: type === "mcq" ? [
        { id: Date.now() + 1, label: "A", text: "", isCorrect: false },
        { id: Date.now() + 2, label: "B", text: "", isCorrect: false },
        { id: Date.now() + 3, label: "C", text: "", isCorrect: false },
        { id: Date.now() + 4, label: "D", text: "", isCorrect: false },
      ] : undefined,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: number, field: string, value: any) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  const updateOption = (questionId: number, optionId: number, field: string, value: any) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            options: q.options.map((o: any) =>
              o.id === optionId ? { ...o, [field]: value } : o
            ),
          };
        }
        return q;
      })
    );
  };

  const deleteQuestion = (id: number) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleSaveDraft = () => {
    // POST /api/cbt/exams (with status draft)
    toast.success("Exam saved as draft");
    navigate("/teacher/exams");
  };

  const handlePublish = () => {
    // POST /api/cbt/exams then POST /api/cbt/exams/{id}/publish
    toast.success("Exam published successfully");
    navigate("/teacher/exams");
  };

  const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Create New Exam</h1>
            <p className="text-slate-600 mt-1">Set up your exam details and questions</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSaveDraft}>
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button onClick={handlePublish} className="bg-green-600 hover:bg-green-700">
              Publish Exam
            </Button>
          </div>
        </div>

        <Tabs value={currentStep} onValueChange={setCurrentStep}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Exam Details</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Configure exam settings and schedule</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Exam Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g. Mathematics Mid-Term Exam"
                    value={examData.title}
                    onChange={(e) => setExamData({ ...examData, title: e.target.value })}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="class">Class *</Label>
                    <Select
                      value={examData.classId}
                      onValueChange={(value) => setExamData({ ...examData, classId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id.toString()}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Select
                      value={examData.subjectId}
                      onValueChange={(value) => setExamData({ ...examData, subjectId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id.toString()}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of the exam content"
                    value={examData.description}
                    onChange={(e) => setExamData({ ...examData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructions">Instructions</Label>
                  <Textarea
                    id="instructions"
                    placeholder="Instructions for students"
                    value={examData.instructions}
                    onChange={(e) => setExamData({ ...examData, instructions: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={examData.duration}
                      onChange={(e) => setExamData({ ...examData, duration: parseInt(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Total Marks</Label>
                    <Input value={totalMarks} disabled />
                    <p className="text-xs text-slate-500">Auto-calculated from questions</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time *</Label>
                    <Input
                      id="startTime"
                      type="datetime-local"
                      value={examData.startTime}
                      onChange={(e) => setExamData({ ...examData, startTime: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time *</Label>
                    <Input
                      id="endTime"
                      type="datetime-local"
                      value={examData.endTime}
                      onChange={(e) => setExamData({ ...examData, endTime: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={() => setCurrentStep("questions")}>
                Next: Add Questions
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="questions" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Exam Questions</CardTitle>
                    <CardDescription>
                      {questions.length} questions · {totalMarks} total marks
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => addQuestion("mcq")}>
                      <PlusCircle className="w-4 h-4 mr-2" />
                      MCQ
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => addQuestion("theory")}>
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Theory
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {questions.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <p>No questions added yet. Click the buttons above to add questions.</p>
                  </div>
                ) : (
                  questions.map((question, index) => (
                    <Card key={question.id} className="border-2">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Badge>Question {index + 1}</Badge>
                            <Badge variant="secondary">
                              {question.type === "mcq" ? "Multiple Choice" : "Theory"}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteQuestion(question.id)}
                          >
                            <Trash className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Question Text *</Label>
                          <Textarea
                            placeholder="Enter your question here"
                            value={question.text}
                            onChange={(e) => updateQuestion(question.id, "text", e.target.value)}
                            rows={3}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Marks *</Label>
                          <Input
                            type="number"
                            value={question.marks}
                            onChange={(e) =>
                              updateQuestion(question.id, "marks", parseInt(e.target.value))
                            }
                            className="w-32"
                          />
                        </div>

                        {question.type === "mcq" && (
                          <div className="space-y-3">
                            <Label>Options</Label>
                            {question.options?.map((option: any) => (
                              <div key={option.id} className="flex items-start gap-3">
                                <div className="flex items-center h-10">
                                  <input
                                    type="radio"
                                    name={`correct-${question.id}`}
                                    checked={option.isCorrect}
                                    onChange={() => {
                                      question.options.forEach((opt: any) => {
                                        updateOption(question.id, opt.id, "isCorrect", opt.id === option.id);
                                      });
                                    }}
                                    className="w-4 h-4"
                                  />
                                </div>
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sm w-8">{option.label}.</span>
                                    <Input
                                      placeholder="Option text"
                                      value={option.text}
                                      onChange={(e) =>
                                        updateOption(question.id, option.id, "text", e.target.value)
                                      }
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                            <p className="text-xs text-slate-500">
                              Select the radio button to mark the correct answer
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep("details")}>
                Back
              </Button>
              <Button onClick={() => setCurrentStep("preview")}>
                Preview Exam
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Exam Preview</CardTitle>
                <CardDescription>Review your exam before publishing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-6 bg-slate-50 rounded-lg space-y-3">
                  <h3 className="text-2xl font-bold">{examData.title || "Untitled Exam"}</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Duration: {examData.duration} mins</Badge>
                    <Badge variant="secondary">Total Marks: {totalMarks}</Badge>
                    <Badge variant="secondary">Questions: {questions.length}</Badge>
                  </div>
                  {examData.description && (
                    <p className="text-slate-600">{examData.description}</p>
                  )}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                    <p className="font-semibold text-sm text-blue-900 mb-1">Instructions:</p>
                    <p className="text-sm text-blue-700">{examData.instructions}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <Card key={question.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge>Question {index + 1}</Badge>
                          <Badge className="bg-blue-100 text-blue-700">{question.marks} marks</Badge>
                        </div>
                        <p className="font-semibold mb-4">{question.text || "No question text"}</p>
                        {question.type === "mcq" && question.options && (
                          <div className="space-y-2">
                            {question.options.map((option: any) => (
                              <div
                                key={option.id}
                                className={`p-3 border rounded ${
                                  option.isCorrect ? "bg-green-50 border-green-200" : ""
                                }`}
                              >
                                <span className="font-semibold mr-2">{option.label}.</span>
                                {option.text || "No option text"}
                                {option.isCorrect && (
                                  <Badge className="ml-2 bg-green-600">Correct</Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        {question.type === "theory" && (
                          <div className="p-4 bg-slate-50 rounded text-sm text-slate-600">
                            Theory question - Students will write their answer here
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep("questions")}>
                Back to Questions
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSaveDraft}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
                </Button>
                <Button onClick={handlePublish} className="bg-green-600 hover:bg-green-700">
                  Publish Exam
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
