import React from 'react';
import { useATS } from '../context/ATSContext';
import { CandidateStage } from '../types/ats';
import { STAGE_CONFIG } from '../data/mockCandidates';
import { Avatar } from '../components/common/Avatar';
import { UserPlus, ArrowRight, CheckCircle2, Search, X } from 'lucide-react';

export const PipelinePage: React.FC = () => {
  const { 
    candidates, 
    updateCandidateStage, 
    setSelectedCandidate, 
    setIsAddModalOpen,
    searchQuery,
    setSearchQuery,
    isSaving,
  } = useATS();

  const pipelineStages: CandidateStage[] = ['applied', 'screening', 'interview', 'offer', 'hired'];

  const nextStageMap: Record<CandidateStage, CandidateStage | null> = {
    applied: 'screening',
    screening: 'interview',
    interview: 'offer',
    offer: 'hired',
    hired: null,
    rejected: null,
  };

  const getCandidatesForStage = (stage: CandidateStage) => {
    const query = searchQuery.trim().toLowerCase();
    return candidates.filter(c => {
      if (c.stage !== stage) return false;
      if (!query) return true;
      return (
        c.name.toLowerCase().includes(query) ||
        c.role.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.department.toLowerCase().includes(query)
      );
    });
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h1>Hiring Pipeline</h1>
          <p>Visual candidate stage tracking and progression board</p>
        </div>

        <div className="page-header-actions">
          {searchQuery && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                background: 'var(--accent-soft)',
                color: 'var(--accent)',
                border: '1px solid rgba(84, 120, 184, 0.22)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                fontWeight: 500,
              }}
            >
              <Search size={13} />
              <span>Filtering: &ldquo;{searchQuery}&rdquo;</span>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  color: 'var(--accent)',
                }}
                aria-label="Clear search filter"
              >
                <X size={13} />
              </button>
            </div>
          )}

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsAddModalOpen(true)}
          >
            <UserPlus size={15} />
            <span>Add Candidate</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="kanban-board">
        {pipelineStages.map(stage => {
          const config = STAGE_CONFIG[stage];
          const stageCandidates = getCandidatesForStage(stage);
          const next = nextStageMap[stage];

          return (
            <div key={stage} className="kanban-column">
              <div className="kanban-column-header">
                <div className="kanban-col-title-group">
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: config.color,
                    }}
                  />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {config.label}
                  </span>
                </div>
                <span className="kanban-col-count">{stageCandidates.length}</span>
              </div>

              <div className="kanban-card-list">
                {stageCandidates.length === 0 ? (
                  <div
                    style={{
                      padding: '24px 12px',
                      textAlign: 'center',
                      color: 'var(--text-muted)',
                      fontSize: '12px',
                    }}
                  >
                    {searchQuery ? 'No matches' : 'No candidates'}
                  </div>
                ) : (
                  stageCandidates.map(cand => (
                    <div
                      key={cand.id}
                      className="kanban-card"
                      onClick={() => setSelectedCandidate(cand)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Avatar name={cand.name} size={26} />
                        <span className="kanban-card-name">{cand.name}</span>
                      </div>

                      <div className="kanban-card-role">{cand.role}</div>

                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        <span className="source-tag" style={{ fontSize: '10.5px', padding: '1px 5px' }}>
                          {cand.source}
                        </span>
                        <span
                          style={{
                            fontSize: '10.5px',
                            padding: '1px 5px',
                            borderRadius: '4px',
                            backgroundColor: 'var(--bg-subtle)',
                            color: 'var(--text-muted)',
                          }}
                        >
                          {cand.experienceYears}
                        </span>
                      </div>

                      <div className="kanban-card-footer">
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {cand.appliedDate}
                        </span>

                        {next ? (
                          <button
                            type="button"
                            className="btn btn-ghost"
                            disabled={isSaving}
                            style={{
                              height: '24px',
                              padding: '0 6px',
                              fontSize: '11px',
                              color: 'var(--accent)',
                            }}
                            title={`Advance to ${STAGE_CONFIG[next].label}`}
                            onClick={async e => {
                              e.stopPropagation();
                              await updateCandidateStage(cand.id, next);
                            }}
                          >
                            <span>Move</span>
                            <ArrowRight size={12} />
                          </button>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              fontSize: '11px',
                              color: '#059669',
                              fontWeight: 500,
                            }}
                          >
                            <CheckCircle2 size={12} /> Hired
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
