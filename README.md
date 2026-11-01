# GUTECH Portal

A prototype student/faculty portal built with React and Supabase. Faculty members log in to post, edit and delete course announcements, and students log in to read the announcements for their enrolled courses. The project was built using AI-assisted development ("vibe coding") with Codex and Claude.

**Live demo:** https://gutech-portal-kappa.vercel.app

## Features

- Email and password authentication (Supabase Auth)
- Role-based access: separate **student** and **faculty** dashboards, with protected routes
- **Faculty:** create, read, update and delete announcements for their courses
- **Student:** view announcements for the courses they are enrolled in
- Row Level Security policies so users can only access data they are allowed to see
- Deployed on Vercel with a live Supabase database

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), React Router, Tailwind CSS |
| Backend and database | Supabase (PostgreSQL, Auth, Row Level Security) |
| Hosting | Vercel |
| AI tools | Codex, Claude |

## Database Schema

- `profiles` (id, full_name, role, roll_no): links each auth user to a role (`student` or `faculty`)
- `courses` (id, course_code, title, faculty_id)
- `enrollments` (student_id, course_id)
- `announcements` (id, course_id, author_id, title, body, created_at)
- `grades` (id, student_id, course_id, assessment, marks, total)

## Run Locally

### Prerequisites
- Node.js (LTS version) from https://nodejs.org
- A free Supabase project from https://supabase.com

### 1. Clone and install
```bash
git clone YOUR_REPO_URL
cd gutech-portal
npm install
```

### 2. Set up environment variables
Create a file named `.env` in the project root (next to `package.json`):
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-or-publishable-key
```

Find both values in Supabase under **Project Settings, API**:
- **Project URL** goes in `VITE_SUPABASE_URL`. It must end right after `.supabase.co`, with no extra path.
- **anon / publishable key** goes in `VITE_SUPABASE_ANON_KEY`. Never use the `service_role` or secret key in the frontend.

A template is provided in `.env.example`. The `.env` file is ignored by Git and must never be committed.

### 3. Create the database
Open the Supabase **SQL Editor** and create the tables listed in the schema above, then enable Row Level Security and add policies so that:
- authenticated users can read their own profile
- authenticated users can read courses
- students can read their own enrollments
- students can read announcements for enrolled courses, and faculty can read their own
- faculty can insert, update and delete only their own announcements

Create two users under **Authentication, Users** (tick Auto Confirm User) and add matching rows in `profiles` with the roles `student` and `faculty`. Add a course and an enrollment to see announcements appear.

### 4. Start the app
```bash
npm run dev
```
Open http://localhost:5173

### Build for production
```bash
npm run build
```

## Test Accounts

| Role | Email | Password |
|---|---|---|
| Student | student@test.com | bestofluck |
| Faculty | faculty@test.com | NewPass123 |

## Deployment

1. Push the repository to GitHub.
2. Import it on Vercel (framework preset: Vite).
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables.
4. Deploy. The included `vercel.json` rewrites all routes to `index.html` so React Router works on refresh.

## AI-Assisted Development Workflow

- Planned the MVP and database schema first, then built one small feature at a time.
- Used Codex to generate the login flow, protected routes, dashboards and the announcements feature from specific prompts.
- Used Claude to plan the architecture, write SQL and Row Level Security policies, and debug problems.
- Tested each slice locally before pushing to GitHub, and Vercel redeployed automatically on every push.
- Issues solved along the way: a wrong Supabase key type in the deployment environment, a malformed project URL variable, Row Level Security blocking profile reads, and column name mismatches between the generated code and the database.

## Author

Haris Suhail, GUTECH