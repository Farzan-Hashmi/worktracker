import express from 'express';
import db from '../db.js';

const router = express.Router();

// Helper to build project with nested taskGroups and metrics
function buildProjectWithNested(project) {
  const taskGroups = db.prepare(`
    SELECT * FROM task_groups WHERE project_id = ?
  `).all(project.id);

  const taskGroupsWithMetrics = taskGroups.map(tg => {
    const metrics = db.prepare(`
      SELECT * FROM metrics WHERE task_group_id = ?
    `).all(tg.id);
    return { ...tg, metrics };
  });

  return {
    ...project,
    countries: JSON.parse(project.countries || '[]'),
    countryPlatforms: JSON.parse(project.country_platforms || '{}'),
    taskGroups: taskGroupsWithMetrics
  };
}

// GET all projects
router.get('/', (req, res) => {
  try {
    const projects = db.prepare('SELECT * FROM projects').all();
    const projectsWithNested = projects.map(buildProjectWithNested);
    res.json(projectsWithNested);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// GET single project
router.get('/:id', (req, res) => {
  try {
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(buildProjectWithNested(project));
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// POST create project
router.post('/', (req, res) => {
  try {
    const { id, name, countries, countryPlatforms, taskGroups } = req.body;
    const projectId = id || `project_${Date.now()}`;

    db.prepare(`
      INSERT INTO projects (id, name, countries, country_platforms)
      VALUES (?, ?, ?, ?)
    `).run(
      projectId,
      name,
      JSON.stringify(countries || []),
      JSON.stringify(countryPlatforms || {})
    );

    // Insert task groups and metrics if provided
    if (taskGroups && taskGroups.length > 0) {
      const insertTaskGroup = db.prepare(`
        INSERT INTO task_groups (id, project_id, name) VALUES (?, ?, ?)
      `);
      const insertMetric = db.prepare(`
        INSERT INTO metrics (id, task_group_id, name, unit) VALUES (?, ?, ?, ?)
      `);

      for (const tg of taskGroups) {
        const tgId = tg.id || `taskgroup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        insertTaskGroup.run(tgId, projectId, tg.name);

        if (tg.metrics && tg.metrics.length > 0) {
          for (const metric of tg.metrics) {
            const metricId = metric.id || `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            insertMetric.run(metricId, tgId, metric.name, metric.unit || 'hours');
          }
        }
      }
    }

    const newProject = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
    res.status(201).json(buildProjectWithNested(newProject));
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// PUT update project
router.put('/:id', (req, res) => {
  try {
    const { name, countries, countryPlatforms } = req.body;
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    db.prepare(`
      UPDATE projects SET name = ?, countries = ?, country_platforms = ?
      WHERE id = ?
    `).run(
      name || project.name,
      JSON.stringify(countries || JSON.parse(project.countries)),
      JSON.stringify(countryPlatforms || JSON.parse(project.country_platforms)),
      req.params.id
    );

    const updatedProject = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
    res.json(buildProjectWithNested(updatedProject));
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// DELETE project
router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// ============ Task Groups ============

// POST create task group
router.post('/:projectId/task-groups', (req, res) => {
  try {
    const { id, name, metrics } = req.body;
    const taskGroupId = id || `taskgroup_${Date.now()}`;

    db.prepare(`
      INSERT INTO task_groups (id, project_id, name) VALUES (?, ?, ?)
    `).run(taskGroupId, req.params.projectId, name);

    // Insert metrics if provided
    if (metrics && metrics.length > 0) {
      const insertMetric = db.prepare(`
        INSERT INTO metrics (id, task_group_id, name, unit) VALUES (?, ?, ?, ?)
      `);
      for (const metric of metrics) {
        const metricId = metric.id || `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        insertMetric.run(metricId, taskGroupId, metric.name, metric.unit || 'hours');
      }
    }

    const taskGroup = db.prepare('SELECT * FROM task_groups WHERE id = ?').get(taskGroupId);
    const taskGroupMetrics = db.prepare('SELECT * FROM metrics WHERE task_group_id = ?').all(taskGroupId);
    
    res.status(201).json({ ...taskGroup, metrics: taskGroupMetrics });
  } catch (error) {
    console.error('Error creating task group:', error);
    res.status(500).json({ error: 'Failed to create task group' });
  }
});

// PUT update task group
router.put('/task-groups/:id', (req, res) => {
  try {
    const { name } = req.body;
    db.prepare('UPDATE task_groups SET name = ? WHERE id = ?').run(name, req.params.id);
    
    const taskGroup = db.prepare('SELECT * FROM task_groups WHERE id = ?').get(req.params.id);
    if (!taskGroup) {
      return res.status(404).json({ error: 'Task group not found' });
    }
    
    const metrics = db.prepare('SELECT * FROM metrics WHERE task_group_id = ?').all(req.params.id);
    res.json({ ...taskGroup, metrics });
  } catch (error) {
    console.error('Error updating task group:', error);
    res.status(500).json({ error: 'Failed to update task group' });
  }
});

// DELETE task group
router.delete('/task-groups/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM task_groups WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Task group not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting task group:', error);
    res.status(500).json({ error: 'Failed to delete task group' });
  }
});

// ============ Metrics ============

// POST create metric
router.post('/task-groups/:taskGroupId/metrics', (req, res) => {
  try {
    const { id, name, unit } = req.body;
    const metricId = id || `metric_${Date.now()}`;

    db.prepare(`
      INSERT INTO metrics (id, task_group_id, name, unit) VALUES (?, ?, ?, ?)
    `).run(metricId, req.params.taskGroupId, name, unit || 'hours');

    const metric = db.prepare('SELECT * FROM metrics WHERE id = ?').get(metricId);
    res.status(201).json(metric);
  } catch (error) {
    console.error('Error creating metric:', error);
    res.status(500).json({ error: 'Failed to create metric' });
  }
});

// PUT update metric
router.put('/metrics/:id', (req, res) => {
  try {
    const { name, unit } = req.body;
    const metric = db.prepare('SELECT * FROM metrics WHERE id = ?').get(req.params.id);
    
    if (!metric) {
      return res.status(404).json({ error: 'Metric not found' });
    }

    db.prepare('UPDATE metrics SET name = ?, unit = ? WHERE id = ?').run(
      name || metric.name,
      unit || metric.unit,
      req.params.id
    );

    const updatedMetric = db.prepare('SELECT * FROM metrics WHERE id = ?').get(req.params.id);
    res.json(updatedMetric);
  } catch (error) {
    console.error('Error updating metric:', error);
    res.status(500).json({ error: 'Failed to update metric' });
  }
});

// DELETE metric
router.delete('/metrics/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM metrics WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Metric not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting metric:', error);
    res.status(500).json({ error: 'Failed to delete metric' });
  }
});

export default router;

