import { Task } from '../../models/task.model';
import { StoredUser } from './mock-db';

export const DEMO_USER_ID = 'user-demo';

export function seedUsers(): StoredUser[] {
  return [
    {
      id: DEMO_USER_ID,
      name: 'Demo User',
      email: 'demo@taskflow.dev',
      salt: 'seed-taskflow',
      passwordHash: 'd24412c229a4322ee33f13a083fb57a63652b632d38f4c1e1d014982d809767c',
    },
  ];
}

function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

export function seedTasks(): Task[] {
  const rows: Array<Omit<Task, 'userId' | 'updatedAt'>> = [
    {
      id: 'task-1',
      title: 'Set up project repository',
      description: 'Create the Git repository, add a README and configure Prettier.',
      priority: 'medium',
      completed: true,
      dueDate: daysFromNow(-3),
      createdAt: daysAgo(9),
    },
    {
      id: 'task-2',
      title: 'Design the login screen',
      description: 'Sketch the login and sign-up layouts and agree on validation messages.',
      priority: 'high',
      completed: true,
      dueDate: daysFromNow(-1),
      createdAt: daysAgo(7),
    },
    {
      id: 'task-3',
      title: 'Write unit tests for AuthService',
      description: 'Cover login, sign-up, logout and the session restore logic.',
      priority: 'high',
      completed: false,
      dueDate: daysFromNow(2),
      createdAt: daysAgo(5),
    },
    {
      id: 'task-4',
      title: 'Review RxJS operators',
      description: 'Practise switchMap, mergeMap, concatMap and exhaustMap with small examples.',
      priority: 'medium',
      completed: false,
      dueDate: daysFromNow(4),
      createdAt: daysAgo(4),
    },
    {
      id: 'task-5',
      title: 'Prepare interview answers',
      description: 'Explain change detection, signals versus observables and dependency injection.',
      priority: 'high',
      completed: false,
      dueDate: daysFromNow(6),
      createdAt: daysAgo(3),
    },
    {
      id: 'task-6',
      title: 'Clean up global styles',
      description: 'Move repeated values into CSS variables.',
      priority: 'low',
      completed: false,
      dueDate: null,
      createdAt: daysAgo(2),
    },
    {
      id: 'task-7',
      title: 'Deploy preview build',
      description: 'Build the app in production mode and publish a preview link.',
      priority: 'low',
      completed: false,
      dueDate: daysFromNow(10),
      createdAt: daysAgo(1),
    },
  ];
  return rows.map((row) => ({ ...row, userId: DEMO_USER_ID, updatedAt: row.createdAt }));
}
