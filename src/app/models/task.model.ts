export type TaskPriority = 'low' | 'medium' | 'high';

export type TaskStatusFilter = 'all' | 'pending' | 'completed';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  priority: TaskPriority;
  completed: boolean;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskPayload {
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string | null;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  completionRate: number;
}
