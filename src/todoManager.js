import { supabase } from './supabase.js';

export class TodoManager {
  constructor() {
    this.todos = [];
    this.currentFilter = 'all';
    this.currentCategory = 'all';
    this.searchTerm = '';
  }

  async loadTodos() {
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('position', { ascending: true });

      if (error) throw error;
      this.todos = data || [];
      this.renderTodos();
      this.updateStats();
    } catch (error) {
      console.error('Error loading todos:', error);
      this.showNotification('Failed to load tasks', 'error');
    }
  }

  async addTodo(title, priority = 'medium', category = 'general', dueDate = null) {
    if (!title.trim()) {
      this.showNotification('Please enter a task', 'error');
      return;
    }

    try {
      const maxPosition = this.todos.length > 0
        ? Math.max(...this.todos.map(t => t.position))
        : -1;

      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('todos')
        .insert([{
          user_id: user.id,
          title,
          priority,
          category,
          due_date: dueDate,
          position: maxPosition + 1,
          completed: false
        }])
        .select()
        .single();

      if (error) throw error;

      this.todos.push(data);
      this.renderTodos();
      this.updateStats();
      this.showNotification('Task added successfully', 'success');
    } catch (error) {
      console.error('Error adding todo:', error);
      this.showNotification('Failed to add task', 'error');
    }
  }

  async updateTodo(id, updates) {
    try {
      const { data, error } = await supabase
        .from('todos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const index = this.todos.findIndex(t => t.id === id);
      if (index !== -1) {
        this.todos[index] = data;
      }
      this.renderTodos();
      this.updateStats();
    } catch (error) {
      console.error('Error updating todo:', error);
      this.showNotification('Failed to update task', 'error');
    }
  }

  async deleteTodo(id) {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      this.todos = this.todos.filter(t => t.id !== id);
      this.renderTodos();
      this.updateStats();
      this.showNotification('Task deleted', 'success');
    } catch (error) {
      console.error('Error deleting todo:', error);
      this.showNotification('Failed to delete task', 'error');
    }
  }

  async deleteAllTodos() {
    if (!confirm('Are you sure you want to delete all tasks?')) return;

    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) throw error;

      this.todos = [];
      this.renderTodos();
      this.updateStats();
      this.showNotification('All tasks deleted', 'success');
    } catch (error) {
      console.error('Error deleting all todos:', error);
      this.showNotification('Failed to delete tasks', 'error');
    }
  }

  async toggleComplete(id) {
    const todo = this.todos.find(t => t.id === id);
    if (!todo) return;

    await this.updateTodo(id, { completed: !todo.completed });
  }

  getFilteredTodos() {
    return this.todos.filter(todo => {
      const matchesFilter =
        this.currentFilter === 'all' ||
        (this.currentFilter === 'completed' && todo.completed) ||
        (this.currentFilter === 'uncompleted' && !todo.completed);

      const matchesCategory =
        this.currentCategory === 'all' ||
        todo.category === this.currentCategory;

      const matchesSearch =
        !this.searchTerm ||
        todo.title.toLowerCase().includes(this.searchTerm.toLowerCase());

      return matchesFilter && matchesCategory && matchesSearch;
    });
  }

  renderTodos() {
    const container = document.getElementById('list-container');
    if (!container) return;

    const filteredTodos = this.getFilteredTodos();

    if (filteredTodos.length === 0) {
      container.innerHTML = '<div class="empty-state">No tasks found. Add one to get started!</div>';
      return;
    }

    container.innerHTML = filteredTodos.map(todo => this.createTodoHTML(todo)).join('');
    this.attachEventListeners();
  }

  createTodoHTML(todo) {
    const dueDate = todo.due_date ? new Date(todo.due_date) : null;
    const isOverdue = dueDate && dueDate < new Date() && !todo.completed;
    const dueDateStr = dueDate ? dueDate.toLocaleDateString() : '';

    return `
      <li class="todo-item ${todo.completed ? 'checked' : ''} priority-${todo.priority} ${isOverdue ? 'overdue' : ''}"
          data-id="${todo.id}"
          draggable="true">
        <div class="todo-content">
          <div class="todo-checkbox" onclick="window.todoManager.toggleComplete('${todo.id}')"></div>
          <div class="todo-details">
            <div class="todo-title">${this.escapeHtml(todo.title)}</div>
            <div class="todo-meta">
              <span class="category-badge">${todo.category}</span>
              <span class="priority-badge priority-${todo.priority}">${todo.priority}</span>
              ${dueDateStr ? `<span class="due-date ${isOverdue ? 'overdue-text' : ''}">${dueDateStr}</span>` : ''}
            </div>
          </div>
        </div>
        <div class="todo-actions">
          <button class="edit-btn" onclick="window.todoManager.editTodo('${todo.id}')" title="Edit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button class="delete-btn" onclick="window.todoManager.deleteTodo('${todo.id}')" title="Delete">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </li>
    `;
  }

  attachEventListeners() {
    const items = document.querySelectorAll('.todo-item');
    items.forEach(item => {
      item.addEventListener('dragstart', (e) => this.handleDragStart(e));
      item.addEventListener('dragover', (e) => this.handleDragOver(e));
      item.addEventListener('drop', (e) => this.handleDrop(e));
      item.addEventListener('dragend', (e) => this.handleDragEnd(e));
    });
  }

  handleDragStart(e) {
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.innerHTML);
    e.dataTransfer.setData('todo-id', e.target.dataset.id);
  }

  handleDragOver(e) {
    if (e.preventDefault) {
      e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';

    const dragging = document.querySelector('.dragging');
    const afterElement = this.getDragAfterElement(e.currentTarget.parentElement, e.clientY);

    if (afterElement == null) {
      e.currentTarget.parentElement.appendChild(dragging);
    } else {
      e.currentTarget.parentElement.insertBefore(dragging, afterElement);
    }

    return false;
  }

  handleDrop(e) {
    if (e.stopPropagation) {
      e.stopPropagation();
    }
    this.updatePositions();
    return false;
  }

  handleDragEnd(e) {
    e.target.classList.remove('dragging');
  }

  getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.todo-item:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;

      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }

  async updatePositions() {
    const items = document.querySelectorAll('.todo-item');
    const updates = [];

    items.forEach((item, index) => {
      const id = item.dataset.id;
      const todo = this.todos.find(t => t.id === id);
      if (todo && todo.position !== index) {
        updates.push({ id, position: index });
      }
    });

    for (const update of updates) {
      await this.updateTodo(update.id, { position: update.position });
    }
  }

  editTodo(id) {
    const todo = this.todos.find(t => t.id === id);
    if (!todo) return;

    const modal = document.getElementById('edit-modal');
    document.getElementById('edit-title').value = todo.title;
    document.getElementById('edit-priority').value = todo.priority;
    document.getElementById('edit-category').value = todo.category;
    document.getElementById('edit-due-date').value = todo.due_date
      ? new Date(todo.due_date).toISOString().split('T')[0]
      : '';

    modal.dataset.todoId = id;
    modal.style.display = 'flex';
  }

  async saveEdit() {
    const modal = document.getElementById('edit-modal');
    const id = modal.dataset.todoId;

    const title = document.getElementById('edit-title').value.trim();
    const priority = document.getElementById('edit-priority').value;
    const category = document.getElementById('edit-category').value;
    const dueDate = document.getElementById('edit-due-date').value || null;

    if (!title) {
      this.showNotification('Title cannot be empty', 'error');
      return;
    }

    await this.updateTodo(id, {
      title,
      priority,
      category,
      due_date: dueDate
    });

    modal.style.display = 'none';
    this.showNotification('Task updated successfully', 'success');
  }

  updateStats() {
    const total = this.todos.length;
    const completed = this.todos.filter(t => t.completed).length;
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

    const totalEl = document.getElementById('total-tasks');
    const completedEl = document.getElementById('completed-tasks');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');

    if (totalEl) totalEl.textContent = total;
    if (completedEl) completedEl.textContent = completed;
    if (progressBar) {
      progressBar.style.width = progress + '%';
    }
    if (progressText) {
      progressText.textContent = progress + '%';
    }
  }

  setFilter(filter) {
    this.currentFilter = filter;
    this.renderTodos();
  }

  setCategory(category) {
    this.currentCategory = category;
    this.renderTodos();
  }

  setSearch(term) {
    this.searchTerm = term;
    this.renderTodos();
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
