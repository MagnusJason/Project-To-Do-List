// Todo Factory Function
// Creates todo items with all necessary properties

import { format, parseISO, isValid } from 'date-fns';

const Todo = (
  title,
  description = '',
  dueDate = null,
  priority = 'medium',
  notes = '',
  checklist = [],
  completed = false,
  id = null
) => {
  // Generate unique ID if not provided
  const todoId = id || `todo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Private state
  let _title = title;
  let _description = description;
  let _dueDate = dueDate;
  let _priority = priority; // 'low', 'medium', 'high', 'urgent'
  let _notes = notes;
  let _checklist = [...checklist]; // Array of { text: string, completed: boolean }
  let _completed = completed;

  // Getters
  const getId = () => todoId;
  const getTitle = () => _title;
  const getDescription = () => _description;
  const getDueDate = () => _dueDate;
  const getPriority = () => _priority;
  const getNotes = () => _notes;
  const getChecklist = () => [..._checklist];
  const isCompleted = () => _completed;

  // Setters
  const setTitle = (newTitle) => {
    if (newTitle && newTitle.trim()) {
      _title = newTitle.trim();
    }
  };

  const setDescription = (newDescription) => {
    _description = newDescription || '';
  };

  const setDueDate = (newDate) => {
    _dueDate = newDate;
  };

  const setPriority = (newPriority) => {
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (validPriorities.includes(newPriority)) {
      _priority = newPriority;
    }
  };

  const setNotes = (newNotes) => {
    _notes = newNotes || '';
  };

  const toggleComplete = () => {
    _completed = !_completed;
    return _completed;
  };

  const setCompleted = (status) => {
    _completed = Boolean(status);
  };

  // Checklist methods
  const addChecklistItem = (text) => {
    _checklist.push({ text, completed: false, id: `check-${Date.now()}` });
  };

  const toggleChecklistItem = (index) => {
    if (_checklist[index]) {
      _checklist[index].completed = !_checklist[index].completed;
    }
  };

  const removeChecklistItem = (index) => {
    if (index >= 0 && index < _checklist.length) {
      _checklist.splice(index, 1);
    }
  };

  // Format due date for display
  const getFormattedDueDate = () => {
    if (!_dueDate) return '';
    try {
      const date = typeof _dueDate === 'string' ? parseISO(_dueDate) : _dueDate;
      if (isValid(date)) {
        return format(date, 'MMM d, yyyy');
      }
    } catch (e) {
      return '';
    }
    return '';
  };

  // Check if overdue
  const isOverdue = () => {
    if (!_dueDate || _completed) return false;
    try {
      const date = typeof _dueDate === 'string' ? parseISO(_dueDate) : _dueDate;
      if (isValid(date)) {
        return date < new Date().setHours(0, 0, 0, 0);
      }
    } catch (e) {
      return false;
    }
    return false;
  };

  // Serialize for localStorage
  const toJSON = () => ({
    id: todoId,
    title: _title,
    description: _description,
    dueDate: _dueDate,
    priority: _priority,
    notes: _notes,
    checklist: _checklist,
    completed: _completed,
  });

  return {
    getId,
    getTitle,
    getDescription,
    getDueDate,
    getPriority,
    getNotes,
    getChecklist,
    isCompleted,
    setTitle,
    setDescription,
    setDueDate,
    setPriority,
    setNotes,
    toggleComplete,
    setCompleted,
    addChecklistItem,
    toggleChecklistItem,
    removeChecklistItem,
    getFormattedDueDate,
    isOverdue,
    toJSON,
  };
};

// Create Todo from JSON data (for localStorage retrieval)
const createTodoFromJSON = (data) => {
  return Todo(
    data.title,
    data.description,
    data.dueDate,
    data.priority,
    data.notes,
    data.checklist || [],
    data.completed,
    data.id
  );
};

export { Todo, createTodoFromJSON };

