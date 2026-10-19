import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useATS } from '../context/ATSContext';
import { HeroTalentCircle } from '../components/dashboard/HeroTalentCircle';
import { PipelineVisual } from '../components/dashboard/PipelineVisual';
import { StageChart } from '../components/dashboard/StageChart';
import { UpcomingInterviewsWidget } from '../components/dashboard/UpcomingInterviewsWidget';
import { RecentCandidatesTable } from '../components/dashboard/RecentCandidatesTable';
import { 
  Users, 
  Calendar, 
  Award, 
  Loader2, 
  UserCheck,
  TrendingUp,
  Sparkles,
  Search,
  X
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { 
    kpiData, 
    setActiveTab, 
    isLoading,
    candidates,
    setSearchQuery,
    setSelectedCandidate
  } = useATS();

  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close search dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        searchInputRef.current?.blur();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Filter candidates matching name
  const searchResults = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return [];
    return candidates.filter((c) => c.name.toLowerCase().includes(q));
  }, [candidates, searchTerm]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchTerm.trim()) {
      setSearchQuery(searchTerm.trim());
      setActiveTab('candidates');
      setIsSearchOpen(false);
    }
  };

  const handleSelectCandidate = (candidate: typeof candidates[0]) => {
    setSelectedCandidate(candidate);
    setIsSearchOpen(false);
    setSearchTerm('');
  };

  if (isLoading) {
    return (
      <div className="dashboard-page-container page-loading-state">
        <div className="loading-spinner-box">
          <Loader2 size={24} className="animate-spin accent-spinner" />
          <span className="loading-text">Loading recruitment overview...</span>
        </div>
      </div>
    );
  }

  // Map metric icons
  const getKpiIcon = (id: string) => {
    switch (id) {
      case 'total':
        return <Users size={16} />;
      case 'active':
        return <UserCheck size={16} />;
      case 'interviews':
        return <Calendar size={16} />;
      case 'hires':
        return <Award size={16} />;
      default:
        return <TrendingUp size={16} />;
    }
  };

  return (
    <div className="dashboard-page-container">
      {/* =========================================================================
          DASHBOARD HEADER — Concise Editorial macOS Identity
          ========================================================================= */}
      <header className="dashboard-overview-header">
        <div className="dashboard-header-left">
          <div className="dashboard-title-row">
            <h1 className="dashboard-overview-title">Hiring overview</h1>
            <span className="dashboard-sprint-pill">
              <Sparkles size={12} />
              <span>Active Sprint</span>
            </span>
          </div>
          <p className="dashboard-overview-subtitle">
            Mon, Oct 19, 2026 • Live talent pipeline, active evaluations, and recruitment operations
          </p>
        </div>

        <div className="dashboard-header-actions">
          {/* Candidate Search Pill — Exact Matching Apple Frosted Glass Style */}
          <div className="dashboard-header-search-wrap" ref={searchContainerRef}>
            <form onSubmit={handleSearchSubmit} className={`btn-header-search-pill ${isSearchOpen ? 'is-active' : ''}`}>
              <Search size={14} className="search-pill-icon" />
              <input
                ref={searchInputRef}
                type="text"
                className="search-pill-input"
                placeholder="Search candidate by name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => {
                  if (searchTerm.trim()) setIsSearchOpen(true);
                }}
                aria-label="Search candidates by name"
              />
              {searchTerm && (
                <button
                  type="button"
                  className="search-pill-clear-btn"
                  onClick={() => {
                    setSearchTerm('');
                    setIsSearchOpen(false);
                    searchInputRef.current?.focus();
                  }}
                  title="Clear search"
                >
                  <X size={12} />
                </button>
              )}
            </form>

            {/* Live Dropdown for Search by Name */}
            {isSearchOpen && searchTerm.trim().length > 0 && (
              <div className="dashboard-search-results-dropdown" role="listbox">
                {searchResults.length > 0 ? (
                  <>
                    {searchResults.slice(0, 5).map((candidate) => {
                      const initials = candidate.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase();

                      return (
                        <button
                          key={candidate.id}
                          type="button"
                          className="dashboard-search-item"
                          onClick={() => handleSelectCandidate(candidate)}
                        >
                          <div className="dashboard-search-avatar">{initials}</div>
                          <div className="dashboard-search-item-info">
                            <span className="dashboard-search-item-name">{candidate.name}</span>
                            <span className="dashboard-search-item-role">{candidate.role}</span>
                          </div>
                          <span className="dashboard-search-badge">{candidate.stage}</span>
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      className="dashboard-search-view-all"
                      onClick={() => handleSearchSubmit()}
                    >
                      View all {searchResults.length} matching in Directory →
                    </button>
                  </>
                ) : (
                  <div className="dashboard-search-no-results">
                    No candidates found for "{searchTerm}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Candidate Directory Pill Button */}
          <button
            type="button"
            className="btn-header-secondary"
            onClick={() => setActiveTab('candidates')}
            title="Open Candidate Directory"
          >
            <Users size={14} />
            <span>Candidate Directory</span>
          </button>
        </div>
      </header>

      {/* =========================================================================
          HERO COMPOSITION — Restored Mathematical Circular Talent Visualization
          ========================================================================= */}
      <HeroTalentCircle />

      {/* =========================================================================
          FOUR KEY METRICS — Reference B Floating Glass Geometry
          ========================================================================= */}
      <section className="dashboard-metrics-grid" aria-label="Key Performance Indicators">
        {kpiData.map((kpi, idx) => (
          <div 
            key={kpi.id} 
            className="kpi-card refined-glass-kpi"
            style={{ animationDelay: `${idx * 0.06}s` }}
          >
            <div className="kpi-card-header">
              <span className="kpi-card-label">{kpi.title}</span>
              <div className="kpi-card-icon-pill">
                {getKpiIcon(kpi.id)}
              </div>
            </div>

            <div className="kpi-card-value">
              {kpi.value}
            </div>

            <div className="kpi-card-footer">
              <span className="kpi-change-tag">
                {kpi.change}
              </span>
              <span className="kpi-footer-note">
                {kpi.id === 'total' && 'in recruitment pool'}
                {kpi.id === 'active' && 'evaluations in progress'}
                {kpi.id === 'interviews' && 'technical & screening'}
                {kpi.id === 'hires' && 'offers accepted'}
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* =========================================================================
          ANALYTICS & PIPELINE VISUALIZATION (ROW 1)
          ========================================================================= */}
      <section className="dashboard-workspace-grid-top">
        <div className="dashboard-panel-item">
          <StageChart />
        </div>
        <div className="dashboard-panel-item">
          <PipelineVisual />
        </div>
      </section>

      {/* =========================================================================
          INTERVIEWS & RECENT CANDIDATES (ROW 2)
          ========================================================================= */}
      <section className="dashboard-workspace-grid-bottom">
        <div className="dashboard-panel-item-left">
          <UpcomingInterviewsWidget />
        </div>
        <div className="dashboard-panel-item-right">
          <RecentCandidatesTable onViewAll={() => setActiveTab('candidates')} />
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
