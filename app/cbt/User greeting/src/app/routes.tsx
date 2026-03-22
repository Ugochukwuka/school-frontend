import React from "react";
import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/layouts/RootLayout";
import { HomePage } from "./pages/HomePage";
import { StudentDashboard } from "./pages/student/StudentDashboard";
import { StudentExamList } from "./pages/student/StudentExamList";
import { StudentTakeExam } from "./pages/student/StudentTakeExam";
import { StudentResults } from "./pages/student/StudentResults";
import { TeacherDashboard } from "./pages/teacher/TeacherDashboard";
import { TeacherExamList } from "./pages/teacher/TeacherExamList";
import { TeacherCreateExam } from "./pages/teacher/TeacherCreateExam";
import { TeacherExamDetails } from "./pages/teacher/TeacherExamDetails";
import { TeacherMarkTheory } from "./pages/teacher/TeacherMarkTheory";
import { TeacherAttendance } from "./pages/teacher/TeacherAttendance";
import { TeacherResultsManagement } from "./pages/teacher/TeacherResultsManagement";
import { TeacherClasses } from "./pages/teacher/TeacherClasses";
import { TeacherQuestionBank } from "./pages/teacher/TeacherQuestionBank";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminSettings } from "./pages/admin/AdminSettings";
import { AdminQuestionBank } from "./pages/admin/AdminQuestionBank";
import { AdminReports } from "./pages/admin/AdminReports";
import { ParentDashboard } from "./pages/parent/ParentDashboard";
import { ParentChildResults } from "./pages/parent/ParentChildResults";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      
      // Student Routes
      {
        path: "student",
        children: [
          { index: true, element: <StudentDashboard /> },
          { path: "exams", element: <StudentExamList /> },
          { path: "exam/:examId", element: <StudentTakeExam /> },
          { path: "results", element: <StudentResults /> },
        ],
      },
      
      // Teacher Routes
      {
        path: "teacher",
        children: [
          { index: true, element: <TeacherDashboard /> },
          { path: "exams", element: <TeacherExamList /> },
          { path: "exams/create", element: <TeacherCreateExam /> },
          { path: "exams/:examId", element: <TeacherExamDetails /> },
          { path: "exams/:examId/mark", element: <TeacherMarkTheory /> },
          { path: "attendance", element: <TeacherAttendance /> },
          { path: "results", element: <TeacherResultsManagement /> },
          { path: "classes", element: <TeacherClasses /> },
          { path: "question-bank", element: <TeacherQuestionBank /> },
        ],
      },
      
      // Admin Routes
      {
        path: "admin",
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: "settings", element: <AdminSettings /> },
          { path: "question-bank", element: <AdminQuestionBank /> },
          { path: "reports", element: <AdminReports /> },
        ],
      },
      
      // Parent Routes
      {
        path: "parent",
        children: [
          { index: true, element: <ParentDashboard /> },
          { path: "child/:studentUuid", element: <ParentChildResults /> },
        ],
      },
      
      { path: "*", element: <NotFound /> },
    ],
  },
]);