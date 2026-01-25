// Data service for managing projects, employees, and capacity data
// Uses REST API for persistence

const API_BASE = '/api';

// Helper for API calls
async function apiCall(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// Cache for data to reduce API calls
let projectsCache = null;
let employeesCache = null;
let capacityCache = null;

// Initialize data - now just loads from API
export const initializeData = async () => {
  try {
    // Pre-fetch all data to populate cache
    await Promise.all([
      getProjects(),
      getEmployees(),
      getCapacity()
    ]);
  } catch (error) {
    console.error('Error initializing data:', error);
  }
};

// Project operations
export const getProjects = async () => {
  try {
    projectsCache = await apiCall('/projects');
    return projectsCache;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return projectsCache || [];
  }
};

export const getProjectById = async (id) => {
  try {
    return await apiCall(`/projects/${id}`);
  } catch (error) {
    console.error('Error fetching project:', error);
    // Fallback to cache
    return projectsCache?.find(p => p.id === id) || null;
  }
};

export const addProject = async (project) => {
  const newProject = await apiCall('/projects', {
    method: 'POST',
    body: JSON.stringify(project),
  });
  projectsCache = null; // Invalidate cache
  return newProject;
};

export const updateProject = async (id, updatedProject) => {
  const updated = await apiCall(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updatedProject),
  });
  projectsCache = null; // Invalidate cache
  return updated;
};

export const deleteProject = async (id) => {
  await apiCall(`/projects/${id}`, { method: 'DELETE' });
  projectsCache = null; // Invalidate cache
  capacityCache = null;
};

// Task Group operations
export const addTaskGroupToProject = async (projectId, taskGroup) => {
  const newTaskGroup = await apiCall(`/projects/${projectId}/task-groups`, {
    method: 'POST',
    body: JSON.stringify(taskGroup),
  });
  projectsCache = null; // Invalidate cache
  return newTaskGroup;
};

export const updateTaskGroup = async (projectId, taskGroupId, updatedTaskGroup) => {
  const updated = await apiCall(`/projects/task-groups/${taskGroupId}`, {
    method: 'PUT',
    body: JSON.stringify(updatedTaskGroup),
  });
  projectsCache = null; // Invalidate cache
  return updated;
};

export const deleteTaskGroup = async (projectId, taskGroupId) => {
  await apiCall(`/projects/task-groups/${taskGroupId}`, { method: 'DELETE' });
  projectsCache = null; // Invalidate cache
  capacityCache = null;
};

// Metric operations
export const addMetricToTaskGroup = async (projectId, taskGroupId, metric) => {
  const newMetric = await apiCall(`/projects/task-groups/${taskGroupId}/metrics`, {
    method: 'POST',
    body: JSON.stringify(metric),
  });
  projectsCache = null; // Invalidate cache
  return newMetric;
};

export const updateMetric = async (projectId, taskGroupId, metricId, updatedMetric) => {
  const updated = await apiCall(`/projects/metrics/${metricId}`, {
    method: 'PUT',
    body: JSON.stringify(updatedMetric),
  });
  projectsCache = null; // Invalidate cache
  return updated;
};

export const deleteMetric = async (projectId, taskGroupId, metricId) => {
  await apiCall(`/projects/metrics/${metricId}`, { method: 'DELETE' });
  projectsCache = null; // Invalidate cache
  capacityCache = null;
};

// Employee operations
export const getEmployees = async () => {
  try {
    employeesCache = await apiCall('/employees');
    return employeesCache;
  } catch (error) {
    console.error('Error fetching employees:', error);
    return employeesCache || [];
  }
};

export const getEmployeeById = async (id) => {
  try {
    return await apiCall(`/employees/${id}`);
  } catch (error) {
    console.error('Error fetching employee:', error);
    return employeesCache?.find(e => e.id === id) || null;
  }
};

export const addEmployee = async (employee) => {
  const newEmployee = await apiCall('/employees', {
    method: 'POST',
    body: JSON.stringify(employee),
  });
  employeesCache = null; // Invalidate cache
  return newEmployee;
};

export const updateEmployee = async (id, updatedEmployee) => {
  const updated = await apiCall(`/employees/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updatedEmployee),
  });
  employeesCache = null; // Invalidate cache
  return updated;
};

export const deleteEmployee = async (id) => {
  await apiCall(`/employees/${id}`, { method: 'DELETE' });
  employeesCache = null; // Invalidate cache
  capacityCache = null;
};

// Capacity operations
export const getCapacity = async () => {
  try {
    capacityCache = await apiCall('/capacity');
    return capacityCache;
  } catch (error) {
    console.error('Error fetching capacity:', error);
    return capacityCache || [];
  }
};

export const getCapacityByEmployee = async (employeeId) => {
  try {
    return await apiCall(`/capacity?employeeId=${encodeURIComponent(employeeId)}`);
  } catch (error) {
    console.error('Error fetching capacity by employee:', error);
    return capacityCache?.filter(c => c.employeeId === employeeId) || [];
  }
};

export const getCapacityByEmployeeAndProject = async (employeeId, projectId) => {
  try {
    return await apiCall(`/capacity?employeeId=${encodeURIComponent(employeeId)}&projectId=${encodeURIComponent(projectId)}`);
  } catch (error) {
    console.error('Error fetching capacity:', error);
    return capacityCache?.filter(c => c.employeeId === employeeId && c.projectId === projectId) || [];
  }
};

export const getCapacityEntry = async (employeeId, projectId, country, taskGroupId, metricId) => {
  try {
    const params = new URLSearchParams({
      employeeId,
      projectId,
      country,
      taskGroupId,
      metricId
    });
    return await apiCall(`/capacity/entry?${params}`);
  } catch (error) {
    console.error('Error fetching capacity entry:', error);
    return capacityCache?.find(
      c => c.employeeId === employeeId &&
           c.projectId === projectId &&
           c.country === country &&
           c.taskGroupId === taskGroupId &&
           c.metricId === metricId
    ) || null;
  }
};

export const updateCapacityEntry = async (employeeId, projectId, country, taskGroupId, metricId, timePerUnit, count) => {
  const entry = await apiCall('/capacity', {
    method: 'POST',
    body: JSON.stringify({
      employeeId,
      projectId,
      country,
      taskGroupId,
      metricId,
      timePerUnit,
      count
    }),
  });
  capacityCache = null; // Invalidate cache
  return entry;
};

// Calculation helpers - now use API
export const calculateTotalsByTaskGroup = async (employeeId, projectId, country, taskGroupId) => {
  try {
    const params = new URLSearchParams({ employeeId, projectId, country, taskGroupId });
    const result = await apiCall(`/capacity/totals/task-group?${params}`);
    return result.total;
  } catch (error) {
    console.error('Error calculating totals:', error);
    // Fallback to local calculation
    const entries = capacityCache?.filter(
      c => c.employeeId === employeeId &&
           c.projectId === projectId &&
           c.country === country &&
           c.taskGroupId === taskGroupId
    ) || [];
    return entries.reduce((sum, entry) => sum + (entry.total || 0), 0);
  }
};

export const calculateTotalsByCountry = async (employeeId, projectId, country) => {
  try {
    const params = new URLSearchParams({ employeeId, projectId, country });
    const result = await apiCall(`/capacity/totals/country?${params}`);
    return result.total;
  } catch (error) {
    console.error('Error calculating totals:', error);
    const entries = capacityCache?.filter(
      c => c.employeeId === employeeId &&
           c.projectId === projectId &&
           c.country === country
    ) || [];
    return entries.reduce((sum, entry) => sum + (entry.total || 0), 0);
  }
};

export const calculateGrandTotal = async (employeeId, projectId) => {
  try {
    const params = new URLSearchParams({ employeeId, projectId });
    const result = await apiCall(`/capacity/totals/project?${params}`);
    return result.total;
  } catch (error) {
    console.error('Error calculating totals:', error);
    const entries = capacityCache?.filter(
      c => c.employeeId === employeeId && c.projectId === projectId
    ) || [];
    return entries.reduce((sum, entry) => sum + (entry.total || 0), 0);
  }
};

// Utility functions
export const clearAllData = async () => {
  // This would need a dedicated endpoint - for now, just clear caches
  projectsCache = null;
  employeesCache = null;
  capacityCache = null;
};

export const exportData = async () => {
  const [projects, employees, capacity] = await Promise.all([
    getProjects(),
    getEmployees(),
    getCapacity()
  ]);
  
  return {
    projects,
    employees,
    capacity,
    exportedAt: new Date().toISOString()
  };
};

export const importData = async (data) => {
  // Import projects
  if (data.projects) {
    for (const project of data.projects) {
      await addProject(project);
    }
  }
  // Import employees
  if (data.employees) {
    for (const employee of data.employees) {
      await addEmployee(employee);
    }
  }
  // Import capacity
  if (data.capacity) {
    for (const entry of data.capacity) {
      await updateCapacityEntry(
        entry.employeeId,
        entry.projectId,
        entry.country,
        entry.taskGroupId,
        entry.metricId,
        entry.timePerUnit,
        entry.count
      );
    }
  }
};
