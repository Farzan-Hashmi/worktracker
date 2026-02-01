import express from 'express';
import db from '../db.js';

const router = express.Router();

// Helper to format employee for response
function formatEmployee(emp) {
  const assignedProjects = JSON.parse(emp.assigned_projects || '[]');
  const assignedCountriesByProject = JSON.parse(emp.assigned_countries_by_project || '{}');
  const legacyCountries = JSON.parse(emp.assigned_countries || '[]');
  const legacyProjectId = emp.default_project_id || '';

  if (assignedProjects.length === 0 && legacyProjectId) {
    assignedProjects.push(legacyProjectId);
  }
  if (Object.keys(assignedCountriesByProject).length === 0 && legacyProjectId) {
    assignedCountriesByProject[legacyProjectId] = legacyCountries;
  }

  return {
    id: emp.id,
    name: emp.name,
    email: emp.email || '',
    defaultProjectId: emp.default_project_id || '',
    assignedCountries: legacyCountries,
    assignedProjects,
    assignedCountriesByProject,
    annualWorkingHours: emp.annual_working_hours,
    createdAt: emp.created_at
  };
}

// GET all employees
router.get('/', (req, res) => {
  try {
    const employees = db.prepare('SELECT * FROM employees').all();
    res.json(employees.map(formatEmployee));
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// GET single employee
router.get('/:id', (req, res) => {
  try {
    const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(formatEmployee(employee));
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
});

// POST create employee
router.post('/', (req, res) => {
  try {
    const { id, name, email, defaultProjectId, assignedCountries, assignedProjects, assignedCountriesByProject, annualWorkingHours } = req.body;
    const employeeId = id || `emp_${Date.now()}`;
    const createdAt = new Date().toISOString();
    const normalizedAssignedProjects = assignedProjects || (defaultProjectId ? [defaultProjectId] : []);
    const normalizedCountriesByProject = assignedCountriesByProject || (defaultProjectId ? { [defaultProjectId]: assignedCountries || [] } : {});

    db.prepare(`
      INSERT INTO employees (id, name, email, default_project_id, assigned_countries, assigned_projects, assigned_countries_by_project, annual_working_hours, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      employeeId, 
      name, 
      email || '', 
      defaultProjectId || '',
      JSON.stringify(assignedCountries || []),
      JSON.stringify(normalizedAssignedProjects),
      JSON.stringify(normalizedCountriesByProject),
      annualWorkingHours ?? null,
      createdAt
    );

    const newEmployee = db.prepare('SELECT * FROM employees WHERE id = ?').get(employeeId);
    res.status(201).json(formatEmployee(newEmployee));
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

// PUT update employee
router.put('/:id', (req, res) => {
  try {
    const { name, email, defaultProjectId, assignedCountries, assignedProjects, assignedCountriesByProject, annualWorkingHours } = req.body;
    const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const normalizedAssignedProjects = assignedProjects !== undefined
      ? assignedProjects
      : JSON.parse(employee.assigned_projects || '[]');

    const normalizedCountriesByProject = assignedCountriesByProject !== undefined
      ? assignedCountriesByProject
      : JSON.parse(employee.assigned_countries_by_project || '{}');

    db.prepare(`
      UPDATE employees 
      SET name = ?, email = ?, default_project_id = ?, assigned_countries = ?, assigned_projects = ?, assigned_countries_by_project = ?, annual_working_hours = ?
      WHERE id = ?
    `).run(
      name || employee.name, 
      email !== undefined ? email : employee.email,
      defaultProjectId !== undefined ? defaultProjectId : (employee.default_project_id || ''),
      assignedCountries !== undefined ? JSON.stringify(assignedCountries) : employee.assigned_countries,
      JSON.stringify(normalizedAssignedProjects),
      JSON.stringify(normalizedCountriesByProject),
      annualWorkingHours ?? employee.annual_working_hours ?? null,
      req.params.id
    );

    const updatedEmployee = db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id);
    res.json(formatEmployee(updatedEmployee));
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

// DELETE employee
router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM employees WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

export default router;
