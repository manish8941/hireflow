import React from 'react';
import { useATS } from '../context/ATSContext';
import { KPICard } from '../components/dashboard/KPICard';
import { PipelineVisual } from '../components/dashboard/PipelineVisual';
import { StageChart } from '../components/dashboard/StageChart';
import { RecentCandidatesTable } from '../components/dashboard/RecentCandidatesTable';
import { UserPlus, Calendar, Sparkles, Loader2 } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { kpiData, setIsAddModalOpen, setActiveTab, isLoading } = useATS();

  // Current formatted date
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  if (isLoading) {
    return (
      <div className="page-container" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <Loader2 size={28} className="text-indigo animate-spin" />
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Loading ATS candidates...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Welcome Heading & Page Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h1>Engineering Hiring Dashboard</h1>
          <div className="page-header-date">
            <Calendar size={14} color="var(--indigo-600)" />
            <span>{todayFormatted}</span>
            <span style={{ color: 'var(--border-medium)' }}>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
              <Sparkles size={13} color="#f59e0b" />
              Active recruitment sprint
            </span>
          </div>
        </div>

        <div className="page-header-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setActiveTab('candidates')}
          >
            Candidate Directory
          </button>

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

      {/* Four KPI Cards Grid */}
      <section className="kpi-grid" aria-label="Key Performance Indicators">
        {kpiData.map(kpi => (
          <KPICard key={kpi.id} data={kpi} />
        ))}
      </section>

      {/* Middle Grid: Pipeline Funnel + Distribution Chart */}
      <section className="dashboard-grid-2">
        <PipelineVisual />
        <StageChart />
      </section>

      {/* Recent Candidates Table */}
      <section>
        <RecentCandidatesTable onViewAll={() => setActiveTab('candidates')} />
      </section>
    </div>
  );
};
