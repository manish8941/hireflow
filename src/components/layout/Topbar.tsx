import React, { useState } from 'react';
import { useATS } from '../../context/ATSContext';
import { Search, Bell, Menu, Plus } from 'lucide-react';
import { NotificationDropdown } from '../notifications/NotificationDropdown';

interface TopbarProps {
  onOpenMobile: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenMobile }) => {
  const { 
    activeTab, 
    searchQuery, 
    setSearchQuery, 
    setIsAddModalOpen,
    notifications,
  } = useATS();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const getPageMeta = () => {
    switch (activeTab) {
      case 'dashboard':
        return { title: 'Dashboard', subtitle: 'Overview & Metrics' };
      case 'candidates':
        return { title: 'Candidates', subtitle: 'Candidate Directory' };
      case 'pipeline':
        return { title: 'Hiring Pipeline', subtitle: 'Kanban Workflow' };
      case 'settings':
        return { title: 'Settings', subtitle: 'ATS Configuration' };
      default:
        return { title: 'Dashboard', subtitle: 'Overview' };
    }
  };

  const { title, subtitle } = getPageMeta();

  return (
    <header className="app-topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={onOpenMobile}
          aria-label="Open navigation menu"
        >
          <Menu size={18} />
        </button>

        <div className="topbar-page-title-box">
          <span className="topbar-title">{title}</span>
          <span className="topbar-subtitle">• {subtitle}</span>
        </div>
      </div>

      <div className="topbar-right">
        {/* Search Input */}
        <div className="topbar-search-box">
          <Search size={14} className="topbar-search-icon" />
          <input
            type="text"
            className="topbar-search-input"
            placeholder="Search candidates, roles..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <span className="topbar-search-shortcut">⌘K</span>
        </div>

        {/* Global Add Candidate Button in Topbar */}
        <button
          type="button"
          className="btn btn-primary"
          style={{ height: '32px', padding: '0 10px', fontSize: '12px' }}
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus size={14} />
          <span style={{ display: 'inline' }}>Add Candidate</span>
        </button>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setIsNotifOpen(prev => !prev)}
            aria-label="View notifications"
          >
            <Bell size={17} />
            {unreadCount > 0 && <span className="unread-dot" />}
          </button>

          <NotificationDropdown
            isOpen={isNotifOpen}
            onClose={() => setIsNotifOpen(false)}
          />
        </div>

        {/* User Profile Pill */}
        <div className="user-menu-pill" title="Alex Rivera (Recruiting Lead)">
          <div className="user-avatar-circle">AR</div>
          <span className="user-meta-name">Alex R.</span>
        </div>
      </div>
    </header>
  );
};
