
import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email.trim() || !formData.password) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post('/api/auth/login', {
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      });

      // Save authentication details for this browser session
      sessionStorage.setItem('civicToken', response.data.token);
      sessionStorage.setItem(
        'civicUser',
        JSON.stringify(response.data.user)
      );

      // Temporary destination until we build the dashboard
      navigate('/dashboard');

    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* LEFT SECTION */}
      <div className="login-left">

        <Link to="/" className="login-brand">
          <div className="login-logo">C</div>

          <div>
            <h2>CivicTrack</h2>
            <span>SMART CIVIC SOLUTIONS</span>
          </div>
        </Link>

        <div className="login-message">

          <span className="login-tag">
            YOUR COMMUNITY MATTERS
          </span>

          <h1>
            Together,
            <br />
            We Build
            <br />
            <span>Better Cities.</span>
          </h1>

          <p>
            Stay connected with your community. Report public
            issues, monitor complaint progress and make a
            positive difference.
          </p>

          <div className="login-benefits">
            <div>✓ Your complaints, always accessible</div>
            <div>✓ Transparent complaint tracking</div>
            <div>✓ Stay updated on resolutions</div>
          </div>

        </div>

        <div className="login-left-footer">
          Empowering citizens. Improving communities.
        </div>

      </div>

      {/* RIGHT SECTION */}
      <div className="login-right">

        <div className="login-form-container">

          <div className="login-heading">
            <span>WELCOME BACK</span>
            <h2>Sign In to CivicTrack</h2>
            <p>
              Enter your account details to continue.
            </p>
          </div>

          {error && (
            <div className="login-alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="login-field">
              <label>Email Address</label>

              <input
                type="email"
                name="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            <div className="login-field">
              <label>Password</label>

              <div className="login-password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="login-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In →'}
            </button>

          </form>

          <div className="login-register-link">
            Don't have an account?
            {' '}
            <Link to="/register">Create Account</Link>
          </div>

          <div className="login-home-link">
            <Link to="/">← Back to Home</Link>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;
