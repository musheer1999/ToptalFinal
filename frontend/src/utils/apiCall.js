const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// ── API HELPER ───────────────────────────────────────────────────
// A wrapper around fetch() so we don't repeat the same code everywhere.
// credentials: 'include' tells the browser to send the httpOnly cookie
// automatically — we never touch the token in JavaScript code.
//
// Usage:
//   const data = await apiCall('GET', '/restaurants');
//   const data = await apiCall('POST', '/auth/login', { email, password });
async function apiCall(method, endpoint, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const options = { method, headers, credentials: 'include' };
  if (body) options.body = JSON.stringify(body);

  // Make the request — catch network-level failures (backend not running)
  const response = await fetch(`${API_URL}${endpoint}`, options).catch(() => {
    throw new Error('Cannot connect to the server. Make sure the backend is running.');
  });
  const data = await response.json();

  // If server returned an error status (400, 401, 403, 404, 500...)
  // throw an error so our catch blocks handle it
  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
}

export default apiCall;