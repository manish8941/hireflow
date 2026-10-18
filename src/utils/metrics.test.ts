import { describe, it } from 'node:test';
import assert from 'node:assert';
import { INITIAL_CANDIDATES } from '../data/mockCandidates';
import { Candidate } from '../types/ats';

function calculateMetrics(candidates: Candidate[]) {
  const total = candidates.length;
  const active = candidates.filter(c => ['applied', 'screening', 'interview', 'offer'].includes(c.stage)).length;
  const interviews = candidates.filter(c => c.stage === 'interview').length;
  const hires = candidates.filter(c => c.stage === 'hired').length;
  const rejected = candidates.filter(c => c.stage === 'rejected').length;

  return { total, active, interviews, hires, rejected };
}

function filterCandidates(candidates: Candidate[], query: string, stageFilter: string, deptFilter: string) {
  const q = query.trim().toLowerCase();

  return candidates.filter(candidate => {
    const matchesSearch = 
      !q ||
      candidate.name.toLowerCase().includes(q) ||
      candidate.role.toLowerCase().includes(q) ||
      candidate.email.toLowerCase().includes(q) ||
      candidate.department.toLowerCase().includes(q) ||
      candidate.source.toLowerCase().includes(q);

    const matchesStage = stageFilter === 'all' || candidate.stage === stageFilter;
    const matchesDept = deptFilter === 'all' || candidate.department === deptFilter;

    return matchesSearch && matchesStage && matchesDept;
  });
}

describe('HireFlow Metrics & Filter Derivation', () => {
  it('correctly calculates KPIs from candidate records', () => {
    const metrics = calculateMetrics(INITIAL_CANDIDATES);

    assert.strictEqual(metrics.total, INITIAL_CANDIDATES.length);
    assert.strictEqual(metrics.total, metrics.active + metrics.hires + metrics.rejected);
    assert.strictEqual(metrics.interviews, INITIAL_CANDIDATES.filter(c => c.stage === 'interview').length);
    assert.strictEqual(metrics.hires, INITIAL_CANDIDATES.filter(c => c.stage === 'hired').length);
  });

  it('filters candidates by name query', () => {
    const results = filterCandidates(INITIAL_CANDIDATES, 'Elena', 'all', 'all');
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].name, 'Elena Rostova');
  });

  it('filters candidates by job role and department', () => {
    const results = filterCandidates(INITIAL_CANDIDATES, 'Go', 'all', 'Core Product');
    assert.strictEqual(results.length >= 1, true);
    for (const c of results) {
      assert.strictEqual(c.department, 'Core Product');
      assert.strictEqual(c.role.includes('Go'), true);
    }
  });

  it('filters candidates by hiring stage', () => {
    const results = filterCandidates(INITIAL_CANDIDATES, '', 'interview', 'all');
    for (const c of results) {
      assert.strictEqual(c.stage, 'interview');
    }
  });
});
