import { SupabaseClient } from '@supabase/supabase-js';
import { 
  Candidate, 
  CandidateSource, 
  CandidateStage, 
  NewCandidateInput, 
  UpdateCandidateInput, 
  StorageMode,
  CandidateRepository 
} from '../types/ats';
import { INITIAL_CANDIDATES } from '../data/mockCandidates';

export function mapDbToCandidate(row: Record<string, unknown>): Candidate {
  return {
    id: String(row.id),
    name: String(row.name || ''),
    email: String(row.email || ''),
    phone: row.phone ? String(row.phone) : undefined,
    role: String(row.role || ''),
    department: String(row.department || 'Engineering'),
    experienceYears: String(row.experience_years ?? ''),
    source: (row.source as CandidateSource) || 'LinkedIn',
    stage: (row.stage as CandidateStage) || 'applied',
    appliedDate: row.applied_date ? String(row.applied_date).split('T')[0] : new Date().toISOString().split('T')[0],
    rating: row.rating !== null && row.rating !== undefined ? Number(row.rating) : undefined,
    interviewDate: row.interview_date ? String(row.interview_date) : undefined,
    notes: row.notes ? String(row.notes) : undefined,
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    avatarUrl: row.avatar_url ? String(row.avatar_url) : undefined,
  };
}

export function mapInputToDb(input: NewCandidateInput | UpdateCandidateInput): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if ('name' in input && input.name !== undefined) row.name = input.name.trim();
  if ('email' in input && input.email !== undefined) row.email = input.email.trim();
  if ('role' in input && input.role !== undefined) row.role = input.role.trim();
  if ('department' in input && input.department !== undefined) row.department = input.department.trim();
  if ('experienceYears' in input && input.experienceYears !== undefined) row.experience_years = String(input.experienceYears).trim();
  if ('source' in input && input.source !== undefined) row.source = input.source;
  if ('stage' in input && input.stage !== undefined) row.stage = input.stage;
  if ('notes' in input && input.notes !== undefined) row.notes = input.notes.trim();
  if ('tags' in input && input.tags !== undefined) row.tags = input.tags;
  if ('rating' in input && input.rating !== undefined) row.rating = input.rating;
  return row;
}

export class SupabaseCandidateRepository implements CandidateRepository {
  private client: SupabaseClient;
  private tableName: string;

  constructor(client: SupabaseClient, tableName: string = 'candidates') {
    this.client = client;
    this.tableName = tableName;
  }

  public async getAll(): Promise<Candidate[]> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .order('applied_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[HireFlow Supabase] getAll query failed:', error);
      throw new Error(`Database error loading candidates: ${error.message}`);
    }

    // Auto-seed if the database table is completely empty on first launch
    if (!data || data.length === 0) {
      console.info('[HireFlow Supabase] No candidates found in database. Initializing default demo seed...');
      return this.resetToDemo();
    }

    return (data as Record<string, unknown>[]).map(mapDbToCandidate);
  }

  public async getById(id: string): Promise<Candidate | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error(`[HireFlow Supabase] getById(${id}) failed:`, error);
      throw new Error(`Database error fetching candidate: ${error.message}`);
    }

    return data ? mapDbToCandidate(data as Record<string, unknown>) : null;
  }

  public async create(input: NewCandidateInput): Promise<Candidate> {
    const today = new Date().toISOString().split('T')[0];
    const insertPayload: Record<string, unknown> = {
      name: input.name.trim(),
      email: input.email.trim(),
      role: input.role.trim(),
      department: input.department?.trim() || 'Engineering',
      experience_years: String(input.experienceYears).trim(),
      source: input.source,
      stage: input.stage || 'applied',
      applied_date: today,
      rating: 4,
      notes: input.notes?.trim() || null,
      tags: [input.role.split(' ')[0], input.source],
    };

    const { data, error } = await this.client
      .from(this.tableName)
      .insert([insertPayload])
      .select()
      .single();

    if (error) {
      console.error('[HireFlow Supabase] create failed:', error);
      throw new Error(`Failed to create candidate in database: ${error.message}`);
    }

    return mapDbToCandidate(data as Record<string, unknown>);
  }

  public async update(id: string, input: UpdateCandidateInput): Promise<Candidate> {
    const updatePayload = mapInputToDb(input);

    const { data, error } = await this.client
      .from(this.tableName)
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`[HireFlow Supabase] update(${id}) failed:`, error);
      throw new Error(`Failed to update candidate: ${error.message}`);
    }

    return mapDbToCandidate(data as Record<string, unknown>);
  }

  public async updateStage(id: string, stage: CandidateStage): Promise<Candidate> {
    return this.update(id, { stage });
  }

  public async delete(id: string): Promise<boolean> {
    const { error, count } = await this.client
      .from(this.tableName)
      .delete({ count: 'exact' })
      .eq('id', id);

    if (error) {
      console.error(`[HireFlow Supabase] delete(${id}) failed:`, error);
      throw new Error(`Failed to delete candidate: ${error.message}`);
    }

    return count === null ? true : count > 0;
  }

  public async resetToDemo(): Promise<Candidate[]> {
    const seedRows = INITIAL_CANDIDATES.map(c => ({
      id: c.id,
      name: c.name,
      email: c.email,
      role: c.role,
      department: c.department,
      experience_years: String(c.experienceYears),
      source: c.source,
      stage: c.stage,
      applied_date: c.appliedDate,
      rating: c.rating ?? null,
      notes: c.notes ?? null,
      tags: c.tags || [],
    }));

    const { data, error } = await this.client
      .from(this.tableName)
      .upsert(seedRows, { onConflict: 'id' })
      .select();

    if (error) {
      console.error('[HireFlow Supabase] resetToDemo failed:', error);
      throw new Error(`Failed to reset demo dataset in database: ${error.message}`);
    }

    return ((data as Record<string, unknown>[]) || []).map(mapDbToCandidate);
  }

  public getStorageInfo(): { mode: StorageMode; recordCount: number; isFallback: boolean } {
    return {
      mode: 'supabase',
      recordCount: 0,
      isFallback: false,
    };
  }
}
