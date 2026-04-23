/**
 * CBT (Computer-Based Testing) API client.
 * Mirrors endpoints from the Postman collection. Uses existing api instance (Bearer token, base URL).
 * Response shape: response.data, response.message, response.status; errors: response.message, response.errors (422).
 */
import api from "./api";

const CBT = "/cbt";

export interface AvailableExamDto {
  id: number;
  title?: string;
  name?: string;
  description?: string;
  duration_minutes?: number;
  total_marks?: number;
  start_time?: string;
  end_time?: string;
  is_locked?: boolean;
  can_start_now?: boolean;
  start_blocked_reason?: string | null;
  subject?: { id?: number; name?: string; code?: string };
}

// --- Student ---
export const cbtStudent = {
  getAvailableExams: (params?: { subject_id?: number }) =>
    api.get(`${CBT}/exams/available`, { params }),

  startExam: (examId: number) =>
    api.post(`${CBT}/exams/${examId}/start`),

  getAttemptQuestions: (attemptId: number) =>
    api.get(`${CBT}/attempts/${attemptId}/questions`),

  resumeAttempt: (attemptId: number) =>
    api.get(`${CBT}/attempts/${attemptId}/resume`),

  saveAnswers: (attemptId: number, body: { question_id: number; selected_option_id?: number; answer_text?: string }) =>
    api.post(`${CBT}/attempts/${attemptId}/answers`, body),

  submitAttempt: (attemptId: number) =>
    api.post(`${CBT}/attempts/${attemptId}/submit`),

  syncTime: (attemptId: number, body: { remaining_seconds: number }) =>
    api.post(`${CBT}/attempts/${attemptId}/sync-time`, body),

  logEvent: (attemptId: number, body: { event_type: string; metadata?: Record<string, unknown> }) =>
    api.post(`${CBT}/attempts/${attemptId}/event`, body),

  getAttemptStatus: (attemptId: number) =>
    api.get(`${CBT}/attempts/${attemptId}/status`),

  getOptionsWithCorrect: (attemptId: number) =>
    api.get(`${CBT}/attempts/${attemptId}/options-with-correct`),

  getResult: (examId: number) =>
    api.get(`${CBT}/results/${examId}`),

  getResultHistory: () =>
    api.get(`${CBT}/results/history`),
};

// --- Teacher ---
export const cbtTeacher = {
  createExam: (body: {
    class_id: number;
    subject_id: number;
    title: string;
    description?: string;
    instructions?: string;
    duration_minutes: number;
    total_marks: number;
    start_time: string;
    end_time: string;
  }) => api.post(`${CBT}/exams`, body),

  updateExam: (examId: number, body: Record<string, unknown>) =>
    api.put(`${CBT}/exams/${examId}`, body),

  getExam: (examId: number) =>
    api.get(`${CBT}/exams/${examId}`),

  deleteExam: (examId: number) =>
    api.delete(`${CBT}/exams/${examId}`),

  publishExam: (examId: number) =>
    api.post(`${CBT}/exams/${examId}/publish`),

  unpublishExam: (examId: number) =>
    api.post(`${CBT}/exams/${examId}/unpublish`),

  cloneExam: (examId: number) =>
    api.post(`${CBT}/exams/${examId}/clone`),

  previewExam: (examId: number) =>
    api.get(`${CBT}/exams/${examId}/preview`),

  getExamAttempts: (examId: number) =>
    api.get(`${CBT}/exams/${examId}/attempts`),

  addQuestions: (examId: number, body: { questions: Array<Record<string, unknown>> }) =>
    api.post(`${CBT}/exams/${examId}/questions`, body),

  importQuestions: (examId: number, body: { bank_question_ids: number[] }) =>
    api.post(`${CBT}/exams/${examId}/questions/import`, body),

  updateQuestion: (questionId: number, body: Record<string, unknown>) =>
    api.put(`${CBT}/questions/${questionId}`, body),

  deleteQuestion: (questionId: number) =>
    api.delete(`${CBT}/questions/${questionId}`),

  addOption: (questionId: number, body: { option_label: string; option_text: string; is_correct: boolean }) =>
    api.post(`${CBT}/questions/${questionId}/options`, body),

  updateOption: (optionId: number, body: Record<string, unknown>) =>
    api.put(`${CBT}/options/${optionId}`, body),

  deleteOption: (optionId: number) =>
    api.delete(`${CBT}/options/${optionId}`),

  getAttempt: (attemptId: number) =>
    api.get(`${CBT}/attempts/${attemptId}`),

  markTheory: (attemptId: number, body: { marks: Array<{ question_id: number; mark_awarded: number; remark?: string }> }) =>
    api.post(`${CBT}/attempts/${attemptId}/mark-theory`, body),
};

/** Teacher: list question bank (for import into exam). Uses same endpoint as admin; backend may scope by role. */
export const cbtTeacherListQuestionBank = (params?: { school_id?: number; subject_id?: number }) =>
  api.get(`${CBT}/question-bank`, { params });

// Teacher: get single exam — GET /teacher/exams/:id (avoids CbtTeacherController::authorize error)
export const getTeacherExam = (examId: number) =>
  api.get<{
    status: boolean;
    message?: string;
    data?: {
      id: number;
      title: string;
      description?: string;
      instructions?: string;
      duration_minutes: number;
      total_marks: number;
      start_time?: string;
      end_time?: string;
      published_at?: string | null;
      status?: string;
      subject?: { id: number; name: string };
      class_level?: { id: number; name: string; arm?: string };
      questions?: Array<{
        id: number;
        question_type?: string;
        question_text?: string;
        marks?: number;
        options?: Array<{ id: number; option_label?: string; option_text?: string; is_correct?: boolean }>;
      }>;
    };
  }>(`/teacher/exams/${examId}`);

// Teacher: list my exams — GET /teacher/exams (paginated)
export const cbtTeacherListExams = (params?: { page?: number; per_page?: number }) =>
  api.get<{
    status: boolean;
    message: string;
    type: string;
    data: {
      current_page: number;
      data: Array<{
        id: number;
        title: string;
        description?: string;
        duration_minutes: number;
        total_marks: number;
        start_time: string;
        end_time: string;
        published_at: string | null;
        status: string;
        is_locked?: boolean;
        subject?: { id: number; name: string };
        class_level?: { id: number; name: string; arm?: string };
        creator?: { id: number; name: string; email: string };
      }>;
      first_page_url: string;
      from: number;
      last_page: number;
      last_page_url: string;
      links: Array<{ url: string | null; label: string; page: number | null; active: boolean }>;
      next_page_url: string | null;
      path: string;
      per_page: number;
      prev_page_url: string | null;
      to: number;
      total: number;
    };
  }>("/teacher/exams", { params });

/** Teacher's class–subject assignments (GET /teacher/subjects). Used for CBT create exam: classes dropdown only. */
export const getTeacherSubjects = (sessionId: number) =>
  api.get<{ data?: Array<{ class?: { id: number; name: string; arm?: string }; subject?: unknown }> }>(
    "/teacher/subjects",
    { params: { session_id: sessionId } }
  );

/** Subjects taught by teacher in a class (GET /admin/classes/:classId/subjectsbyteacher). Used for CBT create exam: subjects dropdown. */
export const getSubjectsByTeacherForClass = (classId: number, teacherUuid: string) =>
  api.get<{
    status?: string;
    subjects?: Array<{ subject_id: number; subject_name: string; subject_code?: string }>;
  }>(`/admin/classes/${classId}/subjectsbyteacher`, {
    params: { teacher_uuid: teacherUuid },
  });

// --- Admin ---
/** List all schools for admin (GET /admin/schools). Response: { data: School[] }. */
export interface AdminSchool {
  id: number;
  uuid?: string;
  name: string;
  address?: string;
  phone?: string;
  status?: string;
  created_at?: string;
}
export const getAdminSchools = () =>
  api.get<{ data?: Array<AdminSchool | { id: number; name?: string; school_name?: string }> }>("/admin/schools");

/** List exams for a school (GET /admin/schools/:school_id/exams). Response: { school_id, school_name, exams, count }. */
export const getAdminSchoolExams = (schoolId: number | string) =>
  api.get<{ school_id: number; school_name?: string; exams?: Array<{ id: number; title?: string; [k: string]: unknown }>; count?: number }>(
    `/admin/schools/${schoolId}/exams`
  );

export const cbtAdmin = {
  getSettings: (params?: { school_id?: number | string }) =>
    api.get(`${CBT}/settings`, { params }),

  saveSettings: (body: {
    school_id?: number | string;
    shuffle_questions?: boolean;
    shuffle_options?: boolean;
    autosave_interval_seconds?: number;
    max_attempts?: number;
    allow_late_entry?: boolean;
    show_results_immediately?: boolean;
  }) => api.post(`${CBT}/settings`, body),

  sync: (body?: { school_id?: number }) =>
    api.post(`${CBT}/sync`, body ?? {}),

  lockExam: (examId: number) =>
    api.post(`${CBT}/exams/${examId}/lock`),

  unlockExam: (examId: number) =>
    api.post(`${CBT}/exams/${examId}/unlock`),

  getAnalytics: (params?: { school_id?: number }) =>
    api.get(`${CBT}/analytics`, { params }),

  getReports: (params?: { school_id?: number; exam_id?: number }) =>
    api.get(`${CBT}/reports`, { params }),

  exportExamResults: (examId: number, format: "csv" | "pdf" = "csv") =>
    api.get(`${CBT}/exams/${examId}/export`, { params: { format }, responseType: format === "pdf" ? "blob" : "json" }),

  exportReportsSummary: (params?: { school_id?: number }) =>
    api.get(`${CBT}/reports/export`, { params, responseType: "blob" }),

  listQuestionBank: (params?: { school_id?: number; subject_id?: number }) =>
    api.get(`${CBT}/question-bank`, { params }),

  createQuestionBank: (body: {
    subject_id: number;
    question_type: string;
    question_text: string;
    marks: number;
    options?: Array<{ option_label: string; option_text: string; is_correct: boolean }>;
  }) => api.post(`${CBT}/question-bank`, body),

  updateQuestionBank: (questionBankId: number, body: Record<string, unknown>) =>
    api.put(`${CBT}/question-bank/${questionBankId}`, body),

  deleteQuestionBank: (questionBankId: number) =>
    api.delete(`${CBT}/question-bank/${questionBankId}`),
};

// Admin: list all exams (use same GET /cbt/exams as teacher for list; backend may scope by role)
export const cbtAdminListExams = (params?: { school_id?: number }) =>
  api.get(`${CBT}/exams`, { params });

// --- Parent (use student_uuid in path) ---
export const cbtParent = {
  getChildHistory: (studentUuid: string) =>
    api.get(`${CBT}/parent/${studentUuid}/history`),

  getChildUpcomingExams: (studentUuid: string) =>
    api.get(`${CBT}/parent/${studentUuid}/exams`),

  getChildLiveStatus: (studentUuid: string) =>
    api.get(`${CBT}/parent/${studentUuid}/live-status`),

  getChildNotifications: (studentUuid: string) =>
    api.get(`${CBT}/parent/${studentUuid}/notifications`),

  getChildResult: (studentUuid: string, examId: number) =>
    api.get(`${CBT}/parent/${studentUuid}/results/${examId}`),
};

export default {
  student: cbtStudent,
  teacher: cbtTeacher,
  teacherListExams: cbtTeacherListExams,
  admin: cbtAdmin,
  adminListExams: cbtAdminListExams,
  parent: cbtParent,
};
