import { useState } from 'react';

const TaskGroupForm = ({ taskGroup, onSave, onCancel }) => {
  const [name, setName] = useState(taskGroup?.name || '');
  const [metrics, setMetrics] = useState(taskGroup?.metrics || []);
  const [metricName, setMetricName] = useState('');
  const [metricUnit, setMetricUnit] = useState('hours');

  const handleAddMetric = (e) => {
    if (e) e.preventDefault();
    if (metricName.trim()) {
      const newMetric = {
        id: `metric_${Date.now()}`,
        name: metricName.trim(),
        unit: metricUnit
      };
      setMetrics([...metrics, newMetric]);
      setMetricName('');
      setMetricUnit('hours');
    }
  };

  const handleRemoveMetric = (index) => {
    setMetrics(metrics.filter((_, i) => i !== index));
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();
    if (name.trim()) {
      onSave({
        id: taskGroup?.id || `taskgroup_${Date.now()}`,
        name: name.trim(),
        metrics: metrics
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <div className="task-group-form">
      <h4>{taskGroup ? 'Edit Task Group' : 'Add Task Group'}</h4>
      <div className="task-group-form-content">
        <div className="form-group">
          <label htmlFor="taskGroupName">Task Group Name *</label>
          <input
            type="text"
            id="taskGroupName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., Assessing changes (MRP/CAF/GRA)"
          />
        </div>

        <div className="form-group">
          <label>Metrics</label>
          <div className="input-with-button">
            <input
              type="text"
              value={metricName}
              onChange={(e) => setMetricName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddMetric();
                }
              }}
              placeholder="Metric name"
            />
            <input
              type="text"
              value={metricUnit}
              onChange={(e) => setMetricUnit(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Unit (e.g., hours per MRP)"
              style={{ flex: 1 }}
            />
            <button type="button" onClick={handleAddMetric}>Add</button>
          </div>
          <div className="metrics-list">
            {metrics.map((metric, index) => (
              <div key={metric.id || index} className="metric-item">
                <span className="metric-name">{metric.name}</span>
                <span className="metric-unit">({metric.unit})</span>
                <button type="button" onClick={() => handleRemoveMetric(index)}>&times;</button>
              </div>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={handleSave} className="btn-primary">
            {taskGroup ? 'Update' : 'Add'} Task Group
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskGroupForm;

