export type CandidateStage = 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';

export type CandidateSource = 
  | 'LinkedIn' 
  | 'Referral' 
  | 'Career Page' 
  | 'Indeed' 
  | 'GitHub' 
  | 'Direct Sourced'
  | 'Campus';

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  department: string;
  experienceYears: number | string;
  source: CandidateSource;
  stage: CandidateStage;
  appliedDate: string; // ISO date string (YYYY-MM-DD)
  rating?: number; // 1-5 rating
  interviewDate?: string; // Optional upcoming interview date
  notes?: string;
  tags?: string[];
  avatarUrl?: string;
}

export interface NewCandidateInput {
  name: string;
  email: string;
  role: string;
  department?: string;
  experienceYears: string;
  source: CandidateSource;
  stage?: CandidateStage;
  notes?: string;
}

export interface UpdateCandidateInput {
  name?: string;
  email?: string;
  role?: string;
  department?: string;
  experienceYears?: string | number;
  source?: CandidateSource;
  stage?: CandidateStage;
  notes?: string;
  tags?: string[];
  rating?: number;
}

export interface KPICardData {
  id: string;
  title: string;
  value: number | string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  subtext: string;
  iconName: string;
}

export interface StageDistribution {
  stage: CandidateStage;
  label: string;
  count: number;
  color: string;
  percentage: number;
}

export type NavigationTab = 'dashboard' | 'candidates' | 'pipeline' | 'settings';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'interview' | 'application' | 'hire' | 'reminder';
}

export type StorageMode = 'demo_local' | 'supabase';

export interface CandidateRepository {
  getAll(): Promise<Candidate[]>;
  getById(id: string): Promise<Candidate | null>;
  create(input: NewCandidateInput): Promise<Candidate>;
  update(id: string, input: UpdateCandidateInput): Promise<Candidate>;
  updateStage(id: string, stage: CandidateStage): Promise<Candidate>;
  delete(id: string): Promise<boolean>;
  resetToDemo(): Promise<Candidate[]>;
  getStorageInfo(): { mode: StorageMode; recordCount: number; isFallback: boolean };
}
