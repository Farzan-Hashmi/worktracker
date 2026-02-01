import React, { useState, useEffect, useCallback } from 'react';
import { 
  getCapacityByEmployeeAndProject,
  updateCapacityEntry,
  calculateTotalsByCountry,
  calculateGrandTotal
} from '../services/dataService';

const CapacitySheet = ({ employee, project }) => {
  const [capacityData, setCapacityData] = useState({});
  const [totals, setTotals] = useState({ byCountry: {}, overall: 0 });
  const [isLoading, setIsLoading] = useState(false);

  const recalculateTotals = useCallback(async () => {
    if (!employee || !project) return;
    
    const newTotals = { byCountry: {}, overall: 0 };

    // Get employee's countries for this project
    const projectCountries = employee.assignedCountriesByProject?.[project.id]
      || (employee.defaultProjectId === project.id ? employee.assignedCountries : null);
    const employeeCountries = projectCountries && projectCountries.length > 0
      ? project.countries.filter(country => projectCountries.includes(country))
      : project.countries;

    // Calculate totals for each country
    const countryPromises = employeeCountries.map(async country => {
      const total = await calculateTotalsByCountry(employee.id, project.id, country);
      return { country, total };
    });

    const countryResults = await Promise.all(countryPromises);
    countryResults.forEach(({ country, total }) => {
      newTotals.byCountry[country] = total;
    });

    newTotals.overall = await calculateGrandTotal(employee.id, project.id);
    setTotals(newTotals);
  }, [employee, project]);

  const loadCapacityData = useCallback(async () => {
    if (!employee || !project) return;
    
    setIsLoading(true);
    try {
      const entries = await getCapacityByEmployeeAndProject(employee.id, project.id);
      const entriesByKey = new Map();
      entries.forEach(entry => {
        const key = `${entry.country}|${entry.taskGroupId}|${entry.metricId}`;
        entriesByKey.set(key, entry);
      });

      const data = {};
      project.countries.forEach(country => {
        project.taskGroups?.forEach(taskGroup => {
          taskGroup.metrics?.forEach(metric => {
            const key = `${country}|${taskGroup.id}|${metric.id}`;
            const entry = entriesByKey.get(key);
            data[key] = {
              timePerUnit: entry?.timePerUnit || 0,
              count: entry?.count || 0,
              total: entry?.total || 0
            };
          });
        });
      });
      
      setCapacityData(data);
      await recalculateTotals();
    } catch (error) {
      console.error('Error loading capacity data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [employee, project, recalculateTotals]);

  useEffect(() => {
    if (employee && project) {
      loadCapacityData();
    }
  }, [employee, project, loadCapacityData]);

  const handleValueChange = async (country, taskGroupId, metricId, field, value) => {
    const key = `${country}|${taskGroupId}|${metricId}`;
    const currentData = capacityData[key] || { timePerUnit: 0, count: 0, total: 0 };
    
    const newValue = value === '' ? 0 : parseFloat(value) || 0;
    const updatedData = {
      ...currentData,
      [field]: newValue
    };
    updatedData.total = updatedData.timePerUnit * updatedData.count;
    
    // Update local state immediately for responsiveness
    setCapacityData(prev => ({ ...prev, [key]: updatedData }));
    
    // Save to backend
    try {
      await updateCapacityEntry(
        employee.id, project.id, country, taskGroupId, metricId,
        updatedData.timePerUnit, updatedData.count
      );
      await recalculateTotals();
    } catch (error) {
      console.error('Error updating capacity:', error);
    }
  };

  if (!employee || !project) {
    return (
      <div className="empty-state">
        <p>Please select an employee and project to view capacity data.</p>
      </div>
    );
  }

  if (!project.countries?.length || !project.taskGroups?.length) {
    return (
      <div className="empty-state">
        <p>This project needs countries and task groups to track capacity.</p>
      </div>
    );
  }

  // Filter countries based on employee's assigned countries
  const projectCountries = employee.assignedCountriesByProject?.[project.id]
    || (employee.defaultProjectId === project.id ? employee.assignedCountries : null);
  const employeeCountries = projectCountries && projectCountries.length > 0
    ? project.countries.filter(country => projectCountries.includes(country))
    : project.countries; // Show all if none assigned

  if (employeeCountries.length === 0) {
    return (
      <div className="empty-state">
        <p>This employee has no countries assigned for this project.</p>
        <p>Go to the Employees tab to assign countries.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="capacity-sheet">
        <div className="loading">Loading capacity data...</div>
      </div>
    );
  }

  return (
    <div className="capacity-sheet">
      <div className="sheet-header">
        <h3>{employee.name} - {project.name}</h3>
        <div className="total-hours">
          Total Hours: <strong>{totals.overall?.toFixed(2) || '0.00'}</strong>
        </div>
      </div>

      <div className="capacity-content">
        {project.taskGroups.map(taskGroup => (
          <div key={taskGroup.id} className="task-group-section">
            <div className="task-group-title">{taskGroup.name}</div>
            
            <div className="metrics-table-wrapper">
              <table className="metrics-table">
                <thead>
                  <tr>
                    <th className="col-country">Country</th>
                    <th className="col-platform">Platform</th>
                    {taskGroup.metrics?.map(metric => (
                      <th key={metric.id} colSpan="3" className="col-metric-header">
                        <div>{metric.name}</div>
                        <small>{metric.unit}</small>
                      </th>
                    ))}
                    <th className="col-row-total">Total</th>
                  </tr>
                  <tr className="subheader-row">
                    <th></th>
                    <th></th>
                    {taskGroup.metrics?.map(metric => (
                      <React.Fragment key={`sub-${metric.id}`}>
                        <th className="sub-time">Time</th>
                        <th className="sub-count">Count</th>
                        <th className="sub-total">Total</th>
                      </React.Fragment>
                    ))}
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {employeeCountries.map(country => {
                    // Calculate row total for this task group
                    const rowTotal = taskGroup.metrics?.reduce((sum, metric) => {
                      const key = `${country}|${taskGroup.id}|${metric.id}`;
                      return sum + (capacityData[key]?.total || 0);
                    }, 0) || 0;

                    return (
                      <tr key={country}>
                        <td className="col-country">{country}</td>
                        <td className="col-platform">{project.countryPlatforms?.[country] || '-'}</td>
                        {taskGroup.metrics?.map(metric => {
                          const key = `${country}|${taskGroup.id}|${metric.id}`;
                          const data = capacityData[key] || { timePerUnit: 0, count: 0, total: 0 };
                          return (
                            <React.Fragment key={metric.id}>
                              <td className="cell-input">
                                <input
                                  type="number"
                                  min="0"
                                  step="0.1"
                                  value={data.timePerUnit || ''}
                                  onChange={(e) => handleValueChange(country, taskGroup.id, metric.id, 'timePerUnit', e.target.value)}
                                  placeholder="0"
                                />
                              </td>
                              <td className="cell-input">
                                <input
                                  type="number"
                                  min="0"
                                  step="1"
                                  value={data.count || ''}
                                  onChange={(e) => handleValueChange(country, taskGroup.id, metric.id, 'count', e.target.value)}
                                  placeholder="0"
                                />
                              </td>
                              <td className="cell-total">{data.total?.toFixed(2) || '0.00'}</td>
                            </React.Fragment>
                          );
                        })}
                        <td className="col-row-total">{rowTotal.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="task-group-totals">
                    <td colSpan="2"><strong>Task Group Total</strong></td>
                    {taskGroup.metrics?.map(metric => {
                      const metricTotal = employeeCountries.reduce((sum, country) => {
                        const key = `${country}|${taskGroup.id}|${metric.id}`;
                        return sum + (capacityData[key]?.total || 0);
                      }, 0);
                      return (
                        <td key={metric.id} colSpan="3" className="metric-total">
                          {metricTotal.toFixed(2)} hrs
                        </td>
                      );
                    })}
                    <td className="task-group-grand-total">
                      {employeeCountries.reduce((sum, country) => {
                        return sum + (taskGroup.metrics?.reduce((metricSum, metric) => {
                          const key = `${country}|${taskGroup.id}|${metric.id}`;
                          return metricSum + (capacityData[key]?.total || 0);
                        }, 0) || 0);
                      }, 0).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        ))}

        {/* Grand Total Summary */}
        <div className="grand-total-section">
          <div className="grand-total-card">
            <span>Grand Total (All Task Groups)</span>
            <strong>{totals.overall?.toFixed(2) || '0.00'} hours</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CapacitySheet;
