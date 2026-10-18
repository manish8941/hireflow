import { describe, it } from 'node:test';
import assert from 'node:assert';
import { 
  sanitizeLoadedCandidates, 
  isValidCandidate,
  LocalStorageCandidateRepository 
} from './candidateStorage';
import { INITIAL_CANDIDATES } from '../data/mockCandidates';
import { NewCandidateInput, UpdateCandidateInput } from '../types/ats';

// Mock localStorage for headless Node testing
class MemoryStorage {
  private store: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.store.get(key) || null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  clear(): void {
    this.store.clear();
  }
}

// Attach mock window & localStorage
const mockStorage = new MemoryStorage();
(globalThis as unknown as { window: { localStorage: MemoryStorage } }).window = {
  localStorage: mockStorage,
};

describe('candidateStorage Service & Repository', () => {
  it('validates a correct candidate object', () => {
    const candidate = INITIAL_CANDIDATES[0];
    assert.strictEqual(isValidCandidate(candidate), true);
  });

  it('rejects invalid candidate objects missing required fields', () => {
    assert.strictEqual(isValidCandidate(null), false);
    assert.strictEqual(isValidCandidate({}), false);
    assert.strictEqual(isValidCandidate({ id: '123', name: 'Test' }), false); // missing email & role
    assert.strictEqual(isValidCandidate({ id: '123', name: 'Test', email: 'no-at', role: 'Dev', stage: 'applied' }), false); // invalid email
    assert.strictEqual(isValidCandidate({ id: '123', name: 'Test', email: 'test@mail.com', role: 'Dev', stage: 'non-existent-stage' }), false); // invalid stage
  });

  it('sanitizes null/corrupted JSON by falling back to INITIAL_CANDIDATES', () => {
    assert.strictEqual(sanitizeLoadedCandidates(null).length, INITIAL_CANDIDATES.length);
    assert.strictEqual(sanitizeLoadedCandidates('not-json').length, INITIAL_CANDIDATES.length);
    assert.strictEqual(sanitizeLoadedCandidates('[]').length, INITIAL_CANDIDATES.length);
    assert.strictEqual(sanitizeLoadedCandidates('[{"corrupt": true}]').length, INITIAL_CANDIDATES.length);
  });

  it('performs full CRUD lifecycle in repository', async () => {
    mockStorage.clear();
    const repo = new LocalStorageCandidateRepository('test_candidates_key');

    // 1. Initial Load
    const initialList = await repo.getAll();
    assert.strictEqual(initialList.length, INITIAL_CANDIDATES.length);

    // 2. Create Candidate
    const newCandInput: NewCandidateInput = {
      name: 'Test Candidate',
      email: 'test.candidate@domain.com',
      role: 'Staff QA Engineer',
      department: 'Platform',
      experienceYears: '5 years',
      source: 'LinkedIn',
      stage: 'applied',
      notes: 'Initial interview notes',
    };
    const created = await repo.create(newCandInput);
    assert.strictEqual(created.name, 'Test Candidate');
    assert.strictEqual(created.email, 'test.candidate@domain.com');

    const afterCreate = await repo.getAll();
    assert.strictEqual(afterCreate.length, INITIAL_CANDIDATES.length + 1);
    assert.strictEqual(afterCreate[0].id, created.id);

    // 3. Read Candidate
    const fetched = await repo.getById(created.id);
    assert.notStrictEqual(fetched, null);
    assert.strictEqual(fetched?.name, 'Test Candidate');

    // 4. Update Candidate Details (Edit)
    const updateInput: UpdateCandidateInput = {
      name: 'Test Candidate Edited',
      role: 'Lead QA Engineer',
      experienceYears: '6 years',
    };
    const updated = await repo.update(created.id, updateInput);
    assert.strictEqual(updated.name, 'Test Candidate Edited');
    assert.strictEqual(updated.role, 'Lead QA Engineer');

    // 5. Update Stage (Stage Progression)
    const stageUpdated = await repo.updateStage(created.id, 'interview');
    assert.strictEqual(stageUpdated.stage, 'interview');

    // Verify in store
    const verified = await repo.getById(created.id);
    assert.strictEqual(verified?.stage, 'interview');

    // 6. Delete Candidate
    const deleteResult = await repo.delete(created.id);
    assert.strictEqual(deleteResult, true);

    const afterDelete = await repo.getAll();
    assert.strictEqual(afterDelete.length, INITIAL_CANDIDATES.length);
    assert.strictEqual(await repo.getById(created.id), null);

    // 7. Reset to Demo
    const reset = await repo.resetToDemo();
    assert.strictEqual(reset.length, INITIAL_CANDIDATES.length);
  });
});
