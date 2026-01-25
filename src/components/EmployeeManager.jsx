import { useState, useEffect } from 'react';
import EmployeeForm from './EmployeeForm';
import EmployeeList from './EmployeeList';
import { 
  getEmployees, 
  addEmployee,
  updateEmployee,
  deleteEmployee 
} from '../services/dataService';

const EmployeeManager = () => {
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setIsLoading(true);
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEmployee = async (employeeData) => {
    try {
      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, employeeData);
      } else {
        await addEmployee(employeeData);
      }
      await loadEmployees();
      setShowForm(false);
      setEditingEmployee(null);
    } catch (error) {
      console.error('Error saving employee:', error);
    }
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const handleDeleteEmployee = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee? This will also delete all their capacity data.')) {
      try {
        await deleteEmployee(id);
        await loadEmployees();
      } catch (error) {
        console.error('Error deleting employee:', error);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingEmployee(null);
  };

  if (isLoading) {
    return (
      <div className="employee-manager">
        <div className="manager-header">
          <h2>Employee Management</h2>
        </div>
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="employee-manager">
      <div className="manager-header">
        <h2>Employee Management</h2>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary">
            + New Employee
          </button>
        )}
      </div>

      {showForm && (
        <EmployeeForm
          employeeToEdit={editingEmployee}
          onSave={handleSaveEmployee}
          onCancel={handleCancel}
        />
      )}

      <EmployeeList
        employees={employees}
        onEdit={handleEditEmployee}
        onDelete={handleDeleteEmployee}
      />
    </div>
  );
};

export default EmployeeManager;
