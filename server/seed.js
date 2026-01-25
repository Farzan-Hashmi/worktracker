// Seed script to populate database with initial data
import db from './db.js';

const initialData = {
  projects: [
    {
      id: "regulatory-2025",
      name: "Regulatory Activities 2025",
      countries: [
        "Israel", "Kuwait", "Lebanon", "Saudi Arabia", "Qatar", "Russia", "UAE",
        "Morocco", "South Africa", "Mexico", "Argentina", "Colombia", "Ecuador",
        "Panama", "Peru", "Uruguay", "Venezuela", "Dominican Republic",
        "Australia", "Indonesia", "Malaysia", "New Zealand", "Philippines",
        "Singapore", "Thailand", "Vietnam"
      ],
      countryPlatforms: {
        "Israel": "X, Xi, X, SP, Ion",
        "Kuwait": "2 Xi",
        "Lebanon": "1 Xi",
        "Saudi Arabia": "20 Xi",
        "Qatar": "7 Xi",
        "Russia": "31 Xi",
        "UAE": "7 Xi",
        "Morocco": "",
        "South Africa": "5 X, 8 Xi",
        "Mexico": "10 X, 17 Xi",
        "Argentina": "2",
        "Colombia": "5",
        "Ecuador": "4",
        "Panama": "2",
        "Peru": "1",
        "Uruguay": "0",
        "Venezuela": "1",
        "Dominican Republic": "2",
        "Australia": "103",
        "Indonesia": "0",
        "Malaysia": "17",
        "New Zealand": "7",
        "Philippines": "5",
        "Singapore": "11",
        "Thailand": "10",
        "Vietnam": "1"
      },
      taskGroups: [
        {
          id: "assessing-changes",
          name: "Assessing changes (MRP/CAF/GRA)",
          metrics: [
            { id: "mrp-time-per-mrp", name: "MRPs: Time per MRP", unit: "hours per MRP" },
            { id: "mrp-time-per-pn", name: "MRPs: Time per PN", unit: "hours per PN" },
            { id: "minor-change-notification", name: "Minor Change Notification", unit: "hours per notification" },
            { id: "major-change-notification", name: "Major Change Notification", unit: "hours per notification" }
          ]
        },
        {
          id: "new-registrations",
          name: "New Registrations",
          metrics: [
            { id: "new-registration-per-pn", name: "New Registration per PN", unit: "hours per PN" },
            { id: "ha-queries-response", name: "Health Authority Queries Response", unit: "hours per query" }
          ]
        },
        {
          id: "renewals",
          name: "Renewals",
          metrics: [
            { id: "license-renewal", name: "License Renewal", unit: "hours per license" },
            { id: "monthly-surveillance", name: "Monthly Surveillance (RSR)", unit: "hours per report" }
          ]
        }
      ]
    }
  ]
};

export function seedDatabase() {
  // Check if database already has data
  const existingProjects = db.prepare('SELECT COUNT(*) as count FROM projects').get();
  
  if (existingProjects.count > 0) {
    console.log('Database already has data, skipping seed');
    return false;
  }

  console.log('Seeding database with initial data...');

  const insertProject = db.prepare(`
    INSERT INTO projects (id, name, countries, country_platforms)
    VALUES (?, ?, ?, ?)
  `);

  const insertTaskGroup = db.prepare(`
    INSERT INTO task_groups (id, project_id, name)
    VALUES (?, ?, ?)
  `);

  const insertMetric = db.prepare(`
    INSERT INTO metrics (id, task_group_id, name, unit)
    VALUES (?, ?, ?, ?)
  `);

  // Use a transaction for better performance
  const seedAll = db.transaction(() => {
    for (const project of initialData.projects) {
      // Insert project
      insertProject.run(
        project.id,
        project.name,
        JSON.stringify(project.countries),
        JSON.stringify(project.countryPlatforms)
      );

      // Insert task groups and metrics
      for (const taskGroup of project.taskGroups) {
        insertTaskGroup.run(taskGroup.id, project.id, taskGroup.name);

        for (const metric of taskGroup.metrics) {
          insertMetric.run(metric.id, taskGroup.id, metric.name, metric.unit);
        }
      }
    }
  });

  seedAll();
  console.log('Database seeded successfully!');
  return true;
}

// Run seed if this file is executed directly
if (process.argv[1].includes('seed.js')) {
  seedDatabase();
}

