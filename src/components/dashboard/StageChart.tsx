import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Cell 
} from 'recharts';
import { useATS } from '../../context/ATSContext';
import { useTheme } from '../../context/ThemeContext';
import { BarChart3, TrendingUp, Info } from 'lucide-react';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      label: string;
      count: number;
      percentage: number;
      conversionRate?: number;
    };
  }>;
  isDark?: boolean;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, isDark = true }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div 
        style={{
          background: isDark ? 'rgba(20, 20, 24, 0.94)' : 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(24px) saturate(140%)',
          WebkitBackdropFilter: 'blur(24px) saturate(140%)',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.14)' : '1px solid rgba(0, 0, 0, 0.12)',
          borderRadius: '10px',
          padding: '10px 14px',
          boxShadow: isDark 
            ? '0 16px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.10)'
            : '0 16px 36px rgba(0, 0, 0, 0.10), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
          fontSize: '12px',
          color: isDark ? '#F4F4F5' : '#18181B',
          minWidth: '145px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontWeight: 600, color: isDark ? '#F4F4F5' : '#18181B', fontSize: '13px' }}>
            {data.label}
          </span>
          <span style={{ 
            fontSize: '10.5px', 
            fontWeight: 700, 
            padding: '1px 6px', 
            borderRadius: '4px', 
            background: isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(0, 0, 0, 0.08)', 
            color: isDark ? '#F4F4F5' : '#18181B',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(0, 0, 0, 0.12)',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {data.percentage}%
          </span>
        </div>
        <div style={{ color: isDark ? '#A1A1AA' : '#646473', fontSize: '11.5px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Candidate Count:</span>
          <strong style={{ color: isDark ? '#F4F4F5' : '#18181B', marginLeft: '6px', fontVariantNumeric: 'tabular-nums' }}>{data.count}</strong>
        </div>
        {typeof data.conversionRate === 'number' && (
          <div style={{ color: isDark ? '#71717A' : '#8E8E9E', fontSize: '11px', marginTop: '4px', borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)', paddingTop: '4px' }}>
            Funnel Retention: <strong style={{ color: isDark ? '#E4E4E7' : '#18181B', fontVariantNumeric: 'tabular-nums' }}>{data.conversionRate}%</strong>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export const StageChart: React.FC = () => {
  const { stageDistribution, candidates } = useATS();
  const { isDark } = useTheme();
  const [viewMode, setViewMode] = useState<'distribution' | 'funnel'>('distribution');

  // Calculate cumulative funnel progression
  const total = candidates.length || 1;
  const stagesInOrder = ['applied', 'screening', 'interview', 'offer', 'hired'];
  
  let cumulativeCount = 0;
  const funnelData = stagesInOrder.map((stageKey) => {
    const stageCandidates = candidates.filter(c => c.stage === stageKey);
    const count = stageCandidates.length;
    cumulativeCount += count;
    const stageObj = stageDistribution.find(s => s.stage === stageKey);
    const label = stageObj?.label || stageKey;
    const percentage = Math.round((count / total) * 100);

    return {
      stage: stageKey,
      label,
      count,
      percentage,
      cumulativeCount,
      conversionRate: Math.round(((total - (cumulativeCount - count)) / total) * 100),
      color: stageObj?.color || (isDark ? '#DDD6FE' : '#7C3AED'),
    };
  });

  return (
    <div className="panel-card" style={{ height: '100%' }}>
      <div className="panel-header">
        <div className="panel-title">
          <BarChart3 size={15} color="var(--accent)" />
          <span>Pipeline Analytics</span>
        </div>

        {/* macOS Segmented Pill Control */}
        <div 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'var(--surface-glass-nested)',
            border: '1px solid var(--border-glass)',
            borderRadius: '8px',
            padding: '2px',
            gap: '2px',
          }}
        >
          <button
            type="button"
            onClick={() => setViewMode('distribution')}
            style={{
              padding: '3px 10px',
              fontSize: '11.5px',
              fontWeight: viewMode === 'distribution' ? 600 : 500,
              background: viewMode === 'distribution' ? 'var(--accent-soft)' : 'transparent',
              color: viewMode === 'distribution' ? 'var(--text-primary)' : 'var(--text-secondary)',
              border: viewMode === 'distribution' ? '1px solid var(--border-glass-elevated)' : '1px solid transparent',
              borderRadius: '6px',
              boxShadow: viewMode === 'distribution' ? 'var(--shadow-glass)' : 'none',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <BarChart3 size={12} />
            <span>Distribution</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('funnel')}
            style={{
              padding: '3px 10px',
              fontSize: '11.5px',
              fontWeight: viewMode === 'funnel' ? 600 : 500,
              background: viewMode === 'funnel' ? 'var(--accent-soft)' : 'transparent',
              color: viewMode === 'funnel' ? 'var(--text-primary)' : 'var(--text-secondary)',
              border: viewMode === 'funnel' ? '1px solid var(--border-glass-elevated)' : '1px solid transparent',
              borderRadius: '6px',
              boxShadow: viewMode === 'funnel' ? 'var(--shadow-glass)' : 'none',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <TrendingUp size={12} />
            <span>Progression Curve</span>
          </button>
        </div>
      </div>

      <div style={{ height: '240px', width: '100%', padding: '8px 12px 4px' }}>
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'distribution' ? (
            <BarChart 
              data={stageDistribution}
              margin={{ top: 12, right: 18, left: -14, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'} />
              <XAxis 
                dataKey="label" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: isDark ? '#A1A1AA' : '#646473' }} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: isDark ? '#A1A1AA' : '#646473' }} 
                allowDecimals={false}
                domain={[0, 'dataMax + 1']}
              />
              <Tooltip 
                content={<CustomTooltip isDark={isDark} />} 
                cursor={{ fill: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)' }} 
              />
              <Bar 
                dataKey="count" 
                radius={[6, 6, 0, 0]} 
                maxBarSize={44}
                isAnimationActive={true}
                animationDuration={450}
                animationEasing="ease-out"
              >
                {stageDistribution.map((entry) => (
                  <Cell 
                    key={`cell-${entry.stage}`} 
                    fill={entry.color} 
                    opacity={0.88}
                  />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <AreaChart
              data={funnelData}
              margin={{ top: 12, right: 18, left: -14, bottom: 0 }}
            >
              <defs>
                <linearGradient id="liquidAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isDark ? '#E4E4E7' : '#18181B'} stopOpacity={isDark ? 0.30 : 0.20} />
                  <stop offset="95%" stopColor={isDark ? '#71717A' : '#71717A'} stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'} />
              <XAxis 
                dataKey="label" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: isDark ? '#A1A1AA' : '#646473' }} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: isDark ? '#A1A1AA' : '#646473' }} 
                allowDecimals={false}
                domain={[0, 'dataMax + 1']}
              />
              <Tooltip 
                content={<CustomTooltip isDark={isDark} />} 
                cursor={{ stroke: isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.25)', strokeWidth: 1 }} 
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke={isDark ? '#E4E4E7' : '#18181B'}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#liquidAreaGradient)"
                dot={{ r: 4, fill: isDark ? '#D4D4D8' : '#27272A', stroke: isDark ? '#09090B' : '#FFFFFF', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#FFFFFF', stroke: isDark ? '#FAFAFA' : '#18181B', strokeWidth: 2.5 }}
                isAnimationActive={true}
                animationDuration={450}
                animationEasing="ease-out"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      <div 
        style={{ 
          padding: '8px 16px 12px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          borderTop: '1px solid var(--border-glass-subtle)',
          background: 'var(--surface-glass-nested)',
          borderBottomLeftRadius: 'var(--radius-md)',
          borderBottomRightRadius: 'var(--radius-md)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
          <Info size={12} color="var(--accent)" />
          <span>Live candidate counts directly synced from storage</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
          <span>Active Pipeline:</span>
          <strong style={{ color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
            {candidates.filter(c => c.stage !== 'rejected').length} active
          </strong>
        </div>
      </div>
    </div>
  );
};
