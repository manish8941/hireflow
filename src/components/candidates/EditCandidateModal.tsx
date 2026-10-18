import React, { useState, useEffect } from 'react';
import { useATS } from '../../context/ATSContext';
import { Modal } from '../common/Modal';
import { Candidate, CandidateSource, CandidateStage, UpdateCandidateInput } from '../../types/ats';
import { Save, AlertCircle } from 'lucide-react';

const COMMON_ROLES = [
  'Software Engineer',
  'Senior Software Engineer',
  'Senior Frontend Engineer',
  'Backend Go Specialist',
  'Staff Infrastructure Engineer',
  'Full Stack Engineer',
  'Machine Learning Engineer',
  'Lead Product Designer',
  'Site Reliability Engineer',
  'Mobile Engineer (React Native)',
  'Security & Compliance Engineer',
  'Junior Frontend Developer',
];

const SOURCES: CandidateSource[] = [
  'LinkedIn',
  'Referral',
  'Career Page',
  'Indeed',
  'GitHub',
  'Direct Sourced',
  'Campus',
];

const STAGES: { value: CandidateStage; label: string }[] = [
  { value: 'applied', label: 'Applied (New)' },
  { value: 'screening', label: 'Screening' },
  { value: 'interview', label: 'Interview' },
  { value: 'offer', label: 'Offer' },
  { value: 'hired', label: 'Hired' },
  { value: 'rejected', label: 'Archived / Rejected' },
];

interface EditCandidateModalProps {
  candidate: Candidate | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditCandidateModal: React.FC<EditCandidateModalProps> = ({
  candidate,
  isOpen,
  onClose,
}) => {
  const { updateCandidate } = useATS();

  const [formData, setFormData] = useState<UpdateCandidateInput>({
    name: '',
    email: '',
    role: COMMON_ROLES[0],
    department: 'Engineering',
    experienceYears: '',
    source: 'LinkedIn',
    stage: 'applied',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (candidate) {
      setFormData({
        name: candidate.name,
        email: candidate.email,
        role: candidate.role,
        department: candidate.department,
        experienceYears: String(candidate.experienceYears),
        source: candidate.source,
        stage: candidate.stage,
        notes: candidate.notes || '',
      });
      setErrors({});
      setSubmitError(null);
    }
  }, [candidate]);

  if (!candidate || !isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Candidate full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email address';
    }

    if (!formData.role?.trim()) {
      newErrors.role = 'Job title is required';
    }

    if (!String(formData.experienceYears || '').trim()) {
      newErrors.experienceYears = 'Experience level is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await updateCandidate(candidate.id, formData);
      setSubmitError(null);
      onClose();
    } catch (err: unknown) {
      console.error('Failed to update candidate:', err);
      setSubmitError(err instanceof Error ? err.message : 'Database error: failed to update candidate.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setSubmitError(null);
        onClose();
      }}
      title="Edit Candidate Details"
      maxWidth="540px"
    >
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          {submitError && (
            <div
              role="alert"
              style={{
                padding: '8px 12px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 'var(--radius-sm)',
                color: '#b91c1c',
                fontSize: '12px',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertCircle size={15} color="#dc2626" />
              <span>{submitError}</span>
            </div>
          )}
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="edit-name">
              Full Name <span className="required">*</span>
            </label>
            <input
              id="edit-name"
              type="text"
              className={`form-input ${errors.name ? 'error' : ''}`}
              value={formData.name || ''}
              onChange={e => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: '' });
              }}
            />
            {errors.name && <span className="form-error-msg">{errors.name}</span>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="edit-email">
              Email Address <span className="required">*</span>
            </label>
            <input
              id="edit-email"
              type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              value={formData.email || ''}
              onChange={e => {
                setFormData({ ...formData, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
            />
            {errors.email && <span className="form-error-msg">{errors.email}</span>}
          </div>

          {/* Role & Department */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="edit-role">
                Job Title <span className="required">*</span>
              </label>
              <input
                id="edit-role"
                type="text"
                list="edit-common-roles-list"
                className={`form-input ${errors.role ? 'error' : ''}`}
                value={formData.role || ''}
                onChange={e => {
                  setFormData({ ...formData, role: e.target.value });
                  if (errors.role) setErrors({ ...errors, role: '' });
                }}
              />
              <datalist id="edit-common-roles-list">
                {COMMON_ROLES.map(role => (
                  <option key={role} value={role} />
                ))}
              </datalist>
              {errors.role && <span className="form-error-msg">{errors.role}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-dept">
                Department
              </label>
              <select
                id="edit-dept"
                className="form-select"
                value={formData.department || 'Engineering'}
                onChange={e => setFormData({ ...formData, department: e.target.value })}
              >
                <option value="Core Product">Core Product</option>
                <option value="Engineering">Engineering</option>
                <option value="DevOps & Platform">DevOps & Platform</option>
                <option value="Data Intelligence">Data Intelligence</option>
                <option value="Design & UX">Design & UX</option>
                <option value="Security">Security</option>
                <option value="Mobile Applications">Mobile Applications</option>
              </select>
            </div>
          </div>

          {/* Experience & Source */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="edit-exp">
                Experience <span className="required">*</span>
              </label>
              <input
                id="edit-exp"
                type="text"
                className={`form-input ${errors.experienceYears ? 'error' : ''}`}
                value={formData.experienceYears || ''}
                onChange={e => {
                  setFormData({ ...formData, experienceYears: e.target.value });
                  if (errors.experienceYears) setErrors({ ...errors, experienceYears: '' });
                }}
              />
              {errors.experienceYears && (
                <span className="form-error-msg">{errors.experienceYears}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-source">
                Source
              </label>
              <select
                id="edit-source"
                className="form-select"
                value={formData.source || 'LinkedIn'}
                onChange={e => setFormData({ ...formData, source: e.target.value as CandidateSource })}
              >
                {SOURCES.map(source => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Stage */}
          <div className="form-group">
            <label className="form-label" htmlFor="edit-stage">
              Pipeline Stage
            </label>
            <select
              id="edit-stage"
              className="form-select"
              value={formData.stage || 'applied'}
              onChange={e => setFormData({ ...formData, stage: e.target.value as CandidateStage })}
            >
              {STAGES.map(stage => (
                <option key={stage.value} value={stage.value}>{stage.label}</option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label" htmlFor="edit-notes">
              Evaluation Notes / Remarks
            </label>
            <textarea
              id="edit-notes"
              className="form-textarea"
              value={formData.notes || ''}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            <Save size={15} />
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
