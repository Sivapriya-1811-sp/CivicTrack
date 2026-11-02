
import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './SubmitComplaint.css';

function SubmitComplaint() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: ''
  });

  const [image, setImage] = useState('');
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

    setSuccessMessage('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Image size must be less than 2 MB.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setImage(reader.result);
      setPreview(reader.result);
      setError('');
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSuccessMessage('');

    const token = sessionStorage.getItem('civicToken');

    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        '/api/complaints',
        {
          ...formData,
          image
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Show success message instead of browser alert
      setSuccessMessage(
        response.data.message || 'Complaint submitted successfully!'
      );

      // Reset form after successful submission
      setFormData({
        title: '',
        description: '',
        category: '',
        location: ''
      });

      setImage('');
      setPreview('');

    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to submit your complaint. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="submit-page">
      <div className="submit-container">

        <Link to="/dashboard" className="back-link">
          ← Back to Dashboard
        </Link>

        <div className="submit-heading">
          <p className="submit-eyebrow">
            CIVICTRACK CITIZEN PORTAL
          </p>

          <h1>Report a Civic Issue</h1>

          <p>
            Help improve your community by reporting a problem.
            Provide accurate details so the concerned department
            can take action.
          </p>
        </div>

        <form className="complaint-form" onSubmit={handleSubmit}>

          <h2>Complaint Information</h2>

          <p className="form-description">
            Fields marked with * are required.
          </p>

          {/* Error Message */}
          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label>Complaint Title *</label>

            <input
              type="text"
              name="title"
              placeholder="Example: Damaged road near main street"
              value={formData.title}
              onChange={handleChange}
              required
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label>Complaint Category *</label>

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select a category</option>
              <option value="Road Damage">Road Damage</option>
              <option value="Water Leakage">Water Leakage</option>
              <option value="Waste Disposal">Waste Disposal</option>
              <option value="Street Light">Street Light</option>
              <option value="Drainage Problem">Drainage Problem</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Complaint Description *</label>

            <textarea
              name="description"
              placeholder="Describe the issue in detail..."
              value={formData.description}
              onChange={handleChange}
              rows="5"
              required
              maxLength={2000}
            />
          </div>

          <div className="form-group">
            <label>Location of the Issue *</label>

            <input
              type="text"
              name="location"
              placeholder="Enter street, area, city or landmark"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Upload Photo Evidence</label>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />

            <small>Upload an image up to 2 MB.</small>
          </div>

          {preview && (
            <div className="image-preview">
              <p>Selected Image:</p>

              <img
                src={preview}
                alt="Complaint evidence preview"
              />

              <button
                type="button"
                onClick={() => {
                  setImage('');
                  setPreview('');
                }}
              >
                Remove Image
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="submit-complaint-button"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Complaint'}
          </button>

          {/* Green Success Message */}
          {successMessage && (
            <div className="complaint-success-message">
              <span className="success-icon">✓</span>

              <div>
                <strong>Completed Successfully!</strong>

                <p>{successMessage}</p>
              </div>
            </div>
          )}

        </form>
      </div>
    </div>
  );
}

export default SubmitComplaint;
