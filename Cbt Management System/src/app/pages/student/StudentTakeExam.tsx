import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
import { Badge } from "../../components/ui/badge";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { 
  Clock, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  Flag, 
  CheckCircle,
  Save,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { toast } from "sonner";

export function StudentTakeExam() {
  const { examId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState(3600); // 60 minutes in seconds
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [attemptId, setAttemptId] = useState<number | null>(null);

  // Mock exam data - will be replaced with API calls
  // Start: POST /api/cbt/exams/{exam_id}/start
  // Fetch questions: GET /api/cbt/attempts/{attempt_id}/questions
  // Resume: GET /api/cbt/attempts/{attempt_id}/resume
  const exam = {
    id: examId,
    title: "Mathematics Mid-Term Exam",
    duration: 60,
    totalMarks: 50,
    questions: [
      {
        id: 1,
        type: "mcq",
        text: "What is the value of π (pi) approximately?",
        marks: 2,
        options: [
          { id: 1, label: "A", text: "3.14", isCorrect: true },
          { id: 2, label: "B", text: "2.71", isCorrect: false },
          { id: 3, label: "C", text: "1.62", isCorrect: false },
          { id: 4, label: "D", text: "4.13", isCorrect: false },
        ],
      },
      {
        id: 2,
        type: "mcq",
        text: "Solve for x: 2x + 5 = 15",
        marks: 2,
        options: [
          { id: 5, label: "A", text: "x = 5", isCorrect: true },
          { id: 6, label: "B", text: "x = 10", isCorrect: false },
          { id: 7, label: "C", text: "x = 7.5", isCorrect: false },
          { id: 8, label: "D", text: "x = 3", isCorrect: false },
        ],
      },
      {
        id: 3,
        type: "theory",
        text: "Explain the Pythagorean theorem and provide an example of its application.",
        marks: 5,
      },
      {
        id: 4,
        type: "mcq",
        text: "What is the derivative of x²?",
        marks: 2,
        options: [
          { id: 9, label: "A", text: "2x", isCorrect: true },
          { id: 10, label: "B", text: "x", isCorrect: false },
          { id: 11, label: "C", text: "x²", isCorrect: false },
          { id: 12, label: "D", text: "2", isCorrect: false },
        ],
      },
      {
        id: 5,
        type: "theory",
        text: "Calculate the area of a circle with radius 7 cm. Show your working.",
        marks: 3,
      },
    ],
  };

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Sync time every 30 seconds: POST /api/cbt/attempts/{attempt_id}/sync-time
    const syncTimer = setInterval(() => {
      if (attemptId) {
        console.log("Syncing time with server:", timeRemaining);
        // API call would go here
      }
    }, 30000);

    return () => {
      clearInterval(timer);
      clearInterval(syncTimer);
    };
  }, [attemptId, timeRemaining]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswer = (questionId: number, answer: any) => {
    setAnswers({ ...answers, [questionId]: answer });
    // Auto-save: POST /api/cbt/attempts/{attempt_id}/answers
    // Body: { question_id, selected_option_id (for MCQ), answer_text (for theory) }
    toast.success("Answer saved automatically");
  };

  const handleFlagQuestion = (questionId: number) => {
    const newFlagged = new Set(flaggedQuestions);
    if (newFlagged.has(questionId)) {
      newFlagged.delete(questionId);
    } else {
      newFlagged.add(questionId);
    }
    setFlaggedQuestions(newFlagged);
  };

  const handleAutoSubmit = () => {
    // POST /api/cbt/attempts/{attempt_id}/submit
    console.log("Time's up! Auto-submitting exam...");
    toast.error("Time's up! Your exam has been submitted automatically.");
    setTimeout(() => navigate("/student/results"), 2000);
  };

  const handleSubmit = () => {
    setShowSubmitDialog(true);
  };

  const confirmSubmit = () => {
    // POST /api/cbt/attempts/{attempt_id}/submit
    toast.success("Exam submitted successfully!");
    navigate("/student/results");
  };

  const question = exam.questions[currentQuestion];
  const answered = exam.questions.filter((q) => answers[q.id] !== undefined).length;
  const progress = (answered / exam.questions.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Fixed Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900">{exam.title}</h1>
              <p className="text-sm text-slate-600">Question {currentQuestion + 1} of {exam.questions.length}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                timeRemaining < 300 ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
              }`}>
                <Clock className="w-5 h-5" />
                <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
              </div>
              <Button 
                onClick={handleSubmit}
                className="bg-green-600 hover:bg-green-700"
              >
                Submit Exam
              </Button>
            </div>
          </div>
          <Progress value={progress} className="mt-4 h-2" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Question Panel */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardContent className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">Question {currentQuestion + 1}</Badge>
                      <Badge className="bg-blue-100 text-blue-700">{question.marks} marks</Badge>
                      {question.type === "theory" && (
                        <Badge className="bg-purple-100 text-purple-700">Theory</Badge>
                      )}
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900">{question.text}</h2>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFlagQuestion(question.id)}
                    className={flaggedQuestions.has(question.id) ? "text-orange-600" : ""}
                  >
                    <Flag className="w-5 h-5" fill={flaggedQuestions.has(question.id) ? "currentColor" : "none"} />
                  </Button>
                </div>

                {question.type === "mcq" ? (
                  <RadioGroup
                    value={answers[question.id]?.toString()}
                    onValueChange={(value) => handleAnswer(question.id, parseInt(value))}
                  >
                    <div className="space-y-3">
                      {question.options?.map((option) => (
                        <div
                          key={option.id}
                          className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                            answers[question.id] === option.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <RadioGroupItem value={option.id.toString()} id={`option-${option.id}`} className="mt-1" />
                          <Label
                            htmlFor={`option-${option.id}`}
                            className="flex-1 ml-3 cursor-pointer"
                          >
                            <span className="font-semibold text-slate-700 mr-2">{option.label}.</span>
                            <span className="text-slate-900">{option.text}</span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="theory-answer">Your Answer:</Label>
                    <Textarea
                      id="theory-answer"
                      placeholder="Type your answer here..."
                      value={answers[question.id] || ""}
                      onChange={(e) => handleAnswer(question.id, e.target.value)}
                      rows={10}
                      className="resize-none"
                    />
                    <p className="text-sm text-slate-500">
                      {answers[question.id]?.length || 0} characters
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <div className="text-sm text-slate-600">
                {answered} of {exam.questions.length} answered
              </div>
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion(Math.min(exam.questions.length - 1, currentQuestion + 1))}
                disabled={currentQuestion === exam.questions.length - 1}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Question Navigator */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Question Navigator</h3>
                <div className="grid grid-cols-5 gap-2">
                  {exam.questions.map((q, idx) => (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestion(idx)}
                      className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-colors relative ${
                        currentQuestion === idx
                          ? "bg-blue-600 text-white"
                          : answers[q.id] !== undefined
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {idx + 1}
                      {flaggedQuestions.has(q.id) && (
                        <Flag className="w-3 h-3 absolute -top-1 -right-1 text-orange-500" fill="currentColor" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-blue-600" />
                    <span>Current</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-100 border border-green-700" />
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-slate-100" />
                    <span>Not Answered</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Submit Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Exam?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Are you sure you want to submit your exam? This action cannot be undone.</p>
              <div className="bg-slate-50 p-4 rounded-lg space-y-1">
                <p className="font-semibold text-slate-900">Summary:</p>
                <p className="text-sm">Total Questions: {exam.questions.length}</p>
                <p className="text-sm">Answered: {answered}</p>
                <p className="text-sm">Unanswered: {exam.questions.length - answered}</p>
                <p className="text-sm">Flagged: {flaggedQuestions.size}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Review Answers</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSubmit} className="bg-green-600 hover:bg-green-700">
              Submit Exam
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
