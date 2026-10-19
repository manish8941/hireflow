import React from 'react';
import { useATS } from '../../context/ATSContext';
import { Avatar } from '../common/Avatar';
import { Calendar, Clock, ChevronRight, UserCheck } from 'lucide-react';
import { CandidateStage } from '../../types/ats';

export const UpcomingInterviewsWidget: React.FC = () => {
  const { candidates, setSelectedCandidate, updateCandidateStage, isSaving } = useATS();

  // Find candidates with interviewDate or in 'interview' stage
  const interviewCandidates = candidates
    .filter(c => c.stage === 'interview' || Boolean(c.interviewDate))
    .slice(0, 4);

  const formatInterviewTime = (dateStr?: string) => {
    if (!dateStr) return 'Pending schedule';
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  const handleAdvance = async (e: React.MouseEvent, candidateId: string, nextStage: CandidateStage) => {
    e.stopPropagation();
    await updateCandidateStage(candidateId, nextStage);
  };

  return (
    <div className="panel-card" style={{ height: '100%' }}>
      <div className="panel-header">
        <div className="panel-title">
          <Calendar size={16} color="var(--accent)" />
          <span>Interviews & Stage Priorities</span>
        </div>
        <span className="panel-subtitle">
          {interviewCandidates.length} scheduled / active
        </span>
      </div>

      <div className="panel-body" style={{ padding: '10px 16px' }}>
        {interviewCandidates.length === 0 ? (
          <div style={{ padding: '28px 12px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Calendar size={28} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
            <p style={{ fontSize: '13px', fontWeight: 500 }}>No upcoming interviews</p>
            <span style={{ fontSize: '12px' }}>Move candidates to Interview stage to schedule evaluations.</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {interviewCandidates.map(c => (
              <div
                key={c.id}
                onClick={() => setSelectedCandidate(c)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--surface-glass-nested)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid var(--border-glass-subtle)',
                  boxShadow: 'var(--shadow-glass)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <Avatar name={c.name} size={32} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)' }} className="truncate">
                        {c.name}
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          background: 'rgba(255, 255, 255, 0.08)',
                          color: 'var(--text-secondary)',
                          fontWeight: 600,
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                        }}
                      >
                        {c.department}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }} className="truncate">
                        {c.role}
                      </span>
                      <span style={{ color: 'var(--border-medium)' }}>•</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <Clock size={11} />
                        {formatInterviewTime(c.interviewDate)}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  {c.stage === 'interview' && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ height: '26px', padding: '0 8px', fontSize: '11px', color: 'var(--accent)' }}
                      onClick={(e) => handleAdvance(e, c.id, 'offer')}
                      disabled={isSaving}
                      title="Advance candidate to Offer stage"
                    >
                      <UserCheck size={12} />
                      <span>Move to Offer</span>
                    </button>
                  )}
                  <ChevronRight size={14} color="var(--text-muted)" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
