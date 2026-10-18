import React from 'react';
import { Users, UserCheck, Calendar, Award, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { KPICardData } from '../../types/ats';

interface KPICardProps {
  data: KPICardData;
}

export const KPICard: React.FC<KPICardProps> = ({ data }) => {
  const getIcon = () => {
    switch (data.iconName) {
      case 'Users':
        return <Users size={16} />;
      case 'UserCheck':
        return <UserCheck size={16} />;
      case 'Calendar':
        return <Calendar size={16} />;
      case 'Award':
        return <Award size={16} />;
      default:
        return <Users size={16} />;
    }
  };

  const getTrendIcon = () => {
    if (data.trend === 'up') return <TrendingUp size={12} />;
    if (data.trend === 'down') return <TrendingDown size={12} />;
    return <Minus size={12} />;
  };

  return (
    <div className="kpi-card">
      <div className="kpi-card-top">
        <span className="kpi-card-title">{data.title}</span>
        <div className="kpi-card-icon-wrap">{getIcon()}</div>
      </div>
      <div>
        <div className="kpi-card-value">{data.value}</div>
      </div>
      <div className="kpi-card-bottom">
        <span className={`trend-badge ${data.trend}`}>
          {getTrendIcon()}
          {data.change}
        </span>
        <span className="kpi-card-subtext">{data.subtext}</span>
      </div>
    </div>
  );
};
