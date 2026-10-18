import { 
  Candidate, 
  CandidateStage, 
  NewCandidateInput, 
  UpdateCandidateInput, 
  StorageMode,
  CandidateRepository 
} from '../types/ats';
import { INITIAL_CANDIDATES } from '../data/mockCandidates';
import { isSupabaseConfigured, supabase } from './supabaseClient';
import { SupabaseCandidateRepository } from './supabaseRepository';

export type { CandidateRepository };
export const STORAGE_KEY = 'hireflow_candidates_v1';

const VALID_STAGES: CandidateStage[] = ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'];

/**
 * Validates whether an unknown object conforms to the Candidate schema.
 */
export function isValidCandidate(item: unknown): item is Candidate {
  if (!item || typeof item !== 'object') return false;
  const c = item as Record<string, unknown>;

  return (
    typeof c.id === 'string' &&
    c.id.trim().length > 0 &&
    typeof c.name === 'string' &&
    c.name.trim().length > 0 &&
    typeof c.email === 'string' &&
    c.email.includes('@') &&
    typeof c.role === 'string' &&
    c.role.trim().length > 0 &&
    typeof c.stage === 'string' &&
    VALID_STAGES.includes(c.stage as CandidateStage)
  );
}

/**
 * Safe parser and schema validator for candidate storage records.
 * Falls back to INITIAL_CANDIDATES if corrupted or empty.
 */
export function sanitizeLoadedCandidates(rawJson: string | null): Candidate[] {
  if (!rawJson) {
    return [...INITIAL_CANDIDATES];
  }

  try {
    const parsed = JSON.parse(rawJson);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [...INITIAL_CANDIDATES];
    }

    const validItems = parsed.filter(isValidCandidate);
    if (validItems.length === 0) {
      return [...INITIAL_CANDIDATES];
    }

    return validItems;
  } catch (err) {
    console.warn('[HireFlow Storage] Failed to parse stored candidate records. Falling back to default demo dataset.', err);
    return [...INITIAL_CANDIDATES];
  }
}

/**
 * LocalStorage candidate repository.
 * NOTE: This is a Demo-Mode client-side fallback storage mechanism.
 * It provides identical asynchronous repository signatures to allow seamless
 * migration to Supabase PostgreSQL or a REST backend when credentials are provided.
 */
export class LocalStorageCandidateRepository implements CandidateRepository {
  private key: string;

  constructor(key: string = STORAGE_KEY) {
    this.key = key;
  }

  private loadRaw(): Candidate[] {
    if (typeof window === 'undefined' || !window.localStorage) {
      return [...INITIAL_CANDIDATES];
    }
    const raw = window.localStorage.getItem(this.key);
    const sanitized = sanitizeLoadedCandidates(raw);
    
    // If not previously stored or sanitized back to defaults, prime the store
    if (!raw) {
      this.saveRaw(sanitized);
    }
    return sanitized;
  }

  private saveRaw(candidates: Candidate[]): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(this.key, JSON.stringify(candidates));
    }
  }

  public async getAll(): Promise<Candidate[]> {
    return this.loadRaw();
  }

  public async getById(id: string): Promise<Candidate | null> {
    const candidates = this.loadRaw();
    return candidates.find(c => c.id === id) || null;
  }

  public async create(input: NewCandidateInput): Promise<Candidate> {
    const candidates = this.loadRaw();
    const today = new Date().toISOString().split('T')[0];

    const id = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `cand-${Date.now().toString().slice(-4)}`;

    const newCandidate: Candidate = {
      id,
      name: input.name.trim(),
      email: input.email.trim(),
      role: input.role.trim(),
      department: input.department?.trim() || 'Engineering',
      experienceYears: input.experienceYears.trim(),
      source: input.source,
      stage: input.stage || 'applied',
      appliedDate: today,
      rating: 4,
      notes: input.notes?.trim() || undefined,
      tags: [input.role.split(' ')[0], input.source],
    };

    const updatedList = [newCandidate, ...candidates];
    this.saveRaw(updatedList);
    return newCandidate;
  }

  public async update(id: string, input: UpdateCandidateInput): Promise<Candidate> {
    const candidates = this.loadRaw();
    const index = candidates.findIndex(c => c.id === id);

    if (index === -1) {
      throw new Error(`Candidate with id "${id}" not found.`);
    }

    const existing = candidates[index];
    const updatedCandidate: Candidate = {
      ...existing,
      ...(input.name !== undefined && { name: input.name.trim() }),
      ...(input.email !== undefined && { email: input.email.trim() }),
      ...(input.role !== undefined && { role: input.role.trim() }),
      ...(input.department !== undefined && { department: input.department.trim() }),
      ...(input.experienceYears !== undefined && { experienceYears: String(input.experienceYears).trim() }),
      ...(input.source !== undefined && { source: input.source }),
      ...(input.stage !== undefined && { stage: input.stage }),
      ...(input.notes !== undefined && { notes: input.notes.trim() }),
      ...(input.rating !== undefined && { rating: input.rating }),
      ...(input.tags !== undefined && { tags: input.tags }),
    };

    candidates[index] = updatedCandidate;
    this.saveRaw(candidates);
    return updatedCandidate;
  }

  public async updateStage(id: string, stage: CandidateStage): Promise<Candidate> {
    return this.update(id, { stage });
  }

  public async delete(id: string): Promise<boolean> {
    const candidates = this.loadRaw();
    const filtered = candidates.filter(c => c.id !== id);
    const deleted = filtered.length !== candidates.length;
    this.saveRaw(filtered);
    return deleted;
  }

  public async resetToDemo(): Promise<Candidate[]> {
    const defaultData = [...INITIAL_CANDIDATES];
    this.saveRaw(defaultData);
    return defaultData;
  }

  public getStorageInfo(): { mode: StorageMode; recordCount: number; isFallback: boolean } {
    const candidates = this.loadRaw();
    return {
      mode: 'demo_local',
      recordCount: candidates.length,
      isFallback: true,
    };
  }
}

// Repository factory: Instantiates Supabase repository if configured,
// or falls back explicitly to LocalStorage repository for local demo evaluation.
export function createCandidateRepository(): CandidateRepository {
  if (isSupabaseConfigured() && supabase) {
    console.info('[HireFlow Storage] Initializing Supabase PostgreSQL repository as primary source of truth.');
    return new SupabaseCandidateRepository(supabase);
  }
  console.info('[HireFlow Storage] Supabase credentials not found. Initializing LocalStorage repository in explicit Demo Fallback mode.');
  return new LocalStorageCandidateRepository();
}

// Default singleton repository export
export const candidateStorage: CandidateRepository = createCandidateRepository();
