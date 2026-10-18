import React from 'react';
import { useATS } from '../../context/ATSContext';
import { Modal } from '../common/Modal';
import { Avatar } from '../common/Avatar';
import { StatusBadge } from '../common/StatusBadge';
import { CandidateStage } from '../../types/ats';
import { STAGE_CONFIG } from '../../data/mockCandidates';
import { Mail, Briefcase, Calendar, Award, Trash2, Edit3 } from 'lucide-react';

export const CandidateDetailModal: React.FC = () => {
  const { 
    selectedCandidate, 
    setSelectedCandidate, 
    updateCandidateStage, 
    confirmDeleteCandidate,
    setCandidateToEdit,
    isSaving,
  } = useATS();

  if (!selectedCandidate) return null;

  const handleStageChange = async (newStage: CandidateStage) => {
    await updateCandidateStage(selectedCandidate.id, newStage);
  };

  const handleEditClick = () => {
    const target = selectedCandidate;
    setSelectedCandidate(null);
    setCandidateToEdit(target);
  };

  const handleDeleteClick = () => {
    const target = selectedCandidate;
    setSelectedCandidate(null);
    confirmDeleteCandidate(target);
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);
    } catch {
      return dateStr;
    }
  };

  return (
    <Modal
      isOpen={Boolean(selectedCandidate)}
      onClose={() => setSelectedCandidate(null)}
      title="Candidate Profile"
      maxWidth="560px"
    >
      <div className="modal-body" style={{ gap: '20px' }}>
        {/* Top Header Card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Avatar name={selectedCandidate.name} size={48} />
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {selectedCandidate.name}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                {selectedCandidate.role}
              </span>
              <span style={{ color: 'var(--border-medium)' }}>•</span>
              <StatusBadge stage={selectedCandidate.stage} />
            </div>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: '12px', height: '30px' }}
            onClick={handleEditClick}
          >
            <Edit3 size={13} />
            Edit Profile
          </button>
        </div>

        {/* Quick Info Grid */}
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '12px',
            backgroundColor: 'var(--bg-subtle)',
            padding: '14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12.5px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mail size={15} color="var(--text-muted)" />
            <span style={{ color: 'var(--text-secondary)' }}>{selectedCandidate.email}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Briefcase size={15} color="var(--text-muted)" />
            <span style={{ color: 'var(--text-secondary)' }}>
              {selectedCandidate.department} • {selectedCandidate.experienceYears}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={15} color="var(--text-muted)" />
            <span style={{ color: 'var(--text-secondary)' }}>
              Applied {formatDate(selectedCandidate.appliedDate)}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={15} color="var(--text-muted)" />
            <span style={{ color: 'var(--text-secondary)' }}>
              Source: <strong>{selectedCandidate.source}</strong>
            </span>
          </div>
        </div>

        {/* Change Stage Selector */}
        <div className="form-group">
          <label className="form-label" style={{ fontWeight: 600 }}>
            Current Pipeline Stage {isSaving && <span style={{ fontSize: '11px', color: 'var(--indigo-600)', fontWeight: 400 }}>(Saving...)</span>}
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {(['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'] as CandidateStage[]).map(stage => {
              const isSelected = selectedCandidate.stage === stage;
              const config = STAGE_CONFIG[stage];
              return (
                <button
                  key={stage}
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleStageChange(stage)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    fontWeight: isSelected ? 600 : 500,
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    opacity: isSaving ? 0.7 : 1,
                    border: '1px solid',
                    borderColor: isSelected ? config.color : 'var(--border-subtle)',
                    backgroundColor: isSelected ? config.badgeBg : '#ffffff',
                    color: isSelected ? config.badgeText : 'var(--text-secondary)',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  {config.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Candidate Tags */}
        {selectedCandidate.tags && selectedCandidate.tags.length > 0 && (
          <div className="form-group">
            <label className="form-label">Competencies & Skills</label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {selectedCandidate.tags.map((tag, idx) => (
                <span
                  key={idx}
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--text-secondary)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '11.5px',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {selectedCandidate.notes && (
          <div className="form-group">
            <label className="form-label">Evaluation Notes</label>
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
              }}
            >
              {selectedCandidate.notes}
            </div>
          </div>
        )}
      </div>

      <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
        <button
          type="button"
          className="btn btn-danger"
          style={{ fontSize: '12px' }}
          onClick={handleDeleteClick}
        >
          <Trash2 size={14} />
          Delete Candidate
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setSelectedCandidate(null)}
        >
          Close
        </button>
      </div>
    </Modal>
  );
};
