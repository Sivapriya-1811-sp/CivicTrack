
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import './ComplaintDetails.css';

const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackError, setFeedbackError] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const token = sessionStorage.getItem('civicToken');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchComplaint = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await axios.get(`/api/complaints/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setComplaint(response.data.complaint || response.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          'Unable to load complaint details.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [id, token, navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('civicToken');
    sessionStorage.removeItem('civicUser');
    navigate('/login');
  };

  const formatDate = (date) => {
    if (!date) return 'Not available';

    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getSLAInfo = () => {
    if (!complaint?.resolutionDeadline) {
      return {
        type: 'no-deadline',
        title: 'Resolution Deadline',
        message: 'No resolution deadline has been assigned yet.',
        icon: 'ℹ️'
      };
    }

    if (
      complaint.status === 'Resolved' ||
      complaint.status === 'Rejected'
    ) {
      return {
        type: 'completed',
        title: 'Complaint Completed',
        message: 'This complaint is no longer awaiting resolution.',
        icon: '✓'
      };
    }

    const deadline = new Date(complaint.resolutionDeadline);
    const now = new Date();

    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const deadlineDate = new Date(
      deadline.getFullYear(),
      deadline.getMonth(),
      deadline.getDate()
    );

    const remainingDays = Math.ceil(
      (deadlineDate - today) / (1000 * 60 * 60 * 24)
    );

    if (remainingDays < 0) {
      return {
        type: 'overdue',
        title: 'Resolution Deadline Missed',
        message: `Your complaint is overdue by ${Math.abs(remainingDays)} day(s).`,
        icon: '🚨'
      };
    }

    if (remainingDays === 0) {
      return {
        type: 'today',
        title: 'Deadline Today',
        message: 'Your complaint is scheduled for resolution today.',
        icon: '⏰'
      };
    }

    return {
      type: 'upcoming',
      title: 'Resolution Timeline',
      message: `${remainingDays} day(s) remaining until the resolution deadline.`,
      icon: '📅'
    };
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();

    if (feedbackRating < 1 || feedbackRating > 5) {
      setFeedbackError('Please select a star rating.');
      return;
    }

    try {
      setFeedbackLoading(true);
      setFeedbackError('');
      setFeedbackMessage('');

      const response = await axios.patch(
        `/api/complaints/${id}/feedback`,
        {
          rating: feedbackRating,
          comment: feedbackComment
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setComplaint(previous => ({
        ...previous,
        feedback: response.data.feedback
      }));

      setFeedbackMessage(
        'Thank you! Your feedback has been submitted.'
      );
    } catch (err) {
      setFeedbackError(
        err.response?.data?.message || 'Unable to submit feedback.'
      );
    } finally {
      setFeedbackLoading(false);
    }
  };

  const getStatusClass = (status = '') => {
    return status.toLowerCase().replace(/\s+/g, '-');
  };

  if (loading) {
    return (
      <div className="complaint-details-loading">
        <div className="loading-spinner"></div>
        <h3>Loading Complaint Details</h3>
        <p>Please wait while we retrieve your complaint information.</p>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="complaint-details-error">
        <div className="error-icon">!</div>
        <h2>Unable to Display Complaint</h2>
        <p>{error || 'Complaint not found.'}</p>
        <button
          className="primary-action-button"
          onClick={() => navigate('/complaints')}
        >
          ← Back to My Complaints
        </button>
      </div>
    );
  }

  const sla = getSLAInfo();

  const currentStep = {
    Pending: 0,
    'In Progress': 1,
    Resolved: 2
  }[complaint.status] ?? 0;

  const timelineSteps = [
    {
      label: 'Submitted',
      description: 'Your complaint has been received.',
      icon: '✓'
    },
    {
      label: 'In Progress',
      description: 'The assigned department is working on it.',
      icon: '2'
    },
    {
      label: 'Resolved',
      description: 'The complaint has been successfully resolved.',
      icon: '3'
    }
  ];

  return (
    <div className="complaint-details-page">

      {/* Navigation */}
      <header className="complaint-details-header">
        <div
          className="details-brand"
          onClick={() => navigate('/dashboard')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter') navigate('/dashboard');
          }}
        >
          <div className="details-brand-icon">C</div>
          <div>
            <h2>CivicTrack</h2>
            <p>Public Grievance Management System</p>
          </div>
        </div>

        <nav className="complaint-details-header-actions">
          <button
            className="nav-action-button"
            onClick={() => navigate('/dashboard')}
          >
            <span>⌂</span> Dashboard
          </button>

          <button
            className="nav-action-button"
            onClick={() => navigate('/complaints')}
          >
            <span>▤</span> My Complaints
          </button>

          <button
            className="nav-logout-button"
            onClick={handleLogout}
          >
            <span>↪</span> Logout
          </button>
        </nav>
      </header>

      <main className="complaint-details-container">

        {/* Page heading */}
        <section className="complaint-details-title">
          <button
            className="complaint-back-button"
            onClick={() => navigate('/complaints')}
          >
            ← Back to My Complaints
          </button>

          <div className="details-heading-row">
            <div>
              <span className="details-eyebrow">
                CITIZEN PORTAL / COMPLAINT TRACKING
              </span>
              <h1>Complaint Details</h1>
              <p>
                Track your complaint, view important information
                and follow its resolution progress.
              </p>
            </div>

            <div className={`complaint-status ${getStatusClass(complaint.status)}`}>
              <span className="status-indicator"></span>
              {complaint.status}
            </div>
          </div>
        </section>

        {/* SLA alert */}
        <section className={`sla-alert sla-${sla.type}`}>
          <div className="sla-alert-icon">{sla.icon}</div>
          <div className="sla-alert-content">
            <h3>{sla.title}</h3>
            <p>{sla.message}</p>
          </div>
        </section>

        {/* Complaint overview */}
        <section className="complaint-info-card">
          <div className="complaint-info-top">
            <div className="complaint-overview-heading">
              <span className="complaint-category">
                {complaint.category || 'General Complaint'}
              </span>

              <h2>{complaint.title}</h2>

              <p className="complaint-id">
                Complaint ID: <strong>{complaint._id}</strong>
              </p>
            </div>

            <div className="overview-status">
              <span className="overview-status-label">CURRENT STATUS</span>
              <span className={`complaint-status ${getStatusClass(complaint.status)}`}>
                <span className="status-indicator"></span>
                {complaint.status}
              </span>
            </div>
          </div>

          <div className="details-divider"></div>

          <div className="complaint-info-grid">

            <div className="complaint-info-item">
              <div className="info-card-icon blue">▦</div>
              <div>
                <span>Submitted Date</span>
                <strong>{formatDate(complaint.createdAt)}</strong>
              </div>
            </div>

            <div className="complaint-info-item">
              <div className="info-card-icon purple">↻</div>
              <div>
                <span>Last Updated</span>
                <strong>{formatDate(complaint.updatedAt)}</strong>
              </div>
            </div>

            <div className="complaint-info-item">
              <div className="info-card-icon orange">⌖</div>
              <div>
                <span>Location</span>
                <strong>{complaint.location || 'Not provided'}</strong>
              </div>
            </div>

            <div className="complaint-info-item">
              <div className="info-card-icon green">▥</div>
              <div>
                <span>Assigned Department</span>
                <strong>
                  {complaint.department || 'Not Assigned'}
                </strong>
              </div>
            </div>

            <div className="complaint-info-item">
              <div className="info-card-icon red">◷</div>
              <div>
                <span>Resolution Deadline</span>
                <strong>
                  {complaint.resolutionDeadline
                    ? formatDate(complaint.resolutionDeadline)
                    : 'Not assigned yet'}
                </strong>
              </div>
            </div>

          </div>
        </section>

        {/* Progress timeline */}
        <section className="complaint-progress-card">
          <div className="section-heading">
            <div>
              <span className="section-eyebrow">TRACKING</span>
              <h2>Complaint Progress</h2>
              <p>Follow each stage of your complaint resolution.</p>
            </div>
            <div className="progress-heading-icon">↗</div>
          </div>

          <div className="timeline-current-status">
            Current Status:
            <strong className={`timeline-status-text ${getStatusClass(complaint.status)}`}>
              {complaint.status}
            </strong>
          </div>

          {complaint.status === 'Rejected' ? (
            <div className="timeline-rejected">
              <span className="timeline-rejected-icon">✕</span>
              <div>
                <h3>Complaint Rejected</h3>
                <p>
                  This complaint has been rejected by the administration.
                </p>
              </div>
            </div>
          ) : (
            <div className="complaint-timeline">
              {timelineSteps.map((step, index) => {
                const completed = index < currentStep;
                const active = index === currentStep;

                return (
                  <div
                    className={`timeline-step ${
                      completed ? 'completed' : ''
                    } ${active ? 'active' : ''}`}
                    key={step.label}
                  >
                    <div className="timeline-marker">
                      {completed ? '✓' : index + 1}
                    </div>
                    <h3>{step.label}</h3>
                    <p>{step.description}</p>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Description */}
        <section className="complaint-description-card">
          <div className="section-heading">
            <div>
              <span className="section-eyebrow">COMPLAINT INFORMATION</span>
              <h2>Complaint Description</h2>
              <p>Details provided when this complaint was submitted.</p>
            </div>
            <div className="description-heading-icon">▤</div>
          </div>

          <div className="description-content">
            {complaint.description || 'No description provided.'}
          </div>

          {complaint.image && (
            <div className="complaint-evidence">
              <h3>Attached Photo Evidence</h3>
              <img
                src={complaint.image}
                alt="Complaint evidence"
              />
            </div>
          )}
        </section>

        {/* Citizen feedback */}
        {complaint.status === 'Resolved' && (
          <section className="citizen-feedback-section">
            <div className="citizen-feedback-heading">
              <span className="feedback-heading-icon">★</span>
              <div>
                <h2>Rate Your Experience</h2>
                <p>
                  Your feedback helps us improve public services.
                </p>
              </div>
            </div>

            {complaint.feedback?.rating ? (
              <div className="feedback-submitted">
                <h3>Thank you for your feedback!</h3>

                <div className="feedback-stars">
                  {'★'.repeat(complaint.feedback.rating)}
                  {'☆'.repeat(5 - complaint.feedback.rating)}
                </div>

                <p>
                  {complaint.feedback.comment || 'No additional comment.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit}>
                <label>How would you rate the resolution?</label>

                <div className="feedback-star-picker">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      className={
                        star <= feedbackRating ? 'selected' : ''
                      }
                      onClick={() => setFeedbackRating(star)}
                      aria-label={`Rate ${star} out of 5`}
                    >
                      ★
                    </button>
                  ))}
                </div>

                <label htmlFor="feedback-comment">
                  Additional Comments (Optional)
                </label>

                <textarea
                  id="feedback-comment"
                  rows="4"
                  placeholder="Share your experience with us..."
                  value={feedbackComment}
                  onChange={e => setFeedbackComment(e.target.value)}
                />

                {feedbackError && (
                  <p className="feedback-error">{feedbackError}</p>
                )}

                {feedbackMessage && (
                  <p className="feedback-success">{feedbackMessage}</p>
                )}

                <button
                  type="submit"
                  className="feedback-submit-button"
                  disabled={feedbackLoading}
                >
                  {feedbackLoading ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </form>
            )}
          </section>
        )}

        <footer className="details-page-footer">
          <span className="footer-brand">CivicTrack</span>
          <span>Making our communities better, together.</span>
        </footer>

      </main>
    </div>
  );
};

export default ComplaintDetails;
