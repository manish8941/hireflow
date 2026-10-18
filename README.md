# HireFlow — Modern Applicant Tracking System (ATS)

HireFlow is a fast, Linear-inspired Mini Applicant Tracking System (ATS) designed for high-growth engineering teams. It provides end-to-end recruitment pipeline management, candidate intake, status tracking, interview scheduling, and hiring intelligence dashboards.

HireFlow is built with **React 18**, **TypeScript**, and **Vite**, featuring a dual-mode persistence architecture with **Supabase PostgreSQL** as the primary cloud database and a resilient **LocalStorage fallback** for offline demo evaluation.

---

## 🚀 Key Features

- **Executive Recruitment Dashboard**: Real-time KPI summary cards (Total Candidates, Active Pipeline, Interviews Scheduled, Hires Made), Stage Distribution visual charts (via Recharts), and dynamic recruitment pipeline funnel.
- **Candidate Directory**: Searchable, filterable candidate database supporting search by full/partial name, email, job title, and department, combined with stage filtering.
- **Visual Kanban Pipeline**: Visual hiring stages (`Applied` → `Screening` → `Interview` → `Offer` → `Hired` plus `Archived/Rejected`), with drag-and-drop progression and real-time state synchronization.
- **Candidate Intake & Management**:
  - Full candidate intake form with client-side validation.
  - Candidate details inspector modal with tags, rating, source metadata, and interview dates.
  - In-place profile editor.
  - Safe candidate deletion guarded by a two-step confirmation dialog.
- **Dual-Mode Persistence Architecture**:
  - **Primary**: Supabase PostgreSQL cloud database with Row Level Security (RLS) and automatic `updated_at` triggers.
  - **Fallback**: Schema-validated LocalStorage repository for offline/unconfigured evaluation, with an explicit UI indicator.
- **Accessibility & Responsiveness**:
  - Keyboard shortcuts (`C` to add candidate, `Cmd/Ctrl+K` to search, `Esc` to close modals).
  - Fully responsive layout adapting from 375px mobile screens to wide desktop monitors.

---

## 🛠️ Tech Stack

- **Frontend Core**: React 18.3.1, TypeScript 5.5.3, Vite 5.4.21
- **Styling**: Tailored Vanilla CSS Design System with CSS variables and subtle micro-interactions (Linear-inspired aesthetic)
- **Icons & Data Visualization**: Lucide React (`lucide-react`), Recharts (`recharts`)
- **Database & Backend**: Supabase PostgreSQL (`@supabase/supabase-js`)
- **Testing & QA**: Node Test Runner (`node:test`), Puppeteer-core for automated Chrome browser E2E workflows

---

## 📁 Repository Structure

```
hireflow/
├── public/                     # Static assets and favicon
├── src/
│   ├── components/
│   │   ├── candidates/         # Add, Edit, and Detail candidate modals
│   │   ├── common/             # Modal, ConfirmDialog, DemoBanner, StatCard
│   │   ├── dashboard/          # MetricCards, FunnelVisual, StageDistributionChart
│   │   └── layout/             # AppLayout, Sidebar, Topbar
│   ├── context/
│   │   └── ATSContext.tsx      # Central reactive application state provider
│   ├── data/
│   │   └── mockCandidates.ts   # Baseline demo candidate dataset and stage configurations
│   ├── pages/
│   │   ├── DashboardPage.tsx   # Dashboard overview and KPIs
│   │   ├── CandidatesPage.tsx  # Searchable candidate directory
│   │   ├── PipelinePage.tsx    # Kanban board pipeline
│   │   └── SettingsPage.tsx    # ATS system configuration & database status
│   ├── services/
│   │   ├── candidateStorage.ts         # Repository interface & LocalStorage implementation
│   │   ├── candidateStorage.test.ts    # Unit tests for storage & validation
│   │   ├── supabaseClient.ts           # Supabase client initializer & config guard
│   │   ├── supabaseRepository.ts       # Supabase PostgreSQL repository implementation
│   │   └── supabaseRepository.test.ts  # Mocked unit tests for Supabase repository
│   ├── types/
│   │   └── ats.ts              # Core TypeScript models, enums, and repository contract
│   ├── utils/
│   │   ├── metrics.ts          # Pure KPI and filter derivation utilities
│   │   └── metrics.test.ts     # Unit tests for KPI calculations and filtering
│   ├── App.tsx                 # Root component with routing
│   ├── index.css               # Design system tokens and styling
│   └── main.tsx                # Application entry point
├── supabase/
│   └── migrations/
│       └── 20261018000000_create_candidates.sql # PostgreSQL schema, RLS, triggers & idempotent seed
├── test_e2e_runner.mjs         # Puppeteer E2E browser automation test suite (24 tests)
├── vercel.json                 # Vercel deployment configuration with SPA rewrites
├── .env.example                # Template for environment credentials
└── package.json
```

---

## 🗄️ Database Schema & Supabase Setup

### 1. Database Schema Overview

The database migration is located at:
[`supabase/migrations/20261018000000_create_candidates.sql`](supabase/migrations/20261018000000_create_candidates.sql)

It establishes:
- **`candidates` table**:
  - `id` (UUID PRIMARY KEY DEFAULT `gen_random_uuid()`)
  - `name` (TEXT NOT NULL)
  - `email` (TEXT NOT NULL)
  - `phone` (TEXT)
  - `role` (TEXT NOT NULL)
  - `department` (TEXT NOT NULL DEFAULT `'Engineering'`)
  - `experience_years` (TEXT NOT NULL)
  - `source` (TEXT CHECK constraint: `LinkedIn`, `Referral`, `Career Page`, `Indeed`, `GitHub`, `Direct Sourced`, `Campus`)
  - `stage` (TEXT CHECK constraint: `applied`, `screening`, `interview`, `offer`, `hired`, `rejected`)
  - `applied_date` (DATE NOT NULL DEFAULT `CURRENT_DATE`)
  - `rating` (INTEGER CHECK 1–5)
  - `interview_date` (TIMESTAMPTZ)
  - `notes` (TEXT)
  - `tags` (TEXT[] NOT NULL DEFAULT `'{}'`)
  - `avatar_url` (TEXT)
  - `created_at` (TIMESTAMPTZ NOT NULL DEFAULT `timezone('utc'::text, now())`)
  - `updated_at` (TIMESTAMPTZ NOT NULL DEFAULT `timezone('utc'::text, now())`)
- **Performance Indexes**: Indexed on `stage`, `applied_date DESC`, `role`, `department`, `email`, and `created_at DESC`.
- **Automatic `updated_at` Trigger**: `trigger_set_candidates_updated_at` updates timestamps upon record edits.
- **Idempotent Seed**: Upserts 12 default demo candidates (`ON CONFLICT (id) DO NOTHING`), preserving baseline data across server restarts.

### 2. Database Security & Row Level Security (RLS)

Row Level Security is explicitly enabled on the `candidates` table:
```sql
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
```

**Evaluation Configuration:**
To allow prospective employers and evaluators to test candidate creation, editing, stage transitions, and deletion without registering for an account, public evaluation policies are defined:
- `Allow public read access for candidates`: Allows `anon` and `authenticated` to `SELECT`.
- `Allow public insert for candidates`: Validates non-empty name, role, and valid email syntax.
- `Allow public update for candidates`: Scoped update validation.
- `Allow public delete for candidates`: Scoped deletion for evaluation testing.

**Production Hardening Note:**
In enterprise environments with authentication, these public evaluation policies should be tightened to require authenticated recruiters:
```sql
-- Production authenticated policy example
CREATE POLICY "Recruiter authenticated access" ON candidates
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'recruiter');
```

---

## ⚙️ Environment Variables

Create a `.env` or `.env.local` file in the project root:

```bash
# Copy template
cp .env.example .env
```

Populate the values from your Supabase project dashboard (**Project Settings → API**):

```env
# Supabase Project URL (e.g. https://xyzcompany.supabase.co)
VITE_SUPABASE_URL=https://your-project-id.supabase.co

# Supabase Publishable / Anon API Key (Client-safe)
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key-here

# Optional alias (supported interchangeably)
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

> **Note**: If environment variables are omitted or invalid, HireFlow automatically activates the schema-validated **LocalStorage Fallback Mode**, allowing full offline usage and browser testing without crashing.

---

## 🧪 Testing and Verification

HireFlow includes a comprehensive two-tier test suite:

### 1. Unit Tests (15 Tests)
Covers storage sanitization, schema validation, LocalStorage CRUD lifecycle, Supabase repository mapping, error propagation, and metric derivation:
```bash
npm test
```
*Result: 15/15 tests passing (3 test suites).*

### 2. End-to-End Browser Tests (24 Tests)
Runs automated end-to-end browser workflows via Puppeteer driving Google Chrome against the running application:
```bash
npm run test:e2e
```
*Result: 24/24 tests passing, verifying:*
- Application load & clean browser console.
- Candidate creation with required validation rejection.
- In-place detail edits.
- Multi-dimensional search (name, email, role) and stage filtering.
- Full pipeline progression (`Applied` → `Screening` → `Interview` → `Offer` → `Hired`).
- Kanban board synchronization.
- Two-step deletion confirmation and cancel abort.
- Persistence across full browser page reloads (F5).
- Keyboard accessibility (`Escape` closes modals) and mobile viewport responsiveness (375px).
- Test data cleanup and baseline restoration.

### 3. Linting & Type Checking
```bash
# Run ESLint (0 errors, 0 warnings)
npm run lint

# Run TypeScript compilation and production build
npm run build
```

---

## 🚢 Deployment Guide (Vercel)

HireFlow is pre-configured for zero-configuration deployment to [Vercel](https://vercel.com):

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "feat: complete HireFlow ATS with Supabase PostgreSQL and E2E verification"
   git remote add origin https://github.com/YOUR_USERNAME/hireflow-ats.git
   git push -u origin main
   ```

2. **Import into Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new).
   - Select your GitHub repository `hireflow-ats`.
   - Framework Preset: **Vite**.
   - Build Command: `npm run build` (or default `vite build`).
   - Output Directory: `dist`.

3. **Configure Environment Variables**:
   In Vercel Project Settings → Environment Variables, add:
   - `VITE_SUPABASE_URL`: Your Supabase project URL.
   - `VITE_SUPABASE_PUBLISHABLE_KEY`: Your Supabase anon key.

4. **Deploy**:
   - Click **Deploy**. Vercel will build the production assets and assign a public `.vercel.app` domain.
   - SPA routing is preserved on refresh via `vercel.json`.

---

## 📄 License

MIT License. Created for the HireFlow ATS Engineering Internship Assignment.
