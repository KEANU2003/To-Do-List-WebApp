import './style.css';
import { AuthManager } from './auth.js';
import { TodoManager } from './todoManager.js';

const authManager = new AuthManager();
const todoManager = new TodoManager();

window.authManager = authManager;
window.todoManager = todoManager;

async function init() {
  await authManager.initialize();

  if (authManager.isAuthenticated()) {
    await todoManager.loadTodos();
  }

  setupEventListeners();
}

function setupEventListeners() {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const showSignup = document.getElementById('show-signup');
  const showLogin = document.getElementById('show-login');
  const logoutBtn = document.getElementById('logout-btn');
  const addTaskBtn = document.getElementById('add-task-btn');
  const searchBox = document.getElementById('search-box');
  const filterSelect = document.getElementById('status-filter');
  const categoryFilter = document.getElementById('category-filter');
  const deleteAllBtn = document.getElementById('delete-all-btn');
  const themeToggle = document.getElementById('theme-toggle');
  const closeModal = document.getElementById('close-modal');
  const saveEditBtn = document.getElementById('save-edit-btn');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;

      try {
        await authManager.signIn(email, password);
        todoManager.showNotification('Welcome back!', 'success');
      } catch (error) {
        todoManager.showNotification(error.message, 'error');
      }
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('signup-email').value;
      const password = document.getElementById('signup-password').value;
      const confirmPassword = document.getElementById('signup-confirm-password').value;

      if (password !== confirmPassword) {
        todoManager.showNotification('Passwords do not match', 'error');
        return;
      }

      if (password.length < 6) {
        todoManager.showNotification('Password must be at least 6 characters', 'error');
        return;
      }

      try {
        await authManager.signUp(email, password);
        todoManager.showNotification('Account created successfully!', 'success');
      } catch (error) {
        todoManager.showNotification(error.message, 'error');
      }
    });
  }

  if (showSignup) {
    showSignup.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('login-form').style.display = 'none';
      document.getElementById('signup-form').style.display = 'block';
    });
  }

  if (showLogin) {
    showLogin.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('signup-form').style.display = 'none';
      document.getElementById('login-form').style.display = 'block';
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await authManager.signOut();
        todoManager.showNotification('Logged out successfully', 'success');
      } catch (error) {
        todoManager.showNotification(error.message, 'error');
      }
    });
  }

  if (addTaskBtn) {
    addTaskBtn.addEventListener('click', () => {
      const input = document.getElementById('input-box');
      const priority = document.getElementById('priority-select').value;
      const category = document.getElementById('category-select').value;
      const dueDate = document.getElementById('due-date-input').value || null;

      todoManager.addTodo(input.value, priority, category, dueDate);
      input.value = '';
      document.getElementById('due-date-input').value = '';
    });
  }

  const inputBox = document.getElementById('input-box');
  if (inputBox) {
    inputBox.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        addTaskBtn.click();
      }
    });
  }

  if (searchBox) {
    searchBox.addEventListener('input', (e) => {
      todoManager.setSearch(e.target.value);
    });
  }

  if (filterSelect) {
    filterSelect.addEventListener('change', (e) => {
      todoManager.setFilter(e.target.value);
    });
  }

  if (categoryFilter) {
    categoryFilter.addEventListener('change', (e) => {
      todoManager.setCategory(e.target.value);
    });
  }

  if (deleteAllBtn) {
    deleteAllBtn.addEventListener('click', () => {
      todoManager.deleteAllTodos();
    });
  }

  if (themeToggle) {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-mode');
      themeToggle.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';
    }

    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const isDark = document.body.classList.contains('dark-mode');

      if (isDark) {
        themeToggle.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';
      } else {
        themeToggle.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
      }

      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
  }

  if (closeModal) {
    closeModal.addEventListener('click', () => {
      document.getElementById('edit-modal').style.display = 'none';
    });
  }

  if (saveEditBtn) {
    saveEditBtn.addEventListener('click', () => {
      todoManager.saveEdit();
    });
  }

  window.addEventListener('click', (e) => {
    const modal = document.getElementById('edit-modal');
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  window.addEventListener('user-authenticated', async () => {
    await todoManager.loadTodos();
  });
}

init();
