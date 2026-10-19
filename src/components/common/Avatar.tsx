import React from 'react';

interface AvatarProps {
  name: string;
  size?: number;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ name, size = 32, className = '' }) => {
  // Extract initials
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join('');

  // Stable color based on name string (Apple macOS refined palette)
  const colors = [
    { bg: 'rgba(84, 120, 184, 0.12)', text: '#3E5F97', border: 'rgba(84, 120, 184, 0.25)' },
    { bg: 'rgba(112, 119, 137, 0.12)', text: '#4B5061', border: 'rgba(112, 119, 137, 0.22)' },
    { bg: 'rgba(57, 134, 106, 0.12)', text: '#265D49', border: 'rgba(57, 134, 106, 0.24)' },
    { bg: 'rgba(78, 127, 184, 0.12)', text: '#365D8A', border: 'rgba(78, 127, 184, 0.24)' },
    { bg: 'rgba(181, 138, 69, 0.12)', text: '#7D5B23', border: 'rgba(181, 138, 69, 0.24)' },
    { bg: 'rgba(128, 90, 140, 0.12)', text: '#5D3C6A', border: 'rgba(128, 90, 140, 0.22)' },
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % colors.length;
  const theme = colors[colorIndex];

  return (
    <div
      className={`candidate-avatar ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: theme.bg,
        color: theme.text,
        borderColor: theme.border,
        fontSize: size <= 28 ? '10px' : '12px',
      }}
      title={name}
    >
      {initials || '?'}
    </div>
  );
};
