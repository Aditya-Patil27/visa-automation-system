const BASE_URL = process.env.REACT_APP_API_URL || (typeof window !== 'undefined' && window.location.origin === 'http://localhost:3000' ? 'http://localhost:8000' : '/api');

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  getToken() {
    return localStorage.getItem('access_token');
  }

  async request(method, path, body) {
    const token = this.getToken();
    const headers = {};
    // Send Bearer token if available, otherwise rely on httpOnly cookie
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (body && !(body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    const opts = {
      method,
      headers,
      credentials: 'include',  // send httpOnly cookies
    };
    if (body !== undefined) {
      opts.body = body instanceof FormData ? body : JSON.stringify(body);
    }
    const res = await fetch(`${this.baseUrl}${path}`, opts);
    if (res.status === 401) {
      localStorage.removeItem('access_token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      throw new Error('Unauthorized');
    }
    const data = await res.json();
    if (!res.ok) throw { status: res.status, ...data };
    return data;
  }

  get(path) { return this.request('GET', path); }
  post(path, body) { return this.request('POST', path, body); }
  put(path, body) { return this.request('PUT', path, body); }
  del(path) { return this.request('DELETE', path); }
  upload(path, formData) { return this.request('POST', path, formData); }
}

export const api = new ApiClient(BASE_URL);
