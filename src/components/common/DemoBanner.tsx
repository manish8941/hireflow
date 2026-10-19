import React from 'react';
import { useATS } from '../../context/ATSContext';
import { Database, RotateCcw, AlertCircle, X, CheckCircle2 } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  const { storageMode, resetDemoData, error, clearError } = useATS();

  const handleReset = async () => {
    if (window.confirm('Reset candidate pool back to initial demo dataset? Any added or edited candidates will be reverted.')) {
      await resetDemoData();
    }
  };

  return (
    <>
      {/* Floating Error Toast if database error occurs */}
      {error && (
        <div
          role="alert"
          className="editorial-error-toast"
          style={{
            position: 'fixed',
            top: '84px',
            right: '24px',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 16px',
            background: 'rgba(24, 24, 28, 0.94)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(239, 68, 68, 0.40)',
            borderRadius: '12px',
            color: '#FCA5A5',
            fontSize: '12px',
            boxShadow: '0 16px 36px rgba(0, 0, 0, 0.4)',
          }}
        >
          <AlertCircle size={15} color="#EF4444" />
          <span><strong>Error:</strong> {error}</span>
          <button
            type="button"
            onClick={clearError}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FCA5A5', padding: 2 }}
            title="Dismiss error"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Discrete Unobtrusive Utility Surface in bottom corner (No persistent top strip) */}
      <div 
        className="unobtrusive-storage-utility" 
        role="complementary" 
        aria-label="Storage status and demo data management"
      >
        <div className="utility-storage-pill">
          {storageMode === 'supabase' ? (
            <CheckCircle2 size={11} className="utility-icon-connected" />
          ) : (
            <Database size={11} className="utility-icon-db" />
          )}
          <span className="utility-mode-text">
            {storageMode === 'supabase' ? 'Supabase Connected' : 'LocalStorage Fallback'}
          </span>
        </div>

        <button
          type="button"
          className="utility-reset-btn"
          onClick={handleReset}
          title="Reset candidate pool back to initial demo set"
        >
          <RotateCcw size={11} />
          <span>Reset Demo Data</span>
        </button>
      </div>
    </>
  );
};
