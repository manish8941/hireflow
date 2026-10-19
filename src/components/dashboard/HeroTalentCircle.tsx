import React from 'react';
import { useATS } from '../../context/ATSContext';
import { Avatar } from '../common/Avatar';
import { StatusBadge } from '../common/StatusBadge';
import { Sparkles, Plus, Star } from 'lucide-react';
import { Candidate } from '../../types/ats';

export const HeroTalentCircle: React.FC = () => {
  const { candidates, setIsAddModalOpen, setSelectedCandidate } = useATS();

  // Select up to 6 real candidate records from active state
  const featuredCandidates: Candidate[] = candidates.slice(0, 6);

  // Exact mathematical circle geometry (720px square coordinate frame)
  // 6 equidistant angular positions: -60°, 0°, 60°, 120°, 180°, 240°
  // Radius: 270px inside 720px frame => (270 / 720) * 100% = 37.5%
  // Ensures generous 84px breathing room between centerpiece and left/right cards
  const RADIUS_PERCENT = 37.5;
  const ANGLES_DEG = [-60, 0, 60, 120, 180, 240];

  return (
    <div className="hero-talent-composition-wrapper" aria-label="Talent Pipeline Visualization">
      <div className="hero-talent-circle-stage">
        {/* Subtle geometric orbital guide ring */}
        <div className="hero-orbit-guide-ring" aria-hidden="true" />

        {/* Centerpiece Floating Glass Card */}
        <div className="hero-centerpiece-card">
          <div className="hero-centerpiece-sparkle-pill">
            <Sparkles size={13} className="hero-sparkle-icon" />
            <span>Active talent pool</span>
          </div>

          <div className="hero-centerpiece-count">
            {candidates.length} in Pipeline
          </div>

          <div className="hero-centerpiece-action-box">
            <button
              type="button"
              className="hero-centerpiece-add-btn"
              onClick={() => setIsAddModalOpen(true)}
              title="Add a candidate to pipeline"
            >
              <Plus size={13} />
              <span>Add a candidate</span>
            </button>
            <span className="hero-centerpiece-hint">Build your talent pipeline</span>
          </div>
        </div>

        {/* 6 Real Floating Candidate Cards placed around the circle */}
        {featuredCandidates.map((cand, idx) => {
          const angleDeg = ANGLES_DEG[idx % ANGLES_DEG.length];
          const angleRad = (angleDeg * Math.PI) / 180;
          const leftPct = 50 + RADIUS_PERCENT * Math.cos(angleRad);
          const topPct = 50 + RADIUS_PERCENT * Math.sin(angleRad);

          return (
            <div
              key={cand.id}
              className={`hero-candidate-squircle hero-float-anim-${(idx % 3) + 1}`}
              style={{
                left: `${leftPct.toFixed(2)}%`,
                top: `${topPct.toFixed(2)}%`,
                animationDelay: `${(idx * 0.35).toFixed(2)}s`,
              }}
              onClick={() => setSelectedCandidate(cand)}
              title={`View ${cand.name}'s profile`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedCandidate(cand);
                }
              }}
            >
              {/* Top row: Avatar + Rating */}
              <div className="hero-card-top-row">
                <Avatar name={cand.name} size={26} />
                {cand.rating && (
                  <span className="hero-card-rating-pill">
                    <Star size={10} className="fill-current text-amber" />
                    <span>{cand.rating}</span>
                  </span>
                )}
              </div>

              {/* Name & Role */}
              <div className="hero-card-name" title={cand.name}>
                {cand.name}
              </div>
              <div className="hero-card-role" title={cand.role}>
                {cand.role}
              </div>

              {/* Stage Badge */}
              <div className="hero-card-footer">
                <StatusBadge stage={cand.stage} size="sm" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HeroTalentCircle;
