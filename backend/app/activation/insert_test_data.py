# scripts/insert_test_data.py (fixed with unique student numbers)

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, date, timedelta
import random
from state import get_db_connection

def get_connection():
    """Get database connection"""
    return get_db_connection()

def generate_unique_email(base_email, existing_emails):
    """Generate a unique email address"""
    email = base_email
    counter = 1
    while email in existing_emails:
        email = f"{base_email.split('@')[0]}{counter}@{base_email.split('@')[1]}"
        counter += 1
    existing_emails.add(email)
    return email

def insert_test_data():
    """Insert comprehensive test data for 2025-2026 academic year"""
    conn = get_connection()
    cursor = conn.cursor()
    
    print("Starting test data insertion for 2025-2026 academic year...")
    
    # Track existing emails to avoid duplicates
    existing_emails = set()
    existing_student_numbers = set()
    
    # First, get existing data from database
    cursor.execute("SELECT email FROM person_details WHERE email IS NOT NULL")
    for row in cursor.fetchall():
        if row['email']:
            existing_emails.add(row['email'])
    
    cursor.execute("SELECT student_number FROM students WHERE student_number IS NOT NULL")
    for row in cursor.fetchall():
        if row['student_number']:
            existing_student_numbers.add(row['student_number'])
    
    # =============================================
    # 1. ACADEMIC YEARS
    # =============================================
    print("Inserting academic years...")
    
    cursor.execute("""
        INSERT OR IGNORE INTO academic_years (id, year_label, start_date, end_date, is_current, status)
        VALUES 
            (1, '2024-2025', '2024-09-01', '2025-07-31', 0, 'archived'),
            (2, '2025-2026', '2025-09-01', '2026-07-31', 1, 'active')
    """)
    
    # =============================================
    # 2. TERMS
    # =============================================
    print("Inserting terms...")
    
    cursor.execute("""
        INSERT OR IGNORE INTO terms (id, name, term_number, academic_year_id, start_date, end_date, is_active)
        VALUES 
            (1, 'First Term', 1, 2, '2025-09-01', '2025-12-15', 1),
            (2, 'Second Term', 2, 2, '2026-01-05', '2026-04-10', 1),
            (3, 'Third Term', 3, 2, '2026-04-20', '2026-07-31', 1)
    """)
    
    # =============================================
    # 3. LEVELS
    # =============================================
    print("Inserting levels...")
    
    cursor.execute("""
        INSERT OR IGNORE INTO levels (id, name, category, order_index)
        VALUES 
            (1, 'JHS 1', 'JHS', 1),
            (2, 'JHS 2', 'JHS', 2),
            (3, 'JHS 3', 'JHS', 3),
            (4, 'SHS 1', 'SHS', 1),
            (5, 'SHS 2', 'SHS', 2),
            (6, 'SHS 3', 'SHS', 3)
    """)
    
    # =============================================
    # 4. SUBJECTS
    # =============================================
    print("Inserting subjects...")
    
    subjects_data = [
        ('Mathematics', 'MAT-101', 'core', 'BOTH', 'Foundation Mathematics'),
        ('English Language', 'ENG-101', 'core', 'BOTH', 'English Language and Literature'),
        ('Science', 'SCI-101', 'core', 'BOTH', 'Integrated Science'),
        ('Social Studies', 'SST-101', 'core', 'BOTH', 'Social Studies'),
        ('ICT', 'ICT-101', 'core', 'BOTH', 'Information Technology'),
        ('French', 'FRN-101', 'core', 'BOTH', 'French Language'),
        ('Pre-Technical Skills', 'PTS-101', 'elective', 'JHS', 'Pre-Technical Skills'),
        ('Home Economics', 'HEC-101', 'elective', 'JHS', 'Home Economics'),
        ('Religious Studies', 'REL-101', 'elective', 'JHS', 'Religious and Moral Education'),
        ('Core Mathematics', 'CMT-201', 'core', 'SHS', 'Core Mathematics'),
        ('Integrated Science', 'INS-201', 'core', 'SHS', 'Integrated Science'),
        ('Social Studies', 'SST-201', 'core', 'SHS', 'Social Studies'),
        ('Physics', 'PHY-201', 'elective', 'SHS', 'Physics'),
        ('Chemistry', 'CHM-201', 'elective', 'SHS', 'Chemistry'),
        ('Biology', 'BIO-201', 'elective', 'SHS', 'Biology'),
        ('Business Management', 'BMG-201', 'elective', 'SHS', 'Business Management'),
        ('Accounting', 'ACC-201', 'elective', 'SHS', 'Financial Accounting'),
        ('Economics', 'ECO-201', 'elective', 'SHS', 'Economics'),
        ('Literature', 'LIT-201', 'elective', 'SHS', 'English Literature'),
        ('History', 'HIS-201', 'elective', 'SHS', 'History'),
        ('Geography', 'GEO-201', 'elective', 'SHS', 'Geography')
    ]
    
    for subject in subjects_data:
        cursor.execute("""
            INSERT OR IGNORE INTO subjects (name, code, type, category, description)
            VALUES (?, ?, ?, ?, ?)
        """, subject)
    
    # =============================================
    # 5. PROGRAMMES
    # =============================================
    print("Inserting programmes...")
    
    programmes_data = [
        ('General Science', 'SCI', 'SHS', 'Science Programme'),
        ('General Arts', 'ART', 'SHS', 'Arts Programme'),
        ('Business', 'BUS', 'SHS', 'Business Programme'),
        ('General', 'GEN', 'JHS', 'General Programme')
    ]
    
    for programme in programmes_data:
        cursor.execute("""
            INSERT OR IGNORE INTO programmes (name, code, category, description)
            VALUES (?, ?, ?, ?)
        """, programme)
    
    # =============================================
    # 6. CLASSES
    # =============================================
    print("Inserting classes...")
    
    classes_data = [
        ('JHS 1A', 'JHS1-A', 1, 4, 2, None, 'Morning Section', 40),
        ('JHS 1B', 'JHS1-B', 1, 4, 2, None, 'Afternoon Section', 40),
        ('JHS 2A', 'JHS2-A', 2, 4, 2, None, 'Morning Section', 40),
        ('JHS 2B', 'JHS2-B', 2, 4, 2, None, 'Afternoon Section', 40),
        ('JHS 3A', 'JHS3-A', 3, 4, 2, None, 'Morning Section', 40),
        ('JHS 3B', 'JHS3-B', 3, 4, 2, None, 'Afternoon Section', 40),
        ('SHS 1 Science A', 'SHS1-SC-A', 4, 1, 2, None, 'Science Programme A', 45),
        ('SHS 1 Science B', 'SHS1-SC-B', 4, 1, 2, None, 'Science Programme B', 45),
        ('SHS 2 Science', 'SHS2-SC', 5, 1, 2, None, 'Science Programme', 45),
        ('SHS 3 Science', 'SHS3-SC', 6, 1, 2, None, 'Science Programme', 45),
        ('SHS 1 Arts A', 'SHS1-AR-A', 4, 2, 2, None, 'Arts Programme A', 45),
        ('SHS 1 Arts B', 'SHS1-AR-B', 4, 2, 2, None, 'Arts Programme B', 45),
        ('SHS 2 Arts', 'SHS2-AR', 5, 2, 2, None, 'Arts Programme', 45),
        ('SHS 3 Arts', 'SHS3-AR', 6, 2, 2, None, 'Arts Programme', 45),
        ('SHS 1 Business', 'SHS1-BUS', 4, 3, 2, None, 'Business Programme', 45),
        ('SHS 2 Business', 'SHS2-BUS', 5, 3, 2, None, 'Business Programme', 45),
        ('SHS 3 Business', 'SHS3-BUS', 6, 3, 2, None, 'Business Programme', 45)
    ]
    
    for class_data in classes_data:
        cursor.execute("""
            INSERT OR IGNORE INTO classes (class_name, class_code, level_id, programme_id, academic_year_id, form_master_id, description, capacity)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, class_data)
    
    # =============================================
    # 7. PERSON DETAILS (Students & Staff)
    # =============================================
    print("Inserting person details...")
    
    # First names and last names for generating realistic data
    first_names = ['Kwame', 'Akua', 'Yaw', 'Afia', 'Kofi', 'Ama', 'Kwabena', 'Adwoa', 'Kojo', 'Abena', 
                   'Michael', 'David', 'James', 'John', 'Mary', 'Patricia', 'Jennifer', 'Linda', 'Robert', 'William']
    last_names = ['Mensah', 'Asante', 'Owusu', 'Appiah', 'Boateng', 'Osei', 'Adjei', 'Tetteh', 'Acquah', 'Quaye']
    
    # Create students (50 students)
    student_person_ids = []
    for i in range(1, 51):
        first_name = random.choice(first_names)
        last_name = random.choice(last_names)
        unique_id = f"PERS_{datetime.now().strftime('%Y%m%d%H%M%S')}_{i}{random.randint(1000,9999)}"
        base_email = f"{first_name.lower()}.{last_name.lower()}@student.school.edu"
        email = generate_unique_email(base_email, existing_emails)
        phone = f"024{random.randint(1000000, 9999999)}"
        
        cursor.execute("""
            INSERT INTO person_details (unique_id, first_name, last_name, date_of_birth, gender, phone, email, address, city, country)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (unique_id, first_name, last_name, f"{random.randint(2005, 2012)}-{random.randint(1,12)}-{random.randint(1,28)}",
              random.choice(['male', 'female']), phone, email, f"{random.randint(1,100)} Main Street", 'Accra', 'Ghana'))
        
        student_person_ids.append(cursor.lastrowid)
        print(f"  Created student: {first_name} {last_name} ({email})")
    
    # Create staff (15 teachers + admin staff)
    staff_person_ids = []
    staff_roles = ['teacher', 'teacher', 'teacher', 'teacher', 'teacher', 'teacher', 
                   'teacher', 'teacher', 'teacher', 'admin', 'accountant', 'teacher', 
                   'teacher', 'teacher', 'ta']
    
    staff_first_names = ['Dr.', 'Mr.', 'Mrs.', 'Ms.', 'Prof.', 'Mr.', 'Mrs.', 'Dr.', 'Mr.', 
                         'Mrs.', 'Ms.', 'Mr.', 'Mrs.', 'Dr.', 'Mr.']
    staff_last_names = ['Adjei', 'Asante', 'Owusu', 'Appiah', 'Boateng', 'Osei', 'Mensah', 
                        'Tetteh', 'Acquah', 'Quaye', 'Boadu', 'Acheampong', 'Gyasi', 'Opoku', 'Ampofo']
    
    for i in range(1, 16):
        first_name = staff_first_names[i-1]
        last_name = staff_last_names[i-1]
        unique_id = f"PERS_STAFF_{datetime.now().strftime('%Y%m%d%H%M%S')}_{i}{random.randint(1000,9999)}"
        base_email = f"{first_name.lower().replace('.', '')}.{last_name.lower()}@staff.school.edu"
        email = generate_unique_email(base_email, existing_emails)
        phone = f"020{random.randint(1000000, 9999999)}"
        
        cursor.execute("""
            INSERT INTO person_details (unique_id, first_name, last_name, date_of_birth, gender, phone, email, address, city, country)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (unique_id, first_name, last_name, f"{random.randint(1965, 1985)}-{random.randint(1,12)}-{random.randint(1,28)}",
              random.choice(['male', 'female']), phone, email, f"{random.randint(1,100)} Staff Road", 'Accra', 'Ghana'))
        
        staff_person_ids.append(cursor.lastrowid)
        print(f"  Created staff: {first_name} {last_name} ({email})")
    
    conn.commit()
    
    # =============================================
    # 8. USERS
    # =============================================
    print("Inserting users...")
    
    # Student users
    student_user_ids = []
    for i, person_id in enumerate(student_person_ids, 1):
        username = f"student_{i}_{random.randint(1000,9999)}"
        cursor.execute("""
            INSERT INTO users (unique_id, username, password_hash, role, status)
            VALUES (?, ?, ?, ?, ?)
        """, (f"USR_STU_{datetime.now().strftime('%Y%m%d%H%M%S')}_{i}", username, f"hash_{username}", 'student', 'active'))
        student_user_ids.append(cursor.lastrowid)
    
    # Staff users
    staff_user_ids = []
    staff_usernames = ['john_adjei', 'jane_asante', 'michael_owusu', 'sarah_appiah', 'james_boateng', 
                       'linda_osei', 'robert_adjei', 'patricia_tetteh', 'david_acquah', 'admin_user', 
                       'accountant_user', 'teacher_gyasi', 'teacher_opoku', 'teacher_acheampong', 'ta_ampofo']
    
    for i, (person_id, role, username) in enumerate(zip(staff_person_ids, staff_roles, staff_usernames), 1):
        cursor.execute("""
            INSERT INTO users (unique_id, username, password_hash, role, status)
            VALUES (?, ?, ?, ?, ?)
        """, (f"USR_STAFF_{datetime.now().strftime('%Y%m%d%H%M%S')}_{i}", username, f"hash_{username}", role, 'active'))
        staff_user_ids.append(cursor.lastrowid)
    
    conn.commit()
    
    # =============================================
    # 9. STUDENTS
    # =============================================
    print("Inserting students...")
    
    student_ids = []
    classes_list = list(range(1, 18))  # Classes 1-17
    
    for i, (person_id, user_id) in enumerate(zip(student_person_ids, student_user_ids), 1):
        # Generate unique student number
        student_number = f"STU/2026/{str(i).zfill(4)}"
        counter = 1
        while student_number in existing_student_numbers:
            student_number = f"STU/2026/{str(i).zfill(4)}{counter}"
            counter += 1
        existing_student_numbers.add(student_number)
        
        unique_id = f"STU_{datetime.now().strftime('%Y%m%d%H%M%S')}_{i}{random.randint(1000,9999)}"
        class_id = random.choice(classes_list[:14])  # Assign to JHS or SHS 1-2 classes
        academic_year_id = 2  # 2025-2026
        
        cursor.execute("""
            INSERT INTO students (person_id, unique_id, student_number, user_id, academic_year_id, class_id, 
                                  parent1_name, parent1_phone, parent1_email, status, enrolled_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (person_id, unique_id, student_number, user_id, academic_year_id, class_id,
              f"Parent of Student {i}", f"024{random.randint(1000000, 9999999)}", f"parent{i}@example.com", 'active', date.today().isoformat()))
        
        student_ids.append(cursor.lastrowid)
    
    conn.commit()
    print(f"  Created {len(student_ids)} students")
    
    # =============================================
    # 10. STAFF
    # =============================================
    print("Inserting staff...")
    
    staff_ids = []
    departments = ['Mathematics', 'English', 'Science', 'Social Studies', 'ICT', 'Languages', 'Administration', 'Finance']
    
    for i, (person_id, user_id, role) in enumerate(zip(staff_person_ids, staff_user_ids, staff_roles), 1):
        staff_number = f"STF/{datetime.now().year}/{str(i).zfill(3)}"
        unique_id = f"STAFF_{datetime.now().strftime('%Y%m%d%H%M%S')}_{i}{random.randint(1000,9999)}"
        department = random.choice(departments) if role == 'teacher' else 'Administration'
        qualification = random.choice(["Bachelor's Degree", "Master's Degree", "PhD", "Diploma"])
        specialization = department
        hired_at = f"{random.randint(2010, 2023)}-{random.randint(1,8)}-{random.randint(1,28)}"
        
        cursor.execute("""
            INSERT INTO staff (person_id, unique_id, user_id, staff_number, role, department, qualification, specialization, hired_at, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (person_id, unique_id, user_id, staff_number, role, department, qualification, specialization, hired_at, 'active'))
        
        staff_ids.append(cursor.lastrowid)
    
    conn.commit()
    print(f"  Created {len(staff_ids)} staff members")
    
    # =============================================
    # 11. UPDATE FORM MASTERS
    # =============================================
    print("Updating form masters...")
    
    # Assign some teachers as form masters for classes 1-14
    for i, class_id in enumerate(range(1, 15), 0):
        if i < len(staff_ids):
            cursor.execute("UPDATE classes SET form_master_id = ? WHERE id = ?", (staff_ids[i], class_id))
    
    conn.commit()
    
    # =============================================
    # 12. TEACHER SUBJECT ASSIGNMENTS
    # =============================================
    print("Inserting teacher subject assignments...")
    
    # Get subject IDs
    cursor.execute("SELECT id, name FROM subjects")
    subjects_map = {row['name']: row['id'] for row in cursor.fetchall()}
    
    # Assign teachers to subjects and classes
    subject_assignments = []
    
    if len(staff_ids) >= 7:
        # Maths teacher (staff_ids[0]) teaches Mathematics to multiple classes
        for class_id in [7, 8, 9, 10, 11, 12]:
            if subjects_map.get('Mathematics'):
                subject_assignments.append((staff_ids[0], class_id, subjects_map['Mathematics'], 2, 1))
            if subjects_map.get('Core Mathematics'):
                subject_assignments.append((staff_ids[0], class_id, subjects_map['Core Mathematics'], 2, 1))
        
        # English teacher (staff_ids[1])
        for class_id in [7, 8, 9, 10, 11, 12]:
            if subjects_map.get('English Language'):
                subject_assignments.append((staff_ids[1], class_id, subjects_map['English Language'], 2, 1))
            if subjects_map.get('Literature'):
                subject_assignments.append((staff_ids[1], class_id, subjects_map['Literature'], 2, 1))
        
        # Science teacher (staff_ids[2])
        for class_id in [7, 8, 9, 10, 11, 12]:
            if subjects_map.get('Science'):
                subject_assignments.append((staff_ids[2], class_id, subjects_map['Science'], 2, 1))
            if subjects_map.get('Integrated Science'):
                subject_assignments.append((staff_ids[2], class_id, subjects_map['Integrated Science'], 2, 1))
        
        # Social Studies teacher (staff_ids[3])
        for class_id in [1, 2, 3, 4, 5, 6, 7, 8, 11, 12]:
            if subjects_map.get('Social Studies'):
                subject_assignments.append((staff_ids[3], class_id, subjects_map['Social Studies'], 2, 1))
        
        # Physics teacher (staff_ids[4])
        for class_id in [7, 8, 9, 10]:
            if subjects_map.get('Physics'):
                subject_assignments.append((staff_ids[4], class_id, subjects_map['Physics'], 2, 1))
        
        # Chemistry teacher (staff_ids[5])
        for class_id in [7, 8, 9, 10]:
            if subjects_map.get('Chemistry'):
                subject_assignments.append((staff_ids[5], class_id, subjects_map['Chemistry'], 2, 1))
        
        # Biology teacher (staff_ids[6])
        for class_id in [7, 8, 9, 10]:
            if subjects_map.get('Biology'):
                subject_assignments.append((staff_ids[6], class_id, subjects_map['Biology'], 2, 1))
    
    for assignment in subject_assignments:
        cursor.execute("""
            INSERT OR IGNORE INTO teacher_subject_assignments (staff_id, class_id, subject_id, academic_year_id, is_active)
            VALUES (?, ?, ?, ?, ?)
        """, assignment)
    
    conn.commit()
    print(f"  Created {len(subject_assignments)} teacher assignments")
    
    # =============================================
    # 13. SECTIONS
    # =============================================
    print("Inserting sections...")
    
    for class_id in range(1, 18):
        cursor.execute("""
            INSERT OR IGNORE INTO sections (section_name, class_id, academic_year_id, capacity)
            VALUES (?, ?, ?, ?)
        """, (f"Section {chr(65 + (class_id % 4))}", class_id, 2, 40))
    
    conn.commit()
    
    # =============================================
    # 14. ASSESSMENTS
    # =============================================
    print("Inserting assessments...")
    
    # Get all subjects
    cursor.execute("SELECT id FROM subjects")
    all_subjects = [row['id'] for row in cursor.fetchall()]
    
    assessment_count = 0
    for term_id in [1, 2]:  # First and Second Term
        for subject_id in all_subjects[:15]:  # First 15 subjects
            # Create different assessment types with different weights
            assessments_for_subject = [
                (f"Quiz 1", 'quiz', term_id, 2, subject_id, 10, 20, f"2025-10-{random.randint(1,15)}" if term_id == 1 else f"2026-02-{random.randint(1,15)}"),
                (f"Quiz 2", 'quiz', term_id, 2, subject_id, 10, 20, f"2025-11-{random.randint(1,15)}" if term_id == 1 else f"2026-03-{random.randint(1,15)}"),
                (f"Classwork", 'classwork', term_id, 2, subject_id, 10, 20, f"2025-09-{random.randint(15,30)}" if term_id == 1 else f"2026-01-{random.randint(15,30)}"),
                (f"Homework", 'homework', term_id, 2, subject_id, 5, 20, f"2025-10-{random.randint(1,10)}" if term_id == 1 else f"2026-02-{random.randint(1,10)}"),
                (f"Mid Term Test", 'test', term_id, 2, subject_id, 25, 50, f"2025-10-{random.randint(15,25)}" if term_id == 1 else f"2026-02-{random.randint(15,25)}"),
                (f"End of Term Exam", 'exam', term_id, 2, subject_id, 40, 100, f"2025-12-{random.randint(1,15)}" if term_id == 1 else f"2026-04-{random.randint(1,10)}")
            ]
            
            for assessment_name, assessment_type, t_id, ay_id, subj_id, weight, max_score, assess_date in assessments_for_subject:
                cursor.execute("""
                    INSERT OR IGNORE INTO assessments (name, type, term_id, academic_year_id, subject_id, weight, max_score, assessment_date)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (assessment_name, assessment_type, t_id, ay_id, subj_id, weight, max_score, assess_date))
                assessment_count += 1
    
    conn.commit()
    print(f"  Created {assessment_count} assessments")
    
    # =============================================
    # 15. STUDENT SCORES
    # =============================================
    print("Inserting student scores...")
    
    # Get all assessments
    cursor.execute("SELECT id, subject_id, term_id, max_score FROM assessments WHERE academic_year_id = 2")
    assessments = cursor.fetchall()
    
    if assessments:
        score_count = 0
        for assessment in assessments:
            assessment_id_val = assessment['id']
            subject_id_val = assessment['subject_id']
            term_id_val = assessment['term_id']
            max_score_val = assessment['max_score']
            
            # Get students in classes that have this subject
            for student_id in student_ids:
                # Random score between 0 and max_score
                # Generate realistic scores (bell curve around 65%)
                if random.random() < 0.05:  # 5% absent
                    score = None
                    is_absent = 1
                else:
                    # Normal distribution around 65%
                    base_score = max_score_val * 0.65
                    variance = random.gauss(0, max_score_val * 0.15)
                    score = max(0, min(max_score_val, base_score + variance))
                    is_absent = 0
                
                if score is not None:
                    cursor.execute("""
                        INSERT INTO student_scores (student_id, subject_id, assessment_id, term_id, score, is_absent, entered_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    """, (student_id, subject_id_val, assessment_id_val, term_id_val, round(score, 2), is_absent, datetime.now().isoformat()))
                    score_count += 1
                    
                    if score_count % 500 == 0:
                        conn.commit()
                        print(f"    Inserted {score_count} scores...")
        
        conn.commit()
        print(f"  Total scores inserted: {score_count}")
    else:
        print("  No assessments found, skipping scores...")
    
    # =============================================
    # FINAL SUMMARY
    # =============================================
    print("\n" + "="*50)
    print("TEST DATA INSERTION COMPLETE!")
    print("="*50)
    
    # Get counts
    cursor.execute("SELECT COUNT(*) as count FROM students")
    student_count = cursor.fetchone()['count']
    
    cursor.execute("SELECT COUNT(*) as count FROM staff")
    staff_count = cursor.fetchone()['count']
    
    cursor.execute("SELECT COUNT(*) as count FROM assessments")
    assessment_total = cursor.fetchone()['count']
    
    cursor.execute("SELECT COUNT(*) as count FROM student_scores")
    scores_total = cursor.fetchone()['count']
    
    cursor.execute("SELECT COUNT(*) as count FROM teacher_subject_assignments")
    assignments_total = cursor.fetchone()['count']
    
    print(f"\n📊 Database Statistics:")
    print(f"   - Students: {student_count}")
    print(f"   - Staff: {staff_count}")
    print(f"   - Teacher Assignments: {assignments_total}")
    print(f"   - Assessments: {assessment_total}")
    print(f"   - Student Scores: {scores_total}")
    
    conn.close()
    print("\n✅ Test data successfully inserted!")

if __name__ == "__main__":
    insert_test_data()