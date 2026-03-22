## External CBT frontend integration

### Role checks

- **student**: allowed in `app/cbt/student/*` (includes both **School Exams** and **External Exams** in the sidebar).
- **external_user**: allowed in `app/cbt/external/*` only (no school/ERP CBT items in the sidebar).
- **admin**: allowed in `app/cbt/admin/*` and can manage **External CBT** under `CBT → Admin → External CBT`.

Role gating is applied in client layouts using `app/cbt/components/RoleGuard.tsx` (reads `localStorage.user.role` set during CBT login).

### External CBT endpoint mapping (frontend → backend)

All calls go through Next.js API proxy routes under `app/api/cbt/external/*` which forward the existing **Bearer token** (Sanctum) from the browser request.

- **List external exams**
  - UI: `app/cbt/student/external-exams/page.tsx`, `app/cbt/external/exams/page.tsx`
  - Fetch: `GET /api/cbt/external/exams` → backend `GET /cbt/external/exams`

- **Start attempt**
  - UI: `app/cbt/components/external/ExternalTakeExam.tsx`
  - Fetch: `POST /api/cbt/external/exams/{exam_id}/attempt` → backend `POST /cbt/external/exams/{exam_id}/attempt`

- **Fetch questions for attempt**
  - UI: `ExternalTakeExam`
  - Fetch: `GET /api/cbt/external/attempts/{attempt_id}/questions` → backend `GET /cbt/external/attempts/{attempt_id}/questions`
  - Note: UI blocks when attempt is not `in_progress` (checks `GET /api/cbt/external/attempts/{attempt_id}`).

- **Save answers**
  - UI: `ExternalTakeExam`
  - Fetch: `POST /api/cbt/external/attempts/{attempt_id}/answers` → backend `POST /cbt/external/attempts/{attempt_id}/answers`

- **Submit exam**
  - UI: `ExternalTakeExam`
  - Fetch: `POST /api/cbt/external/attempts/{attempt_id}/submit` → backend `POST /cbt/external/attempts/{attempt_id}/submit`

- **Admin manage external exams**
  - UI:
    - List: `app/cbt/admin/external/page.tsx` (`GET /api/cbt/external/exams`)
    - Create: `app/cbt/admin/external/exams/create/page.tsx` (`POST /api/cbt/external/exams`)
    - Edit/Delete: `app/cbt/admin/external/exams/[examId]/page.tsx` (`PUT/DELETE /api/cbt/external/exams/{id}`)
    - Questions/Options: `app/cbt/admin/external/exams/[examId]/questions/page.tsx`
      - `GET/POST /api/cbt/external/exams/{id}/questions`
      - `POST /api/cbt/external/questions/{questionId}/options`
      - `DELETE /api/cbt/external/questions/{questionId}`
      - `DELETE /api/cbt/external/options/{optionId}`

