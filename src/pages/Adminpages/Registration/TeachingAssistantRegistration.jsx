// // src/components/Registration/TeachingAssistantRegistration.jsx
// import React, { useState } from 'react';
// import { Save, User, Mail, Phone, MapPin, Calendar, GraduationCap, BookOpen } from 'lucide-react';
// import '../../../styles/RegistrationForms.css';
// import { registerTeachingAssistant } from '../../../services/api.service';

// const TeachingAssistantRegistration = ({ onSuccess, onError }) => {
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
//     national_service_id: '',
    
//     // Academic Information
//     college_university: '',
//     college_index_number: '',
//     course_of_study: '',
//     current_level: '',
//     mentee_type: '',
    
//     // Authorization
//     date_of_authorization: '',
//     date_of_termination: '',
    
//     // Family & Emergency
//     fathers_name: '',
//     fathers_contact: '',
//     mothers_name: '',
//     mothers_contact: '',
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
//     if (!formData.college_university.trim()) newErrors.college_university = 'College/University is required';
//     if (!formData.course_of_study.trim()) newErrors.course_of_study = 'Course of study is required';
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const generateNonStaffId = () => {
//     const year = new Date().getFullYear();
//     const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
//     return `TA/${year}/${random}`;
//   };

//   // const handleSubmit = async (e) => {
//   //   e.preventDefault();
    
//   //   if (!validateForm()) {
//   //     return;
//   //   }
    
//   //   setIsSubmitting(true);
    
//   //   try {
//   //     const nonStaffId = generateNonStaffId();
//   //     const initials = `${formData.first_name.charAt(0)}${formData.surname.charAt(0)}`.toUpperCase();
      
//   //     const registrationData = {
//   //       ...formData,
//   //       non_staff_id: nonStaffId,
//   //       initials: initials,
//   //       registration_date: new Date().toISOString(),
//   //       role: 'Teaching Assistant'
//   //     };
      
//   //     await new Promise(resolve => setTimeout(resolve, 1500));
      
//   //     console.log('Teaching Assistant Registration Data:', registrationData);
//   //     onSuccess({ id: nonStaffId, ...registrationData });
      
//   //     // Reset form
//   //     setFormData({
//   //       first_name: '', surname: '', other_names: '', date_of_birth: '', place_of_birth: '',
//   //       nationality: 'Ghanaian', address: '', gps_number: '', place_of_resident: '',
//   //       email_address: '', telephone_number_one: '', telephone_number_two: '',
//   //       national_identification_number: '', national_service_id: '',
//   //       college_university: '', college_index_number: '', course_of_study: '',
//   //       current_level: '', mentee_type: '', date_of_authorization: '', date_of_termination: '',
//   //       fathers_name: '', fathers_contact: '', mothers_name: '', mothers_contact: '',
//   //       emergency_contact_one: '', emergency_contact_two: ''
//   //     });
      
//   //   } catch (error) {
//   //     onError(error);
//   //   } finally {
//   //     setIsSubmitting(false);
//   //   }
//   // };

// // In TeachingAssistantRegistration.jsx - Import the function

// // Update handleSubmit
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
//             gender: formData.gender,
            
//             // Contact Information
//             address: formData.address,
//             gps_number: formData.gps_number,
//             place_of_resident: formData.place_of_resident,
//             email_address: formData.email_address,
//             telephone_number_one: formData.telephone_number_one,
//             telephone_number_two: formData.telephone_number_two,
            
//             // Identification
//             national_identification_number: formData.national_identification_number,
//             national_service_id: formData.national_service_id,
            
//             // Academic Information
//             college_university: formData.college_university,
//             college_index_number: formData.college_index_number,
//             course_of_study: formData.course_of_study,
//             current_level: formData.current_level,
//             mentee_type: formData.mentee_type,
            
//             // Authorization Period
//             date_of_authorization: formData.date_of_authorization,
//             date_of_termination: formData.date_of_termination,
            
//             // Family & Emergency
//             fathers_name: formData.fathers_name,
//             fathers_contact: formData.fathers_contact,
//             mothers_name: formData.mothers_name,
//             mothers_contact: formData.mothers_contact,
//             emergency_contact_one: formData.emergency_contact_one,
//             emergency_contact_two: formData.emergency_contact_two
//         };
        
//         // Call the actual registration API
//         const result = await registerTeachingAssistant(registrationData);
        
//         if (result.success) {
//             onSuccess(result);
            
//             // Show success message with TA details
//             alert(`Teaching Assistant registered successfully!\n\nTA Number: ${result.ta_number}\nUsername: ${result.username}\nDefault Password: ${result.default_password}\n\nPlease provide these credentials to the teaching assistant.`);
            
//             // Reset form
//             setFormData({
//                 first_name: '', surname: '', other_names: '', date_of_birth: '', place_of_birth: '',
//                 nationality: 'Ghanaian', address: '', gps_number: '', place_of_resident: '',
//                 email_address: '', telephone_number_one: '', telephone_number_two: '',
//                 national_identification_number: '', national_service_id: '',
//                 college_university: '', college_index_number: '', course_of_study: '',
//                 current_level: '', mentee_type: '', date_of_authorization: '', date_of_termination: '',
//                 fathers_name: '', fathers_contact: '', mothers_name: '', mothers_contact: '',
//                 emergency_contact_one: '', emergency_contact_two: ''
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
//           <GraduationCap size={20} />
//           Academic Information
//         </h2>
        
//         <div className="form-grid">
//           <div className="form-group">
//             <label>College/University *</label>
//             <input
//               type="text"
//               name="college_university"
//               value={formData.college_university}
//               onChange={handleChange}
//               placeholder="Enter college/university name"
//               className={errors.college_university ? 'error' : ''}
//             />
//             {errors.college_university && <span className="error-message">{errors.college_university}</span>}
//           </div>
          
//           <div className="form-group">
//             <label>College Index Number</label>
//             <input
//               type="text"
//               name="college_index_number"
//               value={formData.college_index_number}
//               onChange={handleChange}
//               placeholder="Enter college index number"
//             />
//           </div>
          
//           <div className="form-group">
//             <label>Course of Study *</label>
//             <input
//               type="text"
//               name="course_of_study"
//               value={formData.course_of_study}
//               onChange={handleChange}
//               placeholder="Enter course of study"
//               className={errors.course_of_study ? 'error' : ''}
//             />
//             {errors.course_of_study && <span className="error-message">{errors.course_of_study}</span>}
//           </div>
          
//           <div className="form-group">
//             <label>Current Level</label>
//             <select name="current_level" value={formData.current_level} onChange={handleChange}>
//               <option value="">Select Level</option>
//               <option value="100">100 Level</option>
//               <option value="200">200 Level</option>
//               <option value="300">300 Level</option>
//               <option value="400">400 Level</option>
//               <option value="Graduate">Graduate</option>
//             </select>
//           </div>
          
//           <div className="form-group">
//             <label>Mentee Type</label>
//             <select name="mentee_type" value={formData.mentee_type} onChange={handleChange}>
//               <option value="">Select Type</option>
//               <option value="intern">Intern</option>
//               <option value="trainee">Trainee</option>
//               <option value="volunteer">Volunteer</option>
//             </select>
//           </div>
//                   <div className="form-group">
//             <label>National ID</label>
//             <input
//               type="text"
//               name="national_identification_number"
//               value={formData.national_identification_number}
//               onChange={handleChange}
//               placeholder="Enter national ID"
//             />
//           </div>
          
//           <div className="form-group">
//             <label>National Service ID</label>
//             <input
//               type="text"
//               name="national_service_id"
//               value={formData.national_service_id}
//               onChange={handleChange}
//               placeholder="Enter national service ID"
//             />
//           </div>
//         </div>
//       </div>

//       <div className="form-section">
//         <h2>
//           <Calendar size={20} />
//           Authorization Period
//         </h2>
        
//         <div className="form-grid">
//           <div className="form-group">
//             <label>Date of Authorization</label>
//             <input
//               type="date"
//               name="date_of_authorization"
//               value={formData.date_of_authorization}
//               onChange={handleChange}
//             />
//           </div>
          
//           <div className="form-group">
//             <label>Date of Termination</label>
//             <input
//               type="date"
//               name="date_of_termination"
//               value={formData.date_of_termination}
//               onChange={handleChange}
//             />
//           </div>
//         </div>
//       </div>

//       <div className="form-section">
//         <h2>
//           <Phone size={20} />
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
//           {isSubmitting ? 'Registering...' : 'Register Teaching Assistant'}
//         </button>
//       </div>
//     </form>
//   );
// };

// export default TeachingAssistantRegistration;








// src/components/Registration/TeachingAssistantRegistration.jsx
import React, { useState } from 'react';
import { Save, User, Mail, Phone, MapPin, Calendar, GraduationCap, BookOpen, TestTube } from 'lucide-react';
import '../../../styles/RegistrationForms.css';
import { registerTeachingAssistant } from '../../../services/api.service';
import Notification from '../../../components/Notification';

const TeachingAssistantRegistration = ({ onSuccess, onError }) => {
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
    national_service_id: '',
    
    // Academic Information
    college_university: '',
    college_index_number: '',
    course_of_study: '',
    current_level: '',
    mentee_type: '',
    
    // Authorization
    date_of_authorization: '',
    date_of_termination: '',
    
    // Family & Emergency
    fathers_name: '',
    fathers_contact: '',
    mothers_name: '',
    mothers_contact: '',
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
    if (!formData.college_university.trim()) newErrors.college_university = 'College/University is required';
    if (!formData.course_of_study.trim()) newErrors.course_of_study = 'Course of study is required';
    if (!formData.emergency_contact_one.trim()) newErrors.emergency_contact_one = 'Emergency contact is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Generate random test data for faster testing
  const fillTestData = () => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    
    const testTA = {
      // Personal Information
      first_name: `TA${randomNum}`,
      surname: `Assistant${randomNum}`,
      other_names: 'Test',
      date_of_birth: '1998-05-15',
      place_of_birth: 'Accra',
      nationality: 'Ghanaian',
      gender: 'female',
      
      // Contact Information
      address: '123 Test Street',
      gps_number: 'GW-0123-4567',
      place_of_resident: 'Accra',
      email_address: `test.ta.${timestamp}@example.com`,
      telephone_number_one: '0244123456',
      telephone_number_two: '0244123457',
      
      // Identification
      national_identification_number: `GHA-${timestamp}`,
      national_service_id: `NS-${timestamp}`,
      
      // Academic Information
      college_university: 'University of Ghana',
      college_index_number: `UG${timestamp}`,
      course_of_study: 'Computer Science',
      current_level: '300',
      mentee_type: 'intern',
      
      // Authorization
      date_of_authorization: new Date().toISOString().split('T')[0],
      date_of_termination: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      
      // Family & Emergency
      fathers_name: 'Test Father',
      fathers_contact: '0244123458',
      mothers_name: 'Test Mother',
      mothers_contact: '0244123459',
      emergency_contact_one: '0244123460',
      emergency_contact_two: '0244123461',
    };
    
    setFormData(testTA);
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
        national_service_id: formData.national_service_id || null,
        
        // Academic Information
        college_university: formData.college_university,
        college_index_number: formData.college_index_number || null,
        course_of_study: formData.course_of_study,
        current_level: formData.current_level || null,
        mentee_type: formData.mentee_type || null,
        
        // Authorization Period
        date_of_authorization: formData.date_of_authorization || null,
        date_of_termination: formData.date_of_termination || null,
        
        // Family & Emergency
        fathers_name: formData.fathers_name || null,
        fathers_contact: formData.fathers_contact || null,
        mothers_name: formData.mothers_name || null,
        mothers_contact: formData.mothers_contact || null,
        emergency_contact_one: formData.emergency_contact_one,
        emergency_contact_two: formData.emergency_contact_two || null
      };
      
      console.log('Submitting Teaching Assistant registration data:', registrationData);
      
      // Call the actual registration API
      const result = await registerTeachingAssistant(registrationData);
      
      console.log('Registration result:', result);
      
      if (result && result.success) {
        showNotification('Teaching Assistant registered successfully!', 'success');
        
        // Show success message with TA details
        setTimeout(() => {
          alert(`Teaching Assistant registered successfully!\n\nTA Number: ${result.ta_number || result.staff_number}\nUsername: ${result.username}\nDefault Password: ${result.default_password}\n\nPlease provide these credentials to the teaching assistant.`);
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
      national_identification_number: '', national_service_id: '',
      college_university: '', college_index_number: '', course_of_study: '',
      current_level: '', mentee_type: '', date_of_authorization: '', date_of_termination: '',
      fathers_name: '', fathers_contact: '', mothers_name: '', mothers_contact: '',
      emergency_contact_one: '', emergency_contact_two: ''
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
            <GraduationCap size={20} />
            Academic Information
          </h2>
          
          <div className="form-grid">
            <div className="form-group">
              <label>College/University *</label>
              <input
                type="text"
                name="college_university"
                value={formData.college_university}
                onChange={handleChange}
                placeholder="Enter college/university name"
                className={errors.college_university ? 'error' : ''}
              />
              {errors.college_university && <span className="error-message">{errors.college_university}</span>}
            </div>
            
            <div className="form-group">
              <label>College Index Number</label>
              <input
                type="text"
                name="college_index_number"
                value={formData.college_index_number}
                onChange={handleChange}
                placeholder="Enter college index number"
              />
            </div>
            
            <div className="form-group">
              <label>Course of Study *</label>
              <input
                type="text"
                name="course_of_study"
                value={formData.course_of_study}
                onChange={handleChange}
                placeholder="Enter course of study"
                className={errors.course_of_study ? 'error' : ''}
              />
              {errors.course_of_study && <span className="error-message">{errors.course_of_study}</span>}
            </div>
            
            <div className="form-group">
              <label>Current Level</label>
              <select name="current_level" value={formData.current_level} onChange={handleChange}>
                <option value="">Select Level</option>
                <option value="100">100 Level</option>
                <option value="200">200 Level</option>
                <option value="300">300 Level</option>
                <option value="400">400 Level</option>
                <option value="Graduate">Graduate</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Mentee Type</label>
              <select name="mentee_type" value={formData.mentee_type} onChange={handleChange}>
                <option value="">Select Type</option>
                <option value="intern">Intern</option>
                <option value="trainee">Trainee</option>
                <option value="volunteer">Volunteer</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>National ID</label>
              <input
                type="text"
                name="national_identification_number"
                value={formData.national_identification_number}
                onChange={handleChange}
                placeholder="Enter national ID"
              />
            </div>
            
            <div className="form-group">
              <label>National Service ID</label>
              <input
                type="text"
                name="national_service_id"
                value={formData.national_service_id}
                onChange={handleChange}
                placeholder="Enter national service ID"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>
            <Calendar size={20} />
            Authorization Period
          </h2>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Date of Authorization</label>
              <input
                type="date"
                name="date_of_authorization"
                value={formData.date_of_authorization}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label>Date of Termination</label>
              <input
                type="date"
                name="date_of_termination"
                value={formData.date_of_termination}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>
            <Phone size={20} />
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
            {isSubmitting ? 'Registering...' : 'Register Teaching Assistant'}
          </button>
        </div>
      </form>
    </>
  );
};

export default TeachingAssistantRegistration;