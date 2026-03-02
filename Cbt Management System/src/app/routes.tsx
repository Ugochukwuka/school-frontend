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
    Component: RootLayout,
    children: [
      { index: true, Component: HomePage },
      
      // Student Routes
      {
        path: "student",
        children: [
          { index: true, Component: StudentDashboard },
          { path: "exams", Component: StudentExamList },
          { path: "exam/:examId", Component: StudentTakeExam },
          { path: "results", Component: StudentResults },
        ],
      },
      
      // Teacher Routes
      {
        path: "teacher",
        children: [
          { index: true, Component: TeacherDashboard },
          { path: "exams", Component: TeacherExamList },
          { path: "exams/create", Component: TeacherCreateExam },
          { path: "exams/:examId", Component: TeacherExamDetails },
          { path: "exams/:examId/mark", Component: TeacherMarkTheory },
        ],
      },
      
      // Admin Routes
      {
        path: "admin",
        children: [
          { index: true, Component: AdminDashboard },
          { path: "settings", Component: AdminSettings },
          { path: "question-bank", Component: AdminQuestionBank },
          { path: "reports", Component: AdminReports },
        ],
      },
      
      // Parent Routes
      {
        path: "parent",
        children: [
          { index: true, Component: ParentDashboard },
          { path: "child/:studentUuid", Component: ParentChildResults },
        ],
      },
      
      { path: "*", Component: NotFound },
    ],
  },
]);
