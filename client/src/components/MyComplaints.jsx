
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './MyComplaints.css';

function MyComplaints() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchComplaints = async () => {
      const token = sessionStorage.getItem('civicToken');

      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get('/api/complaints/my', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setComplaints(response.data.complaints);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          'Unable to load your complaints.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [navigate]);

  const getStatusClass = (status) => {
    return status.toLowerCase().replace(/\s+/g, '-');
  };

  return (
    <div className="my-complaints-page">
      <div className="my-complaints-container">

        <Link to="/dashboard" className="complaints-back-link">
          ← Back to Dashboard
        </Link>

        <div className="my-complaints-header">
          <div>
            <p className="complaints-eyebrow">CIVICTRACK CITIZEN PORTAL</p>
            <h1>My Complaints</h1>
            <p>View and track the civic issues you have reported.</p>
          </div>

          <button
            className="new-complaint-button"
            onClick={() => navigate('/complaints/new')}
          >
            + New Complaint
          </button>
        </div>

        <div className="complaints-summary">
          <div>
            <span>Total Complaints</span>
            <h2>{complaints.length}</h2>
          </div>
          <div>
            <span>Pending</span>
            <h2>
              {complaints.filter(c => c.status === 'Pending').length}
            </h2>
          </div>
          <div>
            <span>In Progress</span>
            <h2>
              {complaints.filter(c => c.status === 'In Progress').length}
            </h2>
          </div>
          <div>
            <span>Resolved</span>
            <h2>
              {complaints.filter(c => c.status === 'Resolved').length}
            </h2>
          </div>
        </div>

        <div className="complaints-list-card">
          <h2>Complaint History</h2>

          {loading && (
            <p className="complaints-message">Loading complaints...</p>
          )}

          {error && (
            <p className="complaints-error">{error}</p>
          )}

          {!loading && !error && complaints.length === 0 && (
            <div className="no-complaints">
              <div>📭</div>
              <h3>No complaints submitted yet</h3>
              <p>Your submitted complaints will appear here.</p>
              <button
                className="new-complaint-button"
                onClick={() => navigate('/complaints/new')}
              >
                Submit Your First Complaint
              </button>
            </div>
          )}

          {!loading && !error && complaints.length > 0 && (
            <div className="complaints-table-wrapper">
              <table className="complaints-table">
                <thead>
                  <tr>
                    <th>Complaint</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Details</th>
                  </tr>
                </thead>

                <tbody>
                  {complaints.map(complaint => (
                    <tr key={complaint._id}>
                      <td>{complaint.title}</td>
                      <td>{complaint.category}</td>
                      <td>{complaint.location}</td>
                      <td>
                        {new Date(complaint.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <span className={`complaint-status ${getStatusClass(complaint.status)}`}>
                          {complaint.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="view-complaint-button"
                          onClick={() => navigate(`/complaints/${complaint._id}`)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default MyComplaints;
