import React from 'react';
import { CandidateStage } from '../../types/ats';
import { STAGE_CONFIG } from '../../data/mockCandidates';

interface StatusBadgeProps {
  stage: CandidateStage;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ stage, size = 'md' }) => {
  const config = STAGE_CONFIG[stage] || STAGE_CONFIG.applied;

  return (
    <span
      className="status-badge"
      style={{
        backgroundColor: config.badgeBg,
        color: config.badgeText,
        borderColor: config.badgeBorder,
        fontSize: size === 'sm' ? '11px' : '12px',
        padding: size === 'sm' ? '1px 6px' : '2px 8px',
      }}
    >
      <span 
        className="status-badge-dot" 
        style={{ backgroundColor: config.color }} 
      />
      {config.label}
    </span>
  );
};
