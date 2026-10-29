import { Task, TaskPayload } from '../../models/task.model';
import { MockHttpError, createId, nowIso, readTable, writeTable } from './mock-db';
import { seedTasks } from './seed-data';

function tasks(): Task[] {
  return readTable<Task>('tasks', seedTasks);
}

function findOwned(userId: string, id: string): Task {
  const task = tasks().find((item) => item.id === id && item.userId === userId);
  if (!task) {
    throw new MockHttpError(404, 'Task not found.');
  }
  return task;
}

function validate(payload: Partial<TaskPayload>): void {
  if (payload.title !== undefined && payload.title.trim().length < 3) {
    throw new MockHttpError(400, 'Title must be at least 3 characters.');
  }
}

export function listTasks(userId: string): Task[] {
  return tasks()
    .filter((task) => task.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getTask(userId: string, id: string): Task {
  return findOwned(userId, id);
}

export function createTask(userId: string, payload: TaskPayload): Task {
  validate(payload);
  const timestamp = nowIso();
  const task: Task = {
    id: createId(),
    userId,
    title: payload.title.trim(),
    description: payload.description.trim(),
    priority: payload.priority,
    dueDate: payload.dueDate || null,
    completed: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  writeTable('tasks', [task, ...tasks()]);
  return task;
}

export function updateTask(
  userId: string,
  id: string,
  changes: Partial<TaskPayload & { completed: boolean }>,
): Task {
  validate(changes);
  const existing = findOwned(userId, id);
  const updated: Task = {
    ...existing,
    ...changes,
    title: changes.title?.trim() ?? existing.title,
    dueDate: changes.dueDate === undefined ? existing.dueDate : changes.dueDate || null,
    updatedAt: nowIso(),
  };
  writeTable(
    'tasks',
    tasks().map((task) => (task.id === id ? updated : task)),
  );
  return updated;
}

export function deleteTask(userId: string, id: string): null {
  findOwned(userId, id);
  writeTable(
    'tasks',
    tasks().filter((task) => task.id !== id),
  );
  return null;
}
