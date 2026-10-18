import { describe, it } from 'node:test';
import assert from 'node:assert';
import { 
  SupabaseCandidateRepository, 
  mapDbToCandidate, 
  mapInputToDb 
} from './supabaseRepository';
import { SupabaseClient } from '@supabase/supabase-js';
import { NewCandidateInput } from '../types/ats';

describe('SupabaseCandidateRepository (Mocked Unit Tests)', () => {
  it('correctly maps database snake_case row to Candidate camelCase model', () => {
    const dbRow = {
      id: 'a0000000-0000-0000-0000-000000000001',
      name: 'Elena Rostova',
      email: 'elena@example.com',
      phone: '+1-555-0199',
      role: 'Senior Frontend Engineer',
      department: 'Core Product',
      experience_years: '6 years',
      source: 'LinkedIn',
      stage: 'interview',
      applied_date: '2026-10-15T00:00:00Z',
      rating: 5,
      interview_date: '2026-10-20T14:00:00Z',
      notes: 'Strong system design skills',
      tags: ['React', 'TypeScript'],
      avatar_url: 'https://example.com/avatar.jpg',
    };

    const candidate = mapDbToCandidate(dbRow);
    assert.strictEqual(candidate.id, 'a0000000-0000-0000-0000-000000000001');
    assert.strictEqual(candidate.name, 'Elena Rostova');
    assert.strictEqual(candidate.email, 'elena@example.com');
    assert.strictEqual(candidate.experienceYears, '6 years');
    assert.strictEqual(candidate.source, 'LinkedIn');
    assert.strictEqual(candidate.stage, 'interview');
    assert.strictEqual(candidate.appliedDate, '2026-10-15');
    assert.strictEqual(candidate.rating, 5);
    assert.deepStrictEqual(candidate.tags, ['React', 'TypeScript']);
  });

  it('correctly maps application inputs to database snake_case columns', () => {
    const input: NewCandidateInput = {
      name: '  Alex Morgan  ',
      email: ' alex@example.com ',
      role: ' Staff Architect ',
      department: ' Infrastructure ',
      experienceYears: ' 8 years ',
      source: 'Referral',
      stage: 'offer',
      notes: ' Offer sent ',
    };

    const dbPayload = mapInputToDb(input);
    assert.strictEqual(dbPayload.name, 'Alex Morgan');
    assert.strictEqual(dbPayload.email, 'alex@example.com');
    assert.strictEqual(dbPayload.role, 'Staff Architect');
    assert.strictEqual(dbPayload.department, 'Infrastructure');
    assert.strictEqual(dbPayload.experience_years, '8 years');
    assert.strictEqual(dbPayload.source, 'Referral');
    assert.strictEqual(dbPayload.stage, 'offer');
    assert.strictEqual(dbPayload.notes, 'Offer sent');
  });

  it('queries all candidates from Supabase table with ordering', async () => {
    const mockDbRows = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        name: 'Candidate One',
        email: 'one@example.com',
        role: 'Full Stack Engineer',
        department: 'Engineering',
        experience_years: '3 years',
        source: 'LinkedIn',
        stage: 'applied',
        applied_date: '2026-10-18',
        tags: [],
      },
    ];

    const mockClient = {
      from: (tableName: string) => {
        assert.strictEqual(tableName, 'candidates');
        return {
          select: () => ({
            order: () => ({
              order: async () => ({ data: mockDbRows, error: null }),
            }),
          }),
        };
      },
    } as unknown as SupabaseClient;

    const repo = new SupabaseCandidateRepository(mockClient);
    const result = await repo.getAll();

    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].id, '11111111-1111-1111-1111-111111111111');
    assert.strictEqual(result[0].name, 'Candidate One');
  });

  it('creates candidate record via Supabase insert and returns mapped entity', async () => {
    const mockCreated = {
      id: '22222222-2222-2222-2222-222222222222',
      name: 'Created Candidate',
      email: 'created@example.com',
      role: 'Backend Engineer',
      department: 'Engineering',
      experience_years: '4 years',
      source: 'GitHub',
      stage: 'screening',
      applied_date: '2026-10-18',
      rating: 4,
      notes: null,
      tags: ['Backend', 'GitHub'],
    };

    let insertedData: unknown = null;

    const mockClient = {
      from: () => ({
        insert: (payload: unknown) => {
          insertedData = payload;
          return {
            select: () => ({
              single: async () => ({ data: mockCreated, error: null }),
            }),
          };
        },
      }),
    } as unknown as SupabaseClient;

    const repo = new SupabaseCandidateRepository(mockClient);
    const result = await repo.create({
      name: 'Created Candidate',
      email: 'created@example.com',
      role: 'Backend Engineer',
      department: 'Engineering',
      experienceYears: '4 years',
      source: 'GitHub',
      stage: 'screening',
    });

    assert.strictEqual(result.id, '22222222-2222-2222-2222-222222222222');
    assert.strictEqual(result.name, 'Created Candidate');
    assert.ok(Array.isArray(insertedData));
  });

  it('propagates Supabase errors instead of silently failing', async () => {
    const mockClient = {
      from: () => ({
        select: () => ({
          order: () => ({
            order: async () => ({
              data: null,
              error: { message: 'relation "candidates" does not exist' },
            }),
          }),
        }),
      }),
    } as unknown as SupabaseClient;

    const repo = new SupabaseCandidateRepository(mockClient);
    await assert.rejects(
      async () => {
        await repo.getAll();
      },
      /Database error loading candidates: relation "candidates" does not exist/
    );
  });

  it('updates stage correctly in Supabase', async () => {
    const mockUpdated = {
      id: '33333333-3333-3333-3333-333333333333',
      name: 'Stage Transition Candidate',
      email: 'stage@example.com',
      role: 'DevOps Engineer',
      department: 'DevOps',
      experience_years: '5 years',
      source: 'Referral',
      stage: 'hired',
      applied_date: '2026-10-10',
      tags: [],
    };

    const mockClient = {
      from: () => ({
        update: (payload: Record<string, unknown>) => {
          assert.strictEqual(payload.stage, 'hired');
          return {
            eq: (_col: string, id: string) => {
              assert.strictEqual(id, '33333333-3333-3333-3333-333333333333');
              return {
                select: () => ({
                  single: async () => ({ data: mockUpdated, error: null }),
                }),
              };
            },
          };
        },
      }),
    } as unknown as SupabaseClient;

    const repo = new SupabaseCandidateRepository(mockClient);
    const updated = await repo.updateStage('33333333-3333-3333-3333-333333333333', 'hired');
    assert.strictEqual(updated.stage, 'hired');
  });

  it('deletes candidate by id and returns boolean confirmation', async () => {
    const mockClient = {
      from: () => ({
        delete: () => ({
          eq: (_col: string, id: string) => {
            assert.strictEqual(id, '44444444-4444-4444-4444-444444444444');
            return Promise.resolve({ error: null, count: 1 });
          },
        }),
      }),
    } as unknown as SupabaseClient;

    const repo = new SupabaseCandidateRepository(mockClient);
    const deleted = await repo.delete('44444444-4444-4444-4444-444444444444');
    assert.strictEqual(deleted, true);
  });
});
