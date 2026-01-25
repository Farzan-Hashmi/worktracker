import express from 'express';
import db from '../db.js';

const router = express.Router();

// GET all capacity entries
router.get('/', (req, res) => {
  try {
    const { employeeId, projectId } = req.query;
    
    let query = 'SELECT * FROM capacity';
    const params = [];
    const conditions = [];

    if (employeeId) {
      conditions.push('employee_id = ?');
      params.push(employeeId);
    }
    if (projectId) {
      conditions.push('project_id = ?');
      params.push(projectId);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const capacity = db.prepare(query).all(...params);
    
    // Convert snake_case to camelCase for frontend compatibility
    const formattedCapacity = capacity.map(c => ({
      id: c.id,
      employeeId: c.employee_id,
      projectId: c.project_id,
      country: c.country,
      taskGroupId: c.task_group_id,
      metricId: c.metric_id,
      timePerUnit: c.time_per_unit,
      count: c.count,
      total: c.total,
      updatedAt: c.updated_at
    }));

    res.json(formattedCapacity);
  } catch (error) {
    console.error('Error fetching capacity:', error);
    res.status(500).json({ error: 'Failed to fetch capacity' });
  }
});

// GET single capacity entry
router.get('/entry', (req, res) => {
  try {
    const { employeeId, projectId, country, taskGroupId, metricId } = req.query;

    const capacity = db.prepare(`
      SELECT * FROM capacity
      WHERE employee_id = ? AND project_id = ? AND country = ? AND task_group_id = ? AND metric_id = ?
    `).get(employeeId, projectId, country, taskGroupId, metricId);

    if (!capacity) {
      return res.json(null);
    }

    res.json({
      id: capacity.id,
      employeeId: capacity.employee_id,
      projectId: capacity.project_id,
      country: capacity.country,
      taskGroupId: capacity.task_group_id,
      metricId: capacity.metric_id,
      timePerUnit: capacity.time_per_unit,
      count: capacity.count,
      total: capacity.total,
      updatedAt: capacity.updated_at
    });
  } catch (error) {
    console.error('Error fetching capacity entry:', error);
    res.status(500).json({ error: 'Failed to fetch capacity entry' });
  }
});

// POST/PUT upsert capacity entry
router.post('/', (req, res) => {
  try {
    const { employeeId, projectId, country, taskGroupId, metricId, timePerUnit, count } = req.body;
    
    const parsedTimePerUnit = parseFloat(timePerUnit) || 0;
    const parsedCount = parseFloat(count) || 0;
    const total = parsedTimePerUnit * parsedCount;
    const updatedAt = new Date().toISOString();

    // Upsert using INSERT OR REPLACE
    db.prepare(`
      INSERT INTO capacity (employee_id, project_id, country, task_group_id, metric_id, time_per_unit, count, total, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(employee_id, project_id, country, task_group_id, metric_id)
      DO UPDATE SET time_per_unit = ?, count = ?, total = ?, updated_at = ?
    `).run(
      employeeId, projectId, country, taskGroupId, metricId,
      parsedTimePerUnit, parsedCount, total, updatedAt,
      parsedTimePerUnit, parsedCount, total, updatedAt
    );

    const capacity = db.prepare(`
      SELECT * FROM capacity
      WHERE employee_id = ? AND project_id = ? AND country = ? AND task_group_id = ? AND metric_id = ?
    `).get(employeeId, projectId, country, taskGroupId, metricId);

    res.json({
      employeeId: capacity.employee_id,
      projectId: capacity.project_id,
      country: capacity.country,
      taskGroupId: capacity.task_group_id,
      metricId: capacity.metric_id,
      timePerUnit: capacity.time_per_unit,
      count: capacity.count,
      total: capacity.total,
      updatedAt: capacity.updated_at
    });
  } catch (error) {
    console.error('Error updating capacity:', error);
    res.status(500).json({ error: 'Failed to update capacity' });
  }
});

// DELETE capacity entries by employee
router.delete('/employee/:employeeId', (req, res) => {
  try {
    db.prepare('DELETE FROM capacity WHERE employee_id = ?').run(req.params.employeeId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting capacity:', error);
    res.status(500).json({ error: 'Failed to delete capacity' });
  }
});

// DELETE capacity entries by project
router.delete('/project/:projectId', (req, res) => {
  try {
    db.prepare('DELETE FROM capacity WHERE project_id = ?').run(req.params.projectId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting capacity:', error);
    res.status(500).json({ error: 'Failed to delete capacity' });
  }
});

// Calculation endpoints
router.get('/totals/task-group', (req, res) => {
  try {
    const { employeeId, projectId, country, taskGroupId } = req.query;
    
    const result = db.prepare(`
      SELECT COALESCE(SUM(total), 0) as total FROM capacity
      WHERE employee_id = ? AND project_id = ? AND country = ? AND task_group_id = ?
    `).get(employeeId, projectId, country, taskGroupId);

    res.json({ total: result.total });
  } catch (error) {
    console.error('Error calculating totals:', error);
    res.status(500).json({ error: 'Failed to calculate totals' });
  }
});

router.get('/totals/country', (req, res) => {
  try {
    const { employeeId, projectId, country } = req.query;
    
    const result = db.prepare(`
      SELECT COALESCE(SUM(total), 0) as total FROM capacity
      WHERE employee_id = ? AND project_id = ? AND country = ?
    `).get(employeeId, projectId, country);

    res.json({ total: result.total });
  } catch (error) {
    console.error('Error calculating totals:', error);
    res.status(500).json({ error: 'Failed to calculate totals' });
  }
});

router.get('/totals/project', (req, res) => {
  try {
    const { employeeId, projectId } = req.query;
    
    const result = db.prepare(`
      SELECT COALESCE(SUM(total), 0) as total FROM capacity
      WHERE employee_id = ? AND project_id = ?
    `).get(employeeId, projectId);

    res.json({ total: result.total });
  } catch (error) {
    console.error('Error calculating totals:', error);
    res.status(500).json({ error: 'Failed to calculate totals' });
  }
});

export default router;

