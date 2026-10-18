import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Cell 
} from 'recharts';
import { useATS } from '../../context/ATSContext';
import { BarChart3 } from 'lucide-react';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      label: string;
      count: number;
      percentage: number;
    };
  }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div 
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          padding: '8px 12px',
          boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.08)',
          fontSize: '12px',
        }}
      >
        <p style={{ fontWeight: 600, color: '#0f172a', marginBottom: '2px' }}>
          {data.label}
        </p>
        <p style={{ color: '#475569' }}>
          Candidates: <strong style={{ color: '#0f172a' }}>{data.count}</strong> ({data.percentage}%)
        </p>
      </div>
    );
  }
  return null;
};

export const StageChart: React.FC = () => {
  const { stageDistribution } = useATS();

  return (
    <div className="panel-card">
      <div className="panel-header">
        <div className="panel-title">
          <BarChart3 size={16} />
          <span>Stage Distribution</span>
        </div>
        <span className="panel-subtitle">Current candidate breakdown</span>
      </div>

      <div className="panel-body" style={{ height: '240px', padding: '16px 12px 10px 0' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={stageDistribution}
            margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="label" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#64748b' }} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#94a3b8' }} 
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }} />
            <Bar 
              dataKey="count" 
              radius={[4, 4, 0, 0]} 
              maxBarSize={44}
            >
              {stageDistribution.map((entry) => (
                <Cell key={`cell-${entry.stage}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
