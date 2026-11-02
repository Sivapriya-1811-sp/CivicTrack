
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminComplaints.css';

const AdminComplaints = () => {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [prioritySort, setPrioritySort] = useState('Newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState(null);
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [escalatedFilter, setEscalatedFilter] = useState('all');
  const token = sessionStorage.getItem('civicToken');
  const user = JSON.parse(sessionStorage.getItem('civicUser') || 'null');

  const departments = [
    'Road Maintenance Department',
    'Water Supply Department',
    'Sanitation Department',
    'Electrical Department',
    'Drainage Department',
    'General Administration'
  ];

  const categories = [
    'Road Damage',
    'Water Leakage',
    'Waste Disposal',
    'Street Light',
    'Drainage Problem',
    'Other'
  ];

  // Fetch complaints
  useEffect(() => {
    if (!token || user?.role !== 'admin') {
      navigate('/admin/login');
      return;
    }

    fetchComplaints();
  }, []);

  // Search, filter and priority sorting
  useEffect(() => {
    let result = [...complaints];

    if (statusFilter !== 'All') {
      result = result.filter(
        complaint => complaint.status === statusFilter
      );
    }

    if (categoryFilter !== 'All') {
      result = result.filter(
        complaint => complaint.category === categoryFilter
      );
    }

    // Filter by escalation status
    if (escalatedFilter === 'escalated') {
      result = result.filter(complaint => complaint.isEscalated === true);
    } else if (escalatedFilter === 'normal') {
      result = result.filter(complaint => !complaint.isEscalated);
    }

    if (search.trim()) {
      const term = search.toLowerCase();

      result = result.filter(complaint =>
        [
          complaint.title,
          complaint.category,
          complaint.location,
          complaint.citizen?.fullName,
          complaint.citizen?.email
        ].some(value =>
          value?.toLowerCase().includes(term)
        )
      );
    }

    // Sort complaints by community support
    if (prioritySort === 'Most Supported') {
      result.sort((a, b) => getUpvoteCount(b) - getUpvoteCount(a));
    } else {
      result.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    }

    setFilteredComplaints(result);
  }, [search, statusFilter, categoryFilter, escalatedFilter, complaints, prioritySort]);

  // Check if a complaint is overdue
  const isOverdue = complaint => {
  return (
    complaint.resolutionDeadline &&
    new Date(complaint.resolutionDeadline) < new Date() &&
    complaint.status !== 'Resolved' &&
    complaint.status !== 'Rejected'
  );
};
  // Get community support count
  const getUpvoteCount = complaint => {
    if (Array.isArray(complaint.upvotes)) {
      return complaint.upvotes.length;
    }

    return Number(complaint.upvotes) || 0;
  };

  // Fetch complaints
  const fetchComplaints = async () => {
    try {
      const response = await axios.get('/api/admin/complaints', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setComplaints(response.data.complaints || []);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Unable to load complaints.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Open complaint editor
  const openEditor = complaint => {
    setEditingComplaint({
      ...complaint,
      resolutionDeadline: complaint.resolutionDeadline
        ? new Date(complaint.resolutionDeadline)
            .toISOString()
            .split('T')[0]
        : ''
    });
  };

  // Update complaint
  const handleUpdate = async e => {
    e.preventDefault();

    if (!editingComplaint) return;

    setSavingId(editingComplaint._id);
    setError('');

    try {
      const response = await axios.patch(
        `/api/admin/complaints/${editingComplaint._id}`,
        {
          status: editingComplaint.status,
          department: editingComplaint.department,
          resolutionDeadline:
            editingComplaint.resolutionDeadline || null
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setComplaints(previous =>
        previous.map(complaint =>
          complaint._id === editingComplaint._id
            ? {
                ...complaint,
                ...response.data.complaint
              }
            : complaint
        )
      );

      setEditingComplaint(null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to update complaint.'
      );
    } finally {
      setSavingId(null);
    }
  };

  // Logout
  const handleLogout = () => {
    sessionStorage.removeItem('civicToken');
    sessionStorage.removeItem('civicUser');
    navigate('/admin/login');
  };

  const getStatusClass = status =>
    status.toLowerCase().replace(' ', '-');

  if (loading) {
    return (
      <div className="admin-complaints-loading">
        Loading complaints...
      </div>
    );
  }

  return (
    <div className="admin-complaints-page">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span>🏛️</span>
          <h2>CivicTrack</h2>
        </div>

        <p className="admin-sidebar-label">ADMINISTRATION</p>

        <nav>
          <button onClick={() => navigate('/admin/dashboard')}>
            📊 Dashboard
          </button>

          <button className="admin-nav-active">
            📋 Manage Complaints
          </button>
        </nav>

        <button className="admin-logout" onClick={handleLogout}>
          ↪ Logout
        </button>
      </aside>

      <main className="admin-complaints-main">
        <header className="admin-complaints-header">
          <div>
            <p>ADMINISTRATION / COMPLAINTS</p>
            <h1>Manage Complaints</h1>
            <span>
              Review, prioritize and manage citizen complaints.
            </span>
          </div>

          <button onClick={() => navigate('/admin/dashboard')}>
            ← Dashboard
          </button>
        </header>

        {error && (
          <div className="admin-complaints-error">
            {error}
          </div>
        )}

        {/* Search, filters and priority sorting */}
        <section className="admin-complaints-toolbar">
          <input
            type="search"
            placeholder="Search by title, citizen, category or location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            <option value="All">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select
  value={escalatedFilter}
  onChange={(e) => setEscalatedFilter(e.target.value)}
>
  <option value="all">All Complaints</option>
  <option value="escalated">Escalated Only</option>
  <option value="normal">Non-Escalated</option>
</select>

          {/* Community priority sorting */}
          <select
            value={prioritySort}
            onChange={e => setPrioritySort(e.target.value)}
          >
            <option value="Newest">Newest First</option>
            <option value="Most Supported">Most Supported</option>
          </select>
        </section>

        <div className="admin-complaints-count">
          Showing {filteredComplaints.length} of {complaints.length} complaints
        </div>

        {filteredComplaints.length === 0 ? (
          <section className="admin-complaints-empty">
            <span>📭</span>
            <h2>No complaints found</h2>
            <p>Try changing your search or filters.</p>
          </section>
        ) : (
          <section className="admin-complaints-table-card">
            <div className="admin-complaints-table-scroll">
              <table className="admin-complaints-table">
                <thead>
                  <tr>
                    <th>Complaint</th>
                    <th>Citizen</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Resolution Deadline</th>
                    <th>Community Support</th>
                    <th>Department</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredComplaints.map(complaint => (
                    <tr key={complaint._id}>
                      <td>
                        <strong>{complaint.title}</strong>
                        <small>
                          ID: {complaint._id.slice(-8)}
                        </small>
                      </td>

                      <td>
                        {complaint.citizen?.fullName || 'Unknown'}
                        <small>
                          {complaint.citizen?.email || ''}
                        </small>
                      </td>

                      <td>{complaint.category}</td>
                      <td>{complaint.location}</td>

                      <td>
                        {new Date(
                          complaint.createdAt
                        ).toLocaleDateString()}
                      </td>
                        <td>
  <span
    className={`admin-status ${getStatusClass(
      complaint.status
    )}`}
  >
    {complaint.status}
  </span>
  {complaint.isEscalated && (
  <span className="escalated-badge">
    🚨 ESCALATED
  </span>
)}

  {isOverdue(complaint) && (
    <span className="overdue-badge">
      🚨 OVERDUE
    </span>
  )}
</td>

<td>
  {complaint.resolutionDeadline
    ? new Date(
        complaint.resolutionDeadline
      ).toLocaleDateString()
    : 'Not Set'}
</td>

                      {/* Community upvote count */}
                      <td>
                        <span className="community-support-count">
                          👍 {getUpvoteCount(complaint)}
                        </span>
                        {getUpvoteCount(complaint) >= 5 && (
                          <span className="priority-label">
                            High Support
                          </span>
                        )}
                      </td>

                      <td>
                        {complaint.department || 'Not Assigned'}
                      </td>

                      <td>
                        <button
                          className="admin-edit-button"
                          onClick={() => openEditor(complaint)}
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      {/* Complaint editor */}
      {editingComplaint && (
        <div className="admin-edit-overlay">
          <form
            className="admin-edit-modal"
            onSubmit={handleUpdate}
          >
            <div className="admin-edit-heading">
              <div>
                <p>COMPLAINT MANAGEMENT</p>
                <h2>Update Complaint</h2>
              </div>

              <button
                type="button"
                onClick={() => setEditingComplaint(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="admin-edit-summary">
              <strong>{editingComplaint.title}</strong>
              <span>
                {editingComplaint.category} · {editingComplaint.location}
              </span>
              <span>
                👍 Community Support: {getUpvoteCount(editingComplaint)}
              </span>
            </div>

            <label>Complaint Status</label>
            <select
              value={editingComplaint.status}
              onChange={e =>
                setEditingComplaint({
                  ...editingComplaint,
                  status: e.target.value
                })
              }
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>

            <label>Assign Department</label>
            <select
              value={editingComplaint.department || 'Not Assigned'}
              onChange={e =>
                setEditingComplaint({
                  ...editingComplaint,
                  department: e.target.value
                })
              }
            >
              <option value="Not Assigned">Not Assigned</option>
              {departments.map(department => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>

            <label>Resolution Deadline</label>
            <input
              type="date"
              value={editingComplaint.resolutionDeadline}
              onChange={e =>
                setEditingComplaint({
                  ...editingComplaint,
                  resolutionDeadline: e.target.value
                })
              }
            />

            <div className="admin-edit-actions">
              <button
                type="button"
                className="admin-cancel-button"
                onClick={() => setEditingComplaint(null)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="admin-save-button"
                disabled={savingId === editingComplaint._id}
              >
                {savingId === editingComplaint._id
                  ? 'Saving...'
                  : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminComplaints;
