// import { useState } from 'react';
// import {
//   Building2,
//   Upload,
//   Trash2,
//   MapPin,
//   Phone,
//   Mail,
//   Globe,
//   Users,
//   GraduationCap,
//   Calendar,
//   Shield,
//   Key,
//   Laptop,
//   Save,
//   X,
//   CheckCircle,
//   AlertCircle,
//   School,
//   User,
//   FileText,
//   CreditCard,
//   Clock
// } from 'lucide-react';
// import '../../../styles/school-profile.css';

// function SchoolProfile() {
//   const [formData, setFormData] = useState({
//     // Basic Info
//     schoolName: 'Springfield International School',
//     motto: 'Excellence in Education',
    
//     // Address
//     street: '123 Education Avenue',
//     city: 'Springfield',
//     state: 'Illinois',
//     country: 'USA',
//     postalCode: '62701',
    
//     // Contact
//     phone: '+1 (555) 123-4567',
//     email: 'info@springfield.edu',
//     website: 'www.springfield.edu',
    
//     // Leadership
//     principalName: 'Dr. James Wilson',
//     principalEmail: 'james.wilson@springfield.edu',
//     vicePrincipalName: 'Ms. Sarah Johnson',
//     vicePrincipalEmail: 'sarah.johnson@springfield.edu',
    
//     // School Info
//     establishedYear: '1995',
//     schoolType: 'Private',
    
//     // License
//     licenseKey: 'SCH-2024-ABCD-1234-WXYZ',
//     licenseType: 'Premium',
//     validUntil: '2025-12-31',
//     licensedDevices: '500'
//   });

//   const [logo, setLogo] = useState(null);
//   const [logoPreview, setLogoPreview] = useState(null);
//   const [showAlert, setShowAlert] = useState(false);
//   const [alertMessage, setAlertMessage] = useState('');
//   const [alertType, setAlertType] = useState('success');

//   // Auto-calculated statistics (hardcoded for demo - would come from API)
//   const statistics = {
//     totalClasses: 42,
//     totalSections: 86,
//     totalStudents: 1247,
//     totalStaff: 156
//   };

//   const schoolTypes = ['Public', 'Private', 'Charter', 'International', 'Religious', 'Other'];

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleLogoUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       if (file.size > 2 * 1024 * 1024) {
//         showAlertMessage('Logo size should be less than 2MB', 'error');
//         return;
//       }
      
//       if (!file.type.match('image.*')) {
//         showAlertMessage('Please upload an image file', 'error');
//         return;
//       }
      
//       setLogo(file);
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setLogoPreview(reader.result);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleRemoveLogo = () => {
//     setLogo(null);
//     setLogoPreview(null);
//   };

//   const showAlertMessage = (message, type = 'success') => {
//     setAlertMessage(message);
//     setAlertType(type);
//     setShowAlert(true);
//     setTimeout(() => {
//       setShowAlert(false);
//     }, 3000);
//   };

//   const handleSave = () => {
//     // Validate required fields
//     if (!formData.schoolName) {
//       showAlertMessage('School name is required', 'error');
//       return;
//     }
    
//     if (!formData.principalName) {
//       showAlertMessage('Principal name is required', 'error');
//       return;
//     }
    
//     // Here you would typically save to API
//     console.log('Saving school profile:', { ...formData, logo });
//     showAlertMessage('School profile saved successfully!', 'success');
//   };

//   const handleCancel = () => {
//     // Reset to original values or navigate away
//     showAlertMessage('Changes discarded', 'info');
//   };

//   return (
//     <div className="profile-container">
//       {/* Page Header */}
//       <div className="profile-header">
//         <h1 className="profile-title">
//           <Building2 size={28} style={{ display: 'inline', marginRight: '12px' }} />
//           School Profile
//         </h1>
//         <p className="profile-subtitle">
//           Manage institution details displayed on reports, transcripts, and certificates
//         </p>
//         <hr style={{ margin: '1rem 0', borderColor: 'var(--border)' }} />
//       </div>

//       {/* Alert Messages */}
//       {showAlert && (
//         <div className={`alert-${alertType}`}>
//           <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//             {alertType === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
//             {alertMessage}
//           </span>
//           <span className="close-alert" onClick={() => setShowAlert(false)}>
//             <X size={18} />
//           </span>
//         </div>
//       )}

//       <div className="profile-two-columns">
//         {/* Left Column */}
//         <div>
//           {/* Logo Upload Section */}
//           <div className="card">
//             <div className="form-section-title">
//               <Upload size={18} />
//               School Logo
//             </div>
//             <div className="logo-section">
//               <div className="logo-preview">
//                 {logoPreview ? (
//                   <img src={logoPreview} alt="School Logo" />
//                 ) : (
//                   <div className="logo-placeholder">
//                     <School size={48} />
//                     <span style={{ fontSize: '0.75rem' }}>No logo uploaded</span>
//                   </div>
//                 )}
//               </div>
//               <div className="logo-actions">
//                 <label className="button" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
//                   <Upload size={16} />
//                   Upload Logo
//                   <input
//                     type="file"
//                     className="file-input"
//                     accept="image/*"
//                     onChange={handleLogoUpload}
//                   />
//                 </label>
//                 {logoPreview && (
//                   <button className="button button-danger" onClick={handleRemoveLogo} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
//                     <Trash2 size={16} />
//                     Remove
//                   </button>
//                 )}
//               </div>
//               <small style={{ color: 'var(--secondary)', fontSize: '0.75rem' }}>
//                 Recommended: Square image, minimum 200x200px, max 2MB
//               </small>
//             </div>
//           </div>

//           {/* Statistics Section */}
//           <div className="card">
//             <div className="form-section-title">
//               <Users size={18} />
//               School Statistics (Auto-calculated)
//             </div>
//             <div className="stats-grid">
//               <div className="stat-card">
//                 <div className="stat-value">{statistics.totalClasses}</div>
//                 <div className="stat-label">Total Classes</div>
//               </div>
//               <div className="stat-card">
//                 <div className="stat-value">{statistics.totalSections}</div>
//                 <div className="stat-label">Total Sections</div>
//               </div>
//               <div className="stat-card">
//                 <div className="stat-value">{statistics.totalStudents}</div>
//                 <div className="stat-label">Total Students</div>
//               </div>
//               <div className="stat-card">
//                 <div className="stat-value">{statistics.totalStaff}</div>
//                 <div className="stat-label">Total Staff</div>
//               </div>
//             </div>
//           </div>

        
//         </div>

//         {/* Right Column - Forms */}
//         <div>
//           <div className="card">
//             {/* Basic Information */}
//             <div className="form-section">
//               <div className="form-section-title">
//                 <School size={18} />
//                 Basic Information
//               </div>
//               <div className="form-grid">
//                 <div className="form-group full-width">
//                   <label className="form-label">
//                     School Name <span className="required">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     name="schoolName"
//                     className="form-input"
//                     value={formData.schoolName}
//                     onChange={handleInputChange}
//                     placeholder="Enter school name"
//                   />
//                 </div>
//                 <div className="form-group full-width">
//                   <label className="form-label">Motto / Slogan</label>
//                   <input
//                     type="text"
//                     name="motto"
//                     className="form-input"
//                     value={formData.motto}
//                     onChange={handleInputChange}
//                     placeholder="Enter school motto"
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Address Information */}
//             <div className="form-section">
//               <div className="form-section-title">
//                 <MapPin size={18} />
//                 Address
//               </div>
//               <div className="form-grid">
//                 <div className="form-group full-width">
//                   <label className="form-label">Street Address</label>
//                   <input
//                     type="text"
//                     name="street"
//                     className="form-input"
//                     value={formData.street}
//                     onChange={handleInputChange}
//                   />
//                 </div>
//                 <div className="form-group">
//                   <label className="form-label">City</label>
//                   <input
//                     type="text"
//                     name="city"
//                     className="form-input"
//                     value={formData.city}
//                     onChange={handleInputChange}
//                   />
//                 </div>
//                 <div className="form-group">
//                   <label className="form-label">State</label>
//                   <input
//                     type="text"
//                     name="state"
//                     className="form-input"
//                     value={formData.state}
//                     onChange={handleInputChange}
//                   />
//                 </div>
//                 <div className="form-group">
//                   <label className="form-label">Country</label>
//                   <input
//                     type="text"
//                     name="country"
//                     className="form-input"
//                     value={formData.country}
//                     onChange={handleInputChange}
//                   />
//                 </div>
//                 <div className="form-group">
//                   <label className="form-label">Postal Code</label>
//                   <input
//                     type="text"
//                     name="postalCode"
//                     className="form-input"
//                     value={formData.postalCode}
//                     onChange={handleInputChange}
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Contact Information */}
//             <div className="form-section">
//               <div className="form-section-title">
//                 <Phone size={18} />
//                 Contact Information
//               </div>
//               <div className="form-grid">
//                 <div className="form-group">
//                   <label className="form-label">Phone Number</label>
//                   <input
//                     type="tel"
//                     name="phone"
//                     className="form-input"
//                     value={formData.phone}
//                     onChange={handleInputChange}
//                   />
//                 </div>
//                 <div className="form-group">
//                   <label className="form-label">Email Address</label>
//                   <input
//                     type="email"
//                     name="email"
//                     className="form-input"
//                     value={formData.email}
//                     onChange={handleInputChange}
//                   />
//                 </div>
//                 <div className="form-group full-width">
//                   <label className="form-label">Website</label>
//                   <input
//                     type="url"
//                     name="website"
//                     className="form-input"
//                     value={formData.website}
//                     onChange={handleInputChange}
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Leadership */}
//             <div className="form-section">
//               <div className="form-section-title">
//                 <User size={18} />
//                 School Leadership
//               </div>
//               <div className="form-grid">
//                 <div className="form-group">
//                   <label className="form-label">
//                     Principal Name <span className="required">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     name="principalName"
//                     className="form-input"
//                     value={formData.principalName}
//                     onChange={handleInputChange}
//                   />
//                 </div>
//                 <div className="form-group">
//                   <label className="form-label">Principal Email</label>
//                   <input
//                     type="email"
//                     name="principalEmail"
//                     className="form-input"
//                     value={formData.principalEmail}
//                     onChange={handleInputChange}
//                   />
//                 </div>
//                 <div className="form-group">
//                   <label className="form-label">Vice Principal Name</label>
//                   <input
//                     type="text"
//                     name="vicePrincipalName"
//                     className="form-input"
//                     value={formData.vicePrincipalName}
//                     onChange={handleInputChange}
//                   />
//                 </div>
//                 <div className="form-group">
//                   <label className="form-label">Vice Principal Email</label>
//                   <input
//                     type="email"
//                     name="vicePrincipalEmail"
//                     className="form-input"
//                     value={formData.vicePrincipalEmail}
//                     onChange={handleInputChange}
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Additional Information */}
//             <div className="form-section">
//               <div className="form-section-title">
//                 <Clock size={18} />
//                 Additional Information
//               </div>
//               <div className="form-grid">
//                 <div className="form-group">
//                   <label className="form-label">Established Year</label>
//                   <input
//                     type="number"
//                     name="establishedYear"
//                     className="form-input"
//                     value={formData.establishedYear}
//                     onChange={handleInputChange}
//                     placeholder="YYYY"
//                     min="1800"
//                     max="2024"
//                   />
//                 </div>
//                 <div className="form-group">
//                   <label className="form-label">School Type</label>
//                   <select
//                     name="schoolType"
//                     className="form-select"
//                     value={formData.schoolType}
//                     onChange={handleInputChange}
//                   >
//                     {schoolTypes.map(type => (
//                       <option key={type} value={type}>{type}</option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
//             </div>

//             {/* Form Actions */}
//             <div className="form-actions">
//               <button className="button cancel-btn" onClick={handleCancel}>
//                 <X size={16} style={{ display: 'inline', marginRight: '6px' }} />
//                 Cancel
//               </button>
//               <button className="button save-btn" onClick={handleSave}>
//                 <Save size={16} style={{ display: 'inline', marginRight: '6px' }} />
//                 Save Changes
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default SchoolProfile;











// SchoolProfile.jsx

import { useState, useEffect } from 'react';
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
  Clock,
  RefreshCw,
  Loader
} from 'lucide-react';
import '../../../styles/school-profile.css';

// API Service
const API_BASE_URL = 'http://localhost:8000/api/school-profile';

const schoolProfileService = {
  async getProfile() {
    const response = await fetch(`${API_BASE_URL}/`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async updateProfile(profileData) {
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getStatistics() {
    const response = await fetch(`${API_BASE_URL}/statistics`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async uploadLogo(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/upload-logo`, {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data.logo_url;
  },

  async removeLogo() {
    const response = await fetch(`${API_BASE_URL}/logo`, {
      method: 'DELETE'
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return true;
  },

  async refreshStatistics() {
    const response = await fetch(`${API_BASE_URL}/refresh-statistics`, {
      method: 'POST'
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async verifyLicense(licenseKey) {
    const response = await fetch(`${API_BASE_URL}/verify-license`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(licenseKey)
    });
    const data = await response.json();
    return data;
  }
};

function SchoolProfile() {
  const [formData, setFormData] = useState({
    schoolName: '',
    motto: '',
    street: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    phone: '',
    email: '',
    website: '',
    principalName: '',
    principalEmail: '',
    vicePrincipalName: '',
    vicePrincipalEmail: '',
    establishedYear: '',
    schoolType: 'private',
    licenseKey: '',
    licenseType: 'STANDARD',
    licensedDevices: '1',
    validUntil: ''
  });

  const [statistics, setStatistics] = useState({
    totalClasses: 0,
    totalSections: 0,
    totalStudents: 0,
    totalStaff: 0
  });
  
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshingStats, setRefreshingStats] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [licenseVerified, setLicenseVerified] = useState(false);
  const [verifyingLicense, setVerifyingLicense] = useState(false);

  const schoolTypes = [
    { value: 'public', label: 'Public' },
    { value: 'private', label: 'Private' },
    { value: 'charter', label: 'Charter' },
    { value: 'other', label: 'Other' }
  ];

  const licenseTypes = [
    { value: 'STANDARD', label: 'Standard' },
    { value: 'PREMIUM', label: 'Premium' },
    { value: 'ENTERPRISE', label: 'Enterprise' }
  ];

  // Load data on component mount
  useEffect(() => {
    loadSchoolData();
  }, []);

  const loadSchoolData = async () => {
    try {
      setLoading(true);
      const [profile, stats] = await Promise.all([
        schoolProfileService.getProfile(),
        schoolProfileService.getStatistics()
      ]);
      
      // Map API response to form data
      setFormData({
        schoolName: profile.school_name || '',
        motto: profile.motto || '',
        street: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        country: profile.country || '',
        postalCode: profile.postal_code || '',
        phone: profile.phone || '',
        email: profile.email || '',
        website: profile.website || '',
        principalName: profile.principal_name || '',
        principalEmail: profile.principal_email || '',
        vicePrincipalName: profile.vice_principal_name || '',
        vicePrincipalEmail: profile.vice_principal_email || '',
        establishedYear: profile.established_year || '',
        schoolType: profile.school_type || 'private',
        licenseKey: '',
        licenseType: profile.license_type || 'STANDARD',
        licensedDevices: profile.licensed_devices?.toString() || '1',
        validUntil: profile.license_valid_until || ''
      });
      
      // Set logo preview if exists
      if (profile.logo_url) {
        // Construct full URL (adjust based on your setup)
        const logoUrl = profile.logo_url.startsWith('http') 
          ? profile.logo_url 
          : `http://localhost:8000${profile.logo_url}`;
        setLogoPreview(logoUrl);
      }
      
      // Set statistics
      setStatistics({
        totalClasses: stats.total_classes || 0,
        totalSections: stats.total_sections || 0,
        totalStudents: stats.total_students || 0,
        totalStaff: stats.total_staff || 0
      });
      
    } catch (error) {
      showAlertMessage('Failed to load school data: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoUpload = async (e) => {
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
      
      try {
        setLoading(true);
        const logoUrl = await schoolProfileService.uploadLogo(file);
        const fullLogoUrl = logoUrl.startsWith('http') ? logoUrl : `http://localhost:8000${logoUrl}`;
        setLogoPreview(fullLogoUrl);
        showAlertMessage('Logo uploaded successfully!', 'success');
      } catch (error) {
        showAlertMessage('Failed to upload logo: ' + error.message, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRemoveLogo = async () => {
    try {
      setLoading(true);
      await schoolProfileService.removeLogo();
      setLogoPreview(null);
      showAlertMessage('Logo removed successfully!', 'success');
    } catch (error) {
      showAlertMessage('Failed to remove logo: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyLicense = async () => {
    if (!formData.licenseKey) {
      showAlertMessage('Please enter a license key', 'error');
      return;
    }
    
    try {
      setVerifyingLicense(true);
      const result = await schoolProfileService.verifyLicense(formData.licenseKey);
      
      if (result.success && result.data.is_valid && !result.data.is_expired) {
        setLicenseVerified(true);
        showAlertMessage('License key verified successfully!', 'success');
        // Auto-fill license details from verification
        if (result.data.license_type) {
          setFormData(prev => ({
            ...prev,
            licenseType: result.data.license_type,
            licensedDevices: result.data.licensed_devices?.toString() || prev.licensedDevices,
            validUntil: result.data.valid_until || prev.validUntil
          }));
        }
      } else if (result.data.is_expired) {
        showAlertMessage('License key has expired', 'error');
        setLicenseVerified(false);
      } else {
        showAlertMessage('Invalid license key', 'error');
        setLicenseVerified(false);
      }
    } catch (error) {
      showAlertMessage('Failed to verify license: ' + error.message, 'error');
      setLicenseVerified(false);
    } finally {
      setVerifyingLicense(false);
    }
  };

  const handleRefreshStatistics = async () => {
    try {
      setRefreshingStats(true);
      const freshStats = await schoolProfileService.refreshStatistics();
      setStatistics({
        totalClasses: freshStats.total_classes || 0,
        totalSections: freshStats.total_sections || 0,
        totalStudents: freshStats.total_students || 0,
        totalStaff: freshStats.total_staff || 0
      });
      showAlertMessage('Statistics refreshed successfully!', 'success');
    } catch (error) {
      showAlertMessage('Failed to refresh statistics: ' + error.message, 'error');
    } finally {
      setRefreshingStats(false);
    }
  };

  const handleSave = async () => {
    // Validate required fields
    if (!formData.schoolName) {
      showAlertMessage('School name is required', 'error');
      return;
    }
    
    if (!formData.principalName) {
      showAlertMessage('Principal name is required', 'error');
      return;
    }
    
    try {
      setSaving(true);
      
      // Prepare data for API
      const updateData = {
        school_name: formData.schoolName,
        motto: formData.motto,
        address: formData.street,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        postal_code: formData.postalCode,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        principal_name: formData.principalName,
        principal_email: formData.principalEmail,
        vice_principal_name: formData.vicePrincipalName,
        vice_principal_email: formData.vicePrincipalEmail,
        established_year: formData.establishedYear ? parseInt(formData.establishedYear) : null,
        school_type: formData.schoolType,
        license_type: formData.licenseType,
        licensed_devices: formData.licensedDevices ? parseInt(formData.licensedDevices) : 1,
        license_valid_until: formData.validUntil || null
      };
      
      // Only include license key if provided and verified
      if (formData.licenseKey && licenseVerified) {
        updateData.license_key = formData.licenseKey;
      }
      
      await schoolProfileService.updateProfile(updateData);
      
      // Refresh statistics after save
      const freshStats = await schoolProfileService.refreshStatistics();
      setStatistics({
        totalClasses: freshStats.total_classes || 0,
        totalSections: freshStats.total_sections || 0,
        totalStudents: freshStats.total_students || 0,
        totalStaff: freshStats.total_staff || 0
      });
      
      showAlertMessage('School profile saved successfully!', 'success');
      
      // Reset license verification after save
      setLicenseVerified(false);
      setFormData(prev => ({ ...prev, licenseKey: '' }));
      
    } catch (error) {
      showAlertMessage('Failed to save: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    loadSchoolData(); // Reload original data
    showAlertMessage('Changes discarded', 'info');
  };

  const showAlertMessage = (message, type = 'success') => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 3000);
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-container">
          <Loader size={48} className="spinner" />
          <p>Loading school profile...</p>
        </div>
      </div>
    );
  }

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
            {alertType === 'success' ? <CheckCircle size={18} /> : 
             alertType === 'error' ? <AlertCircle size={18} /> : 
             <AlertCircle size={18} />}
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
                <label className="button button-primary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Upload size={16} />
                  Upload Logo
                  <input
                    type="file"
                    className="file-input"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={loading}
                  />
                </label>
                {logoPreview && (
                  <button 
                    className="button button-danger" 
                    onClick={handleRemoveLogo}
                    disabled={loading}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                  >
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
            <button 
              className="button button-secondary" 
              onClick={handleRefreshStatistics}
              disabled={refreshingStats}
              style={{ width: '100%', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              {refreshingStats ? <Loader size={16} className="spinner" /> : <RefreshCw size={16} />}
              {refreshingStats ? 'Refreshing...' : 'Refresh Statistics'}
            </button>
          </div>

          {/* License Information */}
          <div className="card">
            <div className="form-section-title">
              <Key size={18} />
              License Information
            </div>
            <div className="form-group">
              <label className="form-label">License Key</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  name="licenseKey"
                  className="form-input"
                  value={formData.licenseKey}
                  onChange={handleInputChange}
                  placeholder="Enter license key"
                  style={{ flex: 1 }}
                />
                <button 
                  className="button button-secondary"
                  onClick={handleVerifyLicense}
                  disabled={verifyingLicense || !formData.licenseKey}
                >
                  {verifyingLicense ? <Loader size={16} className="spinner" /> : 'Verify'}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">License Type</label>
              <select
                name="licenseType"
                className="form-select"
                value={formData.licenseType}
                onChange={handleInputChange}
              >
                {licenseTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Licensed Devices</label>
              <input
                type="number"
                name="licensedDevices"
                className="form-input"
                value={formData.licensedDevices}
                onChange={handleInputChange}
                min="1"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Valid Until</label>
              <input
                type="date"
                name="validUntil"
                className="form-input"
                value={formData.validUntil}
                onChange={handleInputChange}
              />
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
                    placeholder="Enter street address"
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
                    placeholder="City"
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
                    placeholder="State"
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
                    placeholder="Country"
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
                    placeholder="Postal code"
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
                    placeholder="Phone number"
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
                    placeholder="Email address"
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
                    placeholder="Website URL"
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
                    placeholder="Principal name"
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
                    placeholder="Principal email"
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
                    placeholder="Vice principal name"
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
                    placeholder="Vice principal email"
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
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button 
                className="button cancel-btn" 
                onClick={handleCancel}
                disabled={saving}
              >
                <X size={16} style={{ display: 'inline', marginRight: '6px' }} />
                Cancel
              </button>
              <button 
                className="button save-btn" 
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <Loader size={16} style={{ display: 'inline', marginRight: '6px' }} className="spinner" />
                ) : (
                  <Save size={16} style={{ display: 'inline', marginRight: '6px' }} />
                )}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add spinner animation CSS if not already present */}
      <style jsx>{`
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: 1rem;
        }
        
        .spinner {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .button-primary {
          background: var(--primary);
          color: white;
          border: none;
        }
        
        .button-primary:hover:not(:disabled) {
          background: var(--primary-dark);
        }
        
        .button-secondary {
          background: var(--secondary-bg);
          color: var(--text);
          border: 1px solid var(--border);
        }
        
        .button-secondary:hover:not(:disabled) {
          background: var(--hover-bg);
        }
        
        .button-danger {
          background: var(--danger);
          color: white;
          border: none;
        }
        
        .button-danger:hover:not(:disabled) {
          background: var(--danger-dark);
        }
        
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .file-input {
          display: none;
        }
        
        .required {
          color: var(--danger);
        }
      `}</style>
    </div>
  );
}

export default SchoolProfile;