export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface TaskStats {
  total: number;
  todo: number;
  in_progress: number;
  done: number;
  overdue: number;
}
