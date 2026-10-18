import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Sliders, 
  Bell, 
  ShieldCheck, 
  Check, 
  Plus,
  RotateCcw,
  Database
} from 'lucide-react';
import { useATS } from '../context/ATSContext';
import { Modal } from '../components/common/Modal';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  permission: 'Admin' | 'Interviewer' | 'Reviewer';
  status: 'Active' | 'Pending';
}

const DEFAULT_TEAM: TeamMember[] = [
  {
    id: 'tm-1',
    name: 'Alex Rivera',
    email: 'alex@acmerobotics.com',
    role: 'Lead Recruiter',
    permission: 'Admin',
    status: 'Active',
  },
  {
    id: 'tm-2',
    name: 'Siddharth Kumar',
    email: 'siddharth@acmerobotics.com',
    role: 'VP of Engineering',
    permission: 'Interviewer',
    status: 'Active',
  },
];

export const SettingsPage: React.FC = () => {
  const { resetDemoData, storageMode, isSaving } = useATS();
  const [activeTab, setActiveTab] = useState<'general' | 'team' | 'pipeline' | 'notifications'>('general');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // General settings state
  const [orgName, setOrgName] = useState(() => {
    return localStorage.getItem('hireflow_org_name') || 'Acme Robotics, Inc.';
  });
  const [portalUrl, setPortalUrl] = useState(() => {
    return localStorage.getItem('hireflow_portal_url') || 'https://careers.acmerobotics.com';
  });
  const [contactEmail, setContactEmail] = useState(() => {
    return localStorage.getItem('hireflow_contact_email') || 'recruiting@acmerobotics.com';
  });

  // Team members state
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem('hireflow_team_members');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return DEFAULT_TEAM;
  });

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Staff Engineer / Interviewer');
  const [invitePerm, setInvitePerm] = useState<'Admin' | 'Interviewer' | 'Reviewer'>('Interviewer');

  useEffect(() => {
    localStorage.setItem('hireflow_team_members', JSON.stringify(teamMembers));
  }, [teamMembers]);

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('hireflow_org_name', orgName);
    localStorage.setItem('hireflow_portal_url', portalUrl);
    localStorage.setItem('hireflow_contact_email', contactEmail);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    const newMember: TeamMember = {
      id: `tm-${Date.now()}`,
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      role: inviteRole,
      permission: invitePerm,
      status: 'Active',
    };

    setTeamMembers(prev => [...prev, newMember]);
    setInviteName('');
    setInviteEmail('');
    setIsInviteOpen(false);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h1>ATS Settings</h1>
          <p>Manage recruitment workflows, team permissions, and workspace preferences</p>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          disabled={isSaving}
          onClick={async () => {
            if (window.confirm('Reset candidate pool back to initial demo dataset?')) {
              await resetDemoData();
            }
          }}
        >
          <RotateCcw size={14} />
          Reset Demo Data
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '20px' }}>
        {/* Settings Navigation Menu */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            padding: '8px',
            height: 'fit-content',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          <button
            type="button"
            className={`nav-item-btn ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <div className="nav-item-content">
              <Building2 size={16} />
              <span>Organization</span>
            </div>
          </button>

          <button
            type="button"
            className={`nav-item-btn ${activeTab === 'team' ? 'active' : ''}`}
            onClick={() => setActiveTab('team')}
          >
            <div className="nav-item-content">
              <Users size={16} />
              <span>Hiring Team</span>
            </div>
          </button>

          <button
            type="button"
            className={`nav-item-btn ${activeTab === 'pipeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('pipeline')}
          >
            <div className="nav-item-content">
              <Sliders size={16} />
              <span>Pipeline Stages</span>
            </div>
          </button>

          <button
            type="button"
            className={`nav-item-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <div className="nav-item-content">
              <Bell size={16} />
              <span>Notifications</span>
            </div>
          </button>
        </div>

        {/* Settings Panel Content */}
        <div className="panel-card">
          {activeTab === 'general' && (
            <form onSubmit={handleSaveGeneral}>
              <div className="panel-header">
                <div>
                  <h3 className="panel-title">Organization Profile</h3>
                  <span className="panel-subtitle">Update company information and ATS branding</span>
                </div>
              </div>

              <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="org-name">Company Name</label>
                  <input
                    id="org-name"
                    type="text"
                    className="form-input"
                    value={orgName}
                    onChange={e => setOrgName(e.target.value)}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="portal-url">Primary Career Portal URL</label>
                    <input
                      id="portal-url"
                      type="text"
                      className="form-input"
                      value={portalUrl}
                      onChange={e => setPortalUrl(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="contact-email">Primary Contact Email</label>
                    <input
                      id="contact-email"
                      type="email"
                      className="form-input"
                      value={contactEmail}
                      onChange={e => setContactEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Storage Architecture Info */}
                <div
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '14px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                  }}
                >
                  <Database size={18} color="var(--indigo-600)" style={{ marginTop: '2px' }} />
                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                      Persistence Mode: {storageMode === 'supabase' ? 'Supabase PostgreSQL (Primary Source of Truth)' : 'LocalStorage Fallback (Demo Mode)'}
                    </h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {storageMode === 'supabase'
                        ? 'Connected to live cloud PostgreSQL via Supabase. Candidate intake, pipeline progression, edits, and deletions persist across all client browsers and sessions with Row Level Security enabled.'
                        : 'Operating in client-side storage fallback with full schema validation. To connect live PostgreSQL, supply VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env and apply the migration in supabase/migrations/20261018000000_create_candidates.sql.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="modal-footer" style={{ justifyContent: 'flex-start' }}>
                <button type="submit" className="btn btn-primary">
                  {savedSuccess ? (
                    <>
                      <Check size={14} /> Saved changes
                    </>
                  ) : (
                    'Save changes'
                  )}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'team' && (
            <div>
              <div className="panel-header">
                <div>
                  <h3 className="panel-title">Hiring Team Members</h3>
                  <span className="panel-subtitle">Manage interviewers and recruiting access</span>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ fontSize: '12px' }}
                  onClick={() => setIsInviteOpen(true)}
                >
                  <Plus size={14} /> Invite Member
                </button>
              </div>

              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Permissions</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamMembers.map(member => (
                      <tr key={member.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="user-avatar-circle" style={{ width: '28px', height: '28px', fontSize: '11px' }}>
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600 }}>{member.name}</div>
                              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{member.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>{member.role}</td>
                        <td>
                          <span
                            className="badge"
                            style={{
                              backgroundColor: member.permission === 'Admin' ? 'var(--indigo-50)' : 'var(--bg-subtle)',
                              color: member.permission === 'Admin' ? 'var(--indigo-600)' : 'var(--text-secondary)',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 600,
                            }}
                          >
                            {member.permission}
                          </span>
                        </td>
                        <td>
                          <span style={{ color: '#059669', fontSize: '12px', fontWeight: 500 }}>
                            {member.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'pipeline' && (
            <div>
              <div className="panel-header">
                <div>
                  <h3 className="panel-title">Default Hiring Stages</h3>
                  <span className="panel-subtitle">Configured interview workflow stages</span>
                </div>
              </div>

              <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { name: '1. Applied', desc: 'New candidate intake & resume review' },
                  { name: '2. Screening', desc: 'Recruiter phone screen & qualifications' },
                  { name: '3. Technical Interview', desc: 'System design, live coding, & architecture' },
                  { name: '4. Offer', desc: 'Compensation package negotiation & background check' },
                  { name: '5. Hired', desc: 'Signed offer letter & team onboarding' },
                  { name: '6. Archived / Rejected', desc: 'Disqualified or declined applicants' },
                ].map((st, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      backgroundColor: 'var(--bg-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '13px',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div>
                      <strong style={{ display: 'block', fontSize: '13px' }}>{st.name}</strong>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{st.desc}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Standard</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={20} color="var(--indigo-600)" />
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 600 }}>Automated Candidate Notifications</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Send instant Slack and email updates when candidates progress</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px' }}>
                  <input type="checkbox" defaultChecked />
                  <span>Notify interviewers 24 hours prior to scheduled interviews</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px' }}>
                  <input type="checkbox" defaultChecked />
                  <span>Send applicant confirmation receipt upon new resume submission</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px' }}>
                  <input type="checkbox" defaultChecked />
                  <span>Send daily digest of active pipeline metrics to Slack #hiring channel</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invite Member Modal */}
      <Modal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title="Invite Hiring Team Member"
        maxWidth="460px"
      >
        <form onSubmit={handleSendInvite}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="inv-name">Full Name *</label>
              <input
                id="inv-name"
                type="text"
                className="form-input"
                placeholder="e.g. Jordan Lee"
                value={inviteName}
                onChange={e => setInviteName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="inv-email">Work Email *</label>
              <input
                id="inv-email"
                type="email"
                className="form-input"
                placeholder="e.g. jordan@acmerobotics.com"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="inv-role">Role</label>
              <input
                id="inv-role"
                type="text"
                className="form-input"
                value={inviteRole}
                onChange={e => setInviteRole(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="inv-perm">Permissions</label>
              <select
                id="inv-perm"
                className="form-select"
                value={invitePerm}
                onChange={e => setInvitePerm(e.target.value as 'Admin' | 'Interviewer' | 'Reviewer')}
              >
                <option value="Interviewer">Interviewer (Can view and submit scorecards)</option>
                <option value="Reviewer">Reviewer (Read-only access to pipeline)</option>
                <option value="Admin">Admin (Full ATS configuration and user management)</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsInviteOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Send Invitation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
