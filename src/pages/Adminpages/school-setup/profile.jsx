import { useState } from 'react';
import {
  Building2,
  Upload,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  GraduationCap,
  Calendar,
  Shield,
  Key,
  Laptop,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  School,
  User,
  FileText,
  CreditCard,
  Clock
} from 'lucide-react';
import '../../../styles/school-profile.css';

function SchoolProfile() {
  const [formData, setFormData] = useState({
    // Basic Info
    schoolName: 'Springfield International School',
    motto: 'Excellence in Education',
    
    // Address
    street: '123 Education Avenue',
    city: 'Springfield',
    state: 'Illinois',
    country: 'USA',
    postalCode: '62701',
    
    // Contact
    phone: '+1 (555) 123-4567',
    email: 'info@springfield.edu',
    website: 'www.springfield.edu',
    
    // Leadership
    principalName: 'Dr. James Wilson',
    principalEmail: 'james.wilson@springfield.edu',
    vicePrincipalName: 'Ms. Sarah Johnson',
    vicePrincipalEmail: 'sarah.johnson@springfield.edu',
    
    // School Info
    establishedYear: '1995',
    schoolType: 'Private',
    
    // License
    licenseKey: 'SCH-2024-ABCD-1234-WXYZ',
    licenseType: 'Premium',
    validUntil: '2025-12-31',
    licensedDevices: '500'
  });

  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');

  // Auto-calculated statistics (hardcoded for demo - would come from API)
  const statistics = {
    totalClasses: 42,
    totalSections: 86,
    totalStudents: 1247,
    totalStaff: 156
  };

  const schoolTypes = ['Public', 'Private', 'Charter', 'International', 'Religious', 'Other'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showAlertMessage('Logo size should be less than 2MB', 'error');
        return;
      }
      
      if (!file.type.match('image.*')) {
        showAlertMessage('Please upload an image file', 'error');
        return;
      }
      
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogo(null);
    setLogoPreview(null);
  };

  const showAlertMessage = (message, type = 'success') => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 3000);
  };

  const handleSave = () => {
    // Validate required fields
    if (!formData.schoolName) {
      showAlertMessage('School name is required', 'error');
      return;
    }
    
    if (!formData.principalName) {
      showAlertMessage('Principal name is required', 'error');
      return;
    }
    
    // Here you would typically save to API
    console.log('Saving school profile:', { ...formData, logo });
    showAlertMessage('School profile saved successfully!', 'success');
  };

  const handleCancel = () => {
    // Reset to original values or navigate away
    showAlertMessage('Changes discarded', 'info');
  };

  return (
    <div className="profile-container">
      {/* Page Header */}
      <div className="profile-header">
        <h1 className="profile-title">
          <Building2 size={28} style={{ display: 'inline', marginRight: '12px' }} />
          School Profile
        </h1>
        <p className="profile-subtitle">
          Manage institution details displayed on reports, transcripts, and certificates
        </p>
        <hr style={{ margin: '1rem 0', borderColor: 'var(--border)' }} />
      </div>

      {/* Alert Messages */}
      {showAlert && (
        <div className={`alert-${alertType}`}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {alertType === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {alertMessage}
          </span>
          <span className="close-alert" onClick={() => setShowAlert(false)}>
            <X size={18} />
          </span>
        </div>
      )}

      <div className="profile-two-columns">
        {/* Left Column */}
        <div>
          {/* Logo Upload Section */}
          <div className="card">
            <div className="form-section-title">
              <Upload size={18} />
              School Logo
            </div>
            <div className="logo-section">
              <div className="logo-preview">
                {logoPreview ? (
                  <img src={logoPreview} alt="School Logo" />
                ) : (
                  <div className="logo-placeholder">
                    <School size={48} />
                    <span style={{ fontSize: '0.75rem' }}>No logo uploaded</span>
                  </div>
                )}
              </div>
              <div className="logo-actions">
                <label className="button" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Upload size={16} />
                  Upload Logo
                  <input
                    type="file"
                    className="file-input"
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                </label>
                {logoPreview && (
                  <button className="button button-danger" onClick={handleRemoveLogo} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Trash2 size={16} />
                    Remove
                  </button>
                )}
              </div>
              <small style={{ color: 'var(--secondary)', fontSize: '0.75rem' }}>
                Recommended: Square image, minimum 200x200px, max 2MB
              </small>
            </div>
          </div>

          {/* Statistics Section */}
          <div className="card">
            <div className="form-section-title">
              <Users size={18} />
              School Statistics (Auto-calculated)
            </div>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{statistics.totalClasses}</div>
                <div className="stat-label">Total Classes</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{statistics.totalSections}</div>
                <div className="stat-label">Total Sections</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{statistics.totalStudents}</div>
                <div className="stat-label">Total Students</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{statistics.totalStaff}</div>
                <div className="stat-label">Total Staff</div>
              </div>
            </div>
          </div>

          {/* License Information */}
          <div className="license-card">
            <div className="license-header">
              <Shield size={20} />
              License Information
            </div>
            <div className="license-details">
              <div className="license-item">
                <span className="license-label">License Key</span>
                <span className="license-value">
                  <Key size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  {formData.licenseKey}
                </span>
              </div>
              <div className="license-item">
                <span className="license-label">License Type</span>
                <span className="license-value">
                  <CreditCard size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  {formData.licenseType}
                </span>
              </div>
              <div className="license-item">
                <span className="license-label">Valid Until</span>
                <span className="license-value">
                  <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  {formData.validUntil}
                </span>
              </div>
              <div className="license-item">
                <span className="license-label">Licensed Devices</span>
                <span className="license-value">
                  <Laptop size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  {formData.licensedDevices}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Forms */}
        <div>
          <div className="card">
            {/* Basic Information */}
            <div className="form-section">
              <div className="form-section-title">
                <School size={18} />
                Basic Information
              </div>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label className="form-label">
                    School Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="schoolName"
                    className="form-input"
                    value={formData.schoolName}
                    onChange={handleInputChange}
                    placeholder="Enter school name"
                  />
                </div>
                <div className="form-group full-width">
                  <label className="form-label">Motto / Slogan</label>
                  <input
                    type="text"
                    name="motto"
                    className="form-input"
                    value={formData.motto}
                    onChange={handleInputChange}
                    placeholder="Enter school motto"
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="form-section">
              <div className="form-section-title">
                <MapPin size={18} />
                Address
              </div>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label className="form-label">Street Address</label>
                  <input
                    type="text"
                    name="street"
                    className="form-input"
                    value={formData.street}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    name="city"
                    className="form-input"
                    value={formData.city}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    name="state"
                    className="form-input"
                    value={formData.state}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <input
                    type="text"
                    name="country"
                    className="form-input"
                    value={formData.country}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    className="form-input"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="form-section">
              <div className="form-section-title">
                <Phone size={18} />
                Contact Information
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-input"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group full-width">
                  <label className="form-label">Website</label>
                  <input
                    type="url"
                    name="website"
                    className="form-input"
                    value={formData.website}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Leadership */}
            <div className="form-section">
              <div className="form-section-title">
                <User size={18} />
                School Leadership
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    Principal Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="principalName"
                    className="form-input"
                    value={formData.principalName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Principal Email</label>
                  <input
                    type="email"
                    name="principalEmail"
                    className="form-input"
                    value={formData.principalEmail}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Vice Principal Name</label>
                  <input
                    type="text"
                    name="vicePrincipalName"
                    className="form-input"
                    value={formData.vicePrincipalName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Vice Principal Email</label>
                  <input
                    type="email"
                    name="vicePrincipalEmail"
                    className="form-input"
                    value={formData.vicePrincipalEmail}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="form-section">
              <div className="form-section-title">
                <Clock size={18} />
                Additional Information
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Established Year</label>
                  <input
                    type="number"
                    name="establishedYear"
                    className="form-input"
                    value={formData.establishedYear}
                    onChange={handleInputChange}
                    placeholder="YYYY"
                    min="1800"
                    max="2024"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">School Type</label>
                  <select
                    name="schoolType"
                    className="form-select"
                    value={formData.schoolType}
                    onChange={handleInputChange}
                  >
                    {schoolTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button className="button cancel-btn" onClick={handleCancel}>
                <X size={16} style={{ display: 'inline', marginRight: '6px' }} />
                Cancel
              </button>
              <button className="button save-btn" onClick={handleSave}>
                <Save size={16} style={{ display: 'inline', marginRight: '6px' }} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SchoolProfile;