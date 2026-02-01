import { useState, useEffect } from 'react';

const EmployeeForm = ({ employeeToEdit, projects = [], onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState('');
  const [assignedCountriesByProject, setAssignedCountriesByProject] = useState({});

  useEffect(() => {
    if (employeeToEdit) {
      setName(employeeToEdit.name);
      setEmail(employeeToEdit.email || '');
      const assignedProjects = employeeToEdit.assignedProjects || (employeeToEdit.defaultProjectId ? [employeeToEdit.defaultProjectId] : []);
      const countriesByProject = employeeToEdit.assignedCountriesByProject || (employeeToEdit.defaultProjectId
        ? { [employeeToEdit.defaultProjectId]: employeeToEdit.assignedCountries || [] }
        : {});
      setSelectedProjects(assignedProjects);
      setAssignedCountriesByProject(countriesByProject);
      setActiveProjectId(assignedProjects[0] || '');
    }
  }, [employeeToEdit]);

  useEffect(() => {
    if (activeProjectId && !selectedProjects.includes(activeProjectId)) {
      setActiveProjectId(selectedProjects[0] || '');
    }
  }, [activeProjectId, selectedProjects]);

  const currentProject = projects.find(p => p.id === activeProjectId);
  const availableCountries = currentProject?.countries || [];
  const assignedCountries = assignedCountriesByProject[activeProjectId] || [];

  const handleToggleProject = (projectId) => {
    if (selectedProjects.includes(projectId)) {
      const updatedProjects = selectedProjects.filter(id => id !== projectId);
      const updatedCountriesByProject = { ...assignedCountriesByProject };
      delete updatedCountriesByProject[projectId];
      setSelectedProjects(updatedProjects);
      setAssignedCountriesByProject(updatedCountriesByProject);
      if (activeProjectId === projectId) {
        setActiveProjectId(updatedProjects[0] || '');
      }
      return;
    }

    setSelectedProjects(prev => [...prev, projectId]);
    setAssignedCountriesByProject(prev => ({ ...prev, [projectId]: prev[projectId] || [] }));
    if (!activeProjectId) {
      setActiveProjectId(projectId);
    }
  };

  const handleToggleCountry = (country) => {
    if (!activeProjectId) return;
    const updatedCountries = assignedCountries.includes(country)
      ? assignedCountries.filter(c => c !== country)
      : [...assignedCountries, country];
    setAssignedCountriesByProject(prev => ({
      ...prev,
      [activeProjectId]: updatedCountries
    }));
  };

  const handleSelectAll = () => {
    if (!activeProjectId) return;
    setAssignedCountriesByProject(prev => ({
      ...prev,
      [activeProjectId]: [...availableCountries]
    }));
  };

  const handleClearAll = () => {
    if (!activeProjectId) return;
    setAssignedCountriesByProject(prev => ({
      ...prev,
      [activeProjectId]: []
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      const defaultProjectId = activeProjectId || selectedProjects[0] || '';
      onSave({
        id: employeeToEdit?.id,
        name: name.trim(),
        email: email.trim(),
        defaultProjectId,
        assignedProjects: selectedProjects,
        assignedCountriesByProject: assignedCountriesByProject,
        assignedCountries: defaultProjectId ? (assignedCountriesByProject[defaultProjectId] || []) : []
      });
      // Reset form
      setName('');
      setEmail('');
      setSelectedProjects([]);
      setActiveProjectId('');
      setAssignedCountriesByProject({});
    }
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setSelectedProjects([]);
    setActiveProjectId('');
    setAssignedCountriesByProject({});
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
          <label>Assign to Projects</label>
          <div className="country-checkbox-grid">
            {projects.map(project => (
              <label key={project.id} className="country-checkbox">
                <input
                  type="checkbox"
                  checked={selectedProjects.includes(project.id)}
                  onChange={() => handleToggleProject(project.id)}
                />
                <span>{project.name}</span>
              </label>
            ))}
          </div>
        </div>

        {selectedProjects.length > 0 && (
          <div className="form-group">
            <label htmlFor="activeProjectSelect">Edit Countries For</label>
            <select
              id="activeProjectSelect"
              value={activeProjectId}
              onChange={(e) => setActiveProjectId(e.target.value)}
            >
              {selectedProjects.map(projectId => {
                const project = projects.find(p => p.id === projectId);
                return (
                  <option key={projectId} value={projectId}>
                    {project?.name || projectId}
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {activeProjectId && availableCountries.length > 0 && (
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
