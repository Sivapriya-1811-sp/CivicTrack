
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);

  const token = sessionStorage.getItem('civicToken');

  useEffect(() => {
    const savedUser = sessionStorage.getItem('civicUser');

    if (!token || !savedUser) {
      navigate('/login');
      return;
    }

    setUser(JSON.parse(savedUser));

    const fetchComplaints = async () => {
      try {
        const response = await axios.get('/api/complaints/my', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setComplaints(response.data.complaints || []);
      } catch (error) {
        console.error('Error fetching complaints:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchNotifications = async () => {
      try {
        const response = await axios.get('/api/notifications/my', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(response.data.notifications || []);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchComplaints();
    fetchNotifications();
  }, [navigate, token]);

  const handleLogout = () => {
    sessionStorage.removeItem('civicToken');
    sessionStorage.removeItem('civicUser');
    navigate('/login');
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(
        `/api/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications(prev =>
        prev.map(n =>
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const total = complaints.length;
  const pending = complaints.filter(c => c.status === 'Pending').length;
  const inProgress = complaints.filter(c => c.status === 'In Progress').length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;

  if (!user) return null;

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <h2 className="dashboard-logo">CivicTrack</h2>
        <p className="sidebar-caption">CITIZEN PORTAL</p>

        <nav className="sidebar-nav">
          <button
            className="nav-item active"
            onClick={() => navigate('/dashboard')}
          >
            Dashboard
          </button>

          <button
            className="nav-item"
            onClick={() => navigate('/complaints/new')}
          >
            Submit Complaint
          </button>

          <button
            className="nav-item"
            onClick={() => navigate('/complaints')}
          >
            My Complaints
          </button>

          {/* Community Issues Navigation */}
          <button
            className="nav-item"
            onClick={() => navigate('/community')}
          >
            👥 Community Issues
          </button>
        </nav>

        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-eyebrow">CITIZEN DASHBOARD</p>
            <h1>Welcome, {user.fullName}!</h1>
            <p className="dashboard-subtitle">
              Track your civic complaints and help improve your community.
            </p>
          </div>

          <div className="dashboard-header-actions">
            <div className="notification-wrapper">
              <button
                className="notification-bell"
                onClick={() => setShowNotifications(prev => !prev)}
                title="Notifications"
              >
                🔔
                {unreadCount > 0 && (
                  <span className="notification-count">{unreadCount}</span>
                )}
              </button>

              {showNotifications && (
                <div className="notification-panel">
                  <div className="notification-panel-header">
                    <h3>Notifications</h3>
                    <span>{unreadCount} unread</span>
                  </div>

                  {notifications.length === 0 ? (
                    <p className="notification-empty">
                      No notifications yet.
                    </p>
                  ) : (
                    <div className="notification-list">
                      {notifications.map(notification => (
                        <div
                          key={notification._id}
                          className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                        >
                          <p>{notification.message}</p>
                          <span className="notification-time">
                            {new Date(notification.createdAt).toLocaleString()}
                          </span>

                          {notification.complaint && (
                            <button
                              className="notification-view-button"
                              onClick={() => {
                                markAsRead(notification._id);
                                navigate(`/complaints/${notification.complaint._id}`);
                              }}
                            >
                              View Complaint
                            </button>
                          )}

                          {!notification.read && (
                            <button
                              className="notification-read-button"
                              onClick={() => markAsRead(notification._id)}
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              className="primary-button"
              onClick={() => navigate('/complaints/new')}
            >
              + Submit Complaint
            </button>
          </div>
        </header>

        <section className="stats-grid">
          <div className="stat-card">
            <span className="stat-icon">📋</span>
            <p>Total Complaints</p>
            <h2>{total}</h2>
            <span>All submissions</span>
          </div>

          <div className="stat-card">
            <span className="stat-icon">⏳</span>
            <p>Pending</p>
            <h2>{pending}</h2>
            <span>Awaiting action</span>
          </div>

          <div className="stat-card">
            <span className="stat-icon">⚙️</span>
            <p>In Progress</p>
            <h2>{inProgress}</h2>
            <span>Being addressed</span>
          </div>

          <div className="stat-card">
            <span className="stat-icon">✅</span>
            <p>Resolved</p>
            <h2>{resolved}</h2>
            <span>Successfully completed</span>
          </div>
        </section>

        <section className="dashboard-content-card">
          <div className="section-heading">
            <div>
              <h2>Recent Complaints</h2>
              <p>Your latest complaint submissions will appear here.</p>
            </div>

            <button onClick={() => navigate('/complaints')}>
              View All
            </button>
          </div>

          {loading ? (
            <div className="empty-state">
              <p>Loading your complaints...</p>
            </div>
          ) : complaints.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No complaints yet</h3>
              <p>
                You haven't submitted any complaints. Report a civic issue
                to help make your community better.
              </p>
              <button
                className="primary-button"
                onClick={() => navigate('/complaints/new')}
              >
                Submit Your First Complaint
              </button>
            </div>
          ) : (
            <div className="recent-complaints-list">
              {complaints.slice(0, 5).map(complaint => (
                <div className="recent-complaint-item" key={complaint._id}>
                  <div>
                    <h3>{complaint.title}</h3>
                    <p>
                      {complaint.category} · {complaint.location}
                    </p>
                    <span className="complaint-date">
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <span className={`status-badge ${complaint.status.toLowerCase().replace(' ', '-')}`}>
                      {complaint.status}
                    </span>
                    <button
                      onClick={() => navigate(`/complaints/${complaint._id}`)}
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
