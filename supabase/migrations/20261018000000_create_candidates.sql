-- HireFlow ATS - Supabase PostgreSQL Schema Migration
-- Migration: 20261018000000_create_candidates.sql
-- Description: Creates the candidates table, indexes, updated_at trigger, Row Level Security policies, and idempotent demo seed.

-- 1. Create Candidates Table
CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL,
  department TEXT NOT NULL DEFAULT 'Engineering',
  experience_years TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('LinkedIn', 'Referral', 'Career Page', 'Indeed', 'GitHub', 'Direct Sourced', 'Campus')),
  stage TEXT NOT NULL DEFAULT 'applied' CHECK (stage IN ('applied', 'screening', 'interview', 'offer', 'hired', 'rejected')),
  applied_date DATE NOT NULL DEFAULT CURRENT_DATE,
  rating INTEGER CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  interview_date TIMESTAMPTZ,
  notes TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_candidates_stage ON candidates(stage);
CREATE INDEX IF NOT EXISTS idx_candidates_applied_date ON candidates(applied_date DESC);
CREATE INDEX IF NOT EXISTS idx_candidates_role ON candidates(role);
CREATE INDEX IF NOT EXISTS idx_candidates_department ON candidates(department);
CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
CREATE INDEX IF NOT EXISTS idx_candidates_created_at ON candidates(created_at DESC);

-- 3. Automatic updated_at Trigger
CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_candidates_updated_at ON candidates;
CREATE TRIGGER trigger_set_candidates_updated_at
BEFORE UPDATE ON candidates
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();

-- 4. Row Level Security (RLS) Configuration
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;

-- Evaluation / Demo access policies:
-- HireFlow operates as an open ATS demo without requiring individual recruiter login.
-- These policies grant scoped public access for evaluating CRUD workflows.
-- For production environments with Supabase Auth, replace with `auth.uid() IS NOT NULL`
-- or role-based policies (e.g., `auth.jwt() ->> 'role' = 'recruiter'`).

DROP POLICY IF EXISTS "Allow public read access for candidates" ON candidates;
CREATE POLICY "Allow public read access for candidates"
  ON candidates FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow public insert for candidates" ON candidates;
CREATE POLICY "Allow public insert for candidates"
  ON candidates FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    name IS NOT NULL AND length(trim(name)) > 0 AND
    email IS NOT NULL AND email LIKE '%@%' AND
    role IS NOT NULL AND length(trim(role)) > 0
  );

DROP POLICY IF EXISTS "Allow public update for candidates" ON candidates;
CREATE POLICY "Allow public update for candidates"
  ON candidates FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (
    name IS NOT NULL AND length(trim(name)) > 0 AND
    email IS NOT NULL AND email LIKE '%@%' AND
    role IS NOT NULL AND length(trim(role)) > 0
  );

DROP POLICY IF EXISTS "Allow public delete for candidates" ON candidates;
CREATE POLICY "Allow public delete for candidates"
  ON candidates FOR DELETE
  TO anon, authenticated
  USING (true);

-- 5. Safe, Repeatable Demo Seed (Idempotent: ON CONFLICT DO NOTHING)
INSERT INTO candidates (
  id, name, email, role, department, experience_years, source, stage, applied_date, rating, notes, tags
) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Elena Rostova', 'elena.rostova@techmail.dev', 'Senior Frontend Engineer', 'Core Product', '6 years', 'LinkedIn', 'interview', '2026-10-15', 5, 'Ex-Stripe engineer. Deep knowledge of React internals, TypeScript, and micro-frontends.', ARRAY['React', 'TypeScript', 'Web Perf', 'Architecture']),
  ('a0000000-0000-0000-0000-000000000002', 'Marcus Vance', 'marcus.v@cloudscale.io', 'Staff Infrastructure Engineer', 'DevOps & Platform', '8 years', 'Referral', 'offer', '2026-10-10', 5, 'Strong candidate for Kubernetes migration and AWS cost optimization lead.', ARRAY['Kubernetes', 'Terraform', 'Go', 'AWS']),
  ('a0000000-0000-0000-0000-000000000003', 'Aisha Al-Mansoor', 'aisha.mansoor@ai-pulse.org', 'Machine Learning Engineer', 'Data Intelligence', '4 years', 'GitHub', 'screening', '2026-10-16', 4, 'Published papers on LLM quantization and embeddings retrieval.', ARRAY['PyTorch', 'Vector DB', 'Python', 'MLOps']),
  ('a0000000-0000-0000-0000-000000000004', 'Devon Bradley', 'devon.b@coderun.net', 'Full Stack Engineer', 'Growth & Monetization', '3 years', 'Career Page', 'applied', '2026-10-17', NULL, 'Portfolio includes impressive open-source payment processing toolkit.', ARRAY['Node.js', 'React', 'PostgreSQL', 'Tailwind']),
  ('a0000000-0000-0000-0000-000000000005', 'Chloe Tremblay', 'chloe.tremblay@uxcraft.ca', 'Lead Product Designer', 'Design & UX', '7 years', 'Direct Sourced', 'hired', '2026-09-28', 5, 'Accepted offer! Starting November 1st. Will lead design system overhaul.', ARRAY['Design Systems', 'Figma', 'User Research']),
  ('a0000000-0000-0000-0000-000000000006', 'Karthik Ramanujan', 'karthik.r@sysfoundry.in', 'Backend Go Specialist', 'Core Product', '5 years', 'LinkedIn', 'interview', '2026-10-12', 4, 'High throughput gRPC distributed services expertise.', ARRAY['Go', 'gRPC', 'Distributed Systems', 'Kafka']),
  ('a0000000-0000-0000-0000-000000000007', 'Sophia Chen', 'sophia.chen@northbyte.com', 'Junior Frontend Developer', 'Core Product', '1 year', 'Campus', 'screening', '2026-10-16', 4, 'Fast learner, built full-stack apps in Next.js during internship.', ARRAY['React', 'Next.js', 'CSS', 'JavaScript']),
  ('a0000000-0000-0000-0000-000000000008', 'Liam O’Connor', 'liam.oconnor@dublin-eng.ie', 'Site Reliability Engineer', 'DevOps & Platform', '5 years', 'Indeed', 'applied', '2026-10-17', NULL, 'Incident response lead at previous SaaS company.', ARRAY['Monitoring', 'Prometheus', 'Linux', 'Docker']),
  ('a0000000-0000-0000-0000-000000000009', 'Ananya Sharma', 'ananya.sharma@nexus-tech.io', 'Senior Frontend Engineer', 'Core Product', '5 years', 'Referral', 'hired', '2026-09-20', 5, 'Already onboarded! Team lead for the dashboard refresh project.', ARRAY['React', 'TypeScript', 'GraphQL']),
  ('a0000000-0000-0000-0000-000000000010', 'Mateo Morales', 'mateo.morales@mobiledev.co', 'Mobile Engineer (React Native)', 'Mobile Applications', '4 years', 'LinkedIn', 'rejected', '2026-10-02', NULL, 'Strong developer, but position paused in favor of web priority.', ARRAY['React Native', 'iOS', 'Android']),
  ('a0000000-0000-0000-0000-000000000011', 'Zara Washington', 'zara.w@securityaudit.com', 'Security & Compliance Engineer', 'Security', '6 years', 'Direct Sourced', 'interview', '2026-10-14', 5, 'SOC2 Type II compliance audit experience and pen-testing certification.', ARRAY['SOC2', 'Pen-Testing', 'Cloud Security']),
  ('a0000000-0000-0000-0000-000000000012', 'Henrik Lindqvist', 'henrik.l@nordicfin.se', 'Backend Go Specialist', 'Core Product', '3 years', 'Career Page', 'screening', '2026-10-15', NULL, 'Clean code style, strong relational database indexing skills.', ARRAY['Go', 'PostgreSQL', 'Redis'])
ON CONFLICT (id) DO NOTHING;
