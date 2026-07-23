import {
  getAllLeaves,
  applyLeave,
  approveLeave,
  rejectLeave,
  handleApiError,
} from './api.js';
import {
  escapeHtml,
  formatDate,
  getStatusClass,
  getStatusLabel,
  showToast,
  clearFieldErrors,
  showFieldErrors,
} from './ui.js';
import { getEmployeesCache, loadEmployees } from './employees.js';

let leaves = [];
let searchQuery = '';
let statusFilter = '';

export function initLeaves(onRefresh) {
  leavesRefreshCallback = onRefresh;

  document.getElementById('apply-leave-form')?.addEventListener('submit', handleApplyLeave);
  document.getElementById('leave-search')?.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    renderLeavesTable();
  });
  document.getElementById('leave-status-filter')?.addEventListener('change', (e) => {
    statusFilter = e.target.value;
    renderLeavesTable();
  });
}

let leavesRefreshCallback = null;

export async function loadLeaves() {
  try {
    leaves = await getAllLeaves();
    renderLeavesTable();
    return leaves;
  } catch (error) {
    console.error('Failed to load leaves:', error);
    document.getElementById('leaves-table-body').innerHTML =
      '<tr><td colspan="7" class="empty-cell">Failed to load leave requests</td></tr>';
    return [];
  }
}

export async function populateEmployeeSelect() {
  let employees = getEmployeesCache();
  if (!employees.length) {
    employees = await loadEmployees();
  }

  const select = document.getElementById('leave-employee');
  if (!select) return;

  const currentValue = select.value;
  select.innerHTML = '<option value="">Select employee</option>';
  employees.forEach((emp) => {
    const option = document.createElement('option');
    option.value = emp.empId;
    option.textContent = `${emp.empName} (${emp.empDepartment})`;
    select.appendChild(option);
  });

  if (currentValue) select.value = currentValue;
}

function getFilteredLeaves() {
  return leaves.filter((leave) => {
    const matchesSearch =
      !searchQuery ||
      String(leave.leaveId).includes(searchQuery) ||
      leave.employee?.empName?.toLowerCase().includes(searchQuery) ||
      leave.reason?.toLowerCase().includes(searchQuery) ||
      leave.status?.toLowerCase().includes(searchQuery);

    const matchesStatus =
      !statusFilter || leave.status?.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });
}

function renderLeavesTable() {
  const tbody = document.getElementById('leaves-table-body');
  const filtered = getFilteredLeaves();

  document.getElementById('leave-count').textContent = `${leaves.length} total`;

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty-cell">${
      searchQuery || statusFilter
        ? 'No leave requests match your filters'
        : 'No leave requests yet'
    }</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered
    .map((leave) => {
      const isPending = leave.status?.toUpperCase() === 'PENDING';
      return `
    <tr>
      <td>${leave.leaveId}</td>
      <td><strong>${escapeHtml(leave.employee?.empName || 'Unknown')}</strong></td>
      <td>${formatDate(leave.fromDate)}</td>
      <td>${formatDate(leave.toDate)}</td>
      <td>${escapeHtml(leave.reason)}</td>
      <td><span class="status-badge ${getStatusClass(leave.status)}">${getStatusLabel(leave.status)}</span></td>
      <td>
        ${
          isPending
            ? `<div class="action-buttons">
                <button class="btn btn-success btn-sm" data-approve="${leave.leaveId}">Approve</button>
                <button class="btn btn-danger btn-sm" data-reject="${leave.leaveId}">Reject</button>
              </div>`
            : '<span style="color: var(--text-muted); font-size: 0.8125rem;">Processed</span>'
        }
      </td>
    </tr>
  `;
    })
    .join('');

  tbody.querySelectorAll('[data-approve]').forEach((btn) => {
    btn.addEventListener('click', () => handleApprove(Number(btn.dataset.approve)));
  });

  tbody.querySelectorAll('[data-reject]').forEach((btn) => {
    btn.addEventListener('click', () => handleReject(Number(btn.dataset.reject)));
  });
}

async function handleApplyLeave(e) {
  e.preventDefault();
  const form = e.target;
  clearFieldErrors(form);

  const employeeId = form.employeeId.value;
  const fromDate = form.fromDate.value;
  const toDate = form.toDate.value;
  const reason = form.reason.value.trim();

  if (fromDate && toDate && fromDate > toDate) {
    showToast('From date cannot be after to date', 'warning');
    return;
  }

  const payload = {
    employee: { empId: Number(employeeId) },
    fromDate,
    toDate,
    reason,
  };

  try {
    await applyLeave(payload);
    showToast('Leave request submitted successfully', 'success');
    form.reset();
    await refreshLeaves();
  } catch (error) {
    const validationErrors = handleApiError(error);
    if (validationErrors && typeof validationErrors === 'object') {
      showFieldErrors(form, validationErrors);
      showToast('Please fix the validation errors', 'warning');
    }
  }
}

async function handleApprove(id) {
  try {
    await approveLeave(id);
    showToast('Leave request approved', 'success');
    await refreshLeaves();
  } catch (error) {
    handleApiError(error, 'Failed to approve leave');
  }
}

async function handleReject(id) {
  try {
    await rejectLeave(id);
    showToast('Leave request rejected', 'success');
    await refreshLeaves();
  } catch (error) {
    handleApiError(error, 'Failed to reject leave');
  }
}

async function refreshLeaves() {
  await loadLeaves();
  if (leavesRefreshCallback) await leavesRefreshCallback();
}

export { refreshLeaves as reloadLeaves };
