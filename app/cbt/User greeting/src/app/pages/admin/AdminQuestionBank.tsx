import { useState } from "react";
import { DashboardLayout } from "../../components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { Search, PlusCircle, Edit, Trash, Download, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../../components/ui/dialog";
import { toast } from "sonner";

export function AdminQuestionBank() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Mock data - GET /api/cbt/question-bank
  const questions = [
    {
      id: 1,
      subject: "Mathematics",
      type: "mcq",
      text: "What is the value of π (pi) approximately?",
      marks: 2,
      difficulty: "easy",
      options: [
        { label: "A", text: "3.14", isCorrect: true },
        { label: "B", text: "2.71", isCorrect: false },
        { label: "C", text: "1.62", isCorrect: false },
        { label: "D", text: "4.13", isCorrect: false },
      ],
      usageCount: 12,
    },
    {
      id: 2,
      subject: "Physics",
      type: "mcq",
      text: "What is Newton's first law of motion?",
      marks: 2,
      difficulty: "medium",
      options: [
        { label: "A", text: "Force = Mass × Acceleration", isCorrect: false },
        { label: "B", text: "An object at rest stays at rest unless acted upon", isCorrect: true },
        { label: "C", text: "For every action there is an equal reaction", isCorrect: false },
        { label: "D", text: "Energy cannot be created or destroyed", isCorrect: false },
      ],
      usageCount: 8,
    },
    {
      id: 3,
      subject: "Chemistry",
      type: "theory",
      text: "Explain the process of photosynthesis and its importance.",
      marks: 5,
      difficulty: "hard",
      usageCount: 5,
    },
  ];

  const subjects = ["all", "Mathematics", "Physics", "Chemistry", "Biology", "English"];

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = filterSubject === "all" || q.subject === filterSubject;
    return matchesSearch && matchesSubject;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "hard":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Question Bank</h1>
            <p className="text-slate-600 mt-1">Manage your reusable question repository</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Add New Question</DialogTitle>
                  <DialogDescription>Create a new question for the question bank</DialogDescription>
                </DialogHeader>
                <AddQuestionForm onClose={() => setShowAddDialog(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-slate-600">Total Questions</p>
              <p className="text-3xl font-bold mt-1">{questions.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-slate-600">MCQ</p>
              <p className="text-3xl font-bold mt-1">
                {questions.filter((q) => q.type === "mcq").length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-slate-600">Theory</p>
              <p className="text-3xl font-bold mt-1">
                {questions.filter((q) => q.type === "theory").length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-slate-600">Subjects</p>
              <p className="text-3xl font-bold mt-1">{subjects.length - 1}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filterSubject} onValueChange={setFilterSubject}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject === "all" ? "All Subjects" : subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Questions List */}
        <div className="space-y-4">
          {filteredQuestions.map((question) => (
            <Card key={question.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{question.subject}</Badge>
                      <Badge className={getDifficultyColor(question.difficulty)}>
                        {question.difficulty}
                      </Badge>
                      <Badge variant="outline">
                        {question.type === "mcq" ? "Multiple Choice" : "Theory"}
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-700">{question.marks} marks</Badge>
                    </div>
                    <p className="font-semibold text-lg">{question.text}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>

                {question.type === "mcq" && question.options && (
                  <div className="grid md:grid-cols-2 gap-2 mt-4">
                    {question.options.map((option) => (
                      <div
                        key={option.label}
                        className={`p-3 border rounded ${
                          option.isCorrect ? "bg-green-50 border-green-200" : "bg-slate-50"
                        }`}
                      >
                        <span className="font-semibold mr-2">{option.label}.</span>
                        {option.text}
                        {option.isCorrect && (
                          <Badge className="ml-2 bg-green-600">Correct</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm text-slate-600">
                  <span>Used in {question.usageCount} exams</span>
                  <Button variant="outline" size="sm">
                    Add to Exam
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

function AddQuestionForm({ onClose }: { onClose: () => void }) {
  const [questionType, setQuestionType] = useState("mcq");

  const handleSubmit = () => {
    // POST /api/cbt/question-bank
    toast.success("Question added to bank");
    onClose();
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Question Type</Label>
        <RadioGroup value={questionType} onValueChange={setQuestionType}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="mcq" id="mcq" />
            <Label htmlFor="mcq">Multiple Choice</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="theory" id="theory" />
            <Label htmlFor="theory">Theory</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label>Subject</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="math">Mathematics</SelectItem>
            <SelectItem value="physics">Physics</SelectItem>
            <SelectItem value="chemistry">Chemistry</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Question Text</Label>
        <Textarea placeholder="Enter your question" rows={4} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Marks</Label>
          <Input type="number" placeholder="2" />
        </div>
        <div className="space-y-2">
          <Label>Difficulty</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {questionType === "mcq" && (
        <div className="space-y-3">
          <Label>Options</Label>
          {["A", "B", "C", "D"].map((label) => (
            <div key={label} className="flex items-center gap-2">
              <input type="radio" name="correct" className="w-4 h-4" />
              <span className="font-semibold w-8">{label}.</span>
              <Input placeholder={`Option ${label}`} />
            </div>
          ))}
          <p className="text-xs text-slate-500">Select the radio button for the correct answer</p>
        </div>
      )}

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
          Add Question
        </Button>
      </DialogFooter>
    </div>
  );
}
