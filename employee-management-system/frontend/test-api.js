/**
 * API integration test script — run: node test-api.js
 * Tests all REST endpoints via the frontend proxy (port 3000).
 */
const BASE = 'http://localhost:3000';

async function request(method, path, body) {
  const options = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE}${path}`, options);
  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('json') ? await res.json() : await res.text();

  return { status: res.status, data };
}

const results = [];
let createdEmployeeId = null;
let createdLeaveId = null;

function log(name, ok, detail) {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
}

async function run() {
  console.log('Testing API endpoints via proxy at', BASE, '\n');

  // 1. GET /employees
  try {
    const r = await request('GET', '/employees');
    log('GET /employees', r.status === 200, `status ${r.status}, count ${Array.isArray(r.data) ? r.data.length : '?'}`);
  } catch (e) {
    log('GET /employees', false, e.message);
  }

  // 2. POST /employees
  try {
    const unique = Date.now();
    const r = await request('POST', '/employees', {
      empName: 'Test User ' + unique,
      empDepartment: 'Engineering',
      empRole: 'Developer',
      empEmail: `test${unique}@example.com`,
      empPhno: String(unique).slice(-10).padStart(10, '0'),
    });
    const ok = r.status === 201 && r.data?.empId;
    if (ok) createdEmployeeId = r.data.empId;
    log('POST /employees', ok, `status ${r.status}, id ${r.data?.empId}`);
  } catch (e) {
    log('POST /employees', false, e.message);
  }

  // 3. GET /employees/{id}
  if (createdEmployeeId) {
    try {
      const r = await request('GET', `/employees/${createdEmployeeId}`);
      log('GET /employees/{id}', r.status === 200 && r.data?.empId === createdEmployeeId, `status ${r.status}`);
    } catch (e) {
      log('GET /employees/{id}', false, e.message);
    }
  } else {
    log('GET /employees/{id}', false, 'skipped — no employee created');
  }

  // 4. PUT /employees/{id}
  if (createdEmployeeId) {
    try {
      const r = await request('PUT', `/employees/${createdEmployeeId}`, {
        empName: 'Updated Test User',
        empDepartment: 'HR',
        empRole: 'Manager',
        empEmail: `updated${Date.now()}@example.com`,
        empPhno: String(Date.now()).slice(-10).padStart(10, '0'),
      });
      log('PUT /employees/{id}', r.status === 200, `status ${r.status}`);
    } catch (e) {
      log('PUT /employees/{id}', false, e.message);
    }
  } else {
    log('PUT /employees/{id}', false, 'skipped — no employee created');
  }

  // 5. POST /leaves
  if (createdEmployeeId) {
    try {
      const r = await request('POST', '/leaves', {
        employee: { empId: createdEmployeeId },
        fromDate: '2026-08-01',
        toDate: '2026-08-03',
        reason: 'API test leave request',
      });
      const ok = r.status === 201 && r.data?.leaveId;
      if (ok) createdLeaveId = r.data.leaveId;
      log('POST /leaves', ok, `status ${r.status}, id ${r.data?.leaveId}, status ${r.data?.status}`);
    } catch (e) {
      log('POST /leaves', false, e.message);
    }
  } else {
    log('POST /leaves', false, 'skipped — no employee created');
  }

  // 6. GET /leaves
  try {
    const r = await request('GET', '/leaves');
    log('GET /leaves', r.status === 200, `status ${r.status}, count ${Array.isArray(r.data) ? r.data.length : '?'}`);
  } catch (e) {
    log('GET /leaves', false, e.message);
  }

  // 7. GET /leaves/{id}
  if (createdLeaveId) {
    try {
      const r = await request('GET', `/leaves/${createdLeaveId}`);
      log('GET /leaves/{id}', r.status === 200 && r.data?.leaveId === createdLeaveId, `status ${r.status}`);
    } catch (e) {
      log('GET /leaves/{id}', false, e.message);
    }
  } else {
    log('GET /leaves/{id}', false, 'skipped — no leave created');
  }

  // 8. PUT /leaves/{id}/approve
  if (createdLeaveId) {
    try {
      const r = await request('PUT', `/leaves/${createdLeaveId}/approve`);
      log('PUT /leaves/{id}/approve', r.status === 200 && r.data?.status === 'Approved', `status ${r.status}, leave status ${r.data?.status}`);
    } catch (e) {
      log('PUT /leaves/{id}/approve', false, e.message);
    }
  } else {
    log('PUT /leaves/{id}/approve', false, 'skipped — no leave created');
  }

  // 9. Create another leave for reject test
  let rejectLeaveId = null;
  if (createdEmployeeId) {
    try {
      const r = await request('POST', '/leaves', {
        employee: { empId: createdEmployeeId },
        fromDate: '2026-09-01',
        toDate: '2026-09-02',
        reason: 'Reject test leave',
      });
      if (r.status === 201) rejectLeaveId = r.data.leaveId;
    } catch { /* ignore */ }
  }

  // 10. PUT /leaves/{id}/reject
  if (rejectLeaveId) {
    try {
      const r = await request('PUT', `/leaves/${rejectLeaveId}/reject`);
      log('PUT /leaves/{id}/reject', r.status === 200 && r.data?.status === 'REJECTED', `status ${r.status}, leave status ${r.data?.status}`);
    } catch (e) {
      log('PUT /leaves/{id}/reject', false, e.message);
    }
  } else {
    log('PUT /leaves/{id}/reject', false, 'skipped — no leave for reject');
  }

  // 11. DELETE /employees/{id}
  if (createdEmployeeId) {
    try {
      const r = await request('DELETE', `/employees/${createdEmployeeId}`);
      log('DELETE /employees/{id}', r.status === 200, `status ${r.status}`);
    } catch (e) {
      log('DELETE /employees/{id}', false, e.message);
    }
  } else {
    log('DELETE /employees/{id}', false, 'skipped — no employee created');
  }

  console.log('\n--- Summary ---');
  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok).length;
  console.log(`${passed} passed, ${failed} failed out of ${results.length} tests`);

  process.exit(failed > 0 ? 1 : 0);
}

run().catch((e) => {
  console.error('Test runner error:', e.message);
  process.exit(1);
});
