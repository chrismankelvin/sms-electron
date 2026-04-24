// // src/components/Registration/TeacherRegistration.jsx
// import React, { useState } from 'react';
// import { Save, User, Mail, Phone, MapPin, Calendar, Briefcase, Users } from 'lucide-react';
// import '../../../styles/RegistrationForms.css';
// import {registerStaff} from '../../../services/api.service' ;

// const TeacherRegistration = ({ onSuccess, onError, role = 'teacher' }) => {
//   const [formData, setFormData] = useState({
//     // Personal Information
//     first_name: '',
//     surname: '',
//     other_names: '',
//     date_of_birth: '',
//     place_of_birth: '',
//     nationality: 'Ghanaian',
    
//     // Contact Information
//     address: '',
//     gps_number: '',
//     place_of_resident: '',
//     email_address: '',
//     telephone_number_one: '',
//     telephone_number_two: '',
    
//     // Identification
//     national_identification_number: '',
    
//     // Professional Information
//     current_status: 'active',
//     roles: role === 'teacher' ? 'teacher' : 'admin',
//         department: '',
//     marital_status: '',
//     spouse_name: '',
//     spouse_phone: '',
//     initials: '',
    
//     // Family Information
//     fathers_name: '',
//     fathers_contact: '',
//     mothers_name: '',
//     mothers_contact: '',
//     next_of_kin_name: '',
//     next_of_kin_contact: '',
    
//     // Emergency
//     emergency_contact_one: '',
//     emergency_contact_two: '',
//   });

//   const [errors, setErrors] = useState({});
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     if (errors[name]) {
//       setErrors(prev => ({ ...prev, [name]: '' }));
//     }
//   };

//   const validateForm = () => {
//     const newErrors = {};
    
//     if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
//     if (!formData.surname.trim()) newErrors.surname = 'Surname is required';
//     if (!formData.email_address.trim()) newErrors.email_address = 'Email is required';
//     else if (!/\S+@\S+\.\S+/.test(formData.email_address)) newErrors.email_address = 'Email is invalid';
//     if (!formData.telephone_number_one.trim()) newErrors.telephone_number_one = 'Primary contact is required';
//     if (!formData.emergency_contact_one.trim()) newErrors.emergency_contact_one = 'Emergency contact is required';
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const generateStaffId = () => {
//     const year = new Date().getFullYear();
//     const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
//     const prefix = role === 'teacher' ? 'TCH' : 'ADM';
//     return `${prefix}/${year}/${random}`;
//   };

//   // const handleSubmit = async (e) => {
//   //   e.preventDefault();
    
//   //   if (!validateForm()) {
//   //     return;
//   //   }
    
//   //   setIsSubmitting(true);
    
//   //   try {
//   //     const staffId = generateStaffId();
//   //     const initials = `${formData.first_name.charAt(0)}${formData.surname.charAt(0)}`.toUpperCase();
      
//   //     const registrationData = {
//   //       ...formData,
//   //       staff_id: staffId,
//   //       initials: initials,
//   //       registration_date: new Date().toISOString(),
//   //       role: role
//   //     };
      
//   //     await new Promise(resolve => setTimeout(resolve, 1500));
      
//   //     console.log(`${role} Registration Data:`, registrationData);
//   //     onSuccess({ id: staffId, ...registrationData });
      
//   //     // Reset form
//   //     setFormData({
//   //       first_name: '', surname: '', other_names: '', date_of_birth: '', place_of_birth: '',
//   //       nationality: 'Ghanaian', address: '', gps_number: '', place_of_resident: '',
//   //       email_address: '', telephone_number_one: '', telephone_number_two: '',
//   //       national_identification_number: '', current_status: 'active', roles: role,
//   //       initials: '', fathers_name: '', fathers_contact: '', mothers_name: '',
//   //       mothers_contact: '', next_of_kin_name: '', next_of_kin_contact: '',
//   //       emergency_contact_one: '', emergency_contact_two: ''
//   //     });
      
//   //   } catch (error) {
//   //     onError(error);
//   //   } finally {
//   //     setIsSubmitting(false);
//   //   }
//   // };

// const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!validateForm()) {
//         return;
//     }
    
//     setIsSubmitting(true);
    
//     try {
//         // Generate initials automatically
//         const initials = `${formData.first_name.charAt(0)}${formData.surname.charAt(0)}`.toUpperCase();
        
//         // Prepare the data in the format expected by the backend
//         const registrationData = {
//             // Personal Information
//             first_name: formData.first_name,
//             surname: formData.surname,
//             other_names: formData.other_names,
//             date_of_birth: formData.date_of_birth,
//             place_of_birth: formData.place_of_birth,
//             nationality: formData.nationality,
//             gender: formData.gender, // You might want to add this to the form
            
//             // Contact Information
//             address: formData.address,
//             gps_number: formData.gps_number,
//             place_of_resident: formData.place_of_resident,
//             email_address: formData.email_address,
//             telephone_number_one: formData.telephone_number_one,
//             telephone_number_two: formData.telephone_number_two,
            
//             // Identification
//             national_identification_number: formData.national_identification_number,
            
//             // Professional Information
//             current_status: formData.current_status,
//             role: role,
//             initials: initials,
//             department: formData.department, // You might want to add this to the form
            
//             // Family Information
//             fathers_name: formData.fathers_name,
//             fathers_contact: formData.fathers_contact,
//             mothers_name: formData.mothers_name,
//             mothers_contact: formData.mothers_contact,
//             next_of_kin_name: formData.next_of_kin_name,
//             next_of_kin_contact: formData.next_of_kin_contact,
            
//             // Marital Information (add these fields to your form if needed)
//             marital_status: formData.marital_status,
//             spouse_name: formData.spouse_name,
//             spouse_phone: formData.spouse_phone,
            
//             // Emergency
//             emergency_contact_one: formData.emergency_contact_one,
//             emergency_contact_two: formData.emergency_contact_two,
//             emergency_contact_one_name: formData.next_of_kin_name, // Using next of kin as emergency contact
            
//             // Employment
//             hired_at: new Date().toISOString().split('T')[0] // Today's date
//         };
        
//         // Call the actual registration API
//         const result = await registerStaff(registrationData);
        
//         if (result.success) {
//             onSuccess(result);
            
//             // Show success message with staff details
//             alert(`${result.role} registered successfully!\n\nStaff Number: ${result.staff_number}\nUsername: ${result.username}\nDefault Password: ${result.default_password}\n\nPlease provide these credentials to the staff member.`);
            
//             // Reset form
//             setFormData({
//                 first_name: '', surname: '', other_names: '', date_of_birth: '', place_of_birth: '',
//                 nationality: 'Ghanaian', address: '', gps_number: '', place_of_resident: '',
//                 email_address: '', telephone_number_one: '', telephone_number_two: '',
//                 national_identification_number: '', current_status: 'active', roles: role,
//                 initials: '', fathers_name: '', fathers_contact: '', mothers_name: '',
//                 mothers_contact: '', next_of_kin_name: '', next_of_kin_contact: '',
//                 emergency_contact_one: '', emergency_contact_two: '',
//                 marital_status: '', spouse_name: '', spouse_phone: '', department: ''
//             });
//         } else {
//             onError(new Error(result.message || 'Registration failed'));
//             alert(`Registration failed: ${result.message}`);
//         }
        
//     } catch (error) {
//         console.error('Registration error:', error);
//         onError(error);
//         alert(`Registration error: ${error.message}`);
//     } finally {
//         setIsSubmitting(false);
//     }
// };

//   return (
//     <form className="registration-form" onSubmit={handleSubmit}>
//       <div className="form-section">
//         <h2>
//           <User size={20} />
//           Personal Information
//         </h2>
        
//         <div className="form-grid">
//           <div className="form-group">
//             <label>First Name *</label>
//             <input
//               type="text"
//               name="first_name"
//               value={formData.first_name}
//               onChange={handleChange}
//               placeholder="Enter first name"
//               className={errors.first_name ? 'error' : ''}
//             />
//             {errors.first_name && <span className="error-message">{errors.first_name}</span>}
//           </div>
          
//           <div className="form-group">
//             <label>Surname *</label>
//             <input
//               type="text"
//               name="surname"
//               value={formData.surname}
//               onChange={handleChange}
//               placeholder="Enter surname"
//               className={errors.surname ? 'error' : ''}
//             />
//             {errors.surname && <span className="error-message">{errors.surname}</span>}
//           </div>
          
//           <div className="form-group">
//             <label>Other Names</label>
//             <input
//               type="text"
//               name="other_names"
//               value={formData.other_names}
//               onChange={handleChange}
//               placeholder="Enter other names"
//             />
//           </div>
          
//           <div className="form-group">
//             <label>Date of Birth</label>
//             <input
//               type="date"
//               name="date_of_birth"
//               value={formData.date_of_birth}
//               onChange={handleChange}
//             />
//           </div>
          
//           <div className="form-group">
//             <label>Place of Birth</label>
//             <input
//               type="text"
//               name="place_of_birth"
//               value={formData.place_of_birth}
//               onChange={handleChange}
//               placeholder="Enter place of birth"
//             />
//           </div>
          
//           <div className="form-group">
//             <label>Nationality</label>
//             <select name="nationality" value={formData.nationality} onChange={handleChange}>
//               <option value="Ghanaian">Ghanaian</option>
//               <option value="Other">Other</option>
//             </select>
//           </div>
//         </div>
//       </div>

//       <div className="form-section">
//         <h2>
//           <Mail size={20} />
//           Contact Information
//         </h2>
        
//         <div className="form-grid">
//           <div className="form-group">
//             <label>Email Address *</label>
//             <input
//               type="email"
//               name="email_address"
//               value={formData.email_address}
//               onChange={handleChange}
//               placeholder="Enter email address"
//               className={errors.email_address ? 'error' : ''}
//             />
//             {errors.email_address && <span className="error-message">{errors.email_address}</span>}
//           </div>
          
//           <div className="form-group">
//             <label>Primary Contact *</label>
//             <input
//               type="tel"
//               name="telephone_number_one"
//               value={formData.telephone_number_one}
//               onChange={handleChange}
//               placeholder="Enter primary contact number"
//               className={errors.telephone_number_one ? 'error' : ''}
//             />
//             {errors.telephone_number_one && <span className="error-message">{errors.telephone_number_one}</span>}
//           </div>
          
//           <div className="form-group">
//             <label>Secondary Contact</label>
//             <input
//               type="tel"
//               name="telephone_number_two"
//               value={formData.telephone_number_two}
//               onChange={handleChange}
//               placeholder="Enter secondary contact number"
//             />
//           </div>
          
//           <div className="form-group">
//             <label>Address</label>
//             <input
//               type="text"
//               name="address"
//               value={formData.address}
//               onChange={handleChange}
//               placeholder="Enter residential address"
//             />
//           </div>
          
//           <div className="form-group">
//             <label>GPS Number</label>
//             <input
//               type="text"
//               name="gps_number"
//               value={formData.gps_number}
//               onChange={handleChange}
//               placeholder="Enter GPS address"
//             />
//           </div>
          
//           <div className="form-group">
//             <label>Place of Resident</label>
//             <input
//               type="text"
//               name="place_of_resident"
//               value={formData.place_of_resident}
//               onChange={handleChange}
//               placeholder="Enter place of resident"
//             />
//           </div>
//         </div>
//       </div>

//       <div className="form-section">
//         <h2>
//           <Briefcase size={20} />
//           Professional Information
//         </h2>
        
//         <div className="form-grid">
//           <div className="form-group">
//             <label>National ID Number</label>
//             <input
//               type="text"
//               name="national_identification_number"
//               value={formData.national_identification_number}
//               onChange={handleChange}
//               placeholder="Enter national ID number"
//             />
//           </div>
          
//           <div className="form-group">
//             <label>Current Status</label>
//             <select name="current_status" value={formData.current_status} onChange={handleChange}>
//               <option value="active">Active</option>
//               <option value="inactive">Inactive</option>
//               <option value="on-leave">On Leave</option>
//             </select>
//           </div>
          
//           <div className="form-group">
//             <label>Initials</label>
//             <input
//               type="text"
//               name="initials"
//               value={formData.initials}
//               onChange={handleChange}
//               placeholder="Will be auto-generated"
//               disabled
//             />
//           </div>
// // Add to the Professional Information section
// <div className="form-group">
//     <label>Department</label>
//     <select name="department" value={formData.department} onChange={handleChange}>
//         <option value="">Select Department</option>
//         <option value="Mathematics">Mathematics</option>
//         <option value="Science">Science</option>
//         <option value="Languages">Languages</option>
//         <option value="Social Studies">Social Studies</option>
//         <option value="Vocational">Vocational</option>
//     </select>
// </div>

// // Add to the Family Information section
// <div className="form-group">
//     <label>Marital Status</label>
//     <select name="marital_status" value={formData.marital_status} onChange={handleChange}>
//         <option value="">Select Marital Status</option>
//         <option value="single">Single</option>
//         <option value="married">Married</option>
//         <option value="divorced">Divorced</option>
//         <option value="widowed">Widowed</option>
//     </select>
// </div>

// <div className="form-group">
//     <label>Spouse Name</label>
//     <input
//         type="text"
//         name="spouse_name"
//         value={formData.spouse_name}
//         onChange={handleChange}
//         placeholder="Enter spouse name"
//     />
// </div>

// <div className="form-group">
//     <label>Spouse Contact</label>
//     <input
//         type="tel"
//         name="spouse_phone"
//         value={formData.spouse_phone}
//         onChange={handleChange}
//         placeholder="Enter spouse contact"
//     />
// </div>


//         </div>
//       </div>

//       <div className="form-section">
//         <h2>
//           <Users size={20} />
//           Family & Emergency Information
//         </h2>
        
//         <div className="form-grid">
//           <div className="form-group">
//             <label>Father's Name</label>
//             <input
//               type="text"
//               name="fathers_name"
//               value={formData.fathers_name}
//               onChange={handleChange}
//               placeholder="Enter father's name"
//             />
//           </div>
          
//           <div className="form-group">
//             <label>Father's Contact</label>
//             <input
//               type="tel"
//               name="fathers_contact"
//               value={formData.fathers_contact}
//               onChange={handleChange}
//               placeholder="Enter father's contact"
//             />
//           </div>
          
//           <div className="form-group">
//             <label>Mother's Name</label>
//             <input
//               type="text"
//               name="mothers_name"
//               value={formData.mothers_name}
//               onChange={handleChange}
//               placeholder="Enter mother's name"
//             />
//           </div>
          
//           <div className="form-group">
//             <label>Mother's Contact</label>
//             <input
//               type="tel"
//               name="mothers_contact"
//               value={formData.mothers_contact}
//               onChange={handleChange}
//               placeholder="Enter mother's contact"
//             />
//           </div>
          
//           <div className="form-group">
//             <label>Next of Kin Name</label>
//             <input
//               type="text"
//               name="next_of_kin_name"
//               value={formData.next_of_kin_name}
//               onChange={handleChange}
//               placeholder="Enter next of kin name"
//             />
//           </div>
          
//           <div className="form-group">
//             <label>Next of Kin Contact</label>
//             <input
//               type="tel"
//               name="next_of_kin_contact"
//               value={formData.next_of_kin_contact}
//               onChange={handleChange}
//               placeholder="Enter next of kin contact"
//             />
//           </div>
          
//           <div className="form-group">
//             <label>Emergency Contact 1 *</label>
//             <input
//               type="tel"
//               name="emergency_contact_one"
//               value={formData.emergency_contact_one}
//               onChange={handleChange}
//               placeholder="Enter primary emergency contact"
//               className={errors.emergency_contact_one ? 'error' : ''}
//             />
//             {errors.emergency_contact_one && <span className="error-message">{errors.emergency_contact_one}</span>}
//           </div>
          
//           <div className="form-group">
//             <label>Emergency Contact 2</label>
//             <input
//               type="tel"
//               name="emergency_contact_two"
//               value={formData.emergency_contact_two}
//               onChange={handleChange}
//               placeholder="Enter secondary emergency contact"
//             />
//           </div>
//         </div>
//       </div>

//       <div className="form-actions">
//         <button type="button" className="btn-secondary" onClick={() => window.history.back()}>
//           Cancel
//         </button>
//         <button type="submit" className="btn-primary" disabled={isSubmitting}>
//           <Save size={18} />
//           {isSubmitting ? 'Registering...' : `Register ${role}`}
//         </button>
//       </div>
//     </form>
//   );
// };

// export default TeacherRegistration;









// src/components/Registration/TeacherRegistration.jsx
import React, { useState } from 'react';
import { Save, User, Mail, Phone, MapPin, Calendar, Briefcase, Users, TestTube } from 'lucide-react';
import '../../../styles/RegistrationForms.css';
import { registerStaff } from '../../../services/api.service';
import Notification from '../../../components/Notification';

const TeacherRegistration = ({ onSuccess, onError, role = 'teacher' }) => {
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
    roles: role === 'teacher' ? 'teacher' : 'admin',
    department: '',
    marital_status: '',
    spouse_name: '',
    spouse_phone: '',
    initials: '',
    
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
  
  // Notification state
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'error'
  });

  const showNotification = (message, type = 'error') => {
    setNotification({ show: true, message, type });
  };

  const hideNotification = () => {
    setNotification({ show: false, message: '', type: 'error' });
  };

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
    if (!formData.email_address.trim()) {
      newErrors.email_address = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email_address)) {
      newErrors.email_address = 'Email is invalid';
    }
    if (!formData.telephone_number_one.trim()) newErrors.telephone_number_one = 'Primary contact is required';
    if (!formData.emergency_contact_one.trim()) newErrors.emergency_contact_one = 'Emergency contact is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Generate random test data for faster testing
  const fillTestData = () => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    const rolePrefix = role === 'teacher' ? 'TCH' : 'ADM';
    
    const testTeacher = {
      // Personal Information
      first_name: `Test${randomNum}`,
      surname: `${role === 'teacher' ? 'Teacher' : 'Admin'}${randomNum}`,
      other_names: 'Test',
      date_of_birth: '1985-05-15',
      place_of_birth: 'Accra',
      nationality: 'Ghanaian',
      gender: 'male',
      
      // Contact Information
      address: '123 Test Street',
      gps_number: 'GW-0123-4567',
      place_of_resident: 'Accra',
      email_address: `test.${role}.${timestamp}@example.com`,
      telephone_number_one: '0244123456',
      telephone_number_two: '0244123457',
      
      // Identification
      national_identification_number: `GHA-${timestamp}`,
      
      // Professional Information
      current_status: 'active',
      department: 'Mathematics',
      marital_status: 'married',
      spouse_name: 'Test Spouse',
      spouse_phone: '0244123458',
      
      // Family Information
      fathers_name: 'Test Father',
      fathers_contact: '0244123459',
      mothers_name: 'Test Mother',
      mothers_contact: '0244123460',
      next_of_kin_name: 'Test Next of Kin',
      next_of_kin_contact: '0244123461',
      
      // Emergency
      emergency_contact_one: '0244123462',
      emergency_contact_two: '0244123463',
    };
    
    setFormData(testTeacher);
    showNotification('Test data loaded! Fill in any missing fields and submit.', 'info');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Generate initials automatically
      const initials = `${formData.first_name.charAt(0)}${formData.surname.charAt(0)}`.toUpperCase();
      
      // Prepare the data in the format expected by the backend
      const registrationData = {
        // Personal Information
        first_name: formData.first_name,
        surname: formData.surname,
        other_names: formData.other_names || null,
        date_of_birth: formData.date_of_birth || null,
        place_of_birth: formData.place_of_birth || null,
        nationality: formData.nationality,
        gender: formData.gender || null,
        
        // Contact Information
        address: formData.address || null,
        gps_number: formData.gps_number || null,
        place_of_resident: formData.place_of_resident || null,
        email_address: formData.email_address,
        telephone_number_one: formData.telephone_number_one,
        telephone_number_two: formData.telephone_number_two || null,
        
        // Identification
        national_identification_number: formData.national_identification_number || null,
        
        // Professional Information
        current_status: formData.current_status,
        role: role,
        initials: initials,
        department: formData.department || null,
        
        // Family Information
        fathers_name: formData.fathers_name || null,
        fathers_contact: formData.fathers_contact || null,
        mothers_name: formData.mothers_name || null,
        mothers_contact: formData.mothers_contact || null,
        next_of_kin_name: formData.next_of_kin_name || null,
        next_of_kin_contact: formData.next_of_kin_contact || null,
        
        // Marital Information
        marital_status: formData.marital_status || null,
        spouse_name: formData.spouse_name || null,
        spouse_phone: formData.spouse_phone || null,
        
        // Emergency
        emergency_contact_one: formData.emergency_contact_one,
        emergency_contact_two: formData.emergency_contact_two || null,
        emergency_contact_one_name: formData.next_of_kin_name || null,
        
        // Employment
        hired_at: new Date().toISOString().split('T')[0]
      };
      
      console.log('Submitting registration data:', registrationData);
      
      // Call the actual registration API
      const result = await registerStaff(registrationData);
      
      console.log('Registration result:', result);
      
      if (result && result.success) {
        showNotification(`${result.role || role} registered successfully!`, 'success');
        
        // Show success message with staff details
        setTimeout(() => {
          alert(`${role.toUpperCase()} registered successfully!\n\nStaff Number: ${result.staff_number}\nUsername: ${result.username}\nDefault Password: ${result.default_password}\n\nPlease provide these credentials to the staff member.`);
        }, 500);
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess(result);
        }
        
        // Reset form after successful registration
        setTimeout(() => {
          resetForm();
        }, 1500);
        
      } else {
        const errorMsg = result?.message || 'Registration failed';
        showNotification(errorMsg, 'error');
        
        if (onError) {
          onError(new Error(errorMsg));
        }
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      const errorMsg = error.message || 'An unexpected error occurred';
      showNotification(errorMsg, 'error');
      
      if (onError) {
        onError(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: '', surname: '', other_names: '', date_of_birth: '', place_of_birth: '',
      nationality: 'Ghanaian', gender: '', address: '', gps_number: '', place_of_resident: '',
      email_address: '', telephone_number_one: '', telephone_number_two: '',
      national_identification_number: '', current_status: 'active', roles: role,
      initials: '', fathers_name: '', fathers_contact: '', mothers_name: '',
      mothers_contact: '', next_of_kin_name: '', next_of_kin_contact: '',
      emergency_contact_one: '', emergency_contact_two: '',
      marital_status: '', spouse_name: '', spouse_phone: '', department: ''
    });
    setErrors({});
  };

  return (
    <>
      {/* Notification Component */}
      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
          duration={5000}
        />
      )}

      <form className="registration-form" onSubmit={handleSubmit}>
        {/* Test Data Button */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          marginBottom: '1rem',
          padding: '0 1rem'
        }}>
          <button
            type="button"
            onClick={fillTestData}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <TestTube size={16} />
            Load Test Data
          </button>
        </div>

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

            <div className="form-group">
              <label>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange}>
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
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
              <label>Department</label>
              <select name="department" value={formData.department} onChange={handleChange}>
                <option value="">Select Department</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Science">Science</option>
                <option value="Languages">Languages</option>
                <option value="Social Studies">Social Studies</option>
                <option value="Vocational">Vocational</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Initials</label>
              <input
                type="text"
                name="initials"
                value={formData.initials}
                onChange={handleChange}
                placeholder="Will be auto-generated"
                disabled
              />
            </div>

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
            {isSubmitting ? 'Registering...' : `Register ${role === 'teacher' ? 'Teacher' : 'Admin'}`}
          </button>
        </div>
      </form>
    </>
  );
};

export default TeacherRegistration;