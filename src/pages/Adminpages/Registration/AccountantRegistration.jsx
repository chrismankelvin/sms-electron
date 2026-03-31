// src/components/Registration/AccountantRegistration.jsx
import React, { useState } from 'react';
import { Save, User, Mail, Phone, MapPin, Calendar, Briefcase, Users, DollarSign, Calculator, Receipt } from 'lucide-react';
import '../../../styles/RegistrationForms.css';
import { registerStaff } from '../../../services/api.service';

const AccountantRegistration = ({ onSuccess, onError, role = 'accountant' }) => {
  const [formData, setFormData] = useState({
    // Personal Information
    first_name: '',
    surname: '',
    other_names: '',
    date_of_birth: '',
    place_of_birth: '',
    nationality: 'Ghanaian',
    gender: '',
    
    // Contact Information
    address: '',
    gps_number: '',
    place_of_resident: '',
    email_address: '',
    telephone_number_one: '',
    telephone_number_two: '',
    
    // Identification
    national_identification_number: '',
    
    // Professional Information
    current_status: 'active',
    role: 'accountant',
    department: 'Finance',
    position: 'Accountant',
    qualification: '',
    professional_certification: '',
    years_of_experience: '',
    specialization: '',
    staff_id: '',
    initials: '',
    
    // Marital Information
    marital_status: '',
    spouse_name: '',
    spouse_phone: '',
    
    // Family Information
    fathers_name: '',
    fathers_contact: '',
    mothers_name: '',
    mothers_contact: '',
    next_of_kin_name: '',
    next_of_kin_contact: '',
    
    // Emergency
    emergency_contact_one: '',
    emergency_contact_two: '',
    emergency_contact_one_name: '',
    emergency_contact_two_name: '',
    
    // Employment Information
    employment_date: '',
    employment_type: 'full-time',
    salary_scale: '',
    bank_name: '',
    bank_account_number: '',
    tax_identification_number: '',
    
    // Accounting Specific Fields
    accounting_software: '',
    areas_of_expertise: '',
    responsibilities: '',
    reporting_to: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.surname.trim()) newErrors.surname = 'Surname is required';
    if (!formData.email_address.trim()) newErrors.email_address = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email_address)) newErrors.email_address = 'Email is invalid';
    if (!formData.telephone_number_one.trim()) newErrors.telephone_number_one = 'Primary contact is required';
    if (!formData.emergency_contact_one.trim()) newErrors.emergency_contact_one = 'Emergency contact is required';
    if (!formData.position.trim()) newErrors.position = 'Position is required';
    if (!formData.qualification.trim()) newErrors.qualification = 'Qualification is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateStaffId = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ACC/${year}/${random}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const staffId = generateStaffId();
      const initials = `${formData.first_name.charAt(0)}${formData.surname.charAt(0)}`.toUpperCase();
      
      const registrationData = {
        // Personal Information
        first_name: formData.first_name,
        surname: formData.surname,
        other_names: formData.other_names,
        date_of_birth: formData.date_of_birth,
        place_of_birth: formData.place_of_birth,
        nationality: formData.nationality,
        gender: formData.gender,
        
        // Contact Information
        address: formData.address,
        gps_number: formData.gps_number,
        place_of_resident: formData.place_of_resident,
        email_address: formData.email_address,
        telephone_number_one: formData.telephone_number_one,
        telephone_number_two: formData.telephone_number_two,
        
        // Identification
        national_identification_number: formData.national_identification_number,
        
        // Professional Information
        current_status: formData.current_status,
        role: role,
        initials: initials,
        staff_number: staffId,
        department: formData.department,
        position: formData.position,
        qualification: formData.qualification,
        professional_certification: formData.professional_certification,
        years_of_experience: formData.years_of_experience,
        specialization: formData.specialization,
        
        // Marital Information
        marital_status: formData.marital_status,
        spouse_name: formData.spouse_name,
        spouse_phone: formData.spouse_phone,
        
        // Family Information
        fathers_name: formData.fathers_name,
        fathers_contact: formData.fathers_contact,
        mothers_name: formData.mothers_name,
        mothers_contact: formData.mothers_contact,
        next_of_kin_name: formData.next_of_kin_name,
        next_of_kin_contact: formData.next_of_kin_contact,
        
        // Emergency
        emergency_contact_one: formData.emergency_contact_one,
        emergency_contact_two: formData.emergency_contact_two,
        emergency_contact_one_name: formData.emergency_contact_one_name,
        emergency_contact_two_name: formData.emergency_contact_two_name,
        
        // Employment Information
        employment_date: formData.employment_date || new Date().toISOString().split('T')[0],
        employment_type: formData.employment_type,
        salary_scale: formData.salary_scale,
        bank_name: formData.bank_name,
        bank_account_number: formData.bank_account_number,
        tax_identification_number: formData.tax_identification_number,
        
        // Accounting Specific
        accounting_software: formData.accounting_software,
        areas_of_expertise: formData.areas_of_expertise,
        responsibilities: formData.responsibilities,
        reporting_to: formData.reporting_to,
        
        // Employment
        hired_at: new Date().toISOString().split('T')[0]
      };
      
      const result = await registerStaff(registrationData);
      
      if (result.success) {
        onSuccess(result);
        
        alert(`Accountant registered successfully!\n\nStaff Number: ${result.staff_number}\nUsername: ${result.username}\nDefault Password: ${result.default_password}\n\nPlease provide these credentials to the accountant.`);
        
        // Reset form
        setFormData({
          first_name: '', surname: '', other_names: '', date_of_birth: '', place_of_birth: '',
          nationality: 'Ghanaian', gender: '', address: '', gps_number: '', place_of_resident: '',
          email_address: '', telephone_number_one: '', telephone_number_two: '',
          national_identification_number: '', current_status: 'active', role: 'accountant',
          department: 'Finance', position: '', qualification: '', professional_certification: '',
          years_of_experience: '', specialization: '', staff_id: '', initials: '',
          marital_status: '', spouse_name: '', spouse_phone: '',
          fathers_name: '', fathers_contact: '', mothers_name: '', mothers_contact: '',
          next_of_kin_name: '', next_of_kin_contact: '',
          emergency_contact_one: '', emergency_contact_two: '',
          emergency_contact_one_name: '', emergency_contact_two_name: '',
          employment_date: '', employment_type: 'full-time', salary_scale: '',
          bank_name: '', bank_account_number: '', tax_identification_number: '',
          accounting_software: '', areas_of_expertise: '', responsibilities: '', reporting_to: ''
        });
      } else {
        onError(new Error(result.message || 'Registration failed'));
        alert(`Registration failed: ${result.message}`);
      }
      
    } catch (error) {
      console.error('Accountant registration error:', error);
      onError(error);
      alert(`Registration error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="registration-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <h2>
          <User size={20} />
          Personal Information
        </h2>
        
        <div className="form-grid">
          <div className="form-group">
            <label>First Name *</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              placeholder="Enter first name"
              className={errors.first_name ? 'error' : ''}
            />
            {errors.first_name && <span className="error-message">{errors.first_name}</span>}
          </div>
          
          <div className="form-group">
            <label>Surname *</label>
            <input
              type="text"
              name="surname"
              value={formData.surname}
              onChange={handleChange}
              placeholder="Enter surname"
              className={errors.surname ? 'error' : ''}
            />
            {errors.surname && <span className="error-message">{errors.surname}</span>}
          </div>
          
          <div className="form-group">
            <label>Other Names</label>
            <input
              type="text"
              name="other_names"
              value={formData.other_names}
              onChange={handleChange}
              placeholder="Enter other names"
            />
          </div>
          
          <div className="form-group">
            <label>Gender *</label>
            <select name="gender" value={formData.gender} onChange={handleChange} required>
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Date of Birth</label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label>Place of Birth</label>
            <input
              type="text"
              name="place_of_birth"
              value={formData.place_of_birth}
              onChange={handleChange}
              placeholder="Enter place of birth"
            />
          </div>
          
          <div className="form-group">
            <label>Nationality</label>
            <select name="nationality" value={formData.nationality} onChange={handleChange}>
              <option value="Ghanaian">Ghanaian</option>
              <option value="Nigerian">Nigerian</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h2>
          <Mail size={20} />
          Contact Information
        </h2>
        
        <div className="form-grid">
          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              name="email_address"
              value={formData.email_address}
              onChange={handleChange}
              placeholder="Enter email address"
              className={errors.email_address ? 'error' : ''}
            />
            {errors.email_address && <span className="error-message">{errors.email_address}</span>}
          </div>
          
          <div className="form-group">
            <label>Primary Contact *</label>
            <input
              type="tel"
              name="telephone_number_one"
              value={formData.telephone_number_one}
              onChange={handleChange}
              placeholder="Enter primary contact number"
              className={errors.telephone_number_one ? 'error' : ''}
            />
            {errors.telephone_number_one && <span className="error-message">{errors.telephone_number_one}</span>}
          </div>
          
          <div className="form-group">
            <label>Secondary Contact</label>
            <input
              type="tel"
              name="telephone_number_two"
              value={formData.telephone_number_two}
              onChange={handleChange}
              placeholder="Enter secondary contact number"
            />
          </div>
          
          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter residential address"
            />
          </div>
          
          <div className="form-group">
            <label>GPS Number</label>
            <input
              type="text"
              name="gps_number"
              value={formData.gps_number}
              onChange={handleChange}
              placeholder="Enter GPS address"
            />
          </div>
          
          <div className="form-group">
            <label>Place of Resident</label>
            <input
              type="text"
              name="place_of_resident"
              value={formData.place_of_resident}
              onChange={handleChange}
              placeholder="Enter place of resident"
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h2>
          <Briefcase size={20} />
          Professional & Qualification Information
        </h2>
        
        <div className="form-grid">
          <div className="form-group">
            <label>National ID Number</label>
            <input
              type="text"
              name="national_identification_number"
              value={formData.national_identification_number}
              onChange={handleChange}
              placeholder="Enter national ID number"
            />
          </div>
          
          <div className="form-group">
            <label>Position *</label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
              placeholder="e.g., Senior Accountant, Accounts Clerk"
              className={errors.position ? 'error' : ''}
            />
            {errors.position && <span className="error-message">{errors.position}</span>}
          </div>
          
          <div className="form-group">
            <label>Qualification *</label>
            <input
              type="text"
              name="qualification"
              value={formData.qualification}
              onChange={handleChange}
              placeholder="e.g., BSc Accounting, ACCA, CIMA"
              className={errors.qualification ? 'error' : ''}
            />
            {errors.qualification && <span className="error-message">{errors.qualification}</span>}
          </div>
          
          <div className="form-group">
            <label>Professional Certification</label>
            <input
              type="text"
              name="professional_certification"
              value={formData.professional_certification}
              onChange={handleChange}
              placeholder="e.g., ICAG, ACCA, CPA"
            />
          </div>
          
          <div className="form-group">
            <label>Years of Experience</label>
            <input
              type="number"
              name="years_of_experience"
              value={formData.years_of_experience}
              onChange={handleChange}
              placeholder="Number of years"
              min="0"
            />
          </div>
          
          <div className="form-group">
            <label>Specialization</label>
            <input
              type="text"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              placeholder="e.g., Taxation, Auditing, Financial Reporting"
            />
          </div>
          
          <div className="form-group">
            <label>Department</label>
            <select name="department" value={formData.department} onChange={handleChange}>
              <option value="Finance">Finance</option>
              <option value="Accounts">Accounts</option>
              <option value="Audit">Audit</option>
              <option value="Budget">Budget</option>
              <option value="Revenue">Revenue</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Current Status</label>
            <select name="current_status" value={formData.current_status} onChange={handleChange}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on-leave">On Leave</option>
            </select>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h2>
          <DollarSign size={20} />
          Employment & Financial Information
        </h2>
        
        <div className="form-grid">
          <div className="form-group">
            <label>Employment Type</label>
            <select name="employment_type" value={formData.employment_type} onChange={handleChange}>
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="contract">Contract</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Employment Date</label>
            <input
              type="date"
              name="employment_date"
              value={formData.employment_date}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label>Salary Scale</label>
            <input
              type="text"
              name="salary_scale"
              value={formData.salary_scale}
              onChange={handleChange}
              placeholder="Enter salary scale"
            />
          </div>
          
          <div className="form-group">
            <label>Bank Name</label>
            <input
              type="text"
              name="bank_name"
              value={formData.bank_name}
              onChange={handleChange}
              placeholder="Enter bank name"
            />
          </div>
          
          <div className="form-group">
            <label>Bank Account Number</label>
            <input
              type="text"
              name="bank_account_number"
              value={formData.bank_account_number}
              onChange={handleChange}
              placeholder="Enter bank account number"
            />
          </div>
          
          <div className="form-group">
            <label>Tax Identification Number (TIN)</label>
            <input
              type="text"
              name="tax_identification_number"
              value={formData.tax_identification_number}
              onChange={handleChange}
              placeholder="Enter TIN"
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h2>
          <Calculator size={20} />
          Accounting Specific Information
        </h2>
        
        <div className="form-grid">
          <div className="form-group">
            <label>Accounting Software Experience</label>
            <input
              type="text"
              name="accounting_software"
              value={formData.accounting_software}
              onChange={handleChange}
              placeholder="e.g., QuickBooks, Sage, Tally"
            />
          </div>
          
          <div className="form-group">
            <label>Areas of Expertise</label>
            <textarea
              name="areas_of_expertise"
              value={formData.areas_of_expertise}
              onChange={handleChange}
              placeholder="List areas of expertise (e.g., Accounts Payable, Payroll, Financial Analysis)"
              rows="3"
            />
          </div>
          
          <div className="form-group">
            <label>Key Responsibilities</label>
            <textarea
              name="responsibilities"
              value={formData.responsibilities}
              onChange={handleChange}
              placeholder="List key responsibilities"
              rows="3"
            />
          </div>
          
          <div className="form-group">
            <label>Reports To</label>
            <input
              type="text"
              name="reporting_to"
              value={formData.reporting_to}
              onChange={handleChange}
              placeholder="e.g., Finance Manager, Director"
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h2>
          <Users size={20} />
          Marital & Family Information
        </h2>
        
        <div className="form-grid">
          <div className="form-group">
            <label>Marital Status</label>
            <select name="marital_status" value={formData.marital_status} onChange={handleChange}>
              <option value="">Select Marital Status</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="divorced">Divorced</option>
              <option value="widowed">Widowed</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Spouse Name</label>
            <input
              type="text"
              name="spouse_name"
              value={formData.spouse_name}
              onChange={handleChange}
              placeholder="Enter spouse name"
            />
          </div>
          
          <div className="form-group">
            <label>Spouse Contact</label>
            <input
              type="tel"
              name="spouse_phone"
              value={formData.spouse_phone}
              onChange={handleChange}
              placeholder="Enter spouse contact"
            />
          </div>
          
          <div className="form-group">
            <label>Father's Name</label>
            <input
              type="text"
              name="fathers_name"
              value={formData.fathers_name}
              onChange={handleChange}
              placeholder="Enter father's name"
            />
          </div>
          
          <div className="form-group">
            <label>Father's Contact</label>
            <input
              type="tel"
              name="fathers_contact"
              value={formData.fathers_contact}
              onChange={handleChange}
              placeholder="Enter father's contact"
            />
          </div>
          
          <div className="form-group">
            <label>Mother's Name</label>
            <input
              type="text"
              name="mothers_name"
              value={formData.mothers_name}
              onChange={handleChange}
              placeholder="Enter mother's name"
            />
          </div>
          
          <div className="form-group">
            <label>Mother's Contact</label>
            <input
              type="tel"
              name="mothers_contact"
              value={formData.mothers_contact}
              onChange={handleChange}
              placeholder="Enter mother's contact"
            />
          </div>
          
          <div className="form-group">
            <label>Next of Kin Name</label>
            <input
              type="text"
              name="next_of_kin_name"
              value={formData.next_of_kin_name}
              onChange={handleChange}
              placeholder="Enter next of kin name"
            />
          </div>
          
          <div className="form-group">
            <label>Next of Kin Contact</label>
            <input
              type="tel"
              name="next_of_kin_contact"
              value={formData.next_of_kin_contact}
              onChange={handleChange}
              placeholder="Enter next of kin contact"
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h2>
          <Receipt size={20} />
          Emergency Contacts
        </h2>
        
        <div className="form-grid">
          <div className="form-group">
            <label>Emergency Contact Name 1 *</label>
            <input
              type="text"
              name="emergency_contact_one_name"
              value={formData.emergency_contact_one_name}
              onChange={handleChange}
              placeholder="Enter emergency contact name"
            />
          </div>
          
          <div className="form-group">
            <label>Emergency Contact Number 1 *</label>
            <input
              type="tel"
              name="emergency_contact_one"
              value={formData.emergency_contact_one}
              onChange={handleChange}
              placeholder="Enter emergency contact number"
              className={errors.emergency_contact_one ? 'error' : ''}
            />
            {errors.emergency_contact_one && <span className="error-message">{errors.emergency_contact_one}</span>}
          </div>
          
          <div className="form-group">
            <label>Emergency Contact Name 2</label>
            <input
              type="text"
              name="emergency_contact_two_name"
              value={formData.emergency_contact_two_name}
              onChange={handleChange}
              placeholder="Enter secondary emergency contact name"
            />
          </div>
          
          <div className="form-group">
            <label>Emergency Contact Number 2</label>
            <input
              type="tel"
              name="emergency_contact_two"
              value={formData.emergency_contact_two}
              onChange={handleChange}
              placeholder="Enter secondary emergency contact number"
            />
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={() => window.history.back()}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          <Save size={18} />
          {isSubmitting ? 'Registering...' : 'Register Accountant'}
        </button>
      </div>
    </form>
  );
};

export default AccountantRegistration;