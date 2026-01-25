# Work Tracker - Enhanced Project Capacity Manager

A comprehensive React-based application for tracking project capacity and employee workload with advanced features including task groups, triple-column metrics (Time per Unit × Count = Total), and platform tracking per country.

## Features

- **Advanced Project Management**: Create projects with task groups (e.g., "Assessing Changes", "New Registrations", "Renewals")
- **Dynamic Metrics**: Each task group can have multiple metrics with customizable units
- **Triple-Column Pattern**: Track Time/Unit, Count, and auto-calculated Totals for each metric
- **Platform Tracking**: Configure platform information per country (e.g., "X, Xi, SP, Ion")
- **Employee Management**: Add and manage employees with their contact information
- **Comprehensive Capacity Tracking**: Spreadsheet-like interface with grouped columns
- **Auto-calculations**: Automatic totals by task group, country, and overall
- **Data Persistence**: SQLite database with Express backend
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js (v18.0.0 or higher, v20.19+ recommended)
- npm (v10.8.2 or higher)

### Installation

1. Navigate to the project directory:
```bash
cd worktracker
```

2. Install dependencies:
```bash
npm install
```

3. Start both frontend and backend development servers:
```bash
npm run dev:all
```

Or start them separately:
```bash
# Terminal 1 - Backend server (port 3001)
npm run dev:server

# Terminal 2 - Frontend dev server (port 5173)
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:5173
```

## Deployment

### Deploy to Railway

1. Push your code to GitHub

2. Go to [Railway](https://railway.app) and create a new project

3. Select "Deploy from GitHub repo" and connect your repository

4. Railway will automatically:
   - Detect the Node.js application
   - Install dependencies
   - Build the frontend
   - Start the server

5. Add a volume for persistent SQLite storage (optional but recommended):
   - Go to your service settings
   - Add a volume mounted at `/app/server`
   - Set `DATABASE_PATH=/app/server/worktracker.db` environment variable

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `DATABASE_PATH` | SQLite database file path | `./server/worktracker.db` |

### Manual Deployment

1. Build the frontend:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

The server will serve the built frontend and handle API requests on the same port.

## Usage Guide

### 1. Setting Up Projects

1. Navigate to the **Projects** tab
2. Click **+ New Project** button
3. Enter project details:
   - **Project name** (e.g., "Regulatory Activities 2025")
   - **Countries** - Add countries and configure their platforms
     - Enter country name
     - Set platform (e.g., "X, Xi, SP, Ion")
   - **Task Groups** - Create groups of related activities
     - Click "+ Add Task Group"
     - Enter task group name (e.g., "Assessing changes (MRP/CAF/GRA)")
     - Add metrics to the task group:
       - Metric name (e.g., "MRPs: Time per MRP")
       - Unit (e.g., "hours per MRP")
4. Click **Create Project**

#### Example Project Structure:
```
Project: Regulatory Activities 2025
├── Countries:
│   ├── Israel (Platform: X, Xi, SP, Ion)
│   ├── Kuwait (Platform: 2 Xi)
│   └── ...
└── Task Groups:
    ├── Assessing changes (MRP/CAF/GRA)
    │   ├── MRPs: Time per MRP (hours per MRP)
    │   ├── Minor Change Notification (hours per notification)
    │   └── Major Change Notification (hours per notification)
    ├── New Registrations
    │   ├── New Registration per PN (hours per PN)
    │   └── Health Authority Queries (hours per query)
    └── Renewals
        ├── License Renewal (hours per license)
        └── Monthly Surveillance (hours per report)
```

### 2. Adding Employees

1. Navigate to the **Employees** tab
2. Click **+ New Employee** button
3. Enter employee information:
   - Name (required)
   - Email (optional)
4. Click **Add Employee**

### 3. Tracking Capacity (Triple-Column Pattern)

1. Navigate to the **Capacity Tracker** tab
2. Select an employee from the dropdown
3. Select a project from the dropdown
4. The spreadsheet displays:
   - **Country column**: List of all countries
   - **Platform column**: Platform for each country
   - **Task Group sections**: Each task group has its metrics
   - **Triple columns per metric**:
     - **Time/Unit**: Hours per unit (e.g., hours per MRP)
     - **Count**: Number of units (e.g., number of MRPs)
     - **Total**: Auto-calculated (Time × Count)

5. Enter data:
   - Input time per unit in the first column
   - Input count in the second column
   - Total automatically calculates
6. View totals:
   - **Country Total**: Sum of all totals for that country
   - **Task Group Total**: Sum of all metrics in that task group
   - **Grand Total**: Overall total hours for the employee on this project

Data is automatically saved as you type!

## Project Structure

```
worktracker/
├── server/                         # Backend server
│   ├── index.js                    # Express server entry point
│   ├── db.js                       # SQLite database setup
│   └── routes/
│       ├── projects.js             # Project API routes
│       ├── employees.js            # Employee API routes
│       └── capacity.js             # Capacity API routes
├── src/                            # Frontend React app
│   ├── components/
│   │   ├── ProjectManager.jsx      # Project CRUD operations
│   │   ├── ProjectForm.jsx         # Form to add/edit projects
│   │   ├── ProjectList.jsx         # Display project cards
│   │   ├── TaskGroupForm.jsx       # Form to add/edit task groups
│   │   ├── EmployeeManager.jsx     # Employee management
│   │   ├── EmployeeForm.jsx        # Form to add employees
│   │   ├── EmployeeList.jsx        # Display employee table
│   │   ├── CapacityTracker.jsx     # Main capacity tracking view
│   │   └── CapacitySheet.jsx       # Spreadsheet with grouped metrics
│   ├── services/
│   │   └── dataService.js          # API client for data operations
│   ├── App.jsx                     # Main application component
│   ├── App.css                     # Application styles
│   ├── index.css                   # Global styles
│   └── main.jsx                    # Application entry point
├── public/
│   └── data/                       # Initial seed data (JSON)
├── package.json
├── vite.config.js
└── railway.json                    # Railway deployment config
```

## API Endpoints

### Projects
- `GET /api/projects` - List all projects
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Task Groups
- `POST /api/projects/:projectId/task-groups` - Create task group
- `PUT /api/projects/task-groups/:id` - Update task group
- `DELETE /api/projects/task-groups/:id` - Delete task group

### Metrics
- `POST /api/projects/task-groups/:taskGroupId/metrics` - Create metric
- `PUT /api/projects/metrics/:id` - Update metric
- `DELETE /api/projects/metrics/:id` - Delete metric

### Employees
- `GET /api/employees` - List all employees
- `GET /api/employees/:id` - Get single employee
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Capacity
- `GET /api/capacity` - List capacity entries (with optional filters)
- `GET /api/capacity/entry` - Get single capacity entry
- `POST /api/capacity` - Create/update capacity entry

## Available Scripts

- `npm run dev` - Start frontend development server only
- `npm run dev:server` - Start backend server only (with auto-reload)
- `npm run dev:all` - Start both frontend and backend concurrently
- `npm run build` - Build frontend for production
- `npm start` - Start production server (serves built frontend)
- `npm run lint` - Run ESLint

## Technology Stack

- **Frontend**: React 19, Vite 7
- **Backend**: Express.js 4
- **Database**: SQLite (via better-sqlite3)
- **Styling**: CSS3 with responsive design

## Database Schema

### Tables
- `projects` - Project information
- `task_groups` - Task groups linked to projects
- `metrics` - Metrics linked to task groups
- `employees` - Employee information
- `capacity` - Capacity entries (time tracking data)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Tips

1. **Start with Projects**: Set up your projects with task groups and metrics first
2. **Configure Platforms**: Add platform information for each country
3. **Add Employees**: Create employee records before tracking capacity
4. **Use Tab Key**: Navigate between input fields efficiently
5. **Watch Auto-Totals**: Totals update automatically as you enter data

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is for internal use.
