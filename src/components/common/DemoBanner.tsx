import React from 'react';
import { useATS } from '../../context/ATSContext';
import { Database, RotateCcw, AlertCircle, X, CheckCircle2 } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  const { storageMode, resetDemoData, isSaving, error, clearError } = useATS();

  const handleReset = async () => {
    if (window.confirm('Reset candidate pool back to initial demo dataset? Any added or edited candidates will be reverted.')) {
      await resetDemoData();
    }
  };

  return (
    <>
      {error && (
        <div
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 16px',
            backgroundColor: '#fef2f2',
            borderBottom: '1px solid #fecaca',
            fontSize: '12px',
            color: '#b91c1c',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={15} color="#dc2626" />
            <span><strong>Database Error:</strong> {error}</span>
          </div>
          <button
            type="button"
            onClick={clearError}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b91c1c', padding: 2 }}
            title="Dismiss error"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 14px',
          backgroundColor: storageMode === 'supabase' ? '#f0fdf4' : '#f8fafc',
          borderBottom: '1px solid var(--border-subtle)',
          fontSize: '11.5px',
          color: storageMode === 'supabase' ? '#166534' : 'var(--text-secondary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {storageMode === 'supabase' ? (
            <CheckCircle2 size={13} color="#16a34a" />
          ) : (
            <Database size={13} color="var(--indigo-600)" />
          )}
          <span>
            <strong>Storage:</strong>{' '}
            {storageMode === 'supabase'
              ? 'Supabase PostgreSQL (Primary Connected)'
              : 'LocalStorage Fallback (Demo Mode)'}
          </span>
          <span style={{ color: 'var(--text-muted)' }}>•</span>
          <span style={{ color: 'var(--text-muted)' }}>
            {storageMode === 'supabase'
              ? 'Multi-user cloud persistence across browsers'
              : 'Local browser persistence (Set VITE_SUPABASE_URL to connect PostgreSQL)'}
          </span>
        </div>

        <button
          type="button"
          className="btn btn-ghost"
          style={{ height: '22px', padding: '0 6px', fontSize: '11px', color: 'var(--text-secondary)' }}
          onClick={handleReset}
          disabled={isSaving}
          title="Reset candidate records back to initial mock dataset"
        >
          <RotateCcw size={11} />
          <span>Reset Demo Data</span>
        </button>
      </div>
    </>
  );
};
