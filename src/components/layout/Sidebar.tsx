import React from 'react';
import { useATS } from '../../context/ATSContext';
import { NavigationTab } from '../../types/ats';
import { 
  LayoutDashboard, 
  Users, 
  GitFork, 
  Settings, 
  Zap, 
  X,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { activeTab, setActiveTab, candidates } = useATS();

  const navItems: { id: NavigationTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={17} />,
    },
    {
      id: 'candidates',
      label: 'Candidates',
      icon: <Users size={17} />,
      badge: candidates.length,
    },
    {
      id: 'pipeline',
      label: 'Hiring Pipeline',
      icon: <GitFork size={17} />,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings size={17} />,
    },
  ];

  const handleNavClick = (tabId: NavigationTab) => {
    setActiveTab(tabId);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop overlay */}
      {mobileOpen && (
        <div
          className="modal-overlay"
          style={{ zIndex: 35 }}
          onClick={onCloseMobile}
        />
      )}

      <aside className={`app-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Brand Header with macOS Traffic Lights */}
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="macos-window-dots" title="macOS Window Controls">
              <span className="macos-dot close" />
              <span className="macos-dot minimize" />
              <span className="macos-dot zoom" />
            </div>
            <div className="brand-wrapper">
              <div className="brand-logo-mark">
                <Zap size={14} fill="#ffffff" />
              </div>
              <div className="brand-text">
                <span>HireFlow</span>
                <span className="brand-badge">ATS</span>
              </div>
            </div>
          </div>

          {/* Mobile close button */}
          {mobileOpen && (
            <button
              type="button"
              className="icon-btn mobile-menu-btn"
              style={{ marginLeft: 'auto' }}
              onClick={onCloseMobile}
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Sidebar Nav Content */}
        <div className="sidebar-content">
          <div>
            <div className="nav-section-title">Navigation</div>
            <ul className="nav-menu">
              {navItems.map(item => {
                const isActive = activeTab === item.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={`nav-item-btn ${isActive ? 'active' : ''}`}
                      onClick={() => handleNavClick(item.id)}
                    >
                      <div className="nav-item-content">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      {typeof item.badge === 'number' && (
                        <span className="nav-badge">{item.badge}</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Quick Filter / Workspace Info Card */}
          <div
            style={{
              marginTop: 'auto',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--surface-glass)',
              border: '1px solid var(--border-glass)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <Sparkles size={14} color="var(--accent)" />
              <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Q4 Engineering Hiring
              </span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              8 of 12 engineering headcount filled. Velocity tracking on pace.
            </p>
          </div>
        </div>

        {/* Sidebar Footer: Team Workspace */}
        <div className="sidebar-footer">
          <div className="sidebar-team-badge">
            <div className="team-avatar">HF</div>
            <div className="team-info">
              <div className="team-name">Acme Robotics</div>
              <div className="team-plan">Growth Plan • 14 Seats</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
