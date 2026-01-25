import express from 'express';
import db from '../db.js';

const router = express.Router();

// GET all employees
router.get('/', (req, res) => {
  try {
    const employees = db.prepare('SELECT * FROM employees').all();
    res.json(employees);
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
    res.json(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
});

// POST create employee
router.post('/', (req, res) => {
  try {
    const { id, name, email } = req.body;
    const employeeId = id || `emp_${Date.now()}`;
    const createdAt = new Date().toISOString();

    db.prepare(`
      INSERT INTO employees (id, name, email, created_at)
      VALUES (?, ?, ?, ?)
    `).run(employeeId, name, email || '', createdAt);

    const newEmployee = db.prepare('SELECT * FROM employees WHERE id = ?').get(employeeId);
    res.status(201).json(newEmployee);
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

// PUT update employee
router.put('/:id', (req, res) => {
  try {
    const { name, email } = req.body;
    const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    db.prepare(`
      UPDATE employees SET name = ?, email = ?
      WHERE id = ?
    `).run(name || employee.name, email !== undefined ? email : employee.email, req.params.id);

    const updatedEmployee = db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id);
    res.json(updatedEmployee);
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

