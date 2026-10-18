import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Candidate, 
  CandidateStage, 
  NewCandidateInput, 
  UpdateCandidateInput,
  KPICardData, 
  StageDistribution, 
  NavigationTab,
  NotificationItem,
  StorageMode,
} from '../types/ats';
import { INITIAL_NOTIFICATIONS, STAGE_CONFIG } from '../data/mockCandidates';
import { candidateStorage } from '../services/candidateStorage';

interface ATSContextType {
  candidates: Candidate[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  clearError: () => void;
  storageMode: StorageMode;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedStageFilter: string;
  setSelectedStageFilter: (stage: string) => void;
  addCandidate: (input: NewCandidateInput) => Promise<Candidate>;
  updateCandidate: (id: string, input: UpdateCandidateInput) => Promise<Candidate>;
  updateCandidateStage: (candidateId: string, newStage: CandidateStage) => Promise<void>;
  deleteCandidate: (candidateId: string) => Promise<boolean>;
  confirmDeleteCandidate: (candidate: Candidate) => void;
  candidateToDelete: Candidate | null;
  setCandidateToDelete: (candidate: Candidate | null) => void;
  candidateToEdit: Candidate | null;
  setCandidateToEdit: (candidate: Candidate | null) => void;
  resetDemoData: () => Promise<void>;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  selectedCandidate: Candidate | null;
  setSelectedCandidate: (candidate: Candidate | null) => void;
  kpiData: KPICardData[];
  stageDistribution: StageDistribution[];
  filteredCandidates: Candidate[];
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  recentCandidates: Candidate[];
  pipelineStages: { id: CandidateStage; label: string; count: number; color: string }[];
}

const ATSContext = createContext<ATSContextType | undefined>(undefined);

export const ATSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [storageMode, setStorageMode] = useState<StorageMode>(() => candidateStorage.getStorageInfo().mode);
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('all');
  
  // Modals & Selection States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [candidateToEdit, setCandidateToEdit] = useState<Candidate | null>(null);
  const [candidateToDelete, setCandidateToDelete] = useState<Candidate | null>(null);
  
  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const clearError = useCallback(() => setError(null), []);

  // Load from candidateStorage on mount
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await candidateStorage.getAll();
        if (mounted) {
          setCandidates(data);
          setStorageMode(candidateStorage.getStorageInfo().mode);
        }
      } catch (err: unknown) {
        console.error('[HireFlow] Failed to load candidates from storage:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to connect to candidate database');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  // Add Candidate
  const addCandidate = useCallback(async (input: NewCandidateInput): Promise<Candidate> => {
    setIsSaving(true);
    setError(null);
    try {
      const created = await candidateStorage.create(input);
      setCandidates(prev => [created, ...prev]);

      // Add notification
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: 'New Candidate Added',
        message: `${created.name} was added to ${created.role} (${STAGE_CONFIG[created.stage]?.label || created.stage}).`,
        timestamp: 'Just now',
        read: false,
        type: 'application',
      };
      setNotifications(prev => [newNotif, ...prev]);
      return created;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add candidate to database';
      setError(msg);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Update Candidate
  const updateCandidate = useCallback(async (id: string, input: UpdateCandidateInput): Promise<Candidate> => {
    setIsSaving(true);
    setError(null);
    try {
      const updated = await candidateStorage.update(id, input);
      setCandidates(prev => prev.map(c => c.id === id ? updated : c));

      // Sync if selectedCandidate is open
      setSelectedCandidate(prev => prev && prev.id === id ? updated : prev);

      // Add notification
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: 'Candidate Updated',
        message: `${updated.name}'s details were updated.`,
        timestamp: 'Just now',
        read: false,
        type: 'application',
      };
      setNotifications(prev => [newNotif, ...prev]);
      return updated;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update candidate in database';
      setError(msg);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Update Candidate Stage
  const updateCandidateStage = useCallback(async (candidateId: string, newStage: CandidateStage): Promise<void> => {
    setIsSaving(true);
    setError(null);
    try {
      const updated = await candidateStorage.updateStage(candidateId, newStage);
      setCandidates(prev => prev.map(c => c.id === candidateId ? updated : c));

      // Sync selectedCandidate if open
      setSelectedCandidate(prev => prev && prev.id === candidateId ? updated : prev);

      // Add notification
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: 'Stage Progression',
        message: `${updated.name} moved to ${STAGE_CONFIG[newStage]?.label || newStage}.`,
        timestamp: 'Just now',
        read: false,
        type: 'interview',
      };
      setNotifications(prev => [newNotif, ...prev]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update candidate stage in database';
      setError(msg);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Delete Candidate
  const deleteCandidate = useCallback(async (candidateId: string): Promise<boolean> => {
    setIsSaving(true);
    setError(null);
    try {
      const deleted = await candidateStorage.delete(candidateId);
      if (deleted) {
        setCandidates(prev => prev.filter(c => c.id !== candidateId));
        if (selectedCandidate?.id === candidateId) {
          setSelectedCandidate(null);
        }
      }
      return deleted;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete candidate from database';
      setError(msg);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [selectedCandidate]);

  const confirmDeleteCandidate = useCallback((candidate: Candidate) => {
    setCandidateToDelete(candidate);
  }, []);

  // Reset demo data
  const resetDemoData = useCallback(async (): Promise<void> => {
    setIsSaving(true);
    setError(null);
    try {
      const fresh = await candidateStorage.resetToDemo();
      setCandidates(fresh);
      setSelectedCandidate(null);
      setCandidateToEdit(null);
      setCandidateToDelete(null);
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: 'Demo Data Reset',
        message: 'Candidate dataset reverted to default demo baseline.',
        timestamp: 'Just now',
        read: false,
        type: 'reminder',
      };
      setNotifications(prev => [newNotif, ...prev]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reset demo dataset in database';
      setError(msg);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Notification actions
  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  // Filtered candidates by search and stage
  const filteredCandidates = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return candidates.filter(candidate => {
      const matchesSearch = 
        !query ||
        candidate.name.toLowerCase().includes(query) ||
        candidate.role.toLowerCase().includes(query) ||
        candidate.email.toLowerCase().includes(query) ||
        candidate.department.toLowerCase().includes(query) ||
        candidate.source.toLowerCase().includes(query);

      const matchesStage = 
        selectedStageFilter === 'all' || 
        candidate.stage === selectedStageFilter;

      return matchesSearch && matchesStage;
    });
  }, [candidates, searchQuery, selectedStageFilter]);

  // Dynamic KPI Metrics derived directly from candidate records
  const kpiData = useMemo<KPICardData[]>(() => {
    const total = candidates.length;
    const active = candidates.filter(c => ['applied', 'screening', 'interview', 'offer'].includes(c.stage)).length;
    const interviews = candidates.filter(c => c.stage === 'interview').length;
    const hires = candidates.filter(c => c.stage === 'hired').length;

    return [
      {
        id: 'kpi-total',
        title: 'Total Candidates',
        value: total,
        change: '+14%',
        trend: 'up',
        subtext: 'in recruitment pool',
        iconName: 'Users',
      },
      {
        id: 'kpi-active',
        title: 'Active Candidates',
        value: active,
        change: `${active} active`,
        trend: 'up',
        subtext: 'evaluations in progress',
        iconName: 'UserCheck',
      },
      {
        id: 'kpi-interviews',
        title: 'Interviews Scheduled',
        value: interviews,
        change: `${interviews} pending`,
        trend: 'neutral',
        subtext: 'technical & screening',
        iconName: 'Calendar',
      },
      {
        id: 'kpi-hires',
        title: 'Hires',
        value: hires,
        change: `${hires} signed`,
        trend: 'up',
        subtext: 'offers accepted',
        iconName: 'Award',
      },
    ];
  }, [candidates]);

  // Stage Distribution for visual chart
  const stageDistribution = useMemo<StageDistribution[]>(() => {
    const stages: CandidateStage[] = ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'];
    const totalCount = candidates.length || 1;

    return stages.map(stageKey => {
      const count = candidates.filter(c => c.stage === stageKey).length;
      return {
        stage: stageKey,
        label: STAGE_CONFIG[stageKey]?.label || stageKey,
        count,
        color: STAGE_CONFIG[stageKey]?.color || '#6366f1',
        percentage: Math.round((count / totalCount) * 100),
      };
    });
  }, [candidates]);

  // Pipeline stages for Funnel visual
  const pipelineStages = useMemo(() => {
    const stages: CandidateStage[] = ['applied', 'screening', 'interview', 'offer', 'hired'];
    return stages.map(st => ({
      id: st,
      label: STAGE_CONFIG[st]?.label || st,
      count: candidates.filter(c => c.stage === st).length,
      color: STAGE_CONFIG[st]?.color || '#6366f1',
    }));
  }, [candidates]);

  // Recent Candidates: sorted by appliedDate descending
  // If search query is active, filter candidates; otherwise take top 6
  const recentCandidates = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const sourceList = query
      ? candidates.filter(c => 
          c.name.toLowerCase().includes(query) ||
          c.role.toLowerCase().includes(query) ||
          c.email.toLowerCase().includes(query) ||
          c.department.toLowerCase().includes(query)
        )
      : candidates;

    return [...sourceList]
      .sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime())
      .slice(0, 6);
  }, [candidates, searchQuery]);

  return (
    <ATSContext.Provider
      value={{
        candidates,
        isLoading,
        isSaving,
        error,
        clearError,
        storageMode,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        selectedStageFilter,
        setSelectedStageFilter,
        addCandidate,
        updateCandidate,
        updateCandidateStage,
        deleteCandidate,
        confirmDeleteCandidate,
        candidateToDelete,
        setCandidateToDelete,
        candidateToEdit,
        setCandidateToEdit,
        resetDemoData,
        isAddModalOpen,
        setIsAddModalOpen,
        selectedCandidate,
        setSelectedCandidate,
        kpiData,
        stageDistribution,
        filteredCandidates,
        notifications,
        markNotificationAsRead,
        clearAllNotifications,
        recentCandidates,
        pipelineStages,
      }}
    >
      {children}
    </ATSContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useATS = () => {
  const context = useContext(ATSContext);
  if (!context) {
    throw new Error('useATS must be used within an ATSProvider');
  }
  return context;
};
