import { useState, useEffect } from 'react';
import TaskGroupForm from './TaskGroupForm';

const ProjectForm = ({ projectToEdit, onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [countries, setCountries] = useState([]);
  const [countryPlatforms, setCountryPlatforms] = useState({});
  const [taskGroups, setTaskGroups] = useState([]);
  const [newCountry, setNewCountry] = useState('');
  const [showTaskGroupForm, setShowTaskGroupForm] = useState(false);
  const [editingTaskGroupIndex, setEditingTaskGroupIndex] = useState(null);

  useEffect(() => {
    if (projectToEdit) {
      setName(projectToEdit.name);
      setCountries(projectToEdit.countries || []);
      setCountryPlatforms(projectToEdit.countryPlatforms || {});
      setTaskGroups(projectToEdit.taskGroups || []);
    }
  }, [projectToEdit]);

  const handleAddCountry = () => {
    if (newCountry.trim() && !countries.includes(newCountry.trim())) {
      const country = newCountry.trim();
      setCountries([...countries, country]);
      setCountryPlatforms({ ...countryPlatforms, [country]: '' });
      setNewCountry('');
    }
  };

  const handleRemoveCountry = (index) => {
    const country = countries[index];
    const newCountries = countries.filter((_, i) => i !== index);
    const newPlatforms = { ...countryPlatforms };
    delete newPlatforms[country];
    setCountries(newCountries);
    setCountryPlatforms(newPlatforms);
  };

  const handlePlatformChange = (country, platform) => {
    setCountryPlatforms({ ...countryPlatforms, [country]: platform });
  };

  const handleAddTaskGroup = () => {
    setEditingTaskGroupIndex(null);
    setShowTaskGroupForm(true);
  };

  const handleEditTaskGroup = (index) => {
    setEditingTaskGroupIndex(index);
    setShowTaskGroupForm(true);
  };

  const handleSaveTaskGroup = (taskGroupData) => {
    if (editingTaskGroupIndex !== null) {
      const updated = [...taskGroups];
      updated[editingTaskGroupIndex] = { ...updated[editingTaskGroupIndex], ...taskGroupData };
      setTaskGroups(updated);
    } else {
      setTaskGroups([...taskGroups, taskGroupData]);
    }
    setShowTaskGroupForm(false);
    setEditingTaskGroupIndex(null);
  };

  const handleRemoveTaskGroup = (index) => {
    setTaskGroups(taskGroups.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onSave({
        id: projectToEdit?.id,
        name: name.trim(),
        countries,
        countryPlatforms,
        taskGroups
      });
      // Reset form
      setName('');
      setCountries([]);
      setCountryPlatforms({});
      setTaskGroups([]);
      setNewCountry('');
    }
  };

  const handleReset = () => {
    setName('');
    setCountries([]);
    setCountryPlatforms({});
    setTaskGroups([]);
    setNewCountry('');
    if (onCancel) onCancel();
  };

  return (
    <div className="project-form">
      <h3>{projectToEdit ? 'Edit Project' : 'Add New Project'}</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="projectName">Project Name *</label>
          <input
            type="text"
            id="projectName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Regulatory Activities 2025"
            required
          />
        </div>

        <div className="form-group">
          <label>Countries & Platforms</label>
          <div className="input-with-button">
            <input
              type="text"
              value={newCountry}
              onChange={(e) => setNewCountry(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCountry())}
              placeholder="Add country"
            />
            <button type="button" onClick={handleAddCountry}>Add</button>
          </div>
          <div className="countries-with-platforms">
            {countries.map((country, index) => (
              <div key={index} className="country-platform-row">
                <span className="country-name">{country}</span>
                <input
                  type="text"
                  value={countryPlatforms[country] || ''}
                  onChange={(e) => handlePlatformChange(country, e.target.value)}
                  placeholder="Platform (e.g., X, Xi, SP)"
                  className="platform-input"
                />
                <button type="button" onClick={() => handleRemoveCountry(index)}>&times;</button>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Task Groups ({taskGroups.length})</label>
          {!showTaskGroupForm && (
            <button type="button" onClick={handleAddTaskGroup} className="btn-small btn-primary">
              + Add Task Group
            </button>
          )}
          
          {showTaskGroupForm && (
            <TaskGroupForm
              taskGroup={editingTaskGroupIndex !== null ? taskGroups[editingTaskGroupIndex] : null}
              onSave={handleSaveTaskGroup}
              onCancel={() => {
                setShowTaskGroupForm(false);
                setEditingTaskGroupIndex(null);
              }}
            />
          )}

          <div className="task-groups-list">
            {taskGroups.length === 0 && !showTaskGroupForm && (
              <p style={{ color: '#6c757d', fontStyle: 'italic', marginTop: '1rem' }}>
                No task groups added yet. Click "+ Add Task Group" to create one.
              </p>
            )}
            {taskGroups.map((tg, index) => (
              <div key={tg.id || index} className="task-group-item">
                <div className="task-group-header">
                  <strong>{tg.name}</strong>
                  <div>
                    <button type="button" onClick={() => handleEditTaskGroup(index)} className="btn-small btn-edit">
                      Edit
                    </button>
                    <button type="button" onClick={() => handleRemoveTaskGroup(index)} className="btn-small btn-delete">
                      Remove
                    </button>
                  </div>
                </div>
                <div className="task-group-metrics">
                  {tg.metrics && tg.metrics.length > 0 ? (
                    <ul>
                      {tg.metrics.map((metric, mIdx) => (
                        <li key={metric.id || mIdx}>
                          {metric.name} <em>({metric.unit})</em>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <em>No metrics defined</em>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            {projectToEdit ? 'Update Project' : 'Create Project'}
          </button>
          <button type="button" onClick={handleReset} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;
