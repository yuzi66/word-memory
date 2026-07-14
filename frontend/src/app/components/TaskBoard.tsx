'use client';

import { useState, useEffect, useCallback } from 'react';
import { Task, TaskStatus, TaskPriority } from '../types/task';
import { api } from '../lib/api';

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: '\u5F85\u529E',
  in_progress: '\u8FDB\u884C\u4E2D',
  done: '\u5DF2\u5B8C\u6210',
};

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: '\u4F4E',
  medium: '\u4E2D',
  high: '\u9AD8',
};

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: 'bg-blue-100 text-blue-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-purple-100 text-purple-700',
  done: 'bg-green-100 text-green-700',
};

export default function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');

  const fetchTasks = useCallback(async () => {
    try {
      setError(null);
      const data = await api.getTasks({
        q: search,
        status: filterStatus,
        priority: filterPriority,
      });
      setTasks(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus, filterPriority]);

  useEffect(() => {
    const timer = setTimeout(() => { fetchTasks(); }, 200);
    return () => clearTimeout(timer);
  }, [fetchTasks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      if (editingTask) {
        await api.updateTask(editingTask.id, { title: title.trim(), description: description.trim() });
      } else {
        await api.createTask({ title: title.trim(), description: description.trim() });
      }
      setTitle('');
      setDescription('');
      setShowForm(false);
      setEditingTask(null);
      await fetchTasks();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('\u786E\u5B9A\u5220\u9664\u8BE5\u4EFB\u52A1\uFF1F')) return;
    try {
      await api.deleteTask(id);
      await fetchTasks();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
    try {
      await api.updateTask(task.id, { status: newStatus });
      await fetchTasks();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handlePriorityChange = async (task: Task, newPriority: TaskPriority) => {
    try {
      await api.updateTask(task.id, { priority: newPriority });
      await fetchTasks();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTask(null);
    setTitle('');
    setDescription('');
  };

  const columns: TaskStatus[] = ['todo', 'in_progress', 'done'];

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-50">\u4E2A\u4EBA\u4EFB\u52A1\u770B\u677F</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">\u7BA1\u7406\u4F60\u7684\u4EFB\u52A1\uFF0C\u63D0\u5347\u5DE5\u4F5C\u6548\u7387</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingTask(null); setTitle(''); setDescription(''); }}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          \u65B0\u5EFA\u4EFB\u52A1
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">\u5173\u95ED</button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="\u641C\u7D22\u4EFB\u52A1\u6807\u9898\u6216\u63CF\u8FF0..."
            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-gray-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">\u5168\u90E8\u72B6\u6001</option>
          <option value="todo">\u5F85\u529E</option>
          <option value="in_progress">\u8FDB\u884C\u4E2D</option>
          <option value="done">\u5DF2\u5B8C\u6210</option>
        </select>
        <select
          value={filterPriority}
          onChange={e => setFilterPriority(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-gray-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">\u5168\u90E8\u4F18\u5148\u7EA7</option>
          <option value="low">\u4F4E</option>
          <option value="medium">\u4E2D</option>
          <option value="high">\u9AD8</option>
        </select>
      </div>

      {showForm && (
        <div className="mb-6 p-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-zinc-50">
            {editingTask ? '\u7F16\u8F91\u4EFB\u52A1' : '\u65B0\u5EFA\u4EFB\u52A1'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">\u6807\u9898</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="\u8F93\u5165\u4EFB\u52A1\u6807\u9898"
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">\u63CF\u8FF0\uFF08\u53EF\u9009\uFF09</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="\u8F93\u5165\u4EFB\u52A1\u63CF\u8FF0"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={submitting || !title.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {submitting ? '\u4FDD\u5B58\u4E2D...' : editingTask ? '\u4FDD\u5B58' : '\u521B\u5EFA'}
              </button>
              <button type="button" onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-zinc-300 border border-gray-300 dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                \u53D6\u6D88
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {columns.map(status => (
            <div key={status} className="bg-gray-50 dark:bg-zinc-900/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${STATUS_COLORS[status]}`}>
                  {STATUS_LABELS[status]}
                </span>
                <span className="text-xs text-gray-400">{tasks.filter(t => t.status === status).length}</span>
              </div>
              <div className="space-y-2">
                {tasks.filter(t => t.status === status).map(task => (
                  <div key={task.id} className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg p-3 shadow-sm hover:shadow transition-shadow">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-zinc-100 flex-1">{task.title}</h3>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={() => handleEdit(task)} className="p-1 text-gray-400 hover:text-blue-600 rounded" title="\u7F16\u8F91">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => handleDelete(task.id)} className="p-1 text-gray-400 hover:text-red-600 rounded" title="\u5220\u9664">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    {task.description && (
                      <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${PRIORITY_COLORS[task.priority]}`}>
                        {PRIORITY_LABELS[task.priority]}
                      </span>
                      <select value={task.priority} onChange={e => handlePriorityChange(task, e.target.value as TaskPriority)}
                        className="text-[10px] border-none bg-transparent text-gray-400 cursor-pointer focus:outline-none">
                        <option value="low">\u4F4E</option>
                        <option value="medium">\u4E2D</option>
                        <option value="high">\u9AD8</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      {(['todo', 'in_progress', 'done'] as TaskStatus[]).map(s => (
                        <button key={s} onClick={() => handleStatusChange(task, s)}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                            task.status === s
                              ? STATUS_COLORS[s]
                              : 'bg-transparent text-gray-300 dark:text-zinc-600 hover:bg-gray-100 dark:hover:bg-zinc-700'}`}>
                          {STATUS_LABELS[s]}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {tasks.filter(t => t.status === status).length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">\u6682\u65E0\u4EFB\u52A1</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
