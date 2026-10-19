import React, { useState, useEffect, useRef } from 'react';
import { useATS } from '../context/ATSContext';
import { CandidateStage } from '../types/ats';
import { Avatar } from '../components/common/Avatar';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import { STAGE_CONFIG } from '../data/mockCandidates';
import { 
  UserPlus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Edit3,
  ArrowRightCircle, 
  Trash2,
  SlidersHorizontal 
} from 'lucide-react';

export const CandidatesPage: React.FC = () => {
  const { 
    filteredCandidates, 
    candidates, 
    searchQuery, 
    setSearchQuery, 
    selectedStageFilter, 
    setSelectedStageFilter,
    setIsAddModalOpen,
    setSelectedCandidate,
    setCandidateToEdit,
    confirmDeleteCandidate,
    updateCandidateStage,
    isSaving,
  } = useATS();

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const menuRef = useRef<HTMLDivElement>(null);

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

  const stageTabs = [
    { id: 'all', label: 'All Candidates', count: candidates.length },
    { id: 'applied', label: 'Applied', count: candidates.filter(c => c.stage === 'applied').length },
    { id: 'screening', label: 'Screening', count: candidates.filter(c => c.stage === 'screening').length },
    { id: 'interview', label: 'Interview', count: candidates.filter(c => c.stage === 'interview').length },
    { id: 'offer', label: 'Offer', count: candidates.filter(c => c.stage === 'offer').length },
    { id: 'hired', label: 'Hired', count: candidates.filter(c => c.stage === 'hired').length },
    { id: 'rejected', label: 'Archived', count: candidates.filter(c => c.stage === 'rejected').length },
  ];

  const displayedList = filteredCandidates.filter(c => {
    if (selectedDept === 'all') return true;
    return c.department === selectedDept;
  });

  const nextStageMap: Record<CandidateStage, CandidateStage | null> = {
    applied: 'screening',
    screening: 'interview',
    interview: 'offer',
    offer: 'hired',
    hired: null,
    rejected: 'applied',
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h1>Candidate Directory</h1>
          <p>Browse, screen, and manage applicants across all engineering roles</p>
        </div>

        <div className="page-header-actions">
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

      {/* Filter Tabs & Search Controls */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          background: 'var(--surface-glass)',
          backdropFilter: 'blur(20px) saturate(140%)',
          WebkitBackdropFilter: 'blur(20px) saturate(140%)',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-glass)',
          boxShadow: 'var(--shadow-glass)',
        }}
      >
        {/* Stage Filter Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            paddingBottom: '4px',
          }}
        >
          {stageTabs.map(tab => {
            const isSelected = selectedStageFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedStageFilter(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12.5px',
                  fontWeight: isSelected ? 600 : 500,
                  backgroundColor: isSelected ? 'var(--accent-soft)' : 'transparent',
                  color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                  border: '1px solid',
                  borderColor: isSelected ? 'var(--accent)' : 'transparent',
                  boxShadow: isSelected ? 'var(--shadow-glass)' : 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    fontSize: '11px',
                    padding: '1px 6px',
                    borderRadius: '10px',
                    backgroundColor: isSelected ? 'var(--accent-soft)' : 'var(--surface-glass-nested)',
                    color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontWeight: 600,
                    border: '1px solid var(--border-glass)',
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Department Filter Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
            paddingTop: '8px',
            borderTop: '1px solid var(--border-glass-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '240px' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
              <Search
                size={14}
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                type="text"
                placeholder="Filter by name, email, or role..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  height: '32px',
                  paddingLeft: '32px',
                  paddingRight: '12px',
                  fontSize: '12.5px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-glass)',
                  backgroundColor: 'var(--surface-glass-nested)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
              />
            </div>

            {searchQuery && (
              <button
                type="button"
                className="btn btn-ghost"
                style={{ fontSize: '12px', height: '32px', padding: '0 8px' }}
                onClick={() => setSearchQuery('')}
              >
                Clear
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SlidersHorizontal size={14} color="var(--text-muted)" />
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              style={{
                height: '32px',
                padding: '0 10px',
                fontSize: '12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-glass)',
                backgroundColor: 'var(--surface-glass-nested)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            >
              <option value="all">All Departments</option>
              <option value="Core Product">Core Product</option>
              <option value="Engineering">Engineering</option>
              <option value="DevOps & Platform">DevOps & Platform</option>
              <option value="Data Intelligence">Data Intelligence</option>
              <option value="Design & UX">Design & UX</option>
              <option value="Security">Security</option>
              <option value="Mobile Applications">Mobile Applications</option>
            </select>
          </div>
        </div>
      </div>

      {/* Candidates List / Table */}
      <div className="panel-card">
        {displayedList.length === 0 ? (
          <EmptyState
            icon={Filter}
            title="No matching candidates found"
            description="Try modifying your search query or switching stage filters to find applicants."
            actionText="Reset filters"
            onAction={() => {
              setSearchQuery('');
              setSelectedStageFilter('all');
              setSelectedDept('all');
            }}
          />
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Job Title & Department</th>
                  <th>Experience</th>
                  <th>Source</th>
                  <th>Applied Date</th>
                  <th>Current Stage</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedList.map((cand, idx) => {
                  const isMenuOpen = activeMenuId === cand.id;
                  const nextStage = nextStageMap[cand.stage];
                  const isNearBottom = idx >= displayedList.length - 2;

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
                          <div className="dept-subtext">{cand.department}</div>
                        </div>
                      </td>

                      <td>
                        <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                          {cand.experienceYears}
                        </span>
                      </td>

                      <td>
                        <span className="source-tag">{cand.source}</span>
                      </td>

                      <td>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
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
                                onClick={() => {
                                  setCandidateToEdit(cand);
                                  setActiveMenuId(null);
                                }}
                              >
                                <Edit3 size={14} />
                                <span>Edit Details</span>
                              </button>

                              {nextStage && (
                                <button
                                  type="button"
                                  className="action-menu-item"
                                  disabled={isSaving}
                                  onClick={async () => {
                                    await updateCandidateStage(cand.id, nextStage);
                                    setActiveMenuId(null);
                                  }}
                                >
                                  <ArrowRightCircle size={14} />
                                  <span>Advance to {STAGE_CONFIG[nextStage]?.label}</span>
                                </button>
                              )}

                              <div className="action-menu-divider" />

                              <button
                                type="button"
                                className="action-menu-item danger"
                                onClick={() => {
                                  confirmDeleteCandidate(cand);
                                  setActiveMenuId(null);
                                }}
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
          </div>
        )}
      </div>
    </div>
  );
};
