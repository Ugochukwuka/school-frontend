"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Search, PlusCircle, FileText } from "lucide-react";

const questions = [
  { id: 1, subject: "Mathematics", type: "mcq", text: "What is the value of π (pi) approximately?", marks: 2, difficulty: "easy", usageCount: 12 },
  { id: 2, subject: "Physics", type: "mcq", text: "What is Newton's first law of motion?", marks: 2, difficulty: "medium", usageCount: 8 },
  { id: 3, subject: "Chemistry", type: "theory", text: "Explain the process of photosynthesis and its importance.", marks: 5, difficulty: "hard", usageCount: 5 },
];

const subjects = ["all", "Mathematics", "Physics", "Chemistry", "Biology", "English"];

export default function AdminQuestionBankPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = filterSubject === "all" || q.subject === filterSubject;
    return matchesSearch && matchesSubject;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-700";
      case "medium": return "bg-yellow-100 text-yellow-700";
      case "hard": return "bg-red-100 text-red-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Question Bank</h1>
          <p className="text-slate-600 mt-1">Manage questions (use cbtAdmin.listQuestionBank, createQuestionBank)</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Question
        </Button>
      </div>

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
                {subjects.map((s) => (
                  <SelectItem key={s} value={s}>{s === "all" ? "All Subjects" : s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredQuestions.map((q) => (
          <Card key={q.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{q.subject}</Badge>
                    <Badge className={getDifficultyColor(q.difficulty)}>{q.difficulty}</Badge>
                    <Badge variant="outline">{q.type}</Badge>
                    <span className="text-sm text-slate-500">{q.marks} marks · Used {q.usageCount} times</span>
                  </div>
                  <p className="text-slate-900 font-medium">{q.text}</p>
                </div>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredQuestions.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No questions found</h3>
            <p className="text-slate-600">Add questions to the bank or adjust filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
