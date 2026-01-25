import { useState, useEffect } from 'react';
import { getProjects } from '../services/dataService';

const EmployeeForm = ({ employeeToEdit, onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [assignedCountries, setAssignedCountries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      setIsLoading(true);
      try {
        const projectData = await getProjects();
        setProjects(projectData || []);
      } catch (error) {
        console.error('Error loading projects:', error);
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProjects();
  }, []);

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

  if (isLoading) {
    return (
      <div className="employee-form">
        <h3>{employeeToEdit ? 'Edit Employee' : 'Add New Employee'}</h3>
        <div className="loading">Loading projects...</div>
      </div>
    );
  }

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
