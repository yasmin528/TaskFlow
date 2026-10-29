import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guards';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'login',
    canActivate: [guestGuard],
    title: 'Log in · TaskFlow',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'signup',
    canActivate: [guestGuard],
    title: 'Sign up · TaskFlow',
    loadComponent: () => import('./features/auth/signup/signup.component').then((m) => m.SignupComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard-layout/dashboard-layout.component').then(
        (m) => m.DashboardLayoutComponent,
      ),
    children: [
      {
        path: '',
        title: 'Tasks · TaskFlow',
        loadComponent: () =>
          import('./features/dashboard/task-list/task-list.component').then((m) => m.TaskListComponent),
      },
      {
        path: 'tasks/:id',
        title: 'Task details · TaskFlow',
        loadComponent: () =>
          import('./features/dashboard/task-detail/task-detail.component').then((m) => m.TaskDetailComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
