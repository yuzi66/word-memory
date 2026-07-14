import { Task } from '../types/task';

const API_BASE = 'http://localhost:5000/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    let message = err.error || 'Request failed';
    if (err.details) {
      const detailMessages = Object.values(err.details).join('; ');
      message = `${message}: ${detailMessages}`;
    }
    throw new Error(message);
  }
  return res.json();
}

function buildQuery(params: Record<string, string>): string {
  const filtered = Object.entries(params).filter(([_, v]) => v.trim() !== '');
  if (filtered.length === 0) return '';
  return '?' + filtered.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
}

export const api = {
  getTasks: (filters?: { q?: string; status?: string; priority?: string }) =>
    request<Task[]>(`/tasks${buildQuery({ q: filters?.q || '', status: filters?.status || '', priority: filters?.priority || '' })}`),

  getTask: (id: number) => request<Task>(`/tasks/${id}`),

  createTask: (data: Pick<Task, 'title' | 'description'>) =>
    request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateTask: (id: number, data: Partial<Pick<Task, 'title' | 'description' | 'status' | 'priority'>>) =>
    request<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteTask: (id: number) =>
    request<{ message: string }>(`/tasks/${id}`, {
      method: 'DELETE',
    }),
};
