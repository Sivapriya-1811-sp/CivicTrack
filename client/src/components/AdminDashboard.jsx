
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';


const AdminDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0
  });

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const user = JSON.parse(sessionStorage.getItem('civicUser') || 'null');
  const token = sessionStorage.getItem('civicToken');
  
  const statusData = [
    { name: 'Pending', value: stats.pending },
    { name: 'In Progress', value: stats.inProgress },
    { name: 'Resolved', value: stats.resolved },
    { name: 'Rejected', value: stats.rejected }
  ];

  const categoryData = [
    'Road Damage',
    'Water Leakage',
    'Waste Disposal',
    'Street Light',
    'Drainage Problem',
    'Other'
  ].map((category) => ({
    name: category,
    complaints: complaints.filter(
      (complaint) => complaint.category === category
    ).length
  }));

  const monthlyData = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - (5 - index));

    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();

    return {
      month: `${month} ${year}`,
      complaints: complaints.filter((complaint) => {
        const complaintDate = new Date(complaint.createdAt);
        return (
          complaintDate.getMonth() === date.getMonth() &&
          complaintDate.getFullYear() === year
        );
      }).length
    };
  });

  const chartColors = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444'];

  useEffect(() => {
    if (!token || user?.role !== 'admin') {
      navigate('/admin/login');
      return;
    }

    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const [statsResponse, complaintsResponse] = await Promise.all([
        axios.get('/api/admin/stats', config),
        axios.get('/api/admin/complaints', config)
      ]);

      setStats(statsResponse.data);
      setComplaints(complaintsResponse.data.complaints || []);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Unable to load dashboard data.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('civicToken');
    sessionStorage.removeItem('civicUser');
    navigate('/admin/login');
  };

  const getStatusClass = (status) => {
    return status.toLowerCase().replace(' ', '-');
  };

  // Feedback calculations
  const feedbackComplaints = complaints.filter(
    (complaint) => complaint.feedback?.rating
  );

  const totalFeedback = feedbackComplaints.length;

  const averageRating =
    totalFeedback > 0
      ? (
          feedbackComplaints.reduce(
            (sum, complaint) => sum + complaint.feedback.rating,
            0
          ) / totalFeedback
        ).toFixed(1)
      : '0.0';

  const recentFeedback = [...feedbackComplaints].sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  );
  // Overdue Complaint Calculation
  const overdueComplaints = complaints.filter((complaint) => {
    const deadline = complaint.resolutionDeadline;

    return (
      deadline &&
      new Date(deadline) < new Date() &&
      complaint.status !== 'Resolved' &&
      complaint.status !== 'Rejected'
    );
  });

  const overdueCount = overdueComplaints.length;
  const getDaysOverdue = (deadline) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(deadline);
  dueDate.setHours(0, 0, 0, 0);

  return Math.max(
    1,
    Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24))
  );
};
  if (loading) {
    return <div className="admin-loading">Loading admin dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span>🏛️</span>
          <h2>CivicTrack</h2>
        </div>

        <p className="admin-sidebar-label">ADMINISTRATION</p>

        <nav>
          <button className="admin-nav-active">📊 Dashboard</button>
          <button onClick={() => navigate('/admin/complaints')}>
            📋 Manage Complaints
          </button>
        </nav>

        <button className="admin-logout" onClick={handleLogout}>
          ↪ Logout
        </button>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <p>ADMINISTRATION / OVERVIEW</p>
            <h1>Admin Dashboard</h1>
          </div>

          <div className="admin-profile">
            <span>🛡️</span>
            <div>
              <strong>{user?.fullName || 'Administrator'}</strong>
              <small>System Administrator</small>
            </div>
          </div>
        </header>

        <section className="admin-welcome">
          <div>
            <h2>Welcome back, {user?.fullName || 'Admin'}!</h2>
            <p>Here's an overview of citizen complaints and their progress.</p>
          </div>
          <span>🏙️</span>
        </section>

        {error && <p className="admin-dashboard-error">{error}</p>}

        {/* Complaint Statistics */}
        <section className="admin-stats-grid">
          <div className="admin-stat-card">
            <span>📋</span>
            <p>Total Complaints</p>
            <h2>{stats.total}</h2>
          </div>

          <div className="admin-stat-card">
            <span>⏳</span>
            <p>Pending</p>
            <h2>{stats.pending}</h2>
          </div>

          <div className="admin-stat-card">
            <span>🔄</span>
            <p>In Progress</p>
            <h2>{stats.inProgress}</h2>
          </div>

          <div className="admin-stat-card">
            <span>✅</span>
            <p>Resolved</p>
            <h2>{stats.resolved}</h2>
          </div>

          <div className="admin-stat-card">
            <span>❌</span>
            <p>Rejected</p>
            <h2>{stats.rejected}</h2>
          </div>
          <div className="admin-stat-card overdue-stat-card">
  <span>🚨</span>
  <p>Overdue Complaints</p>
  <h2>{overdueCount}</h2>
</div>
        </section>
{/* Urgent Overdue Complaints */}
<section className="admin-urgent-section">
  <div className="admin-section-heading">
    <div>
      <h2>🚨 Urgent Complaints</h2>
      <p>Complaints that have missed their resolution deadline</p>
    </div>

    <span className="urgent-count">
      {overdueCount} Overdue
    </span>
  </div>

  {overdueComplaints.length === 0 ? (
    <div className="admin-urgent-empty">
      <span>🎉</span>
      <h3>No overdue complaints!</h3>
      <p>All complaints are within their resolution deadlines.</p>
    </div>
  ) : (
    <div className="admin-urgent-list">
      {overdueComplaints
        .sort(
          (a, b) =>
            new Date(a.resolutionDeadline) -
            new Date(b.resolutionDeadline)
        )
        .slice(0, 5)
        .map((complaint) => (
          <div className="admin-urgent-item" key={complaint._id}>
            <div className="admin-urgent-info">
              <h3>{complaint.title}</h3>
              <p>
                {complaint.category} · {complaint.location}
              </p>
              <span className="admin-urgent-days">
                🚨 {getDaysOverdue(complaint.resolutionDeadline)} day(s) overdue
              </span>
            </div>

            <button
              className="admin-urgent-manage"
              onClick={() => navigate('/admin/complaints')}
            >
              Manage →
            </button>
          </div>
        ))}
    </div>
  )}
</section>
        {/* Recent Complaints */}
        <section className="admin-recent-section">
          <div className="admin-section-heading">
            <div>
              <h2>Recent Complaints</h2>
              <p>Latest complaints submitted by citizens</p>
            </div>

            <button onClick={() => navigate('/admin/complaints')}>
              View All →
            </button>
          </div>

          {complaints.length === 0 ? (
            <div className="admin-empty">
              <span>📭</span>
              <h3>No complaints yet</h3>
              <p>Citizen complaints will appear here.</p>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Complaint</th>
                    <th>Citizen</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {complaints.slice(0, 5).map((complaint) => (
                    <tr key={complaint._id}>
                      <td>{complaint.title}</td>
                      <td>{complaint.citizen?.fullName || 'Unknown'}</td>
                      <td>{complaint.category}</td>
                      <td>
                        {new Date(complaint.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <span className={`admin-status ${getStatusClass(complaint.status)}`}>
                          {complaint.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Citizen Feedback Section */}
        <section className="admin-feedback-section">
          <div className="admin-feedback-heading">
            <div>
              <h2>⭐ Citizen Feedback & Ratings</h2>
              <p>Feedback submitted by citizens on resolved complaints</p>
            </div>
          </div>

          {/* Feedback Summary Cards */}
          <div className="admin-feedback-stats">
            <div className="admin-feedback-card">
              <span>⭐</span>
              <p>Average Rating</p>
              <h2>{averageRating} / 5</h2>
            </div>

            <div className="admin-feedback-card">
              <span>💬</span>
              <p>Total Feedback</p>
              <h2>{totalFeedback}</h2>
            </div>
          </div>

          {/* Recent Feedback */}
          <div className="admin-feedback-list">
            <h3>Recent Citizen Feedback</h3>

            {recentFeedback.length === 0 ? (
              <div className="admin-feedback-empty">
                <span>💭</span>
                <p>No citizen feedback received yet.</p>
              </div>
            ) : (
              recentFeedback.slice(0, 5).map((complaint) => (
                <div className="admin-feedback-item" key={complaint._id}>
                  <div className="admin-feedback-item-header">
                    <div>
                      <strong>
                        {complaint.citizen?.fullName || 'Unknown Citizen'}
                      </strong>
                      <p>{complaint.title}</p>
                    </div>

                    <span className="admin-feedback-rating">
                      ⭐ {complaint.feedback.rating}/5
                    </span>
                  </div>

                  <p className="admin-feedback-comment">
                    {complaint.feedback.comment?.trim()
                      ? `"${complaint.feedback.comment}"`
                      : 'No written comment provided.'}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
        
        {/* Analytics Charts */}
        <section className="admin-analytics-section">
          <div className="admin-analytics-heading">
            <h2>📊 Complaint Analytics</h2>
            <p>Visual overview of complaint statistics</p>
          </div>

          <div className="admin-charts-grid">
            {/* Status Pie Chart */}
            <div className="admin-chart-card">
              <h3>Complaint Status Distribution</h3>

              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {statusData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={chartColors[index % chartColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category Bar Chart */}
            <div className="admin-chart-card">
              <h3>Complaints by Category</h3>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={categoryData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 35 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                    fontSize={11}
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar
                    dataKey="complaints"
                    fill="#6366f1"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Monthly Trends */}
            <div className="admin-chart-card admin-monthly-chart">
              <h3>Monthly Complaint Trends</h3>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar
                    dataKey="complaints"
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default AdminDashboard;
