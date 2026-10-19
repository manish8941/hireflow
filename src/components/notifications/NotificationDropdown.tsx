import React, { useRef, useEffect } from 'react';
import { useATS } from '../../context/ATSContext';
import { Check, Bell, Calendar, UserPlus, CheckCircle2, Clock } from 'lucide-react';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationAsRead, clearAllNotifications } = useATS();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'interview':
        return <Calendar size={14} color="var(--accent)" />;
      case 'application':
        return <UserPlus size={14} color="#4E7FB8" />;
      case 'hire':
        return <CheckCircle2 size={14} color="var(--success)" />;
      default:
        return <Clock size={14} color="var(--warning)" />;
    }
  };

  return (
    <div className="notification-popover" ref={dropdownRef}>
      <div className="notification-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Bell size={15} color="var(--accent)" />
          <h4>Notifications</h4>
        </div>
        <button
          type="button"
          className="btn btn-ghost"
          style={{ fontSize: '11px', height: '24px', padding: '0 6px' }}
          onClick={clearAllNotifications}
        >
          <Check size={12} />
          Mark all read
        </button>
      </div>

      <div className="notification-list">
        {notifications.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12.5px' }}>
            No new notifications
          </div>
        ) : (
          notifications.map(notif => (
            <div
              key={notif.id}
              className={`notification-item ${!notif.read ? 'unread' : ''}`}
              onClick={() => markNotificationAsRead(notif.id)}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <div style={{ marginTop: '2px' }}>{getIcon(notif.type)}</div>
                <div style={{ flex: 1 }}>
                  <div className="notification-item-title">{notif.title}</div>
                  <div className="notification-item-msg">{notif.message}</div>
                  <div className="notification-item-time">{notif.timestamp}</div>
                </div>
                {!notif.read && (
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--accent)',
                      marginTop: '6px',
                    }}
                  />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
