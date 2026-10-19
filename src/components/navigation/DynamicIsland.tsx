import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useATS } from '../../context/ATSContext';
import { useTheme } from '../../context/ThemeContext';
import { NavigationTab } from '../../types/ats';
import {
  Sun,
  Moon,
  LayoutDashboard,
  Users,
  GitFork,
  Settings,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface NavOption {
  id: NavigationTab;
  label: string;
  subtitle: string;
  icon: React.ReactNode;
  badge?: string | number;
}

export const DynamicIsland: React.FC = () => {
  const { activeTab, setActiveTab, candidates } = useATS();
  const { toggleTheme, isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const islandRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const focusedIndexRef = useRef<number>(-1);

  const navItems: NavOption[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      subtitle: 'Overview & metrics',
      icon: <LayoutDashboard size={15} />,
      badge: 'Live',
    },
    {
      id: 'candidates',
      label: 'Candidates',
      subtitle: 'Talent directory',
      icon: <Users size={15} />,
      badge: candidates.length,
    },
    {
      id: 'pipeline',
      label: 'Hiring Pipeline',
      subtitle: 'Kanban workflow',
      icon: <GitFork size={15} />,
      badge: '5 stages',
    },
    {
      id: 'settings',
      label: 'Settings',
      subtitle: 'Preferences & database',
      icon: <Settings size={15} />,
    },
  ];

  // Close on Escape or click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (islandRef.current && !islandRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Handle keyboard navigation inside the menu
  const handleMenuKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusedIndexRef.current = (focusedIndexRef.current + 1) % navItems.length;
      itemRefs.current[focusedIndexRef.current]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusedIndexRef.current = focusedIndexRef.current <= 0 ? navItems.length - 1 : focusedIndexRef.current - 1;
      itemRefs.current[focusedIndexRef.current]?.focus();
    }
  }, [isOpen, navItems.length]);

  const handleSelectTab = (tabId: NavigationTab) => {
    setActiveTab(tabId);
    setIsOpen(false);
  };

  return (
    <div 
      className={`dynamic-island-wrapper ${isOpen ? 'is-expanded' : 'is-collapsed'}`}
      ref={islandRef}
      onKeyDown={handleMenuKeyDown}
    >
      <div 
        className="dynamic-island-surface" 
        role="region" 
        aria-label="Navigation and quick controls"
      >
        {/* Collapsed Pill Control Bar (Editorial proportions matching reference) */}
        <div className="dynamic-island-bar">
          {/* Menu Trigger Button */}
          <button
            type="button"
            className="dynamic-island-trigger"
            onClick={() => setIsOpen(prev => !prev)}
            aria-expanded={isOpen}
            aria-haspopup="menu"
            aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {/* Minimalist 2-line menu icon matching reference */}
            <span className="editorial-menu-icon" aria-hidden="true">
              <span className={`menu-line ${isOpen ? 'is-open' : ''}`} />
              <span className={`menu-line ${isOpen ? 'is-open' : ''}`} />
            </span>
            <span className="trigger-label">Menu</span>
          </button>

          <span className="dynamic-island-divider" aria-hidden="true" />

          {/* Theme Switcher Button */}
          <button
            type="button"
            className="dynamic-island-theme-btn"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {isDark ? (
              <Sun size={14} className="theme-icon sun" />
            ) : (
              <Moon size={14} className="theme-icon moon" />
            )}
          </button>

          {/* Understated Capsule Indicator matching reference percentage pill */}
          <div 
            className="dynamic-island-status"
            title={`${candidates.length} active candidates in pipeline`}
          >
            <span className="status-text">{candidates.length}</span>
          </div>
        </div>

        {/* Expanded Navigation Menu Surface */}
        {isOpen && (
          <div 
            className="dynamic-island-menu" 
            role="menu"
            aria-label="Main Navigation"
          >
            <div className="dynamic-island-menu-header">
              <span className="menu-header-title">Navigation</span>
              <div className="menu-header-badge">
                <Sparkles size={11} />
                <span>macOS Liquid Glass</span>
              </div>
            </div>

            <ul className="dynamic-island-menu-list">
              {navItems.map((item, idx) => {
                const isActive = activeTab === item.id;
                return (
                  <li key={item.id} role="none">
                    <button
                      ref={el => (itemRefs.current[idx] = el)}
                      type="button"
                      role="menuitem"
                      tabIndex={0}
                      className={`dynamic-island-menu-item nav-item-btn ${isActive ? 'active' : ''}`}
                      onClick={() => handleSelectTab(item.id)}
                      onMouseEnter={() => { focusedIndexRef.current = idx; }}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <div className="menu-item-icon-box">
                        {item.icon}
                      </div>

                      <div className="menu-item-text">
                        <span className="menu-item-title">{item.label}</span>
                        <span className="menu-item-sub">{item.subtitle}</span>
                      </div>

                      {item.badge !== undefined && (
                        <span className="menu-item-badge">
                          {item.badge}
                        </span>
                      )}

                      <ChevronRight 
                        size={13} 
                        className={`menu-item-arrow ${isActive ? 'active' : ''}`} 
                      />
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="dynamic-island-menu-footer">
              <div className="shortcut-hint">
                <kbd>⌘K</kbd> <span>Search</span>
                <span className="hint-sep">•</span>
                <kbd>C</kbd> <span>Add</span>
                <span className="hint-sep">•</span>
                <kbd>ESC</kbd> <span>Close</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
