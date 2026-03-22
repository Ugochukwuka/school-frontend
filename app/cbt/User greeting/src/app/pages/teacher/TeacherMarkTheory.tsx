import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { DashboardLayout } from "../../components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { Save, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export function TeacherMarkTheory() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [marks, setMarks] = useState<Record<number, { mark: number; remark: string }>>({});

  // Mock data - GET /api/cbt/exams/{exam_id}/attempts with filter for theory answers
  const submissions = [
    {
      attemptId: 1,
      studentName: "John Doe",
      studentId: "STU001",
      questions: [
        {
          id: 3,
          text: "Explain the Pythagorean theorem and provide an example of its application.",
          marks: 5,
          answer: "The Pythagorean theorem states that in a right-angled triangle, the square of the hypotenuse is equal to the sum of squares of the other two sides (a² + b² = c²). For example, if a triangle has sides of 3cm and 4cm, the hypotenuse would be 5cm because 3² + 4² = 9 + 16 = 25 = 5².",
        },
        {
          id: 5,
          text: "Calculate the area of a circle with radius 7 cm. Show your working.",
          marks: 3,
          answer: "Area = πr²\nArea = π × 7²\nArea = π × 49\nArea = 153.94 cm² (approximately)",
        },
      ],
    },
    {
      attemptId: 2,
      studentName: "Jane Smith",
      studentId: "STU002",
      questions: [
        {
          id: 3,
          text: "Explain the Pythagorean theorem and provide an example of its application.",
          marks: 5,
          answer: "Pythagorean theorem is about triangles. It says a² + b² = c².",
        },
        {
          id: 5,
          text: "Calculate the area of a circle with radius 7 cm. Show your working.",
          marks: 3,
          answer: "Area = πr² = 3.14 × 7 × 7 = 153.86 cm²",
        },
      ],
    },
  ];

  const currentSubmission = submissions[currentIndex];
  const totalSubmissions = submissions.length;
  const markedCount = Object.keys(marks).length;

  const handleMarkQuestion = (questionId: number, mark: number, remark: string) => {
    setMarks({ ...marks, [questionId]: { mark, remark } });
  };

  const handleSave = () => {
    // POST /api/cbt/attempts/{attempt_id}/mark-theory
    // Body: { marks: [{ question_id, mark_awarded, remark }] }
    toast.success("Marks saved successfully");
  };

  const handleSaveAndNext = () => {
    handleSave();
    if (currentIndex < totalSubmissions - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      toast.success("All submissions marked!");
      navigate("/teacher/exams");
    }
  };

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6 max-w-5xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Mark Theory Questions</h1>
          <p className="text-slate-600 mt-1">Review and grade student submissions</p>
        </div>

        {/* Progress */}
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

        {/* Student Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{currentSubmission.studentName}</CardTitle>
                <CardDescription>Student ID: {currentSubmission.studentId}</CardDescription>
              </div>
              <Badge className="bg-blue-100 text-blue-700">
                {currentSubmission.questions.length} Theory Questions
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Questions */}
        <div className="space-y-6">
          {currentSubmission.questions.map((question, idx) => (
            <Card key={question.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Question {idx + 1}</CardTitle>
                    <CardDescription>Maximum marks: {question.marks}</CardDescription>
                  </div>
                  {marks[question.id] && (
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
                  <p className="text-slate-900">{question.text}</p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="font-semibold text-sm text-blue-900 mb-2">Student's Answer:</p>
                  <p className="text-blue-800 whitespace-pre-wrap">{question.answer}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor={`mark-${question.id}`}>
                      Award Marks (out of {question.marks})
                    </Label>
                    <Input
                      id={`mark-${question.id}`}
                      type="number"
                      min="0"
                      max={question.marks}
                      value={marks[question.id]?.mark || ""}
                      onChange={(e) =>
                        handleMarkQuestion(
                          question.id,
                          parseFloat(e.target.value),
                          marks[question.id]?.remark || ""
                        )
                      }
                      placeholder="Enter marks"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`remark-${question.id}`}>Remark (Optional)</Label>
                    <Textarea
                      id={`remark-${question.id}`}
                      value={marks[question.id]?.remark || ""}
                      onChange={(e) =>
                        handleMarkQuestion(
                          question.id,
                          marks[question.id]?.mark || 0,
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

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous Student
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Progress
            </Button>
            <Button
              onClick={handleSaveAndNext}
              className="bg-green-600 hover:bg-green-700"
            >
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
    </DashboardLayout>
  );
}
