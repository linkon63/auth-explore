const API_URL = 'http://localhost:3001/api';

export const auth = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },
  // Add register, logout, getProfile functions
};

export const notes = {
  getAll: async (token: string) => {
    const response = await fetch(`${API_URL}/notes`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },
  // Add create, update, delete functions
};