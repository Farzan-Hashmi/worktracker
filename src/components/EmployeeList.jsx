import { getProjects } from '../services/dataService';

const EmployeeList = ({ employees, onEdit, onDelete }) => {
  const projects = getProjects();

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || '-';
  };

  if (!employees || employees.length === 0) {
    return (
      <div className="empty-state">
        <p>No employees yet. Add your first employee to get started!</p>
      </div>
    );
  }

  return (
    <div className="employee-list">
      <div className="employee-cards">
        {employees.map(employee => (
          <div key={employee.id} className="employee-card">
            <div className="employee-card-header">
              <div className="employee-info">
                <h4>{employee.name}</h4>
                {employee.email && <span className="employee-email">{employee.email}</span>}
              </div>
              <div className="employee-actions">
                <button onClick={() => onEdit(employee)} className="btn-small btn-edit">
                  Edit
                </button>
                <button onClick={() => onDelete(employee.id)} className="btn-small btn-delete">
                  Delete
                </button>
              </div>
            </div>
            
            {employee.defaultProjectId && (
              <div className="employee-project">
                <strong>Project:</strong> {getProjectName(employee.defaultProjectId)}
              </div>
            )}
            
            {employee.assignedCountries && employee.assignedCountries.length > 0 && (
              <div className="employee-countries">
                <strong>Assigned Countries ({employee.assignedCountries.length}):</strong>
                <div className="country-tags">
                  {employee.assignedCountries.map(country => (
                    <span key={country} className="country-tag">{country}</span>
                  ))}
                </div>
              </div>
            )}
            
            {(!employee.assignedCountries || employee.assignedCountries.length === 0) && (
              <div className="employee-countries">
                <em className="no-countries">No countries assigned yet</em>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeList;
