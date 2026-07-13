import { Task } from '../types/task';

const API_BASE = 'http://localhost:5000/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  getTasks: () => request<Task[]>('/tasks'),

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
