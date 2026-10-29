import { Task, TaskPriority } from '../../models/task.model';

export const PRIORITY_OPTIONS: Array<{ value: TaskPriority; label: string }> = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export function priorityBadge(priority: TaskPriority): string {
  const classes: Record<TaskPriority, string> = {
    low: 'badge badge-info',
    medium: 'badge badge-warning',
    high: 'badge badge-danger',
  };
  return classes[priority];
}

export function isOverdue(task: Task): boolean {
  if (!task.dueDate || task.completed) {
    return false;
  }
  const today = new Date().toISOString().slice(0, 10);
  return task.dueDate < today;
}
