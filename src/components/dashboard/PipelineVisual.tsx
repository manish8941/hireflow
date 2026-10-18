import React from 'react';
import { useATS } from '../../context/ATSContext';
import { GitCommit, ArrowRight } from 'lucide-react';

export const PipelineVisual: React.FC = () => {
  const { pipelineStages, candidates, setActiveTab } = useATS();
  const total = candidates.length || 1;

  // Find max count to scale visual bars proportionally
  const maxCount = Math.max(...pipelineStages.map(s => s.count), 1);

  return (
    <div className="panel-card">
      <div className="panel-header">
        <div className="panel-title">
          <GitCommit size={16} className="text-indigo" />
          <span>Candidate Pipeline</span>
        </div>
        <button 
          type="button" 
          className="btn btn-ghost" 
          style={{ fontSize: '12px', padding: '0 8px', height: '28px' }}
          onClick={() => setActiveTab('pipeline')}
        >
          View Kanban <ArrowRight size={13} />
        </button>
      </div>

      <div className="panel-body">
        <div className="pipeline-visual-wrapper">
          {pipelineStages.map(stage => {
            const percentageOfTotal = Math.round((stage.count / total) * 100);
            const fillWidth = Math.max((stage.count / maxCount) * 100, 4);

            return (
              <div key={stage.id} className="funnel-stage-row">
                <div className="funnel-stage-info">
                  <span className="funnel-stage-name">{stage.label}</span>
                  <span className="funnel-stage-count">{stage.count}</span>
                </div>

                <div className="funnel-bar-track">
                  <div
                    className="funnel-bar-fill"
                    style={{
                      width: `${fillWidth}%`,
                      backgroundColor: stage.color,
                    }}
                  />
                </div>

                <div className="funnel-stage-pct">
                  {percentageOfTotal}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
