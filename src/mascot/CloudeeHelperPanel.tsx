import React, { useEffect, useRef } from 'react';
import { X, Sparkles, Plus, Users, BarChart3, Sliders, Search, ArrowRight } from 'lucide-react';
import { CloudeeToggle } from './CloudeeToggle';
import { CloudeeQuickAction } from './cloudee.types';

interface CloudeeHelperPanelProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  subMessage?: string;
  enabled: boolean;
  onToggleEnabled: (enabled: boolean) => void;
  activeTab: string;
  onNavigate: (tab: 'dashboard' | 'candidates' | 'pipeline' | 'settings') => void;
  onOpenAddCandidate: () => void;
  onFocusSearch: () => void;
}

export const CloudeeHelperPanel: React.FC<CloudeeHelperPanelProps> = ({
  isOpen,
  onClose,
  message,
  subMessage,
  enabled,
  onToggleEnabled,
  activeTab,
  onNavigate,
  onOpenAddCandidate,
  onFocusSearch,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Esc key closes panel
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        // Only close if click was not on the mascot trigger itself
        const target = e.target as HTMLElement;
        if (!target.closest('.cloudee-mascot-btn')) {
          onClose();
        }
      }
    };

    const timer = setTimeout(() => {
      window.addEventListener('mousedown', handleClickOutside);
    }, 50);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Determine contextual quick actions based on current tab
  const getQuickActions = (): CloudeeQuickAction[] => {
    const actions: CloudeeQuickAction[] = [];

    // Always provide quick Add Candidate
    actions.push({
      id: 'add-candidate',
      label: 'Add Candidate',
      icon: 'plus',
      action: () => {
        onOpenAddCandidate();
        onClose();
      },
    });

    if (activeTab === 'dashboard') {
      actions.push({
        id: 'go-candidates',
        label: 'Candidate Directory',
        icon: 'users',
        action: () => {
          onNavigate('candidates');
          onClose();
        },
      });
      actions.push({
        id: 'go-pipeline',
        label: 'Hiring Pipeline',
        icon: 'barchart',
        action: () => {
          onNavigate('pipeline');
          onClose();
        },
      });
    } else if (activeTab === 'candidates') {
      actions.push({
        id: 'search-candidates',
        label: 'Search Candidates',
        icon: 'search',
        action: () => {
          onFocusSearch();
          onClose();
        },
      });
      actions.push({
        id: 'go-dashboard',
        label: 'Dashboard Overview',
        icon: 'barchart',
        action: () => {
          onNavigate('dashboard');
          onClose();
        },
      });
    } else if (activeTab === 'pipeline') {
      actions.push({
        id: 'go-candidates',
        label: 'All Candidates',
        icon: 'users',
        action: () => {
          onNavigate('candidates');
          onClose();
        },
      });
      actions.push({
        id: 'go-dashboard',
        label: 'Dashboard Overview',
        icon: 'barchart',
        action: () => {
          onNavigate('dashboard');
          onClose();
        },
      });
    } else {
      actions.push({
        id: 'go-dashboard',
        label: 'Dashboard Overview',
        icon: 'barchart',
        action: () => {
          onNavigate('dashboard');
          onClose();
        },
      });
      actions.push({
        id: 'go-candidates',
        label: 'Candidate Directory',
        icon: 'users',
        action: () => {
          onNavigate('candidates');
          onClose();
        },
      });
    }

    // Always offer Settings link
    actions.push({
      id: 'go-settings',
      label: 'Preferences & Settings',
      icon: 'sliders',
      action: () => {
        onNavigate('settings');
        onClose();
      },
    });

    return actions;
  };

  const quickActions = getQuickActions();

  return (
    <div
      ref={panelRef}
      className="cloudee-helper-panel"
      role="dialog"
      aria-label="Cloudee Assistant Panel"
    >
      {/* Header with Title, Status & Close button */}
      <div className="cloudee-helper-header">
        <div className="cloudee-helper-badge">
          <Sparkles className="cloudee-sparkle-icon" size={14} />
          <span className="cloudee-badge-title">Cloudee Assistant</span>
        </div>
        <button
          type="button"
          className="cloudee-close-btn"
          onClick={onClose}
          aria-label="Close Cloudee Helper"
        >
          <X size={15} />
        </button>
      </div>

      {/* Greeting & Contextual Speech Bubble */}
      <div className="cloudee-speech-bubble">
        <div className="cloudee-speech-main">{message}</div>
        {subMessage && <div className="cloudee-speech-sub">{subMessage}</div>}
      </div>

      {/* Quick Actions Grid */}
      <div className="cloudee-actions-section">
        <div className="cloudee-section-title">Quick Actions</div>
        <div className="cloudee-actions-list">
          {quickActions.map((action) => (
            <button
              key={action.id}
              type="button"
              className="cloudee-action-btn"
              onClick={action.action}
            >
              <span className="cloudee-action-icon-wrap">
                {action.icon === 'plus' && <Plus size={13} />}
                {action.icon === 'users' && <Users size={13} />}
                {action.icon === 'barchart' && <BarChart3 size={13} />}
                {action.icon === 'search' && <Search size={13} />}
                {action.icon === 'sliders' && <Sliders size={13} />}
              </span>
              <span className="cloudee-action-label">{action.label}</span>
              <ArrowRight size={12} className="cloudee-action-arrow" />
            </button>
          ))}
        </div>
      </div>

      {/* Footer with Sliding Toggle */}
      <div className="cloudee-helper-footer">
        <div className="cloudee-footer-toggle-box">
          <CloudeeToggle
            enabled={enabled}
            onToggle={(next) => {
              onToggleEnabled(next);
              if (!next) {
                // If toggled off, close helper panel gracefully
                setTimeout(() => onClose(), 200);
              }
            }}
            id="cloudee-panel-toggle"
          />
        </div>
        <div className="cloudee-helper-hint">Keyboard: Esc to dismiss</div>
      </div>
    </div>
  );
};
