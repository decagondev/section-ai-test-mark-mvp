const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

let jwtToken: string | null = null;

export const apiService = {
  setToken(token: string | null) {
    jwtToken = token;
  },

  async login(email: string, password: string) {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error('Login failed');
    return await res.json();
  },

  async signup(email: string, password: string, name?: string) {
    const res = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });
    if (!res.ok) throw new Error('Signup failed');
    return await res.json();
  },

  async getMe() {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: { 'Authorization': jwtToken ? `Bearer ${jwtToken}` : '' }
    });
    if (!res.ok) throw new Error('Not authenticated');
    return await res.json();
  },

  async request(path: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {};
    if (options.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          headers[key] = value;
        });
      } else {
        Object.assign(headers, options.headers);
      }
    }
    if (jwtToken) headers['Authorization'] = `Bearer ${jwtToken}`;
    const res = await fetch(`${API_URL}${path}`, { ...options, headers });
    if (!res.ok) throw new Error('API request failed');
    return await res.json();
  },

  async submitSubmission(data: { githubUrl: string; rubric: string; projectType: string; fileGlobs?: string[] }) {
    const res = await fetch(`${API_URL}/api/submissions/grade`, {
      method: 'POST',
      headers: jwtToken
        ? ({ 'Content-Type': 'application/json', Authorization: `Bearer ${jwtToken}` } as Record<string, string>)
        : ({ 'Content-Type': 'application/json' } as Record<string, string>),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Submission failed');
    return await res.json();
  },

  async getSubmissions(params: { userId?: string; status?: string; limit?: number; skip?: number } = {}) {
    const url = new URL(`${API_URL}/api/submissions`);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.append(key, String(value));
    });
    const res = await fetch(url.toString(), {
      headers: jwtToken
        ? ({ Authorization: `Bearer ${jwtToken}` } as Record<string, string>)
        : ({} as Record<string, string>),
    });
    if (!res.ok) throw new Error('Failed to fetch submissions');
    return await res.json();
  },

  async updateProfile(data: { name: string }) {
    const res = await fetch(`${API_URL}/api/users/me`, {
      method: 'PATCH',
      headers: jwtToken
        ? ({ 'Content-Type': 'application/json', Authorization: `Bearer ${jwtToken}` } as Record<string, string>)
        : ({ 'Content-Type': 'application/json' } as Record<string, string>),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Profile update failed');
    return await res.json();
  },

  async changePassword(data: { oldPassword: string; newPassword: string }) {
    const res = await fetch(`${API_URL}/api/users/me/change-password`, {
      method: 'POST',
      headers: jwtToken
        ? ({ 'Content-Type': 'application/json', Authorization: `Bearer ${jwtToken}` } as Record<string, string>)
        : ({ 'Content-Type': 'application/json' } as Record<string, string>),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Password change failed');
    return await res.json();
  },

  async getUsers() {
    const res = await fetch(`${API_URL}/api/users`, {
      headers: jwtToken ? ({ Authorization: `Bearer ${jwtToken}` } as Record<string, string>) : ({} as Record<string, string>),
    });
    if (!res.ok) throw new Error('Failed to fetch users');
    return await res.json();
  },

  async createUser(data: { email: string; password: string; role: string; name: string }) {
    const res = await fetch(`${API_URL}/api/users`, {
      method: 'POST',
      headers: jwtToken
        ? ({ 'Content-Type': 'application/json', Authorization: `Bearer ${jwtToken}` } as Record<string, string>)
        : ({ 'Content-Type': 'application/json' } as Record<string, string>),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create user');
    return await res.json();
  },

  async updateUser(id: string, data: { role?: string; name?: string }) {
    const res = await fetch(`${API_URL}/api/users/${id}`, {
      method: 'PATCH',
      headers: jwtToken
        ? ({ 'Content-Type': 'application/json', Authorization: `Bearer ${jwtToken}` } as Record<string, string>)
        : ({ 'Content-Type': 'application/json' } as Record<string, string>),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update user');
    return await res.json();
  },

  async deleteUser(id: string) {
    const res = await fetch(`${API_URL}/api/users/${id}`, {
      method: 'DELETE',
      headers: jwtToken ? ({ Authorization: `Bearer ${jwtToken}` } as Record<string, string>) : ({} as Record<string, string>),
    });
    if (!res.ok) throw new Error('Failed to delete user');
    return await res.json();
  },

  async adminUpdateSubmission(id: string, data: { status?: string; grade?: string; error?: string }) {
    const res = await fetch(`${API_URL}/api/submissions/${id}`, {
      method: 'PATCH',
      headers: jwtToken
        ? ({ 'Content-Type': 'application/json', Authorization: `Bearer ${jwtToken}` } as Record<string, string>)
        : ({ 'Content-Type': 'application/json' } as Record<string, string>),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update submission');
    return await res.json();
  },

  async adminDeleteSubmission(id: string) {
    const res = await fetch(`${API_URL}/api/submissions/${id}`, {
      method: 'DELETE',
      headers: jwtToken ? ({ Authorization: `Bearer ${jwtToken}` } as Record<string, string>) : ({} as Record<string, string>),
    });
    if (!res.ok) throw new Error('Failed to delete submission');
    return await res.json();
  },
}; 