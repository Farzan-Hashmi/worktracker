const ProjectList = ({ projects, onEdit, onDelete }) => {
  if (!projects || projects.length === 0) {
    return (
      <div className="empty-state">
        <p>No projects yet. Create your first project to get started!</p>
      </div>
    );
  }

  return (
    <div className="project-list">
      {projects.map(project => (
        <div key={project.id} className="project-card">
          <div className="project-header">
            <h4>{project.name}</h4>
            <div className="project-actions">
              <button onClick={() => onEdit(project)} className="btn-small btn-edit">
                Edit
              </button>
              <button onClick={() => onDelete(project.id)} className="btn-small btn-delete">
                Delete
              </button>
            </div>
          </div>
          <div className="project-details">
            <div className="detail-section">
              <strong>Countries ({project.countries?.length || 0}):</strong>
              <div className="countries-grid">
                {project.countries?.map((country, idx) => (
                  <div key={idx} className="country-with-platform">
                    <span className="tag tag-country">{country}</span>
                    {project.countryPlatforms?.[country] && (
                      <span className="platform-badge">{project.countryPlatforms[country]}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="detail-section">
              <strong>Task Groups ({project.taskGroups?.length || 0}):</strong>
              {project.taskGroups?.map((tg, idx) => (
                <div key={idx} className="task-group-summary">
                  <span className="tag tag-taskgroup">{tg.name}</span>
                  <span className="metrics-count">
                    {tg.metrics?.length || 0} metrics
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectList;
