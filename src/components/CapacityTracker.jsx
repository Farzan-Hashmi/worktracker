import { useState, useEffect } from 'react';
import CapacitySheet from './CapacitySheet';
import { getEmployees, getProjects } from '../services/dataService';

const CapacityTracker = () => {
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [employeeData, projectData] = await Promise.all([
        getEmployees(),
        getProjects()
      ]);
      setEmployees(employeeData);
      setProjects(projectData);

      // Auto-select first employee and project if available
      if (employeeData.length > 0 && !selectedEmployee) {
        setSelectedEmployee(employeeData[0]);
      }
      if (projectData.length > 0 && !selectedProject) {
        setSelectedProject(projectData[0]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmployeeChange = (e) => {
    const employee = employees.find(emp => emp.id === e.target.value);
    setSelectedEmployee(employee);
  };

  const handleProjectChange = (e) => {
    const project = projects.find(proj => proj.id === e.target.value);
    setSelectedProject(project);
  };

  if (isLoading) {
    return (
      <div className="capacity-tracker">
        <h2>Capacity Tracker</h2>
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (employees.length === 0 || projects.length === 0) {
    return (
      <div className="capacity-tracker">
        <h2>Capacity Tracker</h2>
        <div className="empty-state">
          <p>
            {employees.length === 0 && projects.length === 0 && 
              'You need to add employees and projects before tracking capacity.'}
            {employees.length === 0 && projects.length > 0 && 
              'You need to add employees before tracking capacity.'}
            {employees.length > 0 && projects.length === 0 && 
              'You need to add projects before tracking capacity.'}
          </p>
          <p>Please go to the respective tabs to add them first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="capacity-tracker">
      <h2>Capacity Tracker</h2>
      
      <div className="tracker-controls">
        <div className="control-group">
          <label htmlFor="employeeSelect">Employee:</label>
          <select 
            id="employeeSelect"
            value={selectedEmployee?.id || ''} 
            onChange={handleEmployeeChange}
          >
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="projectSelect">Project:</label>
          <select 
            id="projectSelect"
            value={selectedProject?.id || ''} 
            onChange={handleProjectChange}
          >
            {projects.map(proj => (
              <option key={proj.id} value={proj.id}>
                {proj.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <CapacitySheet 
        employee={selectedEmployee} 
        project={selectedProject}
      />
    </div>
  );
};

export default CapacityTracker;
