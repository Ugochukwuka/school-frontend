import React, { useState } from "react";
import { DashboardLayout } from "../../components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Checkbox } from "../../components/ui/checkbox";
import { 
  PlusCircle,
  Search,
  Filter,
  BookOpen,
  Edit,
  Trash2,
  Download,
  Upload,
  CheckCircle,
} from "lucide-react";

interface Question {
  id: number;
  subject: string;
  topic: string;
  questionType: "mcq" | "theory";
  questionText: string;
  difficulty: "easy" | "medium" | "hard";
  marks: number;
  options?: { label: string; text: string; isCorrect: boolean }[];
  usageCount: number;
}

export function TeacherQuestionBank() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);

  const subjects = [
    { id: "1", name: "Mathematics" },
    { id: "2", name: "Physics" },
    { id: "3", name: "Chemistry" },
    { id: "4", name: "Biology" },
  ];

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      subject: "Mathematics",
      topic: "Algebra",
      questionType: "mcq",
      questionText: "What is the value of x if 2x + 5 = 15?",
      difficulty: "easy",
      marks: 2,
      options: [
        { label: "A", text: "3", isCorrect: false },
        { label: "B", text: "5", isCorrect: true },
        { label: "C", text: "7", isCorrect: false },
        { label: "D", text: "10", isCorrect: false },
      ],
      usageCount: 12,
    },
    {
      id: 2,
      subject: "Mathematics",
      topic: "Geometry",
      questionType: "theory",
      questionText: "Prove that the sum of angles in a triangle equals 180 degrees.",
      difficulty: "medium",
      marks: 10,
      usageCount: 8,
    },
    {
      id: 3,
      subject: "Physics",
      topic: "Mechanics",
      questionType: "mcq",
      questionText: "What is the SI unit of force?",
      difficulty: "easy",
      marks: 1,
      options: [
        { label: "A", text: "Joule", isCorrect: false },
        { label: "B", text: "Newton", isCorrect: true },
        { label: "C", text: "Watt", isCorrect: false },
        { label: "D", text: "Pascal", isCorrect: false },
      ],
      usageCount: 15,
    },
  ]);

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         q.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = !selectedSubject || q.subject === selectedSubject;
    const matchesDifficulty = !selectedDifficulty || q.difficulty === selectedDifficulty;
    const matchesType = !selectedType || q.questionType === selectedType;
    
    return matchesSearch && matchesSubject && matchesDifficulty && matchesType;
  });

  const toggleQuestionSelection = (id: number) => {
    setSelectedQuestions(prev =>
      prev.includes(id) ? prev.filter(qId => qId !== id) : [...prev, id]
    );
  };

  const selectAllQuestions = () => {
    if (selectedQuestions.length === filteredQuestions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(filteredQuestions.map(q => q.id));
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return <Badge className="bg-green-100 text-green-700">Easy</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-700">Medium</Badge>;
      case "hard":
        return <Badge className="bg-red-100 text-red-700">Hard</Badge>;
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    return type === "mcq" 
      ? <Badge variant="secondary">MCQ</Badge>
      : <Badge variant="secondary">Theory</Badge>;
  };

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Question Bank</h1>
            <p className="text-slate-600 mt-1">Create and manage your question repository</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => setShowAddModal(true)}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Questions</p>
                  <p className="text-3xl font-bold mt-1">{questions.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-100">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">MCQ Questions</p>
                  <p className="text-3xl font-bold mt-1">
                    {questions.filter(q => q.questionType === "mcq").length}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-green-100">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Theory Questions</p>
                  <p className="text-3xl font-bold mt-1">
                    {questions.filter(q => q.questionType === "theory").length}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-purple-100">
                  <Edit className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Selected</p>
                  <p className="text-3xl font-bold mt-1">{selectedQuestions.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-orange-100">
                  <Filter className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.name}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="All Difficulties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Difficulties</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="mcq">MCQ</SelectItem>
                  <SelectItem value="theory">Theory</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Selected Actions */}
        {selectedQuestions.length > 0 && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-blue-900">
                  {selectedQuestions.length} question(s) selected
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="bg-white">
                    <Download className="w-4 h-4 mr-2" />
                    Export Selected
                  </Button>
                  <Button size="sm" variant="outline" className="bg-white">
                    Add to Exam
                  </Button>
                  <Button size="sm" variant="outline" className="bg-white text-red-600">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Selected
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Questions List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Questions</CardTitle>
                <CardDescription>
                  {filteredQuestions.length} question(s) found
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={selectAllQuestions}>
                {selectedQuestions.length === filteredQuestions.length ? "Deselect All" : "Select All"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredQuestions.map((question) => (
                <div
                  key={question.id}
                  className={`p-4 border rounded-lg transition-colors ${
                    selectedQuestions.includes(question.id) ? 'bg-blue-50 border-blue-300' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={selectedQuestions.includes(question.id)}
                      onCheckedChange={() => toggleQuestionSelection(question.id)}
                      className="mt-1"
                    />
                    
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{question.subject}</Badge>
                            <Badge variant="outline">{question.topic}</Badge>
                            {getTypeBadge(question.questionType)}
                            {getDifficultyBadge(question.difficulty)}
                            <Badge variant="secondary">{question.marks} marks</Badge>
                          </div>
                          <p className="font-medium text-slate-900">{question.questionText}</p>
                        </div>
                        
                        <div className="flex gap-1 ml-4">
                          <Button size="sm" variant="ghost">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {question.questionType === "mcq" && question.options && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-4 border-l-2 border-slate-200">
                          {question.options.map((option) => (
                            <div
                              key={option.label}
                              className={`p-2 rounded text-sm ${
                                option.isCorrect 
                                  ? 'bg-green-50 border border-green-200 font-medium' 
                                  : 'bg-slate-50'
                              }`}
                            >
                              <span className="font-semibold">{option.label}.</span> {option.text}
                              {option.isCorrect && (
                                <CheckCircle className="w-4 h-4 inline ml-2 text-green-600" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>Used in {question.usageCount} exams</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredQuestions.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500">No questions found</p>
                <Button className="mt-4" onClick={() => setShowAddModal(true)}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Your First Question
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
