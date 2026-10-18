import React, { useEffect } from 'react';
import { ATSProvider, useATS } from './context/ATSContext';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { CandidatesPage } from './pages/CandidatesPage';
import { PipelinePage } from './pages/PipelinePage';
import { SettingsPage } from './pages/SettingsPage';

const MainContent: React.FC = () => {
  const { activeTab, setIsAddModalOpen } = useATS();

  // Keyboard shortcut listener: Cmd/Ctrl + K to focus search, C to open Add Candidate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If typing in an input, textarea, or select, don't trigger global hotkeys
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.tagName === 'SELECT'
      ) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>('.topbar-search-input');
        if (searchInput) {
          searchInput.focus();
        }
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        setIsAddModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsAddModalOpen]);

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'candidates':
        return <CandidatesPage />;
      case 'pipeline':
        return <PipelinePage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return <AppLayout>{renderActivePage()}</AppLayout>;
};

export function App() {
  return (
    <ATSProvider>
      <MainContent />
    </ATSProvider>
  );
}

export default App;
