# TaskFlow - Todo List Application

A modern, elegant todo list application built with vanilla JavaScript, webpack, and localStorage persistence.

## Features

- **Projects**: Organize your todos into separate projects
- **Todo Management**: Create, edit, delete, and mark todos as complete
- **Priority Levels**: Low, Medium, High, and Urgent priorities with visual indicators
- **Due Dates**: Set due dates with overdue highlighting using [date-fns](https://github.com/date-fns/date-fns)
- **Checklists**: Add checklist items within todos
- **Notes & Descriptions**: Add detailed descriptions and notes to todos
- **Data Persistence**: All data saved to localStorage automatically
- **Beautiful Dark Theme**: Modern "Midnight Garden" aesthetic

## Project Structure

```
src/
├── index.js                 # Main entry point
├── styles.css               # Application styles
├── template.html            # HTML template
└── modules/
    ├── Todo.js              # Todo factory function
    ├── Project.js           # Project factory function
    ├── AppController.js     # Application logic (separated from DOM)
    ├── Storage.js           # localStorage persistence
    └── DOM.js               # DOM manipulation and rendering
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Architecture

The application follows a clear separation of concerns:

### Data Layer (`Todo.js`, `Project.js`)
- Factory functions that create todo and project objects
- Encapsulated state with getter/setter methods
- JSON serialization for localStorage

### Business Logic (`AppController.js`)
- CRUD operations for projects and todos
- State management
- Auto-save to localStorage on changes

### Persistence (`Storage.js`)
- Handles localStorage read/write
- Graceful error handling
- Data validation

### Presentation (`DOM.js`, `styles.css`)
- Renders UI components
- Event handling
- User interactions

## Usage

### Projects
- Click "New Project" to create a new project
- Click on a project name to view its todos
- Hover over a project to edit or delete it

### Todos
- Click "Add Task" to create a new todo
- Click the checkbox to mark as complete
- Click the expand button (▼) to view/edit details
- Drag or select a different project to move todos

### Todo Details
- Edit title, description, due date, priority
- Add notes and checklist items
- Move todo to a different project

## Technologies

- **Vanilla JavaScript** (ES6+ modules)
- **Webpack 5** (bundling)
- **date-fns** (date formatting and manipulation)
- **CSS Custom Properties** (theming)
- **localStorage** (data persistence)

## Browser Support

Modern browsers with ES6+ support and localStorage.

## License

MIT

