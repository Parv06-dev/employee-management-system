import { API_BASE_URL } from './config.js';
import { showLoading, hideLoading, showToast } from './ui.js';

async function request(url, options = {}, showLoader = true) {
  if (showLoader) showLoading();

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const contentType = response.headers.get('content-type') || '';
    let data;

    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const error = new Error(getErrorMessage(data, response.status));
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } finally {
    if (showLoader) hideLoading();
  }
}

function getErrorMessage(data, status) {
  if (typeof data === 'string' && data.trim()) return data;
  if (data && typeof data === 'object') {
    if (data.message) return data.message;
    const messages = Object.values(data);
    if (messages.length) return messages.join(', ');
  }
  return `Request failed with status ${status}`;
}

export async function checkApiHealth() {
  try {
    await request('/employees', { method: 'GET' }, false);
    return true;
  } catch {
    return false;
  }
}

// ===== Employee APIs =====

export function getAllEmployees() {
  return request('/employees');
}

export function getEmployeeById(id) {
  return request(`/employees/${id}`);
}

export function createEmployee(employee) {
  return request('/employees', {
    method: 'POST',
    body: JSON.stringify(employee),
  });
}

export function updateEmployee(id, employee) {
  return request(`/employees/${id}`, {
    method: 'PUT',
    body: JSON.stringify(employee),
  });
}

export function deleteEmployee(id) {
  return request(`/employees/${id}`, {
    method: 'DELETE',
  });
}

// ===== Leave APIs =====

export function getAllLeaves() {
  return request('/leaves');
}

export function getLeaveById(id) {
  return request(`/leaves/${id}`);
}

export function applyLeave(leave) {
  return request('/leaves', {
    method: 'POST',
    body: JSON.stringify(leave),
  });
}

export function approveLeave(id) {
  return request(`/leaves/${id}/approve`, {
    method: 'PUT',
  });
}

export function rejectLeave(id) {
  return request(`/leaves/${id}/reject`, {
    method: 'PUT',
  });
}

export function handleApiError(error, fallback = 'Something went wrong') {
  if (error.status === 400 && error.data && typeof error.data === 'object') {
    return error.data;
  }
  showToast(error.message || fallback, 'error');
  return null;
}
