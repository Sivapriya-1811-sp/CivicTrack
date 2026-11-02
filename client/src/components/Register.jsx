
import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './Register.css';

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    setSuccess('');

    const { fullName, email, phone, address, password, confirmPassword } = formData;

    if (!fullName.trim() || !email.trim() || !phone.trim() ||
        !address.trim() || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post('/api/auth/register', {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        address: address.trim(),
        password
      });

      setSuccess(response.data.message);

      setFormData({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        password: '',
        confirmPassword: ''
      });

      setTimeout(() => {
        navigate('/login');
      }, 1500);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to register. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">

      <div className="register-left">
        <div className="register-brand">
          <div className="register-logo">C</div>
          <div>
            <h2>CivicTrack</h2>
            <span>SMART CIVIC SOLUTIONS</span>
          </div>
        </div>

        <div className="register-message">
          <span className="register-tag">BUILDING BETTER COMMUNITIES</span>

          <h1>
            Your Voice.
            <br />
            Your City.
            <br />
            <span>Our Responsibility.</span>
          </h1>

          <p>
            Join CivicTrack and become a part of building
            cleaner, safer and smarter communities.
          </p>

          <div className="register-benefits">
            <div>✓ Report public issues easily</div>
            <div>✓ Track your complaints anytime</div>
            <div>✓ Stay informed about resolutions</div>
          </div>
        </div>

        <div className="register-left-footer">
          Empowering citizens. Improving communities.
        </div>
      </div>

      <div className="register-right">

        <div className="register-form-container">

          <div className="register-heading">
            <span>CREATE YOUR ACCOUNT</span>
            <h2>Join CivicTrack</h2>
            <p>Register to make your community better.</p>
          </div>

          {error && (
            <div className="register-alert error-alert">
              {error}
            </div>
          )}

          {success && (
            <div className="register-alert success-alert">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="register-field">
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                autoComplete="name"
                maxLength={80}
              />
            </div>

            <div className="register-field">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            <div className="register-field">
              <label>Mobile Number</label>
              <input
                type="tel"
                name="phone"
                placeholder="Enter 10-digit mobile number"
                value={formData.phone}
                onChange={handleChange}
                autoComplete="tel"
                maxLength={10}
              />
            </div>

            <div className="register-field">
              <label>Residential Address</label>
              <textarea
                name="address"
                placeholder="Enter your residential address"
                value={formData.address}
                onChange={handleChange}
                autoComplete="street-address"
                rows="3"
                maxLength={250}
              />
            </div>

            <div className="register-field">
              <label>Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="register-field">
              <label>Confirm Password</label>
              <div className="password-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="register-submit"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account →'}
            </button>

          </form>

          <div className="register-login-link">
            Already have an account?
            {' '}
            <Link to="/login">Sign In</Link>
          </div>

          <div className="register-home-link">
            <Link to="/">← Back to Home</Link>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Register;
