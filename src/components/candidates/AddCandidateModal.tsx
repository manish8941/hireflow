import React, { useState } from 'react';
import { useATS } from '../../context/ATSContext';
import { Modal } from '../common/Modal';
import { CandidateSource, CandidateStage, NewCandidateInput } from '../../types/ats';
import { UserPlus, AlertCircle } from 'lucide-react';

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
];

export const AddCandidateModal: React.FC = () => {
  const { isAddModalOpen, setIsAddModalOpen, addCandidate } = useATS();

  const [formData, setFormData] = useState<NewCandidateInput>({
    name: '',
    email: '',
    role: '',
    department: 'Engineering',
    experienceYears: '',
    source: 'LinkedIn',
    stage: 'applied',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Candidate full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email address';
    }

    if (!formData.role.trim()) {
      newErrors.role = 'Job title is required';
    }

    if (!formData.experienceYears.trim()) {
      newErrors.experienceYears = 'Experience level is required';
    }

    if (!formData.source) {
      newErrors.source = 'Candidate source is required';
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
      // Add candidate to state & persistent storage
      await addCandidate(formData);

      // Reset form
      setFormData({
        name: '',
        email: '',
        role: COMMON_ROLES[0],
        department: 'Engineering',
        experienceYears: '3 years',
        source: 'LinkedIn',
        stage: 'applied',
        notes: '',
      });
      setErrors({});
      setSubmitError(null);
      setIsAddModalOpen(false);
    } catch (err: unknown) {
      console.error('Failed to add candidate:', err);
      setSubmitError(err instanceof Error ? err.message : 'Failed to save candidate to database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    setSubmitError(null);
    setIsAddModalOpen(false);
  };

  return (
    <Modal
      isOpen={isAddModalOpen}
      onClose={handleClose}
      title="Add New Candidate"
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
            <label className="form-label" htmlFor="cand-name">
              Full Name <span className="required">*</span>
            </label>
            <input
              id="cand-name"
              type="text"
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="e.g. Liam Anderson"
              value={formData.name}
              onChange={e => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: '' });
              }}
              autoFocus
            />
            {errors.name && <span className="form-error-msg">{errors.name}</span>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="cand-email">
              Email Address <span className="required">*</span>
            </label>
            <input
              id="cand-email"
              type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="e.g. liam.anderson@example.com"
              value={formData.email}
              onChange={e => {
                setFormData({ ...formData, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
            />
            {errors.email && <span className="form-error-msg">{errors.email}</span>}
          </div>

          {/* Job Title & Department */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="cand-role">
                Job Title <span className="required">*</span>
              </label>
              <input
                id="cand-role"
                type="text"
                list="common-roles-list"
                className={`form-input ${errors.role ? 'error' : ''}`}
                placeholder="e.g. Software Engineer"
                value={formData.role}
                onChange={e => {
                  setFormData({ ...formData, role: e.target.value });
                  if (errors.role) setErrors({ ...errors, role: '' });
                }}
              />
              <datalist id="common-roles-list">
                {COMMON_ROLES.map(role => (
                  <option key={role} value={role} />
                ))}
              </datalist>
              {errors.role && <span className="form-error-msg">{errors.role}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="cand-dept">
                Department
              </label>
              <select
                id="cand-dept"
                className="form-select"
                value={formData.department}
                onChange={e => setFormData({ ...formData, department: e.target.value })}
              >
                <option value="Core Product">Core Product</option>
                <option value="Engineering">Engineering</option>
                <option value="DevOps & Platform">DevOps & Platform</option>
                <option value="Data Intelligence">Data Intelligence</option>
                <option value="Design & UX">Design & UX</option>
                <option value="Security">Security</option>
              </select>
            </div>
          </div>

          {/* Experience & Source */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="cand-exp">
                Experience <span className="required">*</span>
              </label>
              <input
                id="cand-exp"
                type="text"
                className={`form-input ${errors.experienceYears ? 'error' : ''}`}
                placeholder="e.g. 4 years or Senior"
                value={formData.experienceYears}
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
              <label className="form-label" htmlFor="cand-source">
                Source <span className="required">*</span>
              </label>
              <select
                id="cand-source"
                className="form-select"
                value={formData.source}
                onChange={e => setFormData({ ...formData, source: e.target.value as CandidateSource })}
              >
                {SOURCES.map(source => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Initial Stage */}
          <div className="form-group">
            <label className="form-label" htmlFor="cand-stage">
              Initial Pipeline Stage
            </label>
            <select
              id="cand-stage"
              className="form-select"
              value={formData.stage}
              onChange={e => setFormData({ ...formData, stage: e.target.value as CandidateStage })}
            >
              {STAGES.map(stage => (
                <option key={stage.value} value={stage.value}>{stage.label}</option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label" htmlFor="cand-notes">
              Candidate Notes / Profile Link
            </label>
            <textarea
              id="cand-notes"
              className="form-textarea"
              placeholder="Key skills, notable projects, interview remarks or LinkedIn profile link..."
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            <UserPlus size={15} />
            Add Candidate
          </button>
        </div>
      </form>
    </Modal>
  );
};
