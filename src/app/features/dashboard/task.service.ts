import { Injectable, inject } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  finalize,
  map,
  of,
  shareReplay,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { Task, TaskPayload, TaskStats, TaskStatusFilter } from '../../models/task.model';
import { errorMessage } from '../../shared/utils/error-message';
import { TaskApiService } from './task-api.service';

@Injectable()
export class TaskService {
  private readonly api = inject(TaskApiService);

  private readonly refresh$ = new BehaviorSubject<void>(undefined);
  private readonly searchTerm$ = new BehaviorSubject<string>('');
  private readonly statusFilter$ = new BehaviorSubject<TaskStatusFilter>('all');
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);

  readonly loading$ = this.loadingSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();
  readonly status$ = this.statusFilter$.asObservable();

  readonly tasks$: Observable<Task[]> = this.refresh$.pipe(
    tap(() => {
      this.loadingSubject.next(true);
      this.errorSubject.next(null);
    }),
    switchMap(() =>
      this.api.getAll().pipe(
        catchError((error: unknown) => {
          this.errorSubject.next(errorMessage(error, 'Could not load your tasks.'));
          return of<Task[]>([]);
        }),
        finalize(() => this.loadingSubject.next(false)),
      ),
    ),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  private readonly search$ = this.searchTerm$.pipe(
    debounceTime(300),
    map((term) => term.trim().toLowerCase()),
    startWith(''),
    distinctUntilChanged(),
  );

  readonly filteredTasks$: Observable<Task[]> = combineLatest([
    this.tasks$,
    this.search$,
    this.statusFilter$,
  ]).pipe(map(([tasks, search, status]) => this.applyFilters(tasks, search, status)));

  readonly stats$: Observable<TaskStats> = this.tasks$.pipe(
    map((tasks) => {
      const completed = tasks.filter((task) => task.completed).length;
      const total = tasks.length;
      return {
        total,
        completed,
        pending: total - completed,
        completionRate: total === 0 ? 0 : Math.round((completed / total) * 100),
      };
    }),
  );

  setSearch(term: string): void {
    this.searchTerm$.next(term);
  }

  setStatus(status: TaskStatusFilter): void {
    this.statusFilter$.next(status);
  }

  reload(): void {
    this.refresh$.next();
  }

  getById(id: string): Observable<Task> {
    return this.api.getById(id);
  }

  create(payload: TaskPayload): Observable<Task> {
    return this.api.create(payload).pipe(tap(() => this.reload()));
  }

  update(id: string, payload: TaskPayload): Observable<Task> {
    return this.api.update(id, payload).pipe(tap(() => this.reload()));
  }

  toggleCompleted(task: Task): Observable<Task> {
    return this.api.setCompleted(task.id, !task.completed).pipe(tap(() => this.reload()));
  }

  delete(id: string): Observable<void> {
    return this.api.delete(id).pipe(tap(() => this.reload()));
  }

  private applyFilters(tasks: Task[], search: string, status: TaskStatusFilter): Task[] {
    return tasks
      .filter((task) => {
        if (status === 'completed') return task.completed;
        if (status === 'pending') return !task.completed;
        return true;
      })
      .filter(
        (task) =>
          !search ||
          task.title.toLowerCase().includes(search) ||
          task.description.toLowerCase().includes(search),
      );
  }
}
