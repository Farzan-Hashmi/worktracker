import { useState, useEffect } from 'react';
import ProjectForm from './ProjectForm';
import ProjectList from './ProjectList';
import { 
  getProjects, 
  addProject, 
  updateProject, 
  deleteProject 
} from '../services/dataService';

const ProjectManager = () => {
  const [projects, setProjects] = useState([]);
  const [editingProject, setEditingProject] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProject = async (projectData) => {
    try {
      if (editingProject) {
        await updateProject(editingProject.id, projectData);
      } else {
        await addProject(projectData);
      }
      await loadProjects();
      setEditingProject(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm('Are you sure you want to delete this project? This will also delete all associated capacity data.')) {
      try {
        await deleteProject(id);
        await loadProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  const handleCancel = () => {
    setEditingProject(null);
    setShowForm(false);
  };

  if (isLoading) {
    return (
      <div className="project-manager">
        <div className="manager-header">
          <h2>Project Management</h2>
        </div>
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="project-manager">
      <div className="manager-header">
        <h2>Project Management</h2>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary">
            + New Project
          </button>
        )}
      </div>

      {showForm && (
        <ProjectForm
          projectToEdit={editingProject}
          onSave={handleSaveProject}
          onCancel={handleCancel}
        />
      )}

      <ProjectList
        projects={projects}
        onEdit={handleEditProject}
        onDelete={handleDeleteProject}
      />
    </div>
  );
};

export default ProjectManager;
