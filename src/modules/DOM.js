// DOM Module
// Handles all DOM manipulation and UI rendering

import AppController from './AppController';
import { format } from 'date-fns';

const DOM = (() => {
  let _expandedTodoId = null;
  let _editingProjectId = null;

  // Priority colors and labels
  const priorityConfig = {
    low: { label: 'Low', class: 'priority-low' },
    medium: { label: 'Medium', class: 'priority-medium' },
    high: { label: 'High', class: 'priority-high' },
    urgent: { label: 'Urgent', class: 'priority-urgent' },
  };

  // === Main Render ===

  const render = () => {
    const app = document.getElementById('app');
    app.innerHTML = '';
    app.appendChild(createLayout());
    attachEventListeners();
  };

  const createLayout = () => {
    const layout = document.createElement('div');
    layout.className = 'app-layout';

    layout.appendChild(createSidebar());
    layout.appendChild(createMainContent());
    layout.appendChild(createModal());

    return layout;
  };

  // === Sidebar ===

  const createSidebar = () => {
    const sidebar = document.createElement('aside');
    sidebar.className = 'sidebar';

    // Logo/Header
    const header = document.createElement('div');
    header.className = 'sidebar-header';
    header.innerHTML = `
      <div class="logo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 11l3 3L22 4"></path>
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
        </svg>
        <h1>TaskFlow</h1>
      </div>
    `;
    sidebar.appendChild(header);

    // Stats
    const stats = AppController.getStats();
    const statsSection = document.createElement('div');
    statsSection.className = 'sidebar-stats';
    statsSection.innerHTML = `
      <div class="stat">
        <span class="stat-number">${stats.pendingTodos}</span>
        <span class="stat-label">Pending</span>
      </div>
      <div class="stat">
        <span class="stat-number">${stats.completedTodos}</span>
        <span class="stat-label">Done</span>
      </div>
      <div class="stat stat-overdue ${stats.overdueTodos > 0 ? 'has-overdue' : ''}">
        <span class="stat-number">${stats.overdueTodos}</span>
        <span class="stat-label">Overdue</span>
      </div>
    `;
    sidebar.appendChild(statsSection);

    // Projects section
    const projectsSection = document.createElement('div');
    projectsSection.className = 'sidebar-section';
    projectsSection.innerHTML = `<h2 class="section-title">Projects</h2>`;

    const projectsList = document.createElement('ul');
    projectsList.className = 'projects-list';

    const projects = AppController.getProjects();
    const activeId = AppController.getActiveProjectId();

    projects.forEach(project => {
      const li = document.createElement('li');
      li.className = `project-item ${project.getId() === activeId ? 'active' : ''}`;
      li.dataset.projectId = project.getId();

      if (_editingProjectId === project.getId()) {
        li.innerHTML = `
          <input type="text" class="project-edit-input" value="${escapeHtml(project.getName())}" autofocus>
          <div class="project-edit-actions">
            <button class="btn-save-project" title="Save">✓</button>
            <button class="btn-cancel-edit" title="Cancel">✕</button>
          </div>
        `;
      } else {
        li.innerHTML = `
          <span class="project-icon">📁</span>
          <span class="project-name">${escapeHtml(project.getName())}</span>
          <span class="project-count">${project.getTodoCount()}</span>
          <div class="project-actions">
            <button class="btn-edit-project" title="Edit">✎</button>
            ${projects.length > 1 ? '<button class="btn-delete-project" title="Delete">🗑</button>' : ''}
          </div>
        `;
      }

      projectsList.appendChild(li);
    });

    projectsSection.appendChild(projectsList);

    // Add project button
    const addProjectBtn = document.createElement('button');
    addProjectBtn.className = 'btn-add-project';
    addProjectBtn.innerHTML = `
      <span class="plus-icon">+</span>
      <span>New Project</span>
    `;
    projectsSection.appendChild(addProjectBtn);

    sidebar.appendChild(projectsSection);

    return sidebar;
  };

  // === Main Content ===

  const createMainContent = () => {
    const main = document.createElement('main');
    main.className = 'main-content';

    const project = AppController.getActiveProject();
    if (!project) return main;

    // Header
    const header = document.createElement('div');
    header.className = 'content-header';
    header.innerHTML = `
      <div class="header-info">
        <h2 class="project-title">${escapeHtml(project.getName())}</h2>
        <span class="todo-count">${project.getPendingCount()} tasks remaining</span>
      </div>
      <button class="btn-add-todo">
        <span>+</span> Add Task
      </button>
    `;
    main.appendChild(header);

    // Todos list
    const todosContainer = document.createElement('div');
    todosContainer.className = 'todos-container';

    const todos = project.getTodos();
    
    if (todos.length === 0) {
      todosContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">✨</div>
          <h3>No tasks yet</h3>
          <p>Add your first task to get started!</p>
        </div>
      `;
    } else {
      // Separate incomplete and complete todos
      const incompleteTodos = todos.filter(t => !t.isCompleted());
      const completeTodos = todos.filter(t => t.isCompleted());

      if (incompleteTodos.length > 0) {
        const activeSection = document.createElement('div');
        activeSection.className = 'todos-section';
        incompleteTodos.forEach(todo => {
          activeSection.appendChild(createTodoCard(todo, project.getId()));
        });
        todosContainer.appendChild(activeSection);
      }

      if (completeTodos.length > 0) {
        const completedSection = document.createElement('div');
        completedSection.className = 'todos-section completed-section';
        completedSection.innerHTML = `
          <div class="section-header">
            <span class="completed-label">Completed (${completeTodos.length})</span>
          </div>
        `;
        completeTodos.forEach(todo => {
          completedSection.appendChild(createTodoCard(todo, project.getId()));
        });
        todosContainer.appendChild(completedSection);
      }
    }

    main.appendChild(todosContainer);

    return main;
  };

  // === Todo Card ===

  const createTodoCard = (todo, projectId) => {
    const isExpanded = _expandedTodoId === todo.getId();
    const card = document.createElement('div');
    card.className = `todo-card ${priorityConfig[todo.getPriority()].class} ${todo.isCompleted() ? 'completed' : ''} ${todo.isOverdue() ? 'overdue' : ''} ${isExpanded ? 'expanded' : ''}`;
    card.dataset.todoId = todo.getId();
    card.dataset.projectId = projectId;

    // Main content row
    const mainRow = document.createElement('div');
    mainRow.className = 'todo-main';
    mainRow.innerHTML = `
      <label class="checkbox-container">
        <input type="checkbox" class="todo-checkbox" ${todo.isCompleted() ? 'checked' : ''}>
        <span class="checkmark"></span>
      </label>
      <div class="todo-info">
        <span class="todo-title">${escapeHtml(todo.getTitle())}</span>
        <div class="todo-meta">
          ${todo.getFormattedDueDate() ? `<span class="todo-date ${todo.isOverdue() ? 'overdue' : ''}">${todo.getFormattedDueDate()}</span>` : ''}
          <span class="todo-priority-badge">${priorityConfig[todo.getPriority()].label}</span>
        </div>
      </div>
      <div class="todo-actions">
        <button class="btn-expand" title="${isExpanded ? 'Collapse' : 'Expand'}">
          ${isExpanded ? '▲' : '▼'}
        </button>
        <button class="btn-delete-todo" title="Delete">🗑</button>
      </div>
    `;
    card.appendChild(mainRow);

    // Expanded details
    if (isExpanded) {
      const details = document.createElement('div');
      details.className = 'todo-details';
      
      const projects = AppController.getProjects();
      const projectOptions = projects.map(p => 
        `<option value="${p.getId()}" ${p.getId() === projectId ? 'selected' : ''}>${escapeHtml(p.getName())}</option>`
      ).join('');

      details.innerHTML = `
        <div class="detail-group">
          <label>Title</label>
          <input type="text" class="detail-title" value="${escapeHtml(todo.getTitle())}">
        </div>
        <div class="detail-group">
          <label>Description</label>
          <textarea class="detail-description" rows="3" placeholder="Add a description...">${escapeHtml(todo.getDescription())}</textarea>
        </div>
        <div class="detail-row">
          <div class="detail-group">
            <label>Due Date</label>
            <input type="date" class="detail-date" value="${todo.getDueDate() || ''}">
          </div>
          <div class="detail-group">
            <label>Priority</label>
            <select class="detail-priority">
              <option value="low" ${todo.getPriority() === 'low' ? 'selected' : ''}>Low</option>
              <option value="medium" ${todo.getPriority() === 'medium' ? 'selected' : ''}>Medium</option>
              <option value="high" ${todo.getPriority() === 'high' ? 'selected' : ''}>High</option>
              <option value="urgent" ${todo.getPriority() === 'urgent' ? 'selected' : ''}>Urgent</option>
            </select>
          </div>
          <div class="detail-group">
            <label>Project</label>
            <select class="detail-project">
              ${projectOptions}
            </select>
          </div>
        </div>
        <div class="detail-group">
          <label>Notes</label>
          <textarea class="detail-notes" rows="2" placeholder="Add notes...">${escapeHtml(todo.getNotes())}</textarea>
        </div>
        <div class="detail-group">
          <label>Checklist</label>
          <div class="checklist">
            ${todo.getChecklist().map((item, index) => `
              <div class="checklist-item" data-index="${index}">
                <label class="checkbox-container small">
                  <input type="checkbox" class="checklist-checkbox" ${item.completed ? 'checked' : ''}>
                  <span class="checkmark"></span>
                </label>
                <span class="checklist-text ${item.completed ? 'completed' : ''}">${escapeHtml(item.text)}</span>
                <button class="btn-remove-checklist">✕</button>
              </div>
            `).join('')}
            <div class="add-checklist-item">
              <input type="text" class="checklist-input" placeholder="Add item...">
              <button class="btn-add-checklist">+</button>
            </div>
          </div>
        </div>
        <div class="detail-actions">
          <button class="btn-save-todo">Save Changes</button>
        </div>
      `;
      card.appendChild(details);
    }

    return card;
  };

  // === Modal ===

  const createModal = () => {
    const modal = document.createElement('div');
    modal.className = 'modal hidden';
    modal.id = 'modal';
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Add New Task</h3>
          <button class="modal-close">✕</button>
        </div>
        <form class="modal-form" id="todo-form">
          <div class="form-group">
            <label for="todo-title">Title *</label>
            <input type="text" id="todo-title" name="title" required placeholder="What needs to be done?">
          </div>
          <div class="form-group">
            <label for="todo-description">Description</label>
            <textarea id="todo-description" name="description" rows="3" placeholder="Add more details..."></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="todo-date">Due Date</label>
              <input type="date" id="todo-date" name="dueDate">
            </div>
            <div class="form-group">
              <label for="todo-priority">Priority</label>
              <select id="todo-priority" name="priority">
                <option value="low">Low</option>
                <option value="medium" selected>Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label for="todo-notes">Notes</label>
            <textarea id="todo-notes" name="notes" rows="2" placeholder="Any additional notes..."></textarea>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-cancel">Cancel</button>
            <button type="submit" class="btn-submit">Add Task</button>
          </div>
        </form>
      </div>
    `;
    return modal;
  };

  // === Event Listeners ===

  const attachEventListeners = () => {
    const app = document.getElementById('app');

    // Project selection
    app.addEventListener('click', (e) => {
      const projectItem = e.target.closest('.project-item');
      if (projectItem && !e.target.closest('.project-actions') && !e.target.closest('.project-edit-actions')) {
        const projectId = projectItem.dataset.projectId;
        _expandedTodoId = null;
        AppController.setActiveProject(projectId);
      }
    });

    // Edit project name
    app.addEventListener('click', (e) => {
      if (e.target.closest('.btn-edit-project')) {
        const projectItem = e.target.closest('.project-item');
        _editingProjectId = projectItem.dataset.projectId;
        render();
        const input = document.querySelector('.project-edit-input');
        if (input) {
          input.focus();
          input.select();
        }
      }
    });

    // Save project name
    app.addEventListener('click', (e) => {
      if (e.target.closest('.btn-save-project')) {
        const input = document.querySelector('.project-edit-input');
        if (input && input.value.trim()) {
          AppController.updateProject(_editingProjectId, input.value.trim());
        }
        _editingProjectId = null;
        render();
      }
    });

    // Cancel project edit
    app.addEventListener('click', (e) => {
      if (e.target.closest('.btn-cancel-edit')) {
        _editingProjectId = null;
        render();
      }
    });

    // Handle Enter key for project edit
    app.addEventListener('keydown', (e) => {
      if (e.target.classList.contains('project-edit-input')) {
        if (e.key === 'Enter') {
          e.preventDefault();
          const saveBtn = document.querySelector('.btn-save-project');
          if (saveBtn) saveBtn.click();
        } else if (e.key === 'Escape') {
          _editingProjectId = null;
          render();
        }
      }
    });

    // Delete project
    app.addEventListener('click', (e) => {
      if (e.target.closest('.btn-delete-project')) {
        const projectItem = e.target.closest('.project-item');
        const projectId = projectItem.dataset.projectId;
        if (confirm('Delete this project and all its tasks?')) {
          AppController.deleteProject(projectId);
        }
      }
    });

    // Add project
    app.addEventListener('click', (e) => {
      if (e.target.closest('.btn-add-project')) {
        const name = prompt('Enter project name:');
        if (name && name.trim()) {
          AppController.addProject(name.trim());
        }
      }
    });

    // Add todo button
    app.addEventListener('click', (e) => {
      if (e.target.closest('.btn-add-todo')) {
        showModal();
      }
    });

    // Modal close
    app.addEventListener('click', (e) => {
      if (e.target.closest('.modal-close') || e.target.closest('.modal-backdrop') || e.target.closest('.btn-cancel')) {
        hideModal();
      }
    });

    // Form submit
    const form = document.getElementById('todo-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const todoData = {
          title: formData.get('title'),
          description: formData.get('description'),
          dueDate: formData.get('dueDate') || null,
          priority: formData.get('priority'),
          notes: formData.get('notes'),
        };
        const projectId = AppController.getActiveProjectId();
        AppController.addTodo(projectId, todoData);
        hideModal();
        form.reset();
      });
    }

    // Toggle todo complete
    app.addEventListener('change', (e) => {
      if (e.target.classList.contains('todo-checkbox')) {
        const card = e.target.closest('.todo-card');
        const todoId = card.dataset.todoId;
        const projectId = card.dataset.projectId;
        AppController.toggleTodoComplete(projectId, todoId);
      }
    });

    // Expand/collapse todo
    app.addEventListener('click', (e) => {
      if (e.target.closest('.btn-expand')) {
        const card = e.target.closest('.todo-card');
        const todoId = card.dataset.todoId;
        _expandedTodoId = _expandedTodoId === todoId ? null : todoId;
        render();
      }
    });

    // Delete todo
    app.addEventListener('click', (e) => {
      if (e.target.closest('.btn-delete-todo')) {
        const card = e.target.closest('.todo-card');
        const todoId = card.dataset.todoId;
        const projectId = card.dataset.projectId;
        AppController.deleteTodo(projectId, todoId);
      }
    });

    // Save todo changes
    app.addEventListener('click', (e) => {
      if (e.target.closest('.btn-save-todo')) {
        const card = e.target.closest('.todo-card');
        const todoId = card.dataset.todoId;
        const projectId = card.dataset.projectId;

        const updates = {
          title: card.querySelector('.detail-title').value,
          description: card.querySelector('.detail-description').value,
          dueDate: card.querySelector('.detail-date').value || null,
          priority: card.querySelector('.detail-priority').value,
          notes: card.querySelector('.detail-notes').value,
        };

        const newProjectId = card.querySelector('.detail-project').value;

        if (newProjectId !== projectId) {
          // Move to different project
          AppController.moveTodo(projectId, newProjectId, todoId);
        } else {
          AppController.updateTodo(projectId, todoId, updates);
        }

        _expandedTodoId = null;
      }
    });

    // Checklist checkbox
    app.addEventListener('change', (e) => {
      if (e.target.classList.contains('checklist-checkbox')) {
        const card = e.target.closest('.todo-card');
        const item = e.target.closest('.checklist-item');
        const todoId = card.dataset.todoId;
        const projectId = card.dataset.projectId;
        const index = parseInt(item.dataset.index);
        AppController.toggleChecklistItem(projectId, todoId, index);
      }
    });

    // Add checklist item
    app.addEventListener('click', (e) => {
      if (e.target.closest('.btn-add-checklist')) {
        const card = e.target.closest('.todo-card');
        const input = card.querySelector('.checklist-input');
        if (input && input.value.trim()) {
          const todoId = card.dataset.todoId;
          const projectId = card.dataset.projectId;
          AppController.addChecklistItem(projectId, todoId, input.value.trim());
        }
      }
    });

    // Handle Enter for checklist input
    app.addEventListener('keydown', (e) => {
      if (e.target.classList.contains('checklist-input') && e.key === 'Enter') {
        e.preventDefault();
        const btn = e.target.closest('.add-checklist-item').querySelector('.btn-add-checklist');
        if (btn) btn.click();
      }
    });

    // Remove checklist item
    app.addEventListener('click', (e) => {
      if (e.target.closest('.btn-remove-checklist')) {
        const card = e.target.closest('.todo-card');
        const item = e.target.closest('.checklist-item');
        const todoId = card.dataset.todoId;
        const projectId = card.dataset.projectId;
        const index = parseInt(item.dataset.index);
        AppController.removeChecklistItem(projectId, todoId, index);
      }
    });
  };

  // === Modal Helpers ===

  const showModal = () => {
    const modal = document.getElementById('modal');
    if (modal) {
      modal.classList.remove('hidden');
      const titleInput = document.getElementById('todo-title');
      if (titleInput) titleInput.focus();
    }
  };

  const hideModal = () => {
    const modal = document.getElementById('modal');
    if (modal) {
      modal.classList.add('hidden');
    }
  };

  // === Utility ===

  const escapeHtml = (text) => {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  return {
    render,
    showModal,
    hideModal,
  };
})();

export default DOM;

