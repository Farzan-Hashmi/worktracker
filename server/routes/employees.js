import express from 'express';
import db from '../db.js';

const router = express.Router();

// Helper to format employee for response
function formatEmployee(emp) {
  return {
    id: emp.id,
    name: emp.name,
    email: emp.email || '',
    defaultProjectId: emp.default_project_id || '',
    assignedCountries: JSON.parse(emp.assigned_countries || '[]'),
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
    const { id, name, email, defaultProjectId, assignedCountries } = req.body;
    const employeeId = id || `emp_${Date.now()}`;
    const createdAt = new Date().toISOString();

    db.prepare(`
      INSERT INTO employees (id, name, email, default_project_id, assigned_countries, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      employeeId, 
      name, 
      email || '', 
      defaultProjectId || '',
      JSON.stringify(assignedCountries || []),
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
    const { name, email, defaultProjectId, assignedCountries } = req.body;
    const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    db.prepare(`
      UPDATE employees 
      SET name = ?, email = ?, default_project_id = ?, assigned_countries = ?
      WHERE id = ?
    `).run(
      name || employee.name, 
      email !== undefined ? email : employee.email,
      defaultProjectId !== undefined ? defaultProjectId : (employee.default_project_id || ''),
      assignedCountries !== undefined ? JSON.stringify(assignedCountries) : employee.assigned_countries,
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
