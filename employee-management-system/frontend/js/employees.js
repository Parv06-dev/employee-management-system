import {
  getAllEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  handleApiError,
} from './api.js';
import {
  escapeHtml,
  showToast,
  openModal,
  closeModal,
  clearFieldErrors,
  showFieldErrors,
} from './ui.js';

let employees = [];
let searchQuery = '';
let editingId = null;
let deleteCallback = null;

export function initEmployees(onRefresh) {
  employeesRefreshCallback = onRefresh;

  document.getElementById('btn-add-employee')?.addEventListener('click', () => openEmployeeModal());
  document.getElementById('employee-modal-close')?.addEventListener('click', closeEmployeeModal);
  document.getElementById('employee-modal-cancel')?.addEventListener('click', closeEmployeeModal);
  document.getElementById('employee-form')?.addEventListener('submit', handleEmployeeSubmit);

  document.getElementById('employee-search')?.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    renderEmployeesTable();
  });

  document.querySelector('#employee-modal .modal-backdrop')?.addEventListener('click', closeEmployeeModal);

  document.getElementById('confirm-modal-close')?.addEventListener('click', closeConfirmModal);
  document.getElementById('confirm-cancel')?.addEventListener('click', closeConfirmModal);
  document.getElementById('confirm-ok')?.addEventListener('click', async () => {
    if (deleteCallback) await deleteCallback();
    closeConfirmModal();
  });
  document.querySelector('#confirm-modal .modal-backdrop')?.addEventListener('click', closeConfirmModal);
}

let employeesRefreshCallback = null;

export async function loadEmployees() {
  try {
    employees = await getAllEmployees();
    renderEmployeesTable();
    return employees;
  } catch (error) {
    console.error('Failed to load employees:', error);
    document.getElementById('employees-table-body').innerHTML =
      '<tr><td colspan="7" class="empty-cell">Failed to load employees</td></tr>';
    return [];
  }
}

export function getEmployeesCache() {
  return employees;
}

function getFilteredEmployees() {
  if (!searchQuery) return employees;
  return employees.filter(
    (emp) =>
      String(emp.empId).includes(searchQuery) ||
      emp.empName?.toLowerCase().includes(searchQuery) ||
      emp.empDepartment?.toLowerCase().includes(searchQuery) ||
      emp.empRole?.toLowerCase().includes(searchQuery) ||
      emp.empEmail?.toLowerCase().includes(searchQuery) ||
      emp.empPhno?.includes(searchQuery)
  );
}

function renderEmployeesTable() {
  const tbody = document.getElementById('employees-table-body');
  const filtered = getFilteredEmployees();

  document.getElementById('employee-count').textContent = `${employees.length} total`;

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty-cell">${
      searchQuery ? 'No employees match your search' : 'No employees found. Add your first employee.'
    }</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered
    .map(
      (emp) => `
    <tr>
      <td>${emp.empId}</td>
      <td><strong>${escapeHtml(emp.empName)}</strong></td>
      <td>${escapeHtml(emp.empDepartment)}</td>
      <td>${escapeHtml(emp.empRole)}</td>
      <td>${escapeHtml(emp.empEmail)}</td>
      <td>${escapeHtml(emp.empPhno)}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-icon edit" title="Edit" data-edit="${emp.empId}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-icon delete" title="Delete" data-delete="${emp.empId}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `
    )
    .join('');

  tbody.querySelectorAll('[data-edit]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.edit);
      const emp = employees.find((e) => e.empId === id);
      if (emp) openEmployeeModal(emp);
    });
  });

  tbody.querySelectorAll('[data-delete]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.delete);
      const emp = employees.find((e) => e.empId === id);
      showConfirmDialog(
        `Are you sure you want to delete <strong>${escapeHtml(emp?.empName || 'this employee')}</strong>?`,
        async () => {
          try {
            await deleteEmployee(id);
            showToast('Employee deleted successfully', 'success');
            await refreshEmployees();
          } catch (error) {
            handleApiError(error, 'Failed to delete employee');
          }
        }
      );
    });
  });
}

export function openEmployeeModal(employee = null) {
  editingId = employee?.empId ?? null;
  const form = document.getElementById('employee-form');
  clearFieldErrors(form);
  form.reset();

  document.getElementById('employee-modal-title').textContent = employee
    ? 'Edit Employee'
    : 'Add Employee';
  document.getElementById('employee-form-submit').textContent = employee
    ? 'Update Employee'
    : 'Save Employee';

  if (employee) {
    document.getElementById('employee-id').value = employee.empId;
    document.getElementById('emp-name').value = employee.empName || '';
    document.getElementById('emp-department').value = employee.empDepartment || '';
    document.getElementById('emp-role').value = employee.empRole || '';
    document.getElementById('emp-email').value = employee.empEmail || '';
    document.getElementById('emp-phone').value = employee.empPhno || '';
  }

  openModal('employee-modal');
}

function closeEmployeeModal() {
  closeModal('employee-modal');
  editingId = null;
}

async function handleEmployeeSubmit(e) {
  e.preventDefault();
  const form = e.target;
  clearFieldErrors(form);

  const payload = {
    empName: form.empName.value.trim(),
    empDepartment: form.empDepartment.value.trim(),
    empRole: form.empRole.value.trim(),
    empEmail: form.empEmail.value.trim(),
    empPhno: form.empPhno.value.trim(),
  };

  try {
    if (editingId) {
      await updateEmployee(editingId, payload);
      showToast('Employee updated successfully', 'success');
    } else {
      await createEmployee(payload);
      showToast('Employee created successfully', 'success');
    }
    closeEmployeeModal();
    await refreshEmployees();
  } catch (error) {
    const validationErrors = handleApiError(error);
    if (validationErrors && typeof validationErrors === 'object') {
      showFieldErrors(form, validationErrors);
      showToast('Please fix the validation errors', 'warning');
    }
  }
}

async function refreshEmployees() {
  await loadEmployees();
  if (employeesRefreshCallback) await employeesRefreshCallback();
}

function showConfirmDialog(message, callback) {
  document.getElementById('confirm-message').innerHTML = message;
  deleteCallback = callback;
  openModal('confirm-modal');
}

function closeConfirmModal() {
  closeModal('confirm-modal');
  deleteCallback = null;
}

export { refreshEmployees as reloadEmployees };
