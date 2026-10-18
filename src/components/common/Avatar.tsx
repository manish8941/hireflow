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

  // Stable color based on name string
  const colors = [
    { bg: '#eef2ff', text: '#4338ca', border: '#c7d2fe' },
    { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
    { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
    { bg: '#faf5ff', text: '#7e22ce', border: '#e9d5ff' },
    { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
    { bg: '#fdf2f8', text: '#be185d', border: '#fbcfe8' },
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
