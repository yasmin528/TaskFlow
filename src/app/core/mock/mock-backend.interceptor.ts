import {
  HttpErrorResponse,
  HttpEvent,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable, catchError, from, map, switchMap, throwError, timer } from 'rxjs';
import { LoginRequest, SignupRequest } from '../../models/user.model';
import { TaskPayload } from '../../models/task.model';
import { login, logout, me, register, requireUserId } from './mock-auth-api';
import { MockHttpError, shouldSimulateFailure } from './mock-db';
import { createTask, deleteTask, getTask, listTasks, updateTask } from './mock-tasks-api';

const LATENCY_MS = 450;

async function route(req: HttpRequest<unknown>): Promise<unknown> {
  const path = new URL(req.url, 'http://mock.local').pathname;
  const segments = path.replace(/^\/api\//, '').split('/');
  const [resource, id] = segments;

  if (resource === 'auth') {
    switch (`${req.method} ${id}`) {
      case 'POST register':
        return register(req.body as SignupRequest);
      case 'POST login':
        return login(req.body as LoginRequest);
      case 'POST logout':
        return logout(req);
      case 'GET me':
        return me(req);
    }
  }

  if (resource === 'tasks') {
    const userId = requireUserId(req);
    if (shouldSimulateFailure()) {
      throw new MockHttpError(500, 'The server is having trouble right now. Please try again.');
    }
    if (!id && req.method === 'GET') return listTasks(userId);
    if (!id && req.method === 'POST') return createTask(userId, req.body as TaskPayload);
    if (id && req.method === 'GET') return getTask(userId, id);
    if (id && (req.method === 'PUT' || req.method === 'PATCH')) {
      return updateTask(userId, id, req.body as Partial<TaskPayload & { completed: boolean }>);
    }
    if (id && req.method === 'DELETE') return deleteTask(userId, id);
  }

  throw new MockHttpError(404, `No mock route for ${req.method} ${path}`);
}

function toHttpError(error: unknown, url: string): HttpErrorResponse {
  const status = error instanceof MockHttpError ? error.status : 500;
  const message = error instanceof Error ? error.message : 'Unexpected error';
  return new HttpErrorResponse({ status, url, error: { message } });
}

export const mockBackendInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api/')) {
    return next(req);
  }
  const response$: Observable<HttpEvent<unknown>> = timer(LATENCY_MS).pipe(
    switchMap(() => from(route(req))),
    map((body) => new HttpResponse({ status: 200, body, url: req.url })),
    catchError((error: unknown) => throwError(() => toHttpError(error, req.url))),
  );
  return response$;
};
