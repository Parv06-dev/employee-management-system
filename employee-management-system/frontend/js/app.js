import { PAGE_TITLES } from './config.js';
import { checkApiHealth } from './api.js';
import { setApiStatus, showToast } from './ui.js';
import { loadDashboard } from './dashboard.js';
import {
  initEmployees,
  loadEmployees,
  openEmployeeModal,
} from './employees.js';
import {
  initLeaves,
  loadLeaves,
  populateEmployeeSelect,
} from './leaves.js';

let currentPage = 'dashboard';

async function refreshDashboardData() {
  await loadDashboard();
}

async function initApp() {
  setupNavigation();
  setupSidebar();
  setupQuickActions();

  initEmployees(refreshDashboardData);
  initLeaves(refreshDashboardData);

  const online = await checkApiHealth();
  setApiStatus(online);

  if (!online) {
    showToast('Cannot connect to API. Start the Spring Boot backend on port 8080 and use the dev server.', 'error', 8000);
  }

  await navigateTo('dashboard');
}

function setupNavigation() {
  document.querySelectorAll('.nav-item[data-page]').forEach((btn) => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.page));
  });
}

function setupSidebar() {
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  const toggle = document.getElementById('menu-toggle');

  toggle?.addEventListener('click', () => {
    sidebar?.classList.toggle('open');
    backdrop?.classList.toggle('visible');
  });

  backdrop?.addEventListener('click', () => {
    sidebar?.classList.remove('open');
    backdrop?.classList.remove('visible');
  });
}

function setupQuickActions() {
  document.querySelectorAll('[data-nav]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const page = btn.dataset.nav;
      const action = btn.dataset.action;
      await navigateTo(page);

      if (action === 'add') {
        openEmployeeModal();
      } else if (action === 'apply') {
        document.getElementById('apply-leave-form')?.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

async function navigateTo(page) {
  currentPage = page;

  document.querySelectorAll('.nav-item').forEach((item) => {
    item.classList.toggle('active', item.dataset.page === page);
  });

  document.querySelectorAll('.page').forEach((section) => {
    section.classList.toggle('active', section.id === `page-${page}`);
  });

  const titles = PAGE_TITLES[page];
  if (titles) {
    document.getElementById('page-title').textContent = titles.title;
    document.getElementById('page-subtitle').textContent = titles.subtitle;
  }

  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('sidebar-backdrop')?.classList.remove('visible');

  await loadPageData(page);
}

async function loadPageData(page) {
  switch (page) {
    case 'dashboard':
      await loadDashboard();
      break;
    case 'employees':
      await loadEmployees();
      break;
    case 'leaves':
      await loadEmployees();
      await populateEmployeeSelect();
      await loadLeaves();
      break;
    default:
      break;
  }
}

document.addEventListener('DOMContentLoaded', initApp);

export { navigateTo, refreshDashboardData };
