# CBT (Next.js App Router)

This folder is the **CBT dashboard UI** inside the School ERP Next.js app. It is **isolated** from the main dashboard: it uses its own layout, sidebar, and routes.

## Routes

- **Landing (role selector):** `/cbt`
- **Login:** `/cbt/login` — sign in, then redirect by role (student / teacher / admin / parent)

**CBT Login via API (for emails, bookmarks, external links):**  
Use the backend redirect endpoint so the server can redirect to the CBT login page.

- **Endpoint:** `GET /api/cbt/login`. Full URL example: `https://your-api-domain.com/api/cbt/login` or `http://localhost:8000/api/cbt/login`.
- **Expected behavior:** No request body. No auth headers required. Server responds with HTTP 302 and a Location header. Redirect target: `{CBT_FRONTEND_URL}/cbt/login` (e.g. `https://your-nextjs-app.com/cbt/login`).
- **In the frontend:** The CBT home page “Login to CBT” button uses `getCbtLoginApiUrl()` from `cbt-urls.ts` (builds URL from `NEXT_PUBLIC_BACKEND_URL`).
- **Redirect in code:** `window.location.href = getCbtLoginApiUrl()` or `window.location.href = \`${API_BASE_URL}/api/cbt/login\``
- **Summary:** Call `GET {API_BASE_URL}/api/cbt/login` → backend returns 302 with `Location: {CBT_FRONTEND_URL}/cbt/login` → browser shows CBT login page. No JSON body; redirect-only.
- **Backend:** Set `CBT_FRONTEND_URL` in Laravel .env to Next.js app base (e.g. `http://localhost:3000`).
- **Student:** `/cbt/student`, `/cbt/student/exams` (School Exams), `/cbt/student/external-exams` (External Exams), `/cbt/student/exam/[examId]`, `/cbt/student/external-exam/[examId]`, `/cbt/student/results`
- **Teacher:** `/cbt/teacher`, `/cbt/teacher/exams`, `/cbt/teacher/exams/create`, `/cbt/teacher/exams/[examId]`, `/cbt/teacher/exams/[examId]/mark`
- **Admin:** `/cbt/admin`, `/cbt/admin/settings`, `/cbt/admin/question-bank`, `/cbt/admin/reports`, `/cbt/admin/external` (External CBT)
- **Parent:** `/cbt/parent`, `/cbt/parent/child/[studentUuid]`
- **External user:** `/cbt/external`, `/cbt/external/exams`, `/cbt/external/exam/[examId]`, `/cbt/external/results`

## Backend API

Use the same Laravel CBT APIs as the main school dashboard. Import from the app lib:

- **`@/app/lib/cbtApi`** — `cbtStudent`, `cbtTeacher`, `cbtAdmin`, `cbtParent`, `getTeacherExam`, `cbtTeacherListExams`, etc.
- **`@/app/lib/api`** — base axios instance (Bearer token, base URL).

Examples:

- Student: `cbtStudent.getAvailableExams()`, `cbtStudent.startExam(examId)`, `cbtStudent.getResultHistory()`
- Teacher: `cbtTeacherListExams()`, `getTeacherExam(examId)`, `cbtTeacher.createExam(body)`, `cbtTeacher.markTheory(attemptId, body)`
- Admin: `cbtAdmin.getSettings()`, `cbtAdmin.saveSettings(body)`, `cbtAdmin.listQuestionBank()`, `cbtAdmin.getReports()`, `cbtAdmin.exportExamResults(examId, format)`
- Parent: `cbtParent.getChildHistory(studentUuid)`, `cbtParent.getChildResult(studentUuid, examId)`

## Login & role redirect

The CBT system has its own entry at `/cbt` (role selector). Add a dedicated CBT login page if needed; after login, redirect to the appropriate role segment based on user role (e.g. `/cbt/student`, `/cbt/teacher`, `/cbt/admin`, `/cbt/parent`).

## Layouts

- **Root:** `app/cbt/layout.tsx` — gradient background, Toaster.
- **Role layouts:** `student/layout.tsx`, `teacher/layout.tsx`, `admin/layout.tsx`, `parent/layout.tsx` — each wraps content in `DashboardLayout` with the correct role. Student exam-taking route (`/cbt/student/exam/...`) renders without the sidebar (full-screen).

## Components

- **Layouts:** `components/layouts/DashboardLayout.tsx` — CBT sidebar and header (uses `CBT_BASE` for links).
- **UI:** `components/ui/` — button, card, input, select, tabs, dialog, etc. (shadcn-style).

No files were deleted; the original standalone CBT project remains at the repo root for reference. This tree is the Next.js App Router conversion.

---

## Role checks and External CBT

### Role-based behavior

- **Role checks:** Applied in the CBT login redirect (`/cbt/login`) and in `DashboardLayout` (sidebar nav is driven by `role`: student, teacher, admin, parent, `external_user`). The `external_user` role never sees school-specific items (classes, school CBT exams, fees); they only see External CBT (Dashboard, Available External Exams, My External Results).
- **Student:** Sees both "School Exams" and "External Exams" in the sidebar; can take school exams and external exams. School exam flow uses `/api/cbt/*`; external flow uses `/api/cbt/external/*`.
- **Admin:** Sees "External CBT" in the sidebar; can list, create, edit, delete external exams and manage questions/options via the same UI patterns as school CBT admin.

### External CBT API mapping (frontend → backend)

All External CBT calls use the **Bearer token** (Sanctum) from `localStorage.getItem("token")`; Next.js API routes in `app/api/cbt/external/` proxy to the backend and forward `Authorization` and `Cookie`.

| Frontend (Next.js API route) | Backend (External CBT API) |
|------------------------------|----------------------------|
| `GET/POST /api/cbt/external/exams` | `GET/POST /cbt/external/exams` |
| `GET/PUT/DELETE /api/cbt/external/exams/[id]` | `GET/PUT/DELETE /cbt/external/exams/:id` |
| `POST /api/cbt/external/exams/[id]/attempt` | `POST /cbt/external/exams/:id/attempt` |
| `GET/POST /api/cbt/external/exams/[id]/questions` | `GET/POST /cbt/external/exams/:id/questions` |
| `PUT/DELETE /api/cbt/external/questions/[id]` | `PUT/DELETE /cbt/external/questions/:id` |
| `GET/POST /api/cbt/external/questions/[id]/options` | `GET/POST /cbt/external/questions/:id/options` |
| `PUT/DELETE /api/cbt/external/options/[id]` | `PUT/DELETE /cbt/external/options/:id` |
| `GET /api/cbt/external/attempts/[id]` | `GET /cbt/external/attempts/:id` |
| `GET /api/cbt/external/attempts/[id]/questions` | `GET /cbt/external/attempts/:id/questions` |
| `POST /api/cbt/external/attempts/[id]/answers` | `POST /cbt/external/attempts/:id/answers` |
| `POST /api/cbt/external/attempts/[id]/submit` | `POST /cbt/external/attempts/:id/submit` |

Proxy helper: `app/api/lib/externalCbtProxy.ts` (tries `{BACKEND}/api/cbt/external/...` then `{BACKEND}/cbt/external/...` on 404).

### Components → External CBT endpoints

- **Student/External user – list exams:** `ExternalExamsList` → `GET /api/cbt/external/exams`.
- **Student/External user – take exam:** `ExternalTakeExam` → start: `POST /api/cbt/external/exams/:examId/attempt`; questions: `GET /api/cbt/external/attempts/:attemptId/questions`; answers: `POST /api/cbt/external/attempts/:attemptId/answers` (body: `question_id`, `option_id` for MCQ); submit: `POST /api/cbt/external/attempts/:attemptId/submit`.
- **Admin – list/create/edit/delete exams:** `app/cbt/admin/external/page.tsx`, `exams/create/page.tsx`, `exams/[examId]/page.tsx` → same External CBT exam endpoints above.
- **Admin – questions & options:** `app/cbt/admin/external/exams/[examId]/questions/page.tsx` → `GET/POST /api/cbt/external/exams/:id/questions`, `PUT/DELETE /api/cbt/external/questions/:id`, `GET/POST /api/cbt/external/questions/:id/options`, `PUT/DELETE /api/cbt/external/options/:id`.
