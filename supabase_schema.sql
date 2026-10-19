-- ==============================================================================
-- HireFlow ATS — Supabase PostgreSQL Schema & Seed Migration
-- ==============================================================================
-- Run this script in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Create Candidates Table
CREATE TABLE IF NOT EXISTS public.candidates (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL,
  department TEXT NOT NULL DEFAULT 'Engineering',
  experience_years TEXT DEFAULT '0',
  source TEXT NOT NULL DEFAULT 'LinkedIn',
  stage TEXT NOT NULL DEFAULT 'applied',
  applied_date DATE NOT NULL DEFAULT CURRENT_DATE,
  rating NUMERIC DEFAULT 4,
  interview_date TIMESTAMPTZ,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_candidates_stage ON public.candidates (stage);
CREATE INDEX IF NOT EXISTS idx_candidates_department ON public.candidates (department);
CREATE INDEX IF NOT EXISTS idx_candidates_applied_date ON public.candidates (applied_date DESC);
CREATE INDEX IF NOT EXISTS idx_candidates_created_at ON public.candidates (created_at DESC);

-- 3. Auto-update updated_at timestamp trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_updated_at ON public.candidates;
CREATE TRIGGER trigger_set_updated_at
  BEFORE UPDATE ON public.candidates
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

-- 5. Policies for Public / Anon Access (Allows full ATS demo operation)
DROP POLICY IF EXISTS "Allow anon select on candidates" ON public.candidates;
CREATE POLICY "Allow anon select on candidates"
  ON public.candidates
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow anon insert on candidates" ON public.candidates;
CREATE POLICY "Allow anon insert on candidates"
  ON public.candidates
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update on candidates" ON public.candidates;
CREATE POLICY "Allow anon update on candidates"
  ON public.candidates
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon delete on candidates" ON public.candidates;
CREATE POLICY "Allow anon delete on candidates"
  ON public.candidates
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- 6. Initial Demo Talent Pool Seed (12 Candidates)
INSERT INTO public.candidates (id, name, email, phone, role, department, experience_years, source, stage, applied_date, rating, interview_date, notes, tags)
VALUES
  ('cand-1', 'Elena Rostova', 'elena.rostova@techmail.dev', '+1 (555) 234-5678', 'Senior Frontend Engineer', 'Engineering', '6', 'LinkedIn', 'interview', '2026-10-15', 5, '2026-10-21T14:00:00Z', 'Exceptional React and WebGL performance background. System design interview scheduled.', ARRAY['React', 'TypeScript', 'Tailwind', 'Three.js']),
  ('cand-2', 'Marcus Vance', 'marcus.v@cloudscale.io', '+1 (555) 345-6789', 'Staff Infrastructure Engineer', 'Engineering', '8', 'Referral', 'offer', '2026-10-10', 5, NULL, 'Strong Kubernetes and distributed systems expertise. Offer letter sent at 185k.', ARRAY['Kubernetes', 'Go', 'AWS', 'Terraform']),
  ('cand-3', 'Aisha Al-Mansoor', 'aisha.mansoor@ai-pulse.org', '+1 (555) 456-7890', 'Machine Learning Engineer', 'Data Science', '4', 'GitHub', 'screening', '2026-10-16', 4, '2026-10-20T10:30:00Z', 'Published research in transformer distillation. Screening with team lead.', ARRAY['Python', 'PyTorch', 'LLMs', 'MLOps']),
  ('cand-4', 'Devon Bradley', 'devon.b@coderun.net', '+1 (555) 567-8901', 'Full Stack Engineer', 'Engineering', '3', 'Career Page', 'applied', '2026-10-17', NULL, NULL, 'Submitted application via portal. Experience with Node and PostgreSQL.', ARRAY['Node.js', 'PostgreSQL', 'Next.js']),
  ('cand-5', 'Chloe Tremblay', 'chloe.tremblay@uxcraft.ca', '+1 (555) 678-9012', 'Lead Product Designer', 'Design', '7', 'Direct Sourced', 'hired', '2026-09-28', 5, NULL, 'Accepted offer! Start date set for November 3rd.', ARRAY['Figma', 'Design Systems', 'User Research']),
  ('cand-6', 'Karthik Ramanujan', 'karthik.r@sysfoundry.in', '+1 (555) 789-0123', 'Backend Go Specialist', 'Engineering', '5', 'LinkedIn', 'interview', '2026-10-12', 4, '2026-10-22T16:00:00Z', 'High-throughput microservices experience. Technical assignment passed with 96%.', ARRAY['Golang', 'gRPC', 'PostgreSQL', 'Kafka']),
  ('cand-7', 'Sophia Chen', 'sophia.chen@northbyte.com', '+1 (555) 890-1234', 'Junior Frontend Developer', 'Engineering', '1', 'Campus', 'screening', '2026-10-16', 4, '2026-10-19T11:00:00Z', 'CS Graduate from Waterloo. Strong portfolio with accessible UI components.', ARRAY['JavaScript', 'React', 'CSS']),
  ('cand-8', 'Liam O''Connor', 'liam.oconnor@dublin-eng.ie', '+1 (555) 901-2345', 'Site Reliability Engineer', 'Engineering', '5', 'Indeed', 'applied', '2026-10-17', NULL, NULL, 'Monitoring, Grafana, and on-call automation focus.', ARRAY['Prometheus', 'Grafana', 'Linux', 'Ansible']),
  ('cand-9', 'Zara Patel', 'zara.patel@datastream.co', '+1 (555) 012-3456', 'Senior Data Platform Engineer', 'Data Science', '6', 'LinkedIn', 'interview', '2026-10-11', 5, '2026-10-20T15:00:00Z', 'Snowflake, dbt, and Kafka streaming pipelines. Highly rated in system design.', ARRAY['Snowflake', 'dbt', 'Kafka', 'Python']),
  ('cand-10', 'Lucas Meyer', 'lucas.m@berlin-tech.de', '+1 (555) 123-4560', 'Engineering Manager', 'Management', '10', 'Referral', 'screening', '2026-10-14', 4, '2026-10-21T09:00:00Z', 'Scaled engineering team from 12 to 55 at previous startup.', ARRAY['Leadership', 'Agile', 'Org Design']),
  ('cand-11', 'Nadia Benali', 'nadia.benali@finsecure.io', '+1 (555) 234-5671', 'Security Operations Engineer', 'Security', '4', 'GitHub', 'applied', '2026-10-18', NULL, NULL, 'Experience in SOC, penetration testing, and AWS IAM policies.', ARRAY['AWS Security', 'SIEM', 'OAuth', 'Compliance']),
  ('cand-12', 'Gabriel Santos', 'gabriel.s@saopaulo-dev.br', '+1 (555) 345-6782', 'DevOps & CI/CD Engineer', 'Engineering', '4', 'Career Page', 'screening', '2026-10-15', 4, '2026-10-22T13:00:00Z', 'GitHub Actions, Docker, and multi-region deployment automation.', ARRAY['GitHub Actions', 'Docker', 'Kubernetes', 'Helm'])
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  experience_years = EXCLUDED.experience_years,
  source = EXCLUDED.source,
  stage = EXCLUDED.stage,
  applied_date = EXCLUDED.applied_date,
  rating = EXCLUDED.rating,
  interview_date = EXCLUDED.interview_date,
  notes = EXCLUDED.notes,
  tags = EXCLUDED.tags;
