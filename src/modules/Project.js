// Project Factory Function
// Creates projects that contain todo items

import { Todo, createTodoFromJSON } from './Todo';

const Project = (name, id = null, todos = []) => {
  // Generate unique ID if not provided
  const projectId = id || `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Private state
  let _name = name;
  let _todos = [...todos];

  // Getters
  const getId = () => projectId;
  const getName = () => _name;
  const getTodos = () => [..._todos];
  const getTodoCount = () => _todos.length;
  const getCompletedCount = () => _todos.filter(todo => todo.isCompleted()).length;
  const getPendingCount = () => _todos.filter(todo => !todo.isCompleted()).length;

  // Setters
  const setName = (newName) => {
    if (newName && newName.trim()) {
      _name = newName.trim();
    }
  };

  // Todo management
  const addTodo = (todo) => {
    _todos.push(todo);
  };

  const removeTodo = (todoId) => {
    const index = _todos.findIndex(todo => todo.getId() === todoId);
    if (index !== -1) {
      _todos.splice(index, 1);
      return true;
    }
    return false;
  };

  const getTodoById = (todoId) => {
    return _todos.find(todo => todo.getId() === todoId) || null;
  };

  const updateTodo = (todoId, updates) => {
    const todo = getTodoById(todoId);
    if (todo) {
      if (updates.title !== undefined) todo.setTitle(updates.title);
      if (updates.description !== undefined) todo.setDescription(updates.description);
      if (updates.dueDate !== undefined) todo.setDueDate(updates.dueDate);
      if (updates.priority !== undefined) todo.setPriority(updates.priority);
      if (updates.notes !== undefined) todo.setNotes(updates.notes);
      if (updates.completed !== undefined) todo.setCompleted(updates.completed);
      return true;
    }
    return false;
  };

  // Sorting methods
  const sortByDueDate = () => {
    _todos.sort((a, b) => {
      if (!a.getDueDate()) return 1;
      if (!b.getDueDate()) return -1;
      return new Date(a.getDueDate()) - new Date(b.getDueDate());
    });
  };

  const sortByPriority = () => {
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    _todos.sort((a, b) => priorityOrder[a.getPriority()] - priorityOrder[b.getPriority()]);
  };

  // Serialize for localStorage
  const toJSON = () => ({
    id: projectId,
    name: _name,
    todos: _todos.map(todo => todo.toJSON()),
  });

  return {
    getId,
    getName,
    getTodos,
    getTodoCount,
    getCompletedCount,
    getPendingCount,
    setName,
    addTodo,
    removeTodo,
    getTodoById,
    updateTodo,
    sortByDueDate,
    sortByPriority,
    toJSON,
  };
};

// Create Project from JSON data (for localStorage retrieval)
const createProjectFromJSON = (data) => {
  const todos = (data.todos || []).map(todoData => createTodoFromJSON(todoData));
  return Project(data.name, data.id, todos);
};

export { Project, createProjectFromJSON };

