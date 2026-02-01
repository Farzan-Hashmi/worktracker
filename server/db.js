import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use environment variable for production, local file for development
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'worktracker.db');

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
function initializeDatabase() {
  // Projects table
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      countries TEXT DEFAULT '[]',
      country_platforms TEXT DEFAULT '{}'
    )
  `);

  // Task groups table
  db.exec(`
    CREATE TABLE IF NOT EXISTS task_groups (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      name TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )
  `);

  // Metrics table
  db.exec(`
    CREATE TABLE IF NOT EXISTS metrics (
      id TEXT PRIMARY KEY,
      task_group_id TEXT NOT NULL,
      name TEXT NOT NULL,
      unit TEXT DEFAULT 'hours',
      FOREIGN KEY (task_group_id) REFERENCES task_groups(id) ON DELETE CASCADE
    )
  `);

  // Employees table
  db.exec(`
    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT DEFAULT '',
      default_project_id TEXT DEFAULT '',
      assigned_countries TEXT DEFAULT '[]',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migration: Add missing columns to existing employees table
  try {
    db.exec(`ALTER TABLE employees ADD COLUMN default_project_id TEXT DEFAULT ''`);
  } catch (e) {
    // Column already exists, ignore
  }
  try {
    db.exec(`ALTER TABLE employees ADD COLUMN assigned_countries TEXT DEFAULT '[]'`);
  } catch (e) {
    // Column already exists, ignore
  }

  // Capacity table
  db.exec(`
    CREATE TABLE IF NOT EXISTS capacity (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id TEXT NOT NULL,
      project_id TEXT NOT NULL,
      country TEXT NOT NULL,
      task_group_id TEXT NOT NULL,
      metric_id TEXT NOT NULL,
      time_per_unit REAL DEFAULT 0,
      count REAL DEFAULT 0,
      total REAL DEFAULT 0,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(employee_id, project_id, country, task_group_id, metric_id),
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (task_group_id) REFERENCES task_groups(id) ON DELETE CASCADE,
      FOREIGN KEY (metric_id) REFERENCES metrics(id) ON DELETE CASCADE
    )
  `);

  console.log('Database initialized successfully');
}

// Initialize on import
initializeDatabase();

export default db;
