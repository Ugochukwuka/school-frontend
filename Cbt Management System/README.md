# CBT Dashboard System

A comprehensive Computer-Based Testing (CBT) system with dashboards for Students, Teachers, Admins, and Parents.

## Features

### Student Dashboard
- View available exams and upcoming assessments
- Take exams with real-time timer and auto-save
- Submit answers (MCQ and Theory questions)
- View exam results and performance history
- Resume unfinished exams
- Track personal performance trends

### Teacher Dashboard
- Create and manage exams with MCQ and theory questions
- Add questions manually or import from question bank
- Publish/unpublish exams
- View student submissions and completion rates
- Mark theory questions with feedback
- Preview exams before publishing
- Clone existing exams
- Track class performance analytics

### Admin Dashboard
- System-wide analytics and reporting
- Configure CBT settings (shuffle questions, autosave, security features)
- Manage question bank (create, edit, delete questions)
- Export exam results (CSV/PDF)
- View performance distributions and trends
- Monitor system activity
- Lock/unlock exams

### Parent Dashboard
- Monitor multiple children's performance
- View exam history and upcoming exams
- Track performance trends by subject
- Real-time notification when child is taking exam
- View detailed results with class rankings
- Performance analytics and insights

## Tech Stack

- **Frontend**: React 18, TypeScript
- **Routing**: React Router 7 (Data Router pattern)
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI, shadcn/ui
- **Charts**: Recharts
- **Icons**: Lucide React
- **Form Handling**: React Hook Form
- **Notifications**: Sonner

## API Endpoints Integration

The application is designed to integrate with the following API endpoints:

### Student Endpoints
- `GET /api/cbt/exams/available` - List available exams
- `POST /api/cbt/exams/{exam_id}/start` - Start an exam attempt
- `GET /api/cbt/attempts/{attempt_id}/questions` - Fetch exam questions
- `GET /api/cbt/attempts/{attempt_id}/resume` - Resume unfinished exam
- `POST /api/cbt/attempts/{attempt_id}/answers` - Save answer (auto-save)
- `POST /api/cbt/attempts/{attempt_id}/submit` - Submit exam
- `GET /api/cbt/results/history` - View all results
- `GET /api/cbt/results/{exam_id}` - View specific exam result
- `POST /api/cbt/attempts/{attempt_id}/sync-time` - Sync remaining time
- `POST /api/cbt/attempts/{attempt_id}/event` - Log events (tab switch, etc.)
- `GET /api/cbt/attempts/{attempt_id}/status` - Check attempt status

### Teacher Endpoints
- `POST /api/cbt/exams` - Create exam
- `PUT /api/cbt/exams/{exam_id}` - Update exam
- `POST /api/cbt/exams/{exam_id}/publish` - Publish exam
- `POST /api/cbt/exams/{exam_id}/unpublish` - Unpublish exam
- `DELETE /api/cbt/exams/{exam_id}` - Delete exam
- `POST /api/cbt/exams/{exam_id}/questions` - Add questions manually
- `POST /api/cbt/exams/{exam_id}/questions/import` - Import from question bank
- `PUT /api/cbt/questions/{question_id}` - Update question
- `DELETE /api/cbt/questions/{question_id}` - Delete question
- `POST /api/cbt/questions/{question_id}/options` - Add MCQ option
- `PUT /api/cbt/options/{option_id}` - Update option
- `DELETE /api/cbt/options/{option_id}` - Delete option
- `POST /api/cbt/attempts/{attempt_id}/mark-theory` - Grade theory questions
- `GET /api/cbt/exams/{exam_id}/attempts` - View all attempts
- `GET /api/cbt/attempts/{attempt_id}` - View student script
- `POST /api/cbt/exams/{exam_id}/clone` - Clone exam
- `GET /api/cbt/exams/{exam_id}/preview` - Preview exam

### Admin Endpoints
- `GET /api/cbt/settings` - Get CBT settings
- `POST /api/cbt/settings` - Save settings
- `GET /api/cbt/analytics` - Dashboard analytics
- `GET /api/cbt/reports` - Results list
- `GET /api/cbt/exams/{exam_id}/export` - Export exam results (CSV/PDF)
- `GET /api/cbt/reports/export` - Export summary report
- `GET /api/cbt/question-bank` - List question bank
- `POST /api/cbt/question-bank` - Create question
- `PUT /api/cbt/question-bank/{question_id}` - Update question
- `DELETE /api/cbt/question-bank/{question_id}` - Delete question
- `POST /api/cbt/sync` - Sync subjects/classes
- `POST /api/cbt/exams/{exam_id}/lock` - Lock exam
- `POST /api/cbt/exams/{exam_id}/unlock` - Unlock exam

### Parent Endpoints
- `GET /api/cbt/parent/{student_uuid}/history` - Child's exam history
- `GET /api/cbt/parent/{student_uuid}/exams` - Child's upcoming exams
- `GET /api/cbt/parent/{student_uuid}/live-status` - Check if child is writing exam
- `GET /api/cbt/parent/{student_uuid}/notifications` - CBT notifications

## Routes

### Public Routes
- `/` - Home page with role selection

### Student Routes
- `/student` - Student dashboard
- `/student/exams` - Available exams list
- `/student/exam/:examId` - Take exam interface
- `/student/results` - Results and performance history

### Teacher Routes
- `/teacher` - Teacher dashboard
- `/teacher/exams` - Exam management list
- `/teacher/exams/create` - Create new exam
- `/teacher/exams/:examId` - Exam details
- `/teacher/exams/:examId/mark` - Mark theory questions

### Admin Routes
- `/admin` - Admin dashboard with analytics
- `/admin/settings` - System settings configuration
- `/admin/question-bank` - Question bank management
- `/admin/reports` - Reports and exports

### Parent Routes
- `/parent` - Parent dashboard with children overview
- `/parent/child/:studentUuid` - Individual child's detailed results

## Design Features

- **Responsive Design**: Fully responsive layouts for desktop, tablet, and mobile
- **Modern UI**: Clean, professional interface with gradient accents
- **Real-time Updates**: Timer countdown, auto-save functionality
- **Data Visualization**: Charts for performance analytics (Recharts)
- **Accessibility**: ARIA-compliant components from Radix UI
- **User Flows**: Intuitive navigation and task completion flows
- **Loading States**: Skeleton loaders and loading indicators
- **Error Handling**: User-friendly error messages and validation
- **Toast Notifications**: Non-intrusive success/error messages

## Key Features by Role

### Student Experience
- Clean, distraction-free exam interface
- Question navigator with progress tracking
- Flag questions for review
- Auto-save answers every 60 seconds
- Time sync with server
- Event logging (tab switches)
- Immediate or delayed results viewing

### Teacher Experience
- Drag-and-drop question ordering
- Question bank integration
- Bulk question import
- Theory question grading interface
- Class performance analytics
- Exam cloning for efficiency
- Student script review

### Admin Experience
- Comprehensive system settings
- Question bank management
- Performance analytics dashboards
- CSV/PDF export functionality
- User activity monitoring
- System-wide reporting

### Parent Experience
- Multi-child monitoring
- Performance trend visualization
- Real-time exam status
- Subject-wise analytics
- Upcoming exam calendar
- Historical performance tracking

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## API Integration Notes

All API calls are currently mocked with placeholder data. To integrate with your backend:

1. Replace mock data with actual API calls using `fetch` or `axios`
2. Add authentication token management
3. Implement error handling for API responses
4. Add loading states for async operations
5. Set up proper base URL configuration

## Authentication

The application expects users to be authenticated before accessing role-specific dashboards. Implement authentication flow:

- `POST /api/login` - Get authentication token
- Store token in localStorage/sessionStorage
- Include token in Authorization header for all API requests
- Handle 401 responses and redirect to login

## License

Proprietary - All rights reserved
