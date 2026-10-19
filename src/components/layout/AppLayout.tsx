import React from 'react';
import { useATS } from '../../context/ATSContext';
import { Topbar } from './Topbar';
import { DemoBanner } from '../common/DemoBanner';
import { AddCandidateModal } from '../candidates/AddCandidateModal';
import { EditCandidateModal } from '../candidates/EditCandidateModal';
import { CandidateDetailModal } from '../candidates/CandidateDetailModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { LiquidPurpleCanvas } from '../common/LiquidPurpleCanvas';
import { CloudeeWidget } from '../../mascot/CloudeeWidget';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { 
    activeTab,
    candidateToDelete, 
    setCandidateToDelete, 
    deleteCandidate,
    candidateToEdit,
    setCandidateToEdit,
  } = useATS();

  const handleConfirmDelete = async () => {
    if (candidateToDelete) {
      await deleteCandidate(candidateToDelete.id);
      setCandidateToDelete(null);
    }
  };

  return (
    <div className="app-shell">
      {/* Immersive interactive atmospheric purple liquid background */}
      <LiquidPurpleCanvas />

      {/* Main application workspace - full viewport width, no persistent sidebar */}
      <div className="app-main">
        <Topbar />
        <DemoBanner />
        
        {/* Fluid page transition wrapper */}
        <main className="app-page-transition-wrapper" key={activeTab}>
          {children}
        </main>
      </div>

      {/* Global Modals & Dialogs */}
      <AddCandidateModal />
      <EditCandidateModal 
        candidate={candidateToEdit}
        isOpen={Boolean(candidateToEdit)}
        onClose={() => setCandidateToEdit(null)}
      />
      <CandidateDetailModal />
      
      {/* Destructive Action Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(candidateToDelete)}
        title="Delete Candidate"
        message={`Are you sure you want to delete ${candidateToDelete?.name}? This will permanently remove their application record and evaluation history.`}
        confirmLabel="Delete Candidate"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setCandidateToDelete(null)}
      />

      {/* Cloudee Interactive Floating AI Mascot */}
      <CloudeeWidget />
    </div>
  );
};
