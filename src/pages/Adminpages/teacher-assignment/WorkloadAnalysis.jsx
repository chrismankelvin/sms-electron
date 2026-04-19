import { useState } from 'react';
import { BarChart3, AlertTriangle, CheckCircle, TrendingUp, Users, Clock } from 'lucide-react';
import '../../../styles/workload-analysis.css';

function WorkloadAnalysis() {
  const [threshold, setThreshold] = useState(25);
  const [teachers, setTeachers] = useState([
    { id: 1, name: 'Mr. John Doe', totalPeriods: 24, numClasses: 4, numSubjects: 2, status: 'Normal' },
    { id: 2, name: 'Mrs. Jane Smith', totalPeriods: 28, numClasses: 5, numSubjects: 3, status: 'Overloaded' },
    { id: 3, name: 'Dr. James Wilson', totalPeriods: 18, numClasses: 3, numSubjects: 2, status: 'Underloaded' },
    { id: 4, name: 'Ms. Sarah Johnson', totalPeriods: 22, numClasses: 4, numSubjects: 2, status: 'Normal' },
    { id: 5, name: 'Mr. Michael Brown', totalPeriods: 30, numClasses: 6, numSubjects: 3, status: 'Overloaded' },
    { id: 6, name: 'Mrs. Emily Davis', totalPeriods: 15, numClasses: 2, numSubjects: 1, status: 'Underloaded' }
  ]);

  const getStatusColor = (periods) => {
    if (periods > threshold) return 'overload';
    if (periods < threshold - 10) return 'warning';
    return 'normal';
  };

  const getStatusText = (periods) => {
    if (periods > threshold) return 'Overloaded';
    if (periods < threshold - 10) return 'Underloaded';
    return 'Normal';
  };

  const getStatusBadgeClass = (periods) => {
    if (periods > threshold) return 'status-withdrawn';
    if (periods < threshold - 10) return 'status-inactive';
    return 'status-active';
  };

  const maxPeriods = Math.max(...teachers.map(t => t.totalPeriods), threshold + 5);
  const averageLoad = teachers.reduce((sum, t) => sum + t.totalPeriods, 0) / teachers.length;
  const overloadedCount = teachers.filter(t => t.totalPeriods > threshold).length;
  const underloadedCount = teachers.filter(t => t.totalPeriods < threshold - 10).length;

  return (
    <div className="workload-container">
      {/* Header */}
      <div className="workload-header">
        <div className="workload-title-section">
          <h1 className="workload-title">
            <BarChart3 size={28} className="workload-title-icon" />
            Workload Analysis
          </h1>
          <p className="workload-subtitle">
            Track teacher workload distribution and identify over/under-utilization
          </p>
        </div>
        <div className="threshold-control">
          <label className="threshold-label">Warning Threshold:</label>
          <input 
            type="number" 
            className="threshold-input" 
            value={threshold} 
            onChange={(e) => setThreshold(parseInt(e.target.value))}
          />
          <span className="threshold-unit">periods/week</span>
        </div>
      </div>
      <hr className="workload-divider" />

      {/* Statistics Cards */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon"><TrendingUp size={24} /></div>
          <div className="stat-info">
            <div className="stat-value">{teachers.length}</div>
            <div className="stat-label">Total Teachers</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Clock size={24} /></div>
          <div className="stat-info">
            <div className="stat-value">{averageLoad.toFixed(1)}</div>
            <div className="stat-label">Avg Periods/Week</div>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon"><AlertTriangle size={24} /></div>
          <div className="stat-info">
            <div className="stat-value">{overloadedCount}</div>
            <div className="stat-label">Overloaded</div>
          </div>
        </div>
        <div className="stat-card info">
          <div className="stat-icon"><CheckCircle size={24} /></div>
          <div className="stat-info">
            <div className="stat-value">{underloadedCount}</div>
            <div className="stat-label">Underloaded</div>
          </div>
        </div>
      </div>

      {/* Workload Table */}
      <div className="workload-table-container">
        <table className="workload-table">
          <thead>
            <tr>
              <th>Teacher Name</th>
              <th>Total Periods/Week</th>
              <th>Number of Classes</th>
              <th>Number of Subjects</th>
              <th>Status</th>
              <th>Workload</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map(teacher => {
              const statusColor = getStatusColor(teacher.totalPeriods);
              const percentage = (teacher.totalPeriods / maxPeriods) * 100;
              const badgeClass = getStatusBadgeClass(teacher.totalPeriods);
              const statusText = getStatusText(teacher.totalPeriods);
              
              return (
                <tr key={teacher.id} className="workload-row">
                  <td className="teacher-name">
                    <strong>{teacher.name}</strong>
                  </td>
                  <td className={`periods-cell ${statusColor}`}>
                    {teacher.totalPeriods}
                  </td>
                  <td>{teacher.numClasses}</td>
                  <td>{teacher.numSubjects}</td>
                  <td>
                    <span className={`status-badge ${badgeClass}`}>
                      {statusText}
                    </span>
                  </td>
                  <td className="workload-cell">
                    <div className="workload-bar-container">
                      <div 
                        className={`workload-bar ${statusColor}`} 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="workload-percentage">{percentage.toFixed(0)}%</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Workload Distribution Chart */}
      <div className="chart-container">
        <h3 className="chart-title">Workload Distribution Chart</h3>
        <div className="chart-bars">
          {teachers.map(teacher => {
            const statusColor = getStatusColor(teacher.totalPeriods);
            const percentage = (teacher.totalPeriods / maxPeriods) * 100;
            
            return (
              <div key={teacher.id} className="chart-bar-item">
                <div className="chart-bar-label">
                  <span className="teacher-name">{teacher.name}</span>
                  <span className="teacher-periods">{teacher.totalPeriods} periods</span>
                </div>
                <div className="workload-bar-container">
                  <div 
                    className={`workload-bar ${statusColor}`} 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Threshold Indicator */}
        <div className="threshold-indicator">
          <div className="threshold-line" style={{ left: `${(threshold / maxPeriods) * 100}%` }}>
            <div className="threshold-marker">Threshold: {threshold}</div>
          </div>
        </div>

        {/* Legend */}
        <div className="legend">
          <div className="legend-item">
            <div className="legend-color normal"></div>
            <span>Normal (≤{threshold} periods)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color warning"></div>
            <span>Underloaded (&lt;{threshold - 10} periods)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color overload"></div>
            <span>Overloaded (&gt;{threshold} periods)</span>
          </div>
          <div className="legend-item">
            <div className="legend-icon"><CheckCircle size={16} /></div>
            <span>Optimal Range: {threshold - 10} - {threshold} periods</span>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="recommendations-container">
        <h3 className="recommendations-title">Recommendations</h3>
        <div className="recommendations-list">
          {overloadedCount > 0 && (
            <div className="recommendation-item warning">
              <AlertTriangle size={18} />
              <span>
                {overloadedCount} teacher(s) are overloaded. Consider redistributing classes or hiring additional staff.
              </span>
            </div>
          )}
          {underloadedCount > 0 && (
            <div className="recommendation-item info">
              <CheckCircle size={18} />
              <span>
                {underloadedCount} teacher(s) are underloaded. Consider assigning additional classes or subjects.
              </span>
            </div>
          )}
          {overloadedCount === 0 && underloadedCount === 0 && (
            <div className="recommendation-item success">
              <CheckCircle size={18} />
              <span>Excellent! All teachers are within optimal workload range.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WorkloadAnalysis;