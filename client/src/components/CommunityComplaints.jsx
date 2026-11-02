import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './CommunityComplaints.css';

const CommunityComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [votingId, setVotingId] = useState(null);

  const navigate = useNavigate();
  const token = sessionStorage.getItem('civicToken');

  const fetchComplaints = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/complaints/public', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to load community complaints.');
      }

      setComplaints(data.complaints || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Something went wrong while loading complaints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('civicUser');
    sessionStorage.removeItem('civicToken');
    navigate('/login');
  };

  const handleUpvote = async (complaintId) => {
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setVotingId(complaintId);
      setActionMessage('');

      const response = await fetch(
        `/api/complaints/${complaintId}/upvote`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to update support.');
      }

      setComplaints(prev =>
        prev.map(complaint =>
          complaint._id === complaintId
            ? {
                ...complaint,
                upvotes: data.upvotes,
                hasUpvoted: data.hasUpvoted
              }
            : complaint
        )
      );

      setActionMessage(
        data.hasUpvoted
          ? 'Your support has been added successfully.'
          : 'Your support has been removed.'
      );
    } catch (err) {
      setActionMessage(err.message || 'Unable to update support.');
    } finally {
      setVotingId(null);
    }
  };

  const getStatusClass = (status = '') => {
    return status.toLowerCase().replace(/\s+/g, '-');
  };

  if (loading) {
    return (
      <div className="community-loading-page">
        <div className="community-spinner"></div>
        <h3>Loading Community Issues</h3>
        <p>Gathering the latest reports from your community...</p>
      </div>
    );
  }

  return (
    <div className="community-page">
      {/* Navigation */}
      <header className="community-navbar">
        <Link to="/" className="community-brand">
          <span className="community-brand-icon">C</span>
          <span>
            <strong>CivicTrack</strong>
            <small>Public Grievance Management</small>
          </span>
        </Link>

        <nav className="community-nav-actions">
          <Link to="/dashboard" className="community-nav-button">
            <span>⌂</span> Dashboard
          </Link>

          <Link to="/complaints" className="community-nav-button">
            <span>▤</span> My Complaints
          </Link>

          <button
            type="button"
            className="community-logout-button"
            onClick={handleLogout}
          >
            ↪ Logout
          </button>
        </nav>
      </header>

      <main className="community-container">
        {/* Page heading */}
        <section className="community-hero">
          <div className="community-hero-content">
            <span className="community-eyebrow">
              YOUR VOICE MATTERS
            </span>

            <h1>Community Issues</h1>

            <p>
              Together, we can make our neighbourhood better.
              Explore reported civic issues and support the problems
              that need attention.
            </p>

            <div className="community-hero-actions">
              <Link to="/complaints/new" className="community-report-button">
                + Report an Issue
              </Link>

              <Link to="/complaints" className="community-secondary-button">
                View My Complaints
              </Link>
            </div>
          </div>

          <div className="community-hero-illustration" aria-hidden="true">
            <div className="community-illustration-circle">
              <span>🏙️</span>
            </div>
            <div className="community-illustration-caption">
              <strong>Stronger Together</strong>
              <small>One community. One better future.</small>
            </div>
          </div>
        </section>

        {/* Community statistics */}
        <section className="community-stats">
          <div className="community-stat-card">
            <div className="community-stat-icon blue">📋</div>
            <div>
              <span>Total Public Issues</span>
              <strong>{complaints.length}</strong>
            </div>
          </div>

          <div className="community-stat-card">
            <div className="community-stat-icon green">✓</div>
            <div>
              <span>Resolved Issues</span>
              <strong>
                {complaints.filter(
                  item => item.status?.toLowerCase() === 'resolved'
                ).length}
              </strong>
            </div>
          </div>

          <div className="community-stat-card">
            <div className="community-stat-icon purple">👍</div>
            <div>
              <span>Community Support</span>
              <strong>
                {complaints.reduce(
                  (total, item) => total + (Number(item.upvotes) || 0),
                  0
                )}
              </strong>
            </div>
          </div>
        </section>

        {/* Issues heading */}
        <section className="community-issues-section">
          <div className="community-section-heading">
            <div>
              <span className="community-section-eyebrow">
                COMMUNITY FEEDBACK
              </span>
              <h2>Reported Public Issues</h2>
              <p>Support an issue to help bring attention to it.</p>
            </div>

            <span className="community-issue-count">
              {complaints.length} {complaints.length === 1 ? 'Issue' : 'Issues'}
            </span>
          </div>

          {error && (
            <div className="community-error">
              <span>⚠️</span>
              <div>
                <strong>Unable to load issues</strong>
                <p>{error}</p>
                <button type="button" onClick={fetchComplaints}>
                  Try Again
                </button>
              </div>
            </div>
          )}

          {actionMessage && (
            <div className="community-action-message" role="status">
              {actionMessage}
              <button
                type="button"
                onClick={() => setActionMessage('')}
                aria-label="Dismiss message"
              >
                ×
              </button>
            </div>
          )}

          {!error && complaints.length === 0 ? (
            <div className="community-empty">
              <div className="community-empty-icon">📭</div>
              <h3>No Community Issues Yet</h3>
              <p>
                There are no public complaints to display right now.
                Be the first to report an issue in your area.
              </p>
              <Link to="/complaints/new" className="community-report-button">
                Report an Issue
              </Link>
            </div>
          ) : (
            !error && (
              <div className="community-grid">
                {complaints.map(complaint => (
                  <article
                    className="community-card"
                    key={complaint._id}
                  >
                    <div className="community-card-top">
                      <span className="community-category">
                        {complaint.category || 'General Issue'}
                      </span>

                      <span
                        className={`community-status ${getStatusClass(
                          complaint.status
                        )}`}
                      >
                        <span className="community-status-dot"></span>
                        {complaint.status || 'Pending'}
                      </span>
                    </div>

                    <h3>{complaint.title}</h3>

                    <p className="community-description">
                      {complaint.description || 'No description provided.'}
                    </p>

                    <div className="community-location">
                      <span>📍</span>
                      <span>{complaint.location || 'Location not specified'}</span>
                    </div>

                    {complaint.image && (
                      <div className="community-image-wrapper">
                        <img
                          src={complaint.image}
                          alt={`Evidence for ${complaint.title}`}
                          className="community-image"
                          loading="lazy"
                        />
                      </div>
                    )}

                    <div className="community-card-footer">
                      <div className="community-support-info">
                        <span className="community-support-icon">👍</span>
                        <div>
                          <strong>
                            {Number(complaint.upvotes) || 0}
                          </strong>
                          <small>Supporters</small>
                        </div>
                      </div>

                      <button
                        type="button"
                        className={`community-vote-btn ${
                          complaint.hasUpvoted ? 'supported' : ''
                        }`}
                        onClick={() => handleUpvote(complaint._id)}
                        disabled={votingId === complaint._id}
                      >
                        {votingId === complaint._id
                          ? 'Updating...'
                          : complaint.hasUpvoted
                          ? '✓ Supported'
                          : '👍 Support'}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )
          )}
        </section>

        <footer className="community-footer">
          <strong>CivicTrack</strong>
          <span>Building better communities, together.</span>
        </footer>
      </main>
    </div>
  );
};

export default CommunityComplaints;