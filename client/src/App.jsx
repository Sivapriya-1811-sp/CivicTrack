
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import SubmitComplaint from './components/SubmitComplaint';
import MyComplaints from './components/MyComplaints';
import ComplaintDetails from './components/ComplaintDetails';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import AdminComplaints from './components/AdminComplaints';
import CommunityComplaints from './components/CommunityComplaints';

import './App.css';

function Home() {
  return (
    <div className="home-page">

      {/* Navigation Bar */}
      <header className="home-navbar">
        <Link to="/" className="home-logo">
          🏙️ Civic<span>Track</span>
        </Link>

        <Link to="/community" className="home-community-link">
          Community
        </Link>
      </header>

      {/* Homepage Role Selection */}
      <main className="home-role-main">

        <span className="home-tagline">
          SMART CIVIC SOLUTIONS
        </span>

        <h1>Welcome to CivicTrack</h1>

        <p className="home-subtitle">
          Choose how you'd like to continue
        </p>

        {/* Citizen and Administrator Cards */}
        <div className="home-role-grid">

          {/* Citizen */}
          <Link
            to="/login"
            className="home-role-card citizen-card"
          >
            <div className="home-role-icon">
              👤
            </div>

            <h2>Citizen</h2>

            <p>
              Report civic issues, track complaints,
              and share feedback with your community.
            </p>

            <span className="home-role-action">
              Citizen Login →
            </span>
          </Link>

          {/* Administrator */}
          <Link
            to="/admin/login"
            className="home-role-card admin-card"
          >
            <div className="home-role-icon">
              🛡️
            </div>

            <h2>Administrator</h2>

            <p>
              Manage complaints, monitor progress,
              and resolve civic issues efficiently.
            </p>

            <span className="home-role-action">
              Admin Login →
            </span>
          </Link>

        </div>

        <p className="home-role-note">
          New citizen? You can register from the citizen login page.
        </p>

      </main>

      {/* Footer */}
      <footer className="home-footer">
        CivicTrack · Smart Civic Solutions
      </footer>

    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Homepage */}
        <Route path="/" element={<Home />} />

        {/* Citizen Authentication */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Citizen Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Citizen Complaints */}
        <Route
          path="/complaints/new"
          element={<SubmitComplaint />}
        />

        <Route
          path="/complaints"
          element={<MyComplaints />}
        />

        <Route
          path="/complaints/:id"
          element={<ComplaintDetails />}
        />

        {/* Community Complaints */}
        <Route
          path="/community"
          element={<CommunityComplaints />}
        />

        {/* Administrator Authentication */}
        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        {/* Administrator Dashboard */}
        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />

        {/* Administrator Complaint Management */}
        <Route
          path="/admin/complaints"
          element={<AdminComplaints />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
