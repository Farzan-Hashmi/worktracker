import { useState, useEffect } from 'react';

const EmployeeForm = ({ employeeToEdit, projects = [], onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [assignedCountries, setAssignedCountries] = useState([]);

  useEffect(() => {
    if (employeeToEdit) {
      setName(employeeToEdit.name);
      setEmail(employeeToEdit.email || '');
      setSelectedProject(employeeToEdit.defaultProjectId || '');
      setAssignedCountries(employeeToEdit.assignedCountries || []);
    }
  }, [employeeToEdit]);

  const currentProject = projects.find(p => p.id === selectedProject);
  const availableCountries = currentProject?.countries || [];

  const handleToggleCountry = (country) => {
    if (assignedCountries.includes(country)) {
      setAssignedCountries(assignedCountries.filter(c => c !== country));
    } else {
      setAssignedCountries([...assignedCountries, country]);
    }
  };

  const handleSelectAll = () => {
    setAssignedCountries([...availableCountries]);
  };

  const handleClearAll = () => {
    setAssignedCountries([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onSave({
        id: employeeToEdit?.id,
        name: name.trim(),
        email: email.trim(),
        defaultProjectId: selectedProject,
        assignedCountries: assignedCountries
      });
      // Reset form
      setName('');
      setEmail('');
      setSelectedProject('');
      setAssignedCountries([]);
    }
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setSelectedProject('');
    setAssignedCountries([]);
    if (onCancel) onCancel();
  };

  return (
    <div className="employee-form">
      <h3>{employeeToEdit ? 'Edit Employee' : 'Add New Employee'}</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="employeeName">Employee Name *</label>
          <input
            type="text"
            id="employeeName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter employee name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="employeeEmail">Email (optional)</label>
          <input
            type="email"
            id="employeeEmail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="employee@example.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="projectSelect">Assign to Project</label>
          <select
            id="projectSelect"
            value={selectedProject}
            onChange={(e) => {
              setSelectedProject(e.target.value);
              setAssignedCountries([]); // Reset countries when project changes
            }}
          >
            <option value="">-- Select a project --</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        {selectedProject && availableCountries.length > 0 && (
          <div className="form-group">
            <label>Assign Countries ({assignedCountries.length} selected)</label>
            <div className="country-selection-actions">
              <button type="button" onClick={handleSelectAll} className="btn-small">
                Select All
              </button>
              <button type="button" onClick={handleClearAll} className="btn-small">
                Clear All
              </button>
            </div>
            <div className="country-checkbox-grid">
              {availableCountries.map(country => (
                <label key={country} className="country-checkbox">
                  <input
                    type="checkbox"
                    checked={assignedCountries.includes(country)}
                    onChange={() => handleToggleCountry(country)}
                  />
                  <span>{country}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            {employeeToEdit ? 'Update Employee' : 'Add Employee'}
          </button>
          <button type="button" onClick={handleReset} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;
