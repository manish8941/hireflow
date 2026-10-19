import React from 'react';
import { useATS } from '../../context/ATSContext';
import { DynamicIsland } from '../navigation/DynamicIsland';
import { Plus, User } from 'lucide-react';

export const Topbar: React.FC = () => {
  const { setIsAddModalOpen, setActiveTab } = useATS();

  return (
    <header className="editorial-floating-header">
      {/* Top-Left: Minimal Brand Mark / Monogram inspired by reference screenshot */}
      <div className="editorial-brand-container" onClick={() => setActiveTab('dashboard')} title="HireFlow ATS">
        <div className="editorial-monogram">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            {/* Minimalist geometric architectural monogram */}
            <rect x="2" y="3" width="7" height="18" rx="2" />
            <rect x="11" y="3" width="11" height="5.5" rx="1.5" />
            <rect x="11" y="10.5" width="8" height="5.5" rx="1.5" />
            <circle cx="13" cy="19.5" r="2" />
          </svg>
        </div>
        <span className="editorial-brand-name">HireFlow</span>
      </div>

      {/* Top-Center: Independent Floating Dynamic Island Capsule */}
      <div className="editorial-island-slot">
        <DynamicIsland />
      </div>

      {/* Top-Right: Minimal Restrained Controls (Avatar circle + subtle primary action) */}
      <div className="editorial-top-actions">
        <button
          type="button"
          className="editorial-action-btn"
          onClick={() => setIsAddModalOpen(true)}
          title="Add new candidate"
        >
          <Plus size={14} />
          <span>Add Candidate</span>
        </button>

        <div className="editorial-avatar-circle" title="Alex Rivera (Recruiting Lead)">
          <User size={14} />
        </div>
      </div>
    </header>
  );
};
