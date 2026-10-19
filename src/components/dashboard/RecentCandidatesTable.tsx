import React, { useState, useRef, useEffect } from 'react';
import { useATS } from '../../context/ATSContext';
import { Candidate, CandidateStage } from '../../types/ats';
import { Avatar } from '../common/Avatar';
import { StatusBadge } from '../common/StatusBadge';
import { MoreHorizontal, Eye, ArrowRightCircle, Trash2, ArrowRight, Edit3, UserX } from 'lucide-react';

interface RecentCandidatesTableProps {
  candidates?: Candidate[];
  onViewAll?: () => void;
}

export const RecentCandidatesTable: React.FC<RecentCandidatesTableProps> = ({ 
  candidates: propCandidates,
  onViewAll 
}) => {
  const { 
    recentCandidates, 
    setSelectedCandidate, 
    updateCandidateStage, 
    confirmDeleteCandidate,
    setCandidateToEdit,
    setActiveTab,
    searchQuery,
    isSaving,
  } = useATS();

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const displayCandidates = propCandidates || recentCandidates;

  // Next stage progression map
  const nextStageMap: Record<CandidateStage, CandidateStage | null> = {
    applied: 'screening',
    screening: 'interview',
    interview: 'offer',
    offer: 'hired',
    hired: null,
    rejected: 'applied',
  };

  // Close menu on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuId(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
    } catch {
      return dateStr;
    }
  };

  const handleAdvanceStage = async (cand: Candidate) => {
    const next = nextStageMap[cand.stage];
    if (next) {
      await updateCandidateStage(cand.id, next);
    }
    setActiveMenuId(null);
  };

  const handleEdit = (cand: Candidate) => {
    setCandidateToEdit(cand);
    setActiveMenuId(null);
  };

  const handleDelete = (cand: Candidate) => {
    confirmDeleteCandidate(cand);
    setActiveMenuId(null);
  };

  return (
    <div className="panel-card">
      <div className="panel-header">
        <div>
          <h3 className="panel-title">
            Recent Candidates
            {searchQuery && (
              <span style={{ fontSize: '11.5px', fontWeight: 400, color: 'var(--accent)', marginLeft: '6px' }}>
                (matching &ldquo;{searchQuery}&rdquo;)
              </span>
            )}
          </h3>
          <span className="panel-subtitle">Latest applications and active evaluations</span>
        </div>
        <button
          type="button"
          className="btn btn-ghost"
          style={{ fontSize: '12px', padding: '0 8px', height: '28px' }}
          onClick={onViewAll || (() => setActiveTab('candidates'))}
        >
          View all candidates <ArrowRight size={13} />
        </button>
      </div>

      <div className="table-responsive">
        {displayCandidates.length === 0 ? (
          <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <UserX size={28} style={{ margin: '0 auto 8px', color: 'var(--text-muted)' }} />
            <p style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: '4px' }}>
              No candidates found
            </p>
            <p style={{ fontSize: '12px' }}>
              {searchQuery ? `No candidate matches "${searchQuery}".` : 'No recent candidate applications.'}
            </p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Job Title</th>
                <th>Applied Date</th>
                <th>Stage</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayCandidates.map((cand, idx) => {
                const isMenuOpen = activeMenuId === cand.id;
                const nextStage = nextStageMap[cand.stage];
                const isNearBottom = idx >= displayCandidates.length - 2;

                return (
                  <tr key={cand.id}>
                    <td>
                      <div className="candidate-cell">
                        <Avatar name={cand.name} size={32} />
                        <div className="candidate-details">
                          <span
                            className="candidate-name"
                            onClick={() => setSelectedCandidate(cand)}
                          >
                            {cand.name}
                          </span>
                          <span className="candidate-email">{cand.email}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div>
                        <div className="role-text">{cand.role}</div>
                        <div className="dept-subtext">{cand.department} • {cand.experienceYears}</div>
                      </div>
                    </td>

                    <td>
                      <span style={{ fontSize: '12.5px', color: '#475569' }}>
                        {formatDate(cand.appliedDate)}
                      </span>
                    </td>

                    <td>
                      <StatusBadge stage={cand.stage} />
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div 
                        className={`action-menu-container ${isMenuOpen ? 'is-open' : ''}`}
                        ref={isMenuOpen ? menuRef : undefined}
                      >
                        <button
                          type="button"
                          className={`action-trigger-btn ${isMenuOpen ? 'is-active' : ''}`}
                          onClick={() => setActiveMenuId(isMenuOpen ? null : cand.id)}
                          aria-label={`Candidate actions for ${cand.name}`}
                          aria-expanded={isMenuOpen}
                        >
                          <MoreHorizontal size={15} />
                        </button>

                        {isMenuOpen && (
                          <div className={`action-menu-dropdown ${isNearBottom ? 'pop-upward' : 'pop-downward'}`}>
                            <button
                              type="button"
                              className="action-menu-item"
                              onClick={() => {
                                setSelectedCandidate(cand);
                                setActiveMenuId(null);
                              }}
                            >
                              <Eye size={14} />
                              <span>View Profile</span>
                            </button>

                            <button
                              type="button"
                              className="action-menu-item"
                              onClick={() => handleEdit(cand)}
                            >
                              <Edit3 size={14} />
                              <span>Edit Details</span>
                            </button>

                            {nextStage && (
                              <button
                                type="button"
                                className="action-menu-item"
                                disabled={isSaving}
                                onClick={() => handleAdvanceStage(cand)}
                              >
                                <ArrowRightCircle size={14} />
                                <span>Advance to {nextStage.charAt(0).toUpperCase() + nextStage.slice(1)}</span>
                              </button>
                            )}

                            <div className="action-menu-divider" />

                            <button
                              type="button"
                              className="action-menu-item danger"
                              onClick={() => handleDelete(cand)}
                            >
                              <Trash2 size={14} />
                              <span>Delete Candidate</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
