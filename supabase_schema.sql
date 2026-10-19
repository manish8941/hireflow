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
  ('a0000000-0000-0000-0000-000000000001', 'Elena Rostova', 'elena.rostova@techmail.dev', '+1 (555) 234-5678', 'Senior Frontend Engineer', 'Core Product', '6 years', 'LinkedIn', 'interview', '2026-10-15', 5, '2026-10-20T14:00:00Z', 'Ex-Stripe engineer. Deep knowledge of React internals, TypeScript, and micro-frontends.', ARRAY['React', 'TypeScript', 'Web Perf', 'Architecture']),
  ('a0000000-0000-0000-0000-000000000002', 'Marcus Vance', 'marcus.v@cloudscale.io', '+1 (555) 345-6789', 'Staff Infrastructure Engineer', 'DevOps & Platform', '8 years', 'Referral', 'offer', '2026-10-10', 5, NULL, 'Strong candidate for Kubernetes migration and AWS cost optimization lead.', ARRAY['Kubernetes', 'Terraform', 'Go', 'AWS']),
  ('a0000000-0000-0000-0000-000000000003', 'Aisha Al-Mansoor', 'aisha.mansoor@ai-pulse.org', '+1 (555) 456-7890', 'Machine Learning Engineer', 'Data Intelligence', '4 years', 'GitHub', 'screening', '2026-10-16', 4, NULL, 'Published papers on LLM quantization and embeddings retrieval.', ARRAY['PyTorch', 'Vector DB', 'Python', 'MLOps']),
  ('a0000000-0000-0000-0000-000000000004', 'Devon Bradley', 'devon.b@coderun.net', '+1 (555) 567-8901', 'Full Stack Engineer', 'Growth & Monetization', '3 years', 'Career Page', 'applied', '2026-10-17', NULL, NULL, 'Portfolio includes impressive open-source payment processing toolkit.', ARRAY['Node.js', 'React', 'PostgreSQL', 'Tailwind']),
  ('a0000000-0000-0000-0000-000000000005', 'Chloe Tremblay', 'chloe.tremblay@uxcraft.ca', '+1 (555) 678-9012', 'Lead Product Designer', 'Design & UX', '7 years', 'Direct Sourced', 'hired', '2026-09-28', 5, NULL, 'Portfolio demonstrates mastery of complex multi-stakeholder design systems.', ARRAY['Figma', 'Design Systems', 'Prototyping', 'User Research']),
  ('a0000000-0000-0000-0000-000000000006', 'Karthik Ramanujan', 'karthik.r@sysfoundry.in', '+1 (555) 789-0123', 'Backend Go Specialist', 'Core Product', '5 years', 'LinkedIn', 'interview', '2026-10-12', 4, '2026-10-21T10:00:00Z', 'Built high-throughput trading engine middleware processing 50k req/sec.', ARRAY['Go', 'gRPC', 'Distributed Systems', 'Kafka']),
  ('a0000000-0000-0000-0000-000000000007', 'Sophia Chen', 'sophia.chen@northbyte.com', '+1 (555) 890-1234', 'Junior Frontend Developer', 'Core Product', '1 year', 'Campus', 'screening', '2026-10-16', 4, '2026-10-19T11:00:00Z', 'Outstanding CS capstone project demonstrating accessible design system.', ARRAY['React', 'CSS Architecture', 'JavaScript', 'Accessibility']),
  ('a0000000-0000-0000-0000-000000000008', 'Liam O’Connor', 'liam.oconnor@dublin-eng.ie', '+1 (555) 901-2345', 'Site Reliability Engineer', 'DevOps & Platform', '5 years', 'Indeed', 'applied', '2026-10-17', NULL, NULL, 'Specialized in Prometheus/Grafana observability and incident response automation.', ARRAY['Linux', 'Prometheus', 'Grafana', 'Ansible']),
  ('a0000000-0000-0000-0000-000000000009', 'Ananya Sharma', 'ananya.sharma@horizonfin.io', '+1 (555) 012-3456', 'Senior Frontend Engineer', 'Core Product', '6 years', 'LinkedIn', 'interview', '2026-10-14', 5, '2026-10-22T15:30:00Z', 'Fintech design system lead. Deep expertise in state machines and canvas rendering.', ARRAY['TypeScript', 'State Machines', 'SVG/Canvas', 'Next.js']),
  ('a0000000-0000-0000-0000-000000000010', 'Mateo Morales', 'mateo.morales@appforge.mx', '+1 (555) 123-4560', 'Mobile Engineer (React Native)', 'Core Product', '4 years', 'Referral', 'applied', '2026-10-18', NULL, NULL, 'Strong mobile-first engineer with 4 published production apps on App Store.', ARRAY['React Native', 'iOS', 'Android', 'Fastlane']),
  ('a0000000-0000-0000-0000-000000000011', 'Zara Washington', 'zara.w@cyberfortress.net', '+1 (555) 234-5671', 'Security & Compliance Engineer', 'DevOps & Platform', '5 years', 'Direct Sourced', 'screening', '2026-10-15', 4, '2026-10-23T09:00:00Z', 'SOC2 Type II audit leader. Experience hardening cloud-native Kubernetes workloads.', ARRAY['SOC2', 'Cloud Security', 'IAM', 'Compliance']),
  ('a0000000-0000-0000-0000-000000000012', 'Henrik Lindqvist', 'henrik.l@nordicgrid.se', '+1 (555) 345-6782', 'Backend Go Specialist', 'DevOps & Platform', '4 years', 'Career Page', 'screening', '2026-10-16', 4, '2026-10-20T16:00:00Z', 'Solid background in event-driven microservices architecture using NATS and Go.', ARRAY['Go', 'NATS', 'Docker', 'PostgreSQL'])
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
