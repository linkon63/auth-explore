const API_URL = 'http://localhost:4000';

export const auth = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },
};

export const notes = {
  getAll: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }
    const response = await fetch(`${API_URL}/notes`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },
  create: async (note: { title: string; content: string }) => {
    const token = localStorage.getItem('token');
    console.log('Creating note with token', token, note);
    if (!token) {
      throw new Error('No token found');
    }
    const response = await fetch(`${API_URL}/notes`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(note),
    });
    return response.json();
  },

  getOne: async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');
    const response = await fetch(`${API_URL}/notes/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch note');
    }
    return response.json();
  },

  update: async (id: string, note: { title: string; content: string }) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');
    const response = await fetch(`${API_URL}/notes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(note),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update note');
    }
    return response.json();
  },
  delete: async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');
    const response = await fetch(`${API_URL}/notes/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete note');
    }
    return response.json();
  },
};