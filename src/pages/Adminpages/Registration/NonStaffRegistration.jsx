// src/components/Registration/NonStaffRegistration.jsx
import React, { useState } from 'react';
import { Save, User, Mail, Phone, MapPin, Calendar, Briefcase, Users } from 'lucide-react';
import '../../../styles/RegistrationForms.css';
import { registerNonStaff } from '../../../services/api.service';


const NonStaffRegistration = ({ onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    // Personal Information
    first_name: '',
    surname: '',
    other_names: '',
    date_of_birth: '',
    place_of_birth: '',
    nationality: 'Ghanaian',
    
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
    roles: '',
    
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
    if (!formData.roles.trim()) newErrors.roles = 'Role is required';
    if (!formData.emergency_contact_one.trim()) newErrors.emergency_contact_one = 'Emergency contact is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateNonStaffId = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `NS/${year}/${random}`;
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
    
  //   if (!validateForm()) {
  //     return;
  //   }
    
  //   setIsSubmitting(true);
    
  //   try {
  //     const nonStaffId = generateNonStaffId();
      
  //     const registrationData = {
  //       ...formData,
  //       non_staff_id: nonStaffId,
  //       registration_date: new Date().toISOString(),
  //       role: 'Non-Teaching Staff'
  //     };
      
  //     await new Promise(resolve => setTimeout(resolve, 1500));
      
  //     console.log('Non-Teaching Staff Registration Data:', registrationData);
  //     onSuccess({ id: nonStaffId, ...registrationData });
      
  //     // Reset form
  //     setFormData({
  //       first_name: '', surname: '', other_names: '', date_of_birth: '', place_of_birth: '',
  //       nationality: 'Ghanaian', address: '', gps_number: '', place_of_resident: '',
  //       email_address: '', telephone_number_one: '', telephone_number_two: '',
  //       national_identification_number: '', current_status: 'active', roles: '',
  //       fathers_name: '', fathers_contact: '', mothers_name: '', mothers_contact: '',
  //       next_of_kin_name: '', next_of_kin_contact: '', emergency_contact_one: '', emergency_contact_two: ''
  //     });
      
  //   } catch (error) {
  //     onError(error);
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
        return;
    }
    
    setIsSubmitting(true);
    
    try {
        // Prepare the data in the format expected by the backend
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
            roles: formData.roles,
            department: formData.department,
            designation: formData.designation,
            hired_at: new Date().toISOString().split('T')[0], // Today's date
            
            // Family Information
            fathers_name: formData.fathers_name,
            fathers_contact: formData.fathers_contact,
            mothers_name: formData.mothers_name,
            mothers_contact: formData.mothers_contact,
            next_of_kin_name: formData.next_of_kin_name,
            next_of_kin_contact: formData.next_of_kin_contact,
            
            // Emergency
            emergency_contact_one: formData.emergency_contact_one,
            emergency_contact_two: formData.emergency_contact_two
        };
        
        // Call the actual registration API
        const result = await registerNonStaff(registrationData);
        
        if (result.success) {
            onSuccess(result);
            
            // Show success message with non-staff details
            alert(`Non-Teaching Staff registered successfully!\n\nStaff Number: ${result.non_staff_number}\nUsername: ${result.username}\nDefault Password: ${result.default_password}\n\nPlease provide these credentials to the staff member.`);
            
            // Reset form
            setFormData({
                first_name: '', surname: '', other_names: '', date_of_birth: '', place_of_birth: '',
                nationality: 'Ghanaian', address: '', gps_number: '', place_of_resident: '',
                email_address: '', telephone_number_one: '', telephone_number_two: '',
                national_identification_number: '', current_status: 'active', roles: '',
                fathers_name: '', fathers_contact: '', mothers_name: '', mothers_contact: '',
                next_of_kin_name: '', next_of_kin_contact: '', emergency_contact_one: '', emergency_contact_two: '',
                department: '', designation: ''
            });
        } else {
            onError(new Error(result.message || 'Registration failed'));
            alert(`Registration failed: ${result.message}`);
        }
        
    } catch (error) {
        console.error('Registration error:', error);
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
          Professional Information
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
            <label>Current Status</label>
            <select name="current_status" value={formData.current_status} onChange={handleChange}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on-leave">On Leave</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Role/Designation *</label>
            <input
              type="text"
              name="roles"
              value={formData.roles}
              onChange={handleChange}
              placeholder="Enter role or designation"
              className={errors.roles ? 'error' : ''}
            />
            {errors.roles && <span className="error-message">{errors.roles}</span>}
          </div>
        </div>
      </div>

      <div className="form-section">
        <h2>
          <Users size={20} />
          Family & Emergency Information
        </h2>
        
        <div className="form-grid">
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
          
          <div className="form-group">
            <label>Emergency Contact 1 *</label>
            <input
              type="tel"
              name="emergency_contact_one"
              value={formData.emergency_contact_one}
              onChange={handleChange}
              placeholder="Enter primary emergency contact"
              className={errors.emergency_contact_one ? 'error' : ''}
            />
            {errors.emergency_contact_one && <span className="error-message">{errors.emergency_contact_one}</span>}
          </div>
          
          <div className="form-group">
            <label>Emergency Contact 2</label>
            <input
              type="tel"
              name="emergency_contact_two"
              value={formData.emergency_contact_two}
              onChange={handleChange}
              placeholder="Enter secondary emergency contact"
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
          {isSubmitting ? 'Registering...' : 'Register Non-Teaching Staff'}
        </button>
      </div>
    </form>
  );
};

export default NonStaffRegistration;