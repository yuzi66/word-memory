import { Task, TaskStats } from '../types/task';

const API_BASE = 'http://localhost:5000/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { headers: { 'Content-Type': 'application/json' }, ...options });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    let message = err.error || 'Request failed';
    if (err.details) { const d = Object.values(err.details).join('; '); message = `${message}: ${d}`; }
    throw new Error(message);
  }
  return res.json();
}

function buildQuery(params: Record<string, string>): string {
  const f = Object.entries(params).filter(([_, v]) => v.trim() !== '');
  if (f.length === 0) return '';
  return '?' + f.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
}

type Filters = { q?: string; status?: string; priority?: string; sort?: string };

export const api = {
  getTasks: (filters?: Filters) =>
    request<Task[]>(`/tasks${buildQuery({ q: filters?.q || '', status: filters?.status || '', priority: filters?.priority || '', sort: filters?.sort || '' })}`),
  getTask: (id: number) => request<Task>(`/tasks/${id}`),
  createTask: (data: Pick<Task, 'title' | 'description'> & { due_date?: string }) =>
    request<Task>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id: number, data: Partial<Pick<Task, 'title' | 'description' | 'status' | 'priority'> & { due_date?: string }>) =>
    request<Task>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTask: (id: number) => request<{ message: string }>(`/tasks/${id}`, { method: 'DELETE' }),
  getStats: () => request<TaskStats>('/tasks/stats'),
  exportCSV: async () => {
    const res = await fetch(`${API_BASE}/tasks/export`);
    if (!res.ok) throw new Error('Export failed');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'tasks.csv'; a.click();
    window.URL.revokeObjectURL(url);
  },
};
