let loadingCount = 0;

export function showLoading() {
  loadingCount += 1;
  document.getElementById('loading-overlay')?.classList.remove('hidden');
}

export function hideLoading() {
  loadingCount = Math.max(0, loadingCount - 1);
  if (loadingCount === 0) {
    document.getElementById('loading-overlay')?.classList.add('hidden');
  }
}

export function showToast(message, type = 'info', duration = 4000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-message">${escapeHtml(message)}</span>
    <button class="toast-close" aria-label="Close">&times;</button>
  `;

  const remove = () => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = '0.3s ease';
    setTimeout(() => toast.remove(), 300);
  };

  toast.querySelector('.toast-close').addEventListener('click', remove);
  container.appendChild(toast);

  if (duration > 0) {
    setTimeout(remove, duration);
  }
}

export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text ?? '';
  return div.innerHTML;
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function getStatusClass(status) {
  if (!status) return '';
  const normalized = status.toUpperCase();
  if (normalized === 'PENDING') return 'status-pending';
  if (normalized === 'APPROVED') return 'status-approved';
  if (normalized === 'REJECTED') return 'status-rejected';
  return '';
}

export function getStatusLabel(status) {
  if (!status) return 'Unknown';
  const normalized = status.toUpperCase();
  if (normalized === 'PENDING') return 'Pending';
  if (normalized === 'APPROVED') return 'Approved';
  if (normalized === 'REJECTED') return 'Rejected';
  return status;
}

export function openModal(modalId) {
  document.getElementById(modalId)?.classList.remove('hidden');
}

export function closeModal(modalId) {
  document.getElementById(modalId)?.classList.add('hidden');
}

export function setApiStatus(online) {
  const el = document.getElementById('api-status');
  if (!el) return;
  el.classList.remove('online', 'offline');
  el.classList.add(online ? 'online' : 'offline');
  el.innerHTML = `<span class="status-dot"></span> API ${online ? 'Connected' : 'Offline'}`;
}

export function clearFieldErrors(form) {
  form.querySelectorAll('.field-error').forEach((el) => el.remove());
  form.querySelectorAll('.input-error').forEach((el) => el.classList.remove('input-error'));
}

export function showFieldErrors(form, errors) {
  clearFieldErrors(form);
  if (!errors || typeof errors !== 'object') return;

  Object.entries(errors).forEach(([field, message]) => {
    const input = form.querySelector(`[name="${field}"], #${fieldToId(field)}`);
    if (input) {
      input.classList.add('input-error');
      const errorEl = document.createElement('span');
      errorEl.className = 'field-error';
      errorEl.textContent = message;
      input.parentElement.appendChild(errorEl);
    }
  });
}

function fieldToId(field) {
  const map = {
    empName: 'emp-name',
    empDepartment: 'emp-department',
    empRole: 'emp-role',
    empEmail: 'emp-email',
    empPhno: 'emp-phone',
    fromDate: 'leave-from',
    toDate: 'leave-to',
    reason: 'leave-reason',
  };
  return map[field] || field;
}
