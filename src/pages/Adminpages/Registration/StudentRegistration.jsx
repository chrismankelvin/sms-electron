// // src/components/Registration/StudentRegistration.jsx
// import React, { useState } from 'react';
// import { Save, User, Mail, Phone, MapPin, Calendar, BookOpen, Users, AlertCircle } from 'lucide-react';
// import '../../../styles/RegistrationForms.css';
// import { registerStudent } from '../../../services/api.service';

// const StudentRegistration = ({ onSuccess, onError }) => {
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
    
//     // Identification
//     national_identification_number: '',
//     national_health_insurance_number: '',
    
//     // Academic Information
//     date_of_enrollment: '',
//     form_of_enrollment: '',
//     bece_index_number: '',
//     previous_school_id_number: '',
//     name_of_previous_school: '',
//     location_of_previous_school: '',
    
//     // Parent/Guardian Information
//     fathers_name: '',
//     fathers_contact: '',
//     fathers_email: '',
//     mothers_name: '',
//     mothers_contact: '',
//     mothers_email: '',
//     guardians_name: '',
//     guardians_contact: '',
//     guardians_email: '',
    
//     // Emergency & Medical
//     emergency_contact_one: '',
//     emergency_contact_two: '',
//     disabilities: '',
//   });

//   const [errors, setErrors] = useState({});
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     // Clear error for this field
//     if (errors[name]) {
//       setErrors(prev => ({ ...prev, [name]: '' }));
//     }
//   };

//   const validateForm = () => {
//     const newErrors = {};
    
//     if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
//     if (!formData.surname.trim()) newErrors.surname = 'Surname is required';
//     if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
//     if (!formData.email_address.trim()) newErrors.email_address = 'Email is required';
//     else if (!/\S+@\S+\.\S+/.test(formData.email_address)) newErrors.email_address = 'Email is invalid';
//     if (!formData.emergency_contact_one.trim()) newErrors.emergency_contact_one = 'Emergency contact is required';
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const generateStudentId = () => {
//     const year = new Date().getFullYear();
//     const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
//     return `STU/${year}/${random}`;
//   };

//   // const handleSubmit = async (e) => {
//   //   e.preventDefault();
    
//   //   if (!validateForm()) {
//   //     return;
//   //   }
    
//   //   setIsSubmitting(true);
    
//   //   try {
//   //     // Generate student ID
//   //     const studentId = generateStudentId();
//   //     const registrationData = {
//   //       ...formData,
//   //       student_id: studentId,
//   //       registration_date: new Date().toISOString(),
//   //       status: 'active'
//   //     };
      
//   //     // Simulate API call
//   //     await new Promise(resolve => setTimeout(resolve, 1500));
      
//   //     console.log('Student Registration Data:', registrationData);
//   //     onSuccess({ id: studentId, ...registrationData });
      
//   //     // Reset form
//   //     setFormData({
//   //       first_name: '', surname: '', other_names: '', date_of_birth: '', place_of_birth: '',
//   //       nationality: 'Ghanaian', address: '', gps_number: '', place_of_resident: '',
//   //       email_address: '', national_identification_number: '', national_health_insurance_number: '',
//   //       date_of_enrollment: '', form_of_enrollment: '', bece_index_number: '',
//   //       previous_school_id_number: '', name_of_previous_school: '', location_of_previous_school: '',
//   //       fathers_name: '', fathers_contact: '', fathers_email: '', mothers_name: '',
//   //       mothers_contact: '', mothers_email: '', guardians_name: '', guardians_contact: '',
//   //       guardians_email: '', emergency_contact_one: '', emergency_contact_two: '', disabilities: ''
//   //     });
      
//   //   } catch (error) {
//   //     onError(error);
//   //   } finally {
//   //     setIsSubmitting(false);
//   //   }
//   // };

// // In StudentRegistration.jsx - Update the handleSubmit function
// const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!validateForm()) {
//         return;
//     }
    
//     setIsSubmitting(true);
    
//     try {
//         // Prepare the data in the format expected by the backend
//         const registrationData = {
//             // Personal Information
//             first_name: formData.first_name,
//             surname: formData.surname,
//             other_names: formData.other_names,
//             date_of_birth: formData.date_of_birth,
//             place_of_birth: formData.place_of_birth,
//             nationality: formData.nationality,
            
//             // Contact Information
//             address: formData.address,
//             gps_number: formData.gps_number,
//             place_of_resident: formData.place_of_resident,
//             email_address: formData.email_address,
            
//             // Identification
//             national_identification_number: formData.national_identification_number,
//             national_health_insurance_number: formData.national_health_insurance_number,
            
//             // Academic Information
//             date_of_enrollment: formData.date_of_enrollment,
//             form_of_enrollment: formData.form_of_enrollment,
//             bece_index_number: formData.bece_index_number,
//             previous_school_id_number: formData.previous_school_id_number,
//             name_of_previous_school: formData.name_of_previous_school,
//             location_of_previous_school: formData.location_of_previous_school,
            
//             // Parent/Guardian Information
//             fathers_name: formData.fathers_name,
//             fathers_contact: formData.fathers_contact,
//             fathers_email: formData.fathers_email,
//             mothers_name: formData.mothers_name,
//             mothers_contact: formData.mothers_contact,
//             mothers_email: formData.mothers_email,
//             guardians_name: formData.guardians_name,
//             guardians_contact: formData.guardians_contact,
//             guardians_email: formData.guardians_email,
            
//             // Emergency & Medical
//             emergency_contact_one: formData.emergency_contact_one,
//             emergency_contact_two: formData.emergency_contact_two,
//             disabilities: formData.disabilities,
            
//             // Class info - you might want to add these to your form
//             class_id: null,  // You'll need to add a class selector to your form
//             section_id: null,  // You'll need to add a section selector to your form
//             academic_year_id: new Date().getFullYear()  // Use current year
//         };
        
//         // Call the actual registration API
//         const result = await registerStudent(registrationData);
        
//         if (result.success) {
//             onSuccess(result);
            
//             // Reset form
//             setFormData({
//                 first_name: '', surname: '', other_names: '', date_of_birth: '', place_of_birth: '',
//                 nationality: 'Ghanaian', address: '', gps_number: '', place_of_resident: '',
//                 email_address: '', national_identification_number: '', national_health_insurance_number: '',
//                 date_of_enrollment: '', form_of_enrollment: '', bece_index_number: '',
//                 previous_school_id_number: '', name_of_previous_school: '', location_of_previous_school: '',
//                 fathers_name: '', fathers_contact: '', fathers_email: '', mothers_name: '',
//                 mothers_contact: '', mothers_email: '', guardians_name: '', guardians_contact: '',
//                 guardians_email: '', emergency_contact_one: '', emergency_contact_two: '', disabilities: ''
//             });
//         } else {
//             onError(new Error(result.message || 'Registration failed'));
//         }
        
//     } catch (error) {
//         console.error('Registration error:', error);
//         onError(error);
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
//             <label>Date of Birth *</label>
//             <input
//               type="date"
//               name="date_of_birth"
//               value={formData.date_of_birth}
//               onChange={handleChange}
//               className={errors.date_of_birth ? 'error' : ''}
//             />
//             {errors.date_of_birth && <span className="error-message">{errors.date_of_birth}</span>}
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
//           <BookOpen size={20} />
//           Academic Information
//         </h2>
        
//         <div className="form-grid">
//           <div className="form-group">
//             <label>Date of Enrollment</label>
//             <input
//               type="date"
//               name="date_of_enrollment"
//               value={formData.date_of_enrollment}
//               onChange={handleChange}
//             />
//           </div>
          
//           <div className="form-group">
//             <label>Form of Enrollment</label>
//             <select name="form_of_enrollment" value={formData.form_of_enrollment} onChange={handleChange}>
//               <option value="">Select Form</option>
//               <option value="Form 1">Form 1</option>
//               <option value="Form 2">Form 2</option>
//               <option value="Form 3">Form 3</option>
//             </select>
//           </div>
          
//           <div className="form-group">
//             <label>BECE Index Number</label>
//             <input
//               type="text"
//               name="bece_index_number"
//               value={formData.bece_index_number}
//               onChange={handleChange}
//               placeholder="Enter BECE index number"
//             />
//           </div>
          
//           <div className="form-group">
//             <label>Previous School ID</label>
//             <input
//               type="text"
//               name="previous_school_id_number"
//               value={formData.previous_school_id_number}
//               onChange={handleChange}
//               placeholder="Enter previous school ID"
//             />
//           </div>
          
//           <div className="form-group">
//             <label>Name of Previous School</label>
//             <input
//               type="text"
//               name="name_of_previous_school"
//               value={formData.name_of_previous_school}
//               onChange={handleChange}
//               placeholder="Enter previous school name"
//             />
//           </div>
          
//           <div className="form-group">
//             <label>Location of Previous School</label>
//             <input
//               type="text"
//               name="location_of_previous_school"
//               value={formData.location_of_previous_school}
//               onChange={handleChange}
//               placeholder="Enter school location"
//             />
//           </div>
//         </div>
//       </div>

//       <div className="form-section">
//         <h2>
//           <Users size={20} />
//           Parent/Guardian Information
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
//             <label>Father's Email</label>
//             <input
//               type="email"
//               name="fathers_email"
//               value={formData.fathers_email}
//               onChange={handleChange}
//               placeholder="Enter father's email"
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
//             <label>Mother's Email</label>
//             <input
//               type="email"
//               name="mothers_email"
//               value={formData.mothers_email}
//               onChange={handleChange}
//               placeholder="Enter mother's email"
//             />
//           </div>
          
//           <div className="form-group">
//             <label>Guardian's Name</label>
//             <input
//               type="text"
//               name="guardians_name"
//               value={formData.guardians_name}
//               onChange={handleChange}
//               placeholder="Enter guardian's name"
//             />
//           </div>
          
//           <div className="form-group">
//             <label>Guardian's Contact</label>
//             <input
//               type="tel"
//               name="guardians_contact"
//               value={formData.guardians_contact}
//               onChange={handleChange}
//               placeholder="Enter guardian's contact"
//             />
//           </div>
          
//           <div className="form-group">
//             <label>Guardian's Email</label>
//             <input
//               type="email"
//               name="guardians_email"
//               value={formData.guardians_email}
//               onChange={handleChange}
//               placeholder="Enter guardian's email"
//             />
//           </div>
//         </div>
//       </div>

//       <div className="form-section">
//         <h2>
//           <Phone size={20} />
//           Emergency & Medical Information
//         </h2>
        
//         <div className="form-grid">
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
          
//           <div className="form-group full-width">
//             <label>Disabilities / Medical Conditions</label>
//             <textarea
//               name="disabilities"
//               value={formData.disabilities}
//               onChange={handleChange}
//               placeholder="Enter any disabilities or medical conditions"
//               rows="3"
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
//           {isSubmitting ? 'Registering...' : 'Register Student'}
//         </button>
//       </div>
//     </form>
//   );
// };

// export default StudentRegistration;









// src/components/Registration/StudentRegistration.jsx
import React, { useState } from 'react';
import { Save, User, Mail, Phone, MapPin, Calendar, BookOpen, Users, AlertCircle, TestTube } from 'lucide-react';
import '../../../styles/RegistrationForms.css';
import { registerStudent } from '../../../services/api.service';
import Notification from '../../../components/Notification'; // Adjust path as needed

const StudentRegistration = ({ onSuccess, onError }) => {
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
    
    // Identification
    national_identification_number: '',
    national_health_insurance_number: '',
    
    // Academic Information
    date_of_enrollment: '',
    form_of_enrollment: '',
    bece_index_number: '',
    previous_school_id_number: '',
    name_of_previous_school: '',
    location_of_previous_school: '',
    
    // Parent/Guardian Information
    fathers_name: '',
    fathers_contact: '',
    fathers_email: '',
    mothers_name: '',
    mothers_contact: '',
    mothers_email: '',
    guardians_name: '',
    guardians_contact: '',
    guardians_email: '',
    
    // Emergency & Medical
    emergency_contact_one: '',
    emergency_contact_two: '',
    disabilities: '',
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
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.surname.trim()) newErrors.surname = 'Surname is required';
    if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
    if (!formData.email_address.trim()) newErrors.email_address = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email_address)) newErrors.email_address = 'Email is invalid';
    if (!formData.emergency_contact_one.trim()) newErrors.emergency_contact_one = 'Emergency contact is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Generate random test data for faster testing
  const fillTestData = () => {
    const timestamp = Date.now();
    const testStudent = {
      // Personal Information
      first_name: `Test${Math.floor(Math.random() * 1000)}`,
      surname: `Student${Math.floor(Math.random() * 1000)}`,
      other_names: 'Test',
      date_of_birth: '2005-05-15',
      place_of_birth: 'Accra',
      nationality: 'Ghanaian',
      
      // Contact Information
      address: '123 Test Street',
      gps_number: 'GW-0123-4567',
      place_of_resident: 'Accra',
      email_address: `test.student.${timestamp}@example.com`,
      
      // Identification
      national_identification_number: `GHA-${timestamp}`,
      national_health_insurance_number: `NHIS-${timestamp}`,
      
      // Academic Information
      date_of_enrollment: new Date().toISOString().split('T')[0],
      form_of_enrollment: 'Form 1',
      bece_index_number: `BECE-${timestamp}`,
      previous_school_id_number: `SCH-${timestamp}`,
      name_of_previous_school: 'Test Previous School',
      location_of_previous_school: 'Accra',
      
      // Parent/Guardian Information
      fathers_name: 'Test Father',
      fathers_contact: '0244123456',
      fathers_email: `father.${timestamp}@example.com`,
      mothers_name: 'Test Mother',
      mothers_contact: '0244123457',
      mothers_email: `mother.${timestamp}@example.com`,
      guardians_name: 'Test Guardian',
      guardians_contact: '0244123458',
      guardians_email: `guardian.${timestamp}@example.com`,
      
      // Emergency & Medical
      emergency_contact_one: '0244123459',
      emergency_contact_two: '0244123460',
      disabilities: 'None',
    };
    
    setFormData(testStudent);
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
      // Prepare the data in the format expected by the backend
      const registrationData = {
        // Personal Information
        first_name: formData.first_name,
        surname: formData.surname,
        other_names: formData.other_names || null,
        date_of_birth: formData.date_of_birth,
        place_of_birth: formData.place_of_birth || null,
        nationality: formData.nationality,
        
        // Contact Information
        address: formData.address || null,
        gps_number: formData.gps_number || null,
        place_of_resident: formData.place_of_resident || null,
        email_address: formData.email_address,
        
        // Identification
        national_identification_number: formData.national_identification_number || null,
        national_health_insurance_number: formData.national_health_insurance_number || null,
        
        // Academic Information
        date_of_enrollment: formData.date_of_enrollment || null,
        form_of_enrollment: formData.form_of_enrollment || null,
        bece_index_number: formData.bece_index_number || null,
        previous_school_id_number: formData.previous_school_id_number || null,
        name_of_previous_school: formData.name_of_previous_school || null,
        location_of_previous_school: formData.location_of_previous_school || null,
        
        // Parent/Guardian Information
        fathers_name: formData.fathers_name || null,
        fathers_contact: formData.fathers_contact || null,
        fathers_email: formData.fathers_email || null,
        mothers_name: formData.mothers_name || null,
        mothers_contact: formData.mothers_contact || null,
        mothers_email: formData.mothers_email || null,
        guardians_name: formData.guardians_name || null,
        guardians_contact: formData.guardians_contact || null,
        guardians_email: formData.guardians_email || null,
        
        // Emergency & Medical
        emergency_contact_one: formData.emergency_contact_one,
        emergency_contact_two: formData.emergency_contact_two || null,
        disabilities: formData.disabilities || null,
        
        // Class info
        class_id: null,
        section_id: null,
        academic_year_id: new Date().getFullYear()
      };
      
      console.log('Submitting registration data:', registrationData);
      
      // Call the actual registration API
      const result = await registerStudent(registrationData);
      
      console.log('Registration result:', result);
      
      if (result && result.success) {
        showNotification(result.message || 'Student registered successfully!', 'success');
        
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
        
        // Call onError callback if provided
        if (onError) {
          onError(new Error(errorMsg));
        }
      }
      
    } catch (error) {
      console.error('Registration error details:', error);
      const errorMsg = error.message || 'An unexpected error occurred';
      showNotification(errorMsg, 'error');
      
      // Call onError callback if provided
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
      nationality: 'Ghanaian', address: '', gps_number: '', place_of_resident: '',
      email_address: '', national_identification_number: '', national_health_insurance_number: '',
      date_of_enrollment: '', form_of_enrollment: '', bece_index_number: '',
      previous_school_id_number: '', name_of_previous_school: '', location_of_previous_school: '',
      fathers_name: '', fathers_contact: '', fathers_email: '', mothers_name: '',
      mothers_contact: '', mothers_email: '', guardians_name: '', guardians_contact: '',
      guardians_email: '', emergency_contact_one: '', emergency_contact_two: '', disabilities: ''
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
              <label>Date of Birth *</label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                className={errors.date_of_birth ? 'error' : ''}
              />
              {errors.date_of_birth && <span className="error-message">{errors.date_of_birth}</span>}
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
            <BookOpen size={20} />
            Academic Information
          </h2>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Date of Enrollment</label>
              <input
                type="date"
                name="date_of_enrollment"
                value={formData.date_of_enrollment}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label>Form of Enrollment</label>
              <select name="form_of_enrollment" value={formData.form_of_enrollment} onChange={handleChange}>
                <option value="">Select Form</option>
                <option value="Form 1">Form 1</option>
                <option value="Form 2">Form 2</option>
                <option value="Form 3">Form 3</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>BECE Index Number</label>
              <input
                type="text"
                name="bece_index_number"
                value={formData.bece_index_number}
                onChange={handleChange}
                placeholder="Enter BECE index number"
              />
            </div>
            
            <div className="form-group">
              <label>Previous School ID</label>
              <input
                type="text"
                name="previous_school_id_number"
                value={formData.previous_school_id_number}
                onChange={handleChange}
                placeholder="Enter previous school ID"
              />
            </div>
            
            <div className="form-group">
              <label>Name of Previous School</label>
              <input
                type="text"
                name="name_of_previous_school"
                value={formData.name_of_previous_school}
                onChange={handleChange}
                placeholder="Enter previous school name"
              />
            </div>
            
            <div className="form-group">
              <label>Location of Previous School</label>
              <input
                type="text"
                name="location_of_previous_school"
                value={formData.location_of_previous_school}
                onChange={handleChange}
                placeholder="Enter school location"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>
            <Users size={20} />
            Parent/Guardian Information
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
              <label>Father's Email</label>
              <input
                type="email"
                name="fathers_email"
                value={formData.fathers_email}
                onChange={handleChange}
                placeholder="Enter father's email"
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
              <label>Mother's Email</label>
              <input
                type="email"
                name="mothers_email"
                value={formData.mothers_email}
                onChange={handleChange}
                placeholder="Enter mother's email"
              />
            </div>
            
            <div className="form-group">
              <label>Guardian's Name</label>
              <input
                type="text"
                name="guardians_name"
                value={formData.guardians_name}
                onChange={handleChange}
                placeholder="Enter guardian's name"
              />
            </div>
            
            <div className="form-group">
              <label>Guardian's Contact</label>
              <input
                type="tel"
                name="guardians_contact"
                value={formData.guardians_contact}
                onChange={handleChange}
                placeholder="Enter guardian's contact"
              />
            </div>
            
            <div className="form-group">
              <label>Guardian's Email</label>
              <input
                type="email"
                name="guardians_email"
                value={formData.guardians_email}
                onChange={handleChange}
                placeholder="Enter guardian's email"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>
            <Phone size={20} />
            Emergency & Medical Information
          </h2>
          
          <div className="form-grid">
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
            
            <div className="form-group full-width">
              <label>Disabilities / Medical Conditions</label>
              <textarea
                name="disabilities"
                value={formData.disabilities}
                onChange={handleChange}
                placeholder="Enter any disabilities or medical conditions"
                rows="3"
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
            {isSubmitting ? 'Registering...' : 'Register Student'}
          </button>
        </div>
      </form>
    </>
  );
};

export default StudentRegistration;