import React from 'react';

interface CloudeeToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  showLabel?: boolean;
  id?: string;
  className?: string;
}

export const CloudeeToggle: React.FC<CloudeeToggleProps> = ({
  enabled,
  onToggle,
  showLabel = true,
  id = 'cloudee-switch',
  className = '',
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onToggle(!enabled);
    }
  };

  return (
    <div className={`cloudee-toggle-wrapper ${className}`}>
      {showLabel && (
        <span 
          id={`${id}-label`} 
          className={`cloudee-toggle-label ${enabled ? 'is-active' : 'is-inactive'}`}
        >
          {enabled ? 'Cloudee On' : 'Cloudee Off'}
        </span>
      )}
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-labelledby={showLabel ? `${id}-label` : undefined}
        aria-label={showLabel ? undefined : (enabled ? 'Cloudee On' : 'Cloudee Off')}
        className={`cloudee-sliding-switch ${enabled ? 'is-checked' : 'is-unchecked'}`}
        onClick={() => onToggle(!enabled)}
        onKeyDown={handleKeyDown}
      >
        <span className="cloudee-switch-track">
          <span className="cloudee-switch-thumb" />
        </span>
      </button>
    </div>
  );
};
