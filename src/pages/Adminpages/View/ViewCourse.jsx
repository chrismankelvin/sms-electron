// src/pages/View/ViewTeachers.jsx
import { useState } from "react";

function ViewCourse() {
  const [teachers] = useState([
    { id: 1, name: "John Doe", department: "Mathematics", email: "john@school.com", status: "Active" },
    { id: 2, name: "Jane Smith", department: "Science", email: "jane@school.com", status: "Active" },
    { id: 3, name: "Mike Johnson", department: "English", email: "mike@school.com", status: "Inactive" },
  ]);

  return (
    <>
      <h1>View Teachers</h1>
      <div className="card">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Department</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map(teacher => (
              <tr key={teacher.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem' }}>{teacher.name}</td>
                <td style={{ padding: '1rem' }}>{teacher.department}</td>
                <td style={{ padding: '1rem' }}>{teacher.email}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    backgroundColor: teacher.status === 'Active' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: teacher.status === 'Active' ? '#22c55e' : '#ef4444'
                  }}>
                    {teacher.status}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <button className="button" style={{ marginRight: '0.5rem' }}>Edit</button>
                  <button className="button" style={{ backgroundColor: '#ef4444' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default ViewCourse;