# ⚡ HireFlow ATS — Modern Applicant Tracking System & Living AI Companion

HireFlow is a fast, beautifully crafted Applicant Tracking System (ATS) designed for high-growth engineering teams. It features an executive recruitment dashboard, an interactive circular talent pool, a searchable candidate directory, a multi-stage pipeline, and **Cloudee** — an interactive, context-aware 2D living mascot.

Built with **React 18**, **TypeScript**, and **Vite**, HireFlow features a dual-mode persistence architecture: powered by **Supabase PostgreSQL** as the primary cloud database, with a resilient **LocalStorage fallback** for offline evaluation.

---

## 🌟 Key Highlights

- **Interactive Circular Talent Composition**: Mathematically balanced circular hero stage displaying live active candidates in orbital cards around a centerpiece pipeline counter.
- **Living 2D Mascot — Cloudee**: A responsive flat-vector companion with continuous idle floating, organic breathing, irregular natural blinking, cursor proximity eye tracking, click squash-and-stretch bounce, and real-time ATS event awareness.
- **Dual Visual Themes**: 
  - **Bright Theme (Default)**: Vibrant liquid mesh gradient with frosted specular glassmorphism.
  - **Dark Obsidian Theme**: High-contrast obsidian graphite with deep glass shadows.
- **Enterprise PostgreSQL Integration**: Live Supabase cloud backend with Row Level Security (RLS), auto-updating timestamps, and optimized indexes.
- **Zero-Friction Candidate Intake & Management**: In-place profile editor, stage transitions, searchable candidate directory, and guarded two-step deletions.

---

## 🧭 Application Navigation & Feature Guide

HireFlow is organized for seamless navigation across recruitment workflows:

```
┌────────────────────────────────────────────────────────────────────────┐
│  [Logo] HireFlow         ( Menu ▼ | 🌙 | 13 )       [+ Add Candidate]   │
└────────────────────────────────────────────────────────────────────────┘
```

### 1. Top Navigation Bar
- **`Menu` Pill**: Click the pill in the center of the top navigation bar to access instant page routing:
  - **Dashboard**: Circular talent visualization, pipeline metrics, and hiring funnels.
  - **Candidate Directory**: Full table of all applicants with multi-attribute filtering.
  - **Hiring Pipeline**: Stage-by-stage Kanban pipeline tracking candidates through hiring stages.
  - **Settings**: System configurations, Supabase connection status, theme selection, and mascot preferences.
- **Theme Switcher** (`☀️ / 🌙` icon): Instantly toggle between the **Bright Color Theme** and **Dark Obsidian Theme**.
- **Candidate Badge** (`13`): Displays the current total talent count in your active pipeline.
- **`+ Add Candidate` Button**: Universal primary action button to open the candidate intake modal from any screen.
- **Top Search Bar**: Quick search bar for immediate candidate lookup by name, role, or skills.

---

### 2. Dashboard & Circular Talent Pool
- **Centerpiece Glass Card**: Shows total active candidates in the pipeline with an immediate "+ Add a candidate" shortcut.
- **Orbital Candidate Cards**: Floating applicant cards positioned in an equidistant mathematical circle around the centerpiece. Hovering over any card reveals candidate ratings, source tags, and current stage.
- **Candidate Quick View**: Click any card in the orbital circle to open the full candidate profile and evaluation notes.
- **Executive Metrics Grid**: Four KPI summary cards tracking *Total Talent Pool*, *Active Pipeline*, *Interviews Scheduled*, and *Offers Extended*.

---

### 3. Candidate Directory
Access by clicking **`Candidate Directory`** on the home page or via the **`Menu`** dropdown:
- **Search & Filters**:
  - Filter by search query (instant partial matching across name, email, role, and tags).
  - Filter by hiring stage tabs (`All Candidates`, `Applied`, `Screening`, `Interview`, `Offer`, `Hired`).
  - Filter by department dropdown (`All Departments`, `Core Product`, `DevOps & Platform`, `Data Intelligence`, `Design & UX`).
- **Row Actions Menu (`...`)**:
  - **Advance Stage**: Move the candidate forward (e.g. `Applied` → `Screening` → `Interview` → `Offer` → `Hired`).
  - **Edit Profile**: Modify role, experience, contact details, rating, or internal interview notes.
  - **Delete Record**: Safely removes applicant after confirmation.

---

### 4. Cloudee — The Living AI Companion

Located in the bottom-right corner of the application, **Cloudee** is an interactive, animated 2D vector character that stays aware of your actions without being distracting:

- **Continuous Idle Motion**:
  - **Gentle Floating**: Slowly floats 4.5px vertically over a 3.8s ease-in-out cycle.
  - **Soft Breathing**: Organic micro-scaling on the squircle head without layout shifts.
  - **Synchronized Shadow Pulse**: Ambient ground shadow expands and dims in harmony with the float.
  - **Natural Irregular Blinking**: Blinks both eyes together every 3.2s to 6.0s with a 16% probability of a cute double-blink.
- **Cursor Proximity Tracking (Eye Glance)**:
  - When your mouse cursor moves within a 420px radius, Cloudee’s white oval eyes gently glance toward your pointer.
  - Movement is strictly clamped within facial boundaries (max ±4.5px horizontal, ±3.5px vertical).
  - Powered by direct CSS custom properties and `requestAnimationFrame` for 60fps GPU acceleration with **zero React re-renders**.
- **Direct User Interaction**:
  - **Hover**: Curious expression tilt.
  - **Click**: Triggers a playful squash-and-stretch bounce (`520ms`), displays a joyful expression, and opens the **Cloudee Assistant** shortcuts panel.
- **ATS Event Awareness**:
  - Adding candidate → `success` expression (*"Nice! A new candidate is in the pipeline."*)
  - Updating candidate → `happy` expression (*"Candidate details updated!"*)
  - Deleting candidate → `sad` expression (*"Candidate removed."*)
  - Changing stage → `excited` expression (*"Pipeline updated. Nice progress!"*)
  - Searching typing → `thinking` expression (*"Let's find who you're looking for."*)
  - Search results found → `happy` (*"Found N candidates for you."*)
  - 0 search results → `confused` (*"No matches yet. Try another search?"*)
  - Theme toggled → `curious` (*"A fresh look!"*)
- **Behavior Priority Hierarchy**:
  1. *Priority 5 (Critical)*: Database errors & validation alerts (cannot be interrupted).
  2. *Priority 4 (Persistent)*: Assistant panel open (`listening` mode).
  3. *Priority 3 (Interaction)*: Clicks and cursor hover.
  4. *Priority 2 (Contextual)*: Candidate operations, searches, theme switches.
  5. *Priority 1 (Baseline)*: Idle floating and route baselines.
- **Accessible Mascot Toggle**:
  - In the assistant panel or on the Settings page, toggle **`Cloudee On / Off`**.
  - When OFF: Cloudee collapses into an accessible **`Mascot Off`** pill; all timers, animations, and tracking listeners halt completely to save CPU/battery.
  - Preference is persisted in `localStorage` under `hireflow_mascot_enabled`.
  - Supports `prefers-reduced-motion: reduce` for full accessibility.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 18.3.1, TypeScript 5.5.3, Vite 5.4.21 |
| **Styling & Design System** | Tailored Vanilla CSS tokens, Glassmorphism, CSS Custom Properties |
| **Icons & Visualization** | Lucide React (`lucide-react`), Recharts (`recharts`) |
| **Database & Cloud Backend**| Supabase PostgreSQL (`@supabase/supabase-js`) |
| **Testing & Quality Assurance** | Node.js Test Runner (`node:test`), Puppeteer Core (`puppeteer-core`) |
| **Code Quality** | ESLint 9 (Flat Config), TypeScript strict mode |

---

## 🗄️ Supabase PostgreSQL Setup

HireFlow connects directly to your Supabase PostgreSQL cloud database:

### 1. Schema Migration Script
The complete SQL schema migration is available in [`supabase_schema.sql`](supabase_schema.sql):
- Creates the `public.candidates` table with typed columns.
- Configures Row Level Security (RLS) with permissive read/write policies for client evaluation.
- Sets up automatic `updated_at` timestamp triggers.
- Creates performance indexes on `stage`, `department`, and `applied_date`.
- Seeds the initial 12 canonical candidates (`a0000000-0000-0000-0000-000000000001` through `0012`).

### 2. Configure Environment Variables
Create a `.env` file in the project root:

```env
# Supabase Project URL
VITE_SUPABASE_URL=https://your-project-id.supabase.co

# Supabase Publishable / Anon Key (Safe for browser client use)
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key-here
```

### 3. Automatic Mode Detection
- **When Supabase credentials are provided in `.env`**: HireFlow automatically connects to your live PostgreSQL database. The bottom floating indicator displays **`✔ Supabase Connected`**.
- **When credentials are not present**: HireFlow falls back gracefully to schema-validated **`LocalStorage Fallback`** mode so evaluation works offline without configuration.

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js**: v18+ or v20+ recommended.
- **npm** or **yarn**.

### Installation & Launch

1. **Clone the repository**:
   ```bash
   git clone https://github.com/manish8941/hireflow.git
   cd hireflow
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment** *(Optional for live Supabase)*:
   ```bash
   cp .env.example .env
   # Populate VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
   ```

4. **Start local development server**:
   ```bash
   npm run dev
   ```
   Open **[http://localhost:5173/](http://localhost:5173/)** in your browser.

---

## 🧪 Testing & Verification

HireFlow features a comprehensive 32-test automated suite:

```bash
# Run all unit and integration tests
npm test
```

### Test Coverage Highlights:
- **Reference A Mascot Vector Geometry**: Validates SVG path continuity, `#FF4A0A` hex identity, and 14 controlled facial expressions.
- **Avatar Definition & Geometry**: Validates expressions and animation step configurations.
- **Context-Aware Event Bus**: Tests event delivery, payload structures, and teardown.
- **Priority Controller & Proximity Clamp**: Tests 5-tier state machine and verifies cursor glance math is strictly bounded within ±4.5px X and ±3.5px Y.
- **Candidate Storage & Validation**: Verifies JSON sanitization, required fields, and LocalStorage CRUD.
- **Supabase PostgreSQL Repository**: Tests query mapping, column transformation, stage updates, and error propagation.
- **Metrics & Filters**: Tests KPI formulas, name searches, role/department filters, and stage aggregations.

### Linting & Production Build
```bash
# Check code style with zero warnings
npm run lint

# Compile TypeScript and bundle for production
npm run build
```

---

## 📁 Repository Structure

```
hireflow/
├── src/
│   ├── components/
│   │   ├── candidates/         # AddCandidateModal, EditCandidateModal, CandidateDetailModal
│   │   ├── common/             # Avatar, StatusBadge, ConfirmDialog, DemoBanner
│   │   ├── dashboard/          # HeroTalentCircle, MetricCards, StageChart
│   │   └── layout/             # AppLayout, Topbar
│   ├── context/
│   │   ├── ATSContext.tsx      # Central reactive recruitment state provider
│   │   └── ThemeContext.tsx    # Light/Dark theme provider with localStorage sync
│   ├── data/
│   │   └── mockCandidates.ts   # Canonical initial candidate seed dataset
│   ├── mascot/
│   │   ├── MascotFace.tsx      # 2D Flat-vector mascot SVG with 14 expressions & eyelid blink
│   │   ├── CloudeeWidget.tsx   # Living mascot controller: idle float, eye glance, bounce, priority
│   │   ├── CloudeeHelperPanel.tsx # Assistant popover dialog with shortcuts & sliding toggle
│   │   ├── CloudeeToggle.tsx   # Accessible sliding switch
│   │   ├── cloudeeEvents.ts    # Centralized event bus for app-wide reactions
│   │   ├── cloudeeController.ts# State machine and 5-tier behavior hierarchy
│   │   ├── cloudeeStorage.ts   # Persisted mascot preference handler
│   │   └── cloudee.test.ts     # Mascot unit tests (geometry, blinking, clamp, priority)
│   ├── pages/
│   │   ├── DashboardPage.tsx   # Circular hero, metrics, and hiring intelligence
│   │   ├── CandidatesPage.tsx  # Searchable directory table with stage filters
│   │   ├── PipelinePage.tsx    # Visual Kanban hiring stages
│   │   └── SettingsPage.tsx    # System settings, Supabase info, mascot toggle
│   ├── services/
│   │   ├── candidateStorage.ts # Repository interface & LocalStorage fallback
│   │   ├── supabaseClient.ts   # Supabase client initializer & config guard
│   │   └── supabaseRepository.ts # Full PostgreSQL CRUD implementation
│   ├── types/
│   │   └── ats.ts              # Core TypeScript candidate and repository interfaces
│   ├── utils/
│   │   └── metrics.ts          # Pure KPI calculation and filtering derivation
│   ├── App.tsx                 # Root application routing and layout
│   ├── index.css               # Design system tokens, glassmorphism & mascot animations
│   └── main.tsx                # React DOM entry point
├── supabase_schema.sql         # Idempotent PostgreSQL schema, indexes, RLS & seed migration
├── .env.example                # Template for Supabase credentials
├── package.json
└── vite.config.ts
```

---

## 📄 License

MIT License. Designed and built with ❤️ for HireFlow ATS.
