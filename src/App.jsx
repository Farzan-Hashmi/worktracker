import { useState, useEffect } from 'react';
import ProjectManager from './components/ProjectManager';
import EmployeeManager from './components/EmployeeManager';
import CapacityTracker from './components/CapacityTracker';
import { initializeData } from './services/dataService';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('capacity');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      await initializeData();
      setIsLoading(false);
    };
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="app">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>📊 Work Tracker - Project Capacity Manager</h1>
        <p className="subtitle">Track project capacity and employee workload</p>
      </header>

      <nav className="app-nav">
        <button 
          className={`nav-tab ${activeTab === 'capacity' ? 'active' : ''}`}
          onClick={() => setActiveTab('capacity')}
        >
          Capacity Tracker
        </button>
        <button 
          className={`nav-tab ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          Projects
        </button>
        <button 
          className={`nav-tab ${activeTab === 'employees' ? 'active' : ''}`}
          onClick={() => setActiveTab('employees')}
        >
          Employees
        </button>
      </nav>

      <main className="app-content">
        {activeTab === 'capacity' && <CapacityTracker />}
        {activeTab === 'projects' && <ProjectManager />}
        {activeTab === 'employees' && <EmployeeManager />}
      </main>

      <footer className="app-footer">
        <p>Data is persisted to the server database</p>
      </footer>
    </div>
  );
}

export default App;
