import { getAllEmployees, getAllLeaves } from './api.js';
import { escapeHtml, formatDate, getStatusClass, getStatusLabel } from './ui.js';

export async function loadDashboard() {
  try {
    const [employees, leaves] = await Promise.all([
      getAllEmployees(),
      getAllLeaves(),
    ]);

    updateStats(employees, leaves);
    renderRecentLeaves(leaves);
  } catch (error) {
    console.error('Dashboard load failed:', error);
    document.getElementById('stat-employees').textContent = '0';
    document.getElementById('stat-pending').textContent = '0';
    document.getElementById('stat-approved').textContent = '0';
    document.getElementById('stat-rejected').textContent = '0';
    document.getElementById('recent-leaves-body').innerHTML =
      '<tr><td colspan="4" class="empty-cell">Unable to load data</td></tr>';
  }
}

function updateStats(employees, leaves) {
  document.getElementById('stat-employees').textContent = employees.length;
  document.getElementById('stat-pending').textContent = leaves.filter(
    (l) => l.status?.toUpperCase() === 'PENDING'
  ).length;
  document.getElementById('stat-approved').textContent = leaves.filter(
    (l) => l.status?.toUpperCase() === 'APPROVED'
  ).length;
  document.getElementById('stat-rejected').textContent = leaves.filter(
    (l) => l.status?.toUpperCase() === 'REJECTED'
  ).length;
}

function renderRecentLeaves(leaves) {
  const tbody = document.getElementById('recent-leaves-body');
  const recent = [...leaves]
    .sort((a, b) => (b.leaveId || 0) - (a.leaveId || 0))
    .slice(0, 5);

  if (!recent.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="empty-cell">No leave requests yet</td></tr>';
    return;
  }

  tbody.innerHTML = recent
    .map(
      (leave) => `
    <tr>
      <td>${escapeHtml(leave.employee?.empName || 'Unknown')}</td>
      <td>${formatDate(leave.fromDate)}</td>
      <td>${formatDate(leave.toDate)}</td>
      <td><span class="status-badge ${getStatusClass(leave.status)}">${getStatusLabel(leave.status)}</span></td>
    </tr>
  `
    )
    .join('');
}
