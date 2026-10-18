import React, { useState } from 'react';
import { useATS } from '../../context/ATSContext';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { DemoBanner } from '../common/DemoBanner';
import { AddCandidateModal } from '../candidates/AddCandidateModal';
import { EditCandidateModal } from '../candidates/EditCandidateModal';
import { CandidateDetailModal } from '../candidates/CandidateDetailModal';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { 
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
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className="app-main">
        <Topbar onOpenMobile={() => setMobileSidebarOpen(true)} />
        <DemoBanner />
        {children}
      </div>

      {/* Global Modals & Dialogs */}
      <AddCandidateModal />
      <EditCandidateModal 
        candidate={candidateToEdit}
        isOpen={Boolean(candidateToEdit)}
        onClose={() => setCandidateToEdit(null)}
      />
      <CandidateDetailModal />
      
      {/* Destructive Action Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(candidateToDelete)}
        title="Delete Candidate"
        message={`Are you sure you want to delete ${candidateToDelete?.name}? This will permanently remove their application record and evaluation history.`}
        confirmLabel="Delete Candidate"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setCandidateToDelete(null)}
      />
    </div>
  );
};
