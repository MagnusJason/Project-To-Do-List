// App Controller Module
// Handles all application logic, separated from DOM manipulation

import { Project } from './Project';
import { Todo } from './Todo';
import Storage from './Storage';

const AppController = (() => {
  let _projects = [];
  let _activeProjectId = null;
  let _onChangeCallback = null;

  // Initialize the app
  const init = () => {
    const savedProjects = Storage.loadProjects();
    
    if (savedProjects && savedProjects.length > 0) {
      _projects = savedProjects;
      _activeProjectId = _projects[0].getId();
    } else {
      // Create default project if no saved data
      const defaultProject = Project('Inbox');
      _projects.push(defaultProject);
      _activeProjectId = defaultProject.getId();
      _save();
    }
  };

  // Register callback for changes
  const onChange = (callback) => {
    _onChangeCallback = callback;
  };

  // Notify about changes
  const _notifyChange = () => {
    if (_onChangeCallback) {
      _onChangeCallback();
    }
  };

  // Save current state
  const _save = () => {
    Storage.saveProjects(_projects);
  };

  // === Project Operations ===

  const getProjects = () => [..._projects];

  const getActiveProject = () => {
    return _projects.find(p => p.getId() === _activeProjectId) || _projects[0];
  };

  const getActiveProjectId = () => _activeProjectId;

  const setActiveProject = (projectId) => {
    const project = _projects.find(p => p.getId() === projectId);
    if (project) {
      _activeProjectId = projectId;
      _notifyChange();
      return true;
    }
    return false;
  };

  const getProjectById = (projectId) => {
    return _projects.find(p => p.getId() === projectId) || null;
  };

  const addProject = (name) => {
    if (!name || !name.trim()) return null;
    
    const project = Project(name.trim());
    _projects.push(project);
    _activeProjectId = project.getId();
    _save();
    _notifyChange();
    return project;
  };

  const updateProject = (projectId, newName) => {
    const project = getProjectById(projectId);
    if (project && newName && newName.trim()) {
      project.setName(newName.trim());
      _save();
      _notifyChange();
      return true;
    }
    return false;
  };

  const deleteProject = (projectId) => {
    // Don't delete if it's the only project
    if (_projects.length <= 1) return false;
    
    const index = _projects.findIndex(p => p.getId() === projectId);
    if (index !== -1) {
      _projects.splice(index, 1);
      
      // If deleted project was active, switch to first project
      if (_activeProjectId === projectId) {
        _activeProjectId = _projects[0].getId();
      }
      
      _save();
      _notifyChange();
      return true;
    }
    return false;
  };

  // === Todo Operations ===

  const addTodo = (projectId, todoData) => {
    const project = getProjectById(projectId);
    if (!project) return null;

    const todo = Todo(
      todoData.title,
      todoData.description || '',
      todoData.dueDate || null,
      todoData.priority || 'medium',
      todoData.notes || '',
      todoData.checklist || []
    );

    project.addTodo(todo);
    _save();
    _notifyChange();
    return todo;
  };

  const updateTodo = (projectId, todoId, updates) => {
    const project = getProjectById(projectId);
    if (!project) return false;

    const success = project.updateTodo(todoId, updates);
    if (success) {
      _save();
      _notifyChange();
    }
    return success;
  };

  const deleteTodo = (projectId, todoId) => {
    const project = getProjectById(projectId);
    if (!project) return false;

    const success = project.removeTodo(todoId);
    if (success) {
      _save();
      _notifyChange();
    }
    return success;
  };

  const toggleTodoComplete = (projectId, todoId) => {
    const project = getProjectById(projectId);
    if (!project) return false;

    const todo = project.getTodoById(todoId);
    if (todo) {
      todo.toggleComplete();
      _save();
      _notifyChange();
      return true;
    }
    return false;
  };

  const getTodoById = (projectId, todoId) => {
    const project = getProjectById(projectId);
    if (!project) return null;
    return project.getTodoById(todoId);
  };

  // Move todo to different project
  const moveTodo = (fromProjectId, toProjectId, todoId) => {
    const fromProject = getProjectById(fromProjectId);
    const toProject = getProjectById(toProjectId);
    
    if (!fromProject || !toProject) return false;
    
    const todo = fromProject.getTodoById(todoId);
    if (!todo) return false;

    // Create new todo in target project with same data
    const todoData = todo.toJSON();
    const newTodo = Todo(
      todoData.title,
      todoData.description,
      todoData.dueDate,
      todoData.priority,
      todoData.notes,
      todoData.checklist,
      todoData.completed
    );

    toProject.addTodo(newTodo);
    fromProject.removeTodo(todoId);
    
    _save();
    _notifyChange();
    return true;
  };

  // === Checklist Operations ===

  const addChecklistItem = (projectId, todoId, text) => {
    const todo = getTodoById(projectId, todoId);
    if (todo && text && text.trim()) {
      todo.addChecklistItem(text.trim());
      _save();
      _notifyChange();
      return true;
    }
    return false;
  };

  const toggleChecklistItem = (projectId, todoId, index) => {
    const todo = getTodoById(projectId, todoId);
    if (todo) {
      todo.toggleChecklistItem(index);
      _save();
      _notifyChange();
      return true;
    }
    return false;
  };

  const removeChecklistItem = (projectId, todoId, index) => {
    const todo = getTodoById(projectId, todoId);
    if (todo) {
      todo.removeChecklistItem(index);
      _save();
      _notifyChange();
      return true;
    }
    return false;
  };

  // === Statistics ===

  const getStats = () => {
    let totalTodos = 0;
    let completedTodos = 0;
    let overdueTodos = 0;

    _projects.forEach(project => {
      project.getTodos().forEach(todo => {
        totalTodos++;
        if (todo.isCompleted()) completedTodos++;
        if (todo.isOverdue()) overdueTodos++;
      });
    });

    return {
      totalProjects: _projects.length,
      totalTodos,
      completedTodos,
      pendingTodos: totalTodos - completedTodos,
      overdueTodos,
    };
  };

  return {
    init,
    onChange,
    getProjects,
    getActiveProject,
    getActiveProjectId,
    setActiveProject,
    getProjectById,
    addProject,
    updateProject,
    deleteProject,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodoComplete,
    getTodoById,
    moveTodo,
    addChecklistItem,
    toggleChecklistItem,
    removeChecklistItem,
    getStats,
  };
})();

export default AppController;

