const BASE_URL = process.env.REACT_APP_API_URL || (typeof window !== 'undefined' && window.location.origin === 'http://localhost:3000' ? 'http://localhost:8000' : '/api');

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  getToken() {
    const token = localStorage.getItem('access_token');
    if (token && isTokenExpired(token)) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_role');
      localStorage.removeItem('user_profile');
      return null;
    }
    return token;
  }

  async request(method, path, body) {
    const token = this.getToken();
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (body && !(body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    const opts = {
      method,
      headers,
      credentials: 'include',
    };
    if (body !== undefined) {
      opts.body = body instanceof FormData ? body : JSON.stringify(body);
    }
    const res = await fetch(`${this.baseUrl}${path}`, opts);
    if (res.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_role');
      localStorage.removeItem('user_profile');
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
