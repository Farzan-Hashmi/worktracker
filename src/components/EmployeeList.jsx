const EmployeeList = ({ employees, projects = [], onEdit, onDelete }) => {

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || projectId || '-';
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
            
            {(() => {
              const projectIds = employee.assignedProjects?.length
                ? employee.assignedProjects
                : (employee.defaultProjectId ? [employee.defaultProjectId] : []);

              if (projectIds.length === 0) {
                return null;
              }

              return (
                <div className="employee-project">
                  <strong>Projects:</strong> {projectIds.map(getProjectName).join(', ')}
                </div>
              );
            })()}

            {employee.annualWorkingHours !== null && employee.annualWorkingHours !== undefined && (
              <div className="employee-project">
                <strong>Annual working hours:</strong> {employee.annualWorkingHours}
              </div>
            )}

            {(() => {
              const countriesByProject = employee.assignedCountriesByProject || {};
              const projectIds = Object.keys(countriesByProject);
              if (projectIds.length > 0) {
                return (
                  <div className="employee-countries">
                    <strong>Assigned Countries:</strong>
                    {projectIds.map(projectId => (
                      <div key={projectId} className="country-tags">
                        <span className="country-tag">{getProjectName(projectId)}:</span>
                        {(countriesByProject[projectId] || []).map(country => (
                          <span key={`${projectId}-${country}`} className="country-tag">{country}</span>
                        ))}
                      </div>
                    ))}
                  </div>
                );
              }

              if (employee.assignedCountries && employee.assignedCountries.length > 0) {
                return (
                  <div className="employee-countries">
                    <strong>Assigned Countries ({employee.assignedCountries.length}):</strong>
                    <div className="country-tags">
                      {employee.assignedCountries.map(country => (
                        <span key={country} className="country-tag">{country}</span>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <div className="employee-countries">
                  <em className="no-countries">No countries assigned yet</em>
                </div>
              );
            })()}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeList;
