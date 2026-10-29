import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, distinctUntilChanged, finalize, map, of, switchMap, tap } from 'rxjs';
import { NotificationService } from '../../../core/notifications/notification.service';
import { Task, TaskPayload } from '../../../models/task.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';
import { SpinnerComponent } from '../../../shared/components/spinner.component';
import { errorMessage } from '../../../shared/utils/error-message';
import { TaskFormComponent } from '../task-form/task-form.component';
import { TaskService } from '../task.service';
import { isOverdue, priorityBadge } from '../task.utils';

@Component({
  selector: 'app-task-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink, SpinnerComponent, EmptyStateComponent, ConfirmDialogComponent, TaskFormComponent],
  templateUrl: './task-detail.component.html',
})
export class TaskDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly taskService = inject(TaskService);
  private readonly notifications = inject(NotificationService);

  protected readonly task = signal<Task | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly busy = signal(false);
  protected readonly editing = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly confirmingDelete = signal(false);

  protected readonly priorityBadge = priorityBadge;
  protected readonly isOverdue = isOverdue;

  constructor() {
    this.route.paramMap
      .pipe(
        map((params) => params.get('id') ?? ''),
        distinctUntilChanged(),
        tap(() => {
          this.loading.set(true);
          this.error.set(null);
        }),
        switchMap((id) =>
          this.taskService.getById(id).pipe(
            catchError((error: unknown) => {
              this.error.set(errorMessage(error, 'Could not load this task.'));
              return of(null);
            }),
            finalize(() => this.loading.set(false)),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((task) => this.task.set(task));
  }

  protected toggle(task: Task): void {
    this.busy.set(true);
    this.taskService
      .toggleCompleted(task)
      .pipe(finalize(() => this.busy.set(false)))
      .subscribe({
        next: (updated) => {
          this.task.set(updated);
          this.notifications.success(updated.completed ? 'Task completed.' : 'Task reopened.');
        },
        error: (error: unknown) => this.notifications.error(errorMessage(error)),
      });
  }

  protected save(task: Task, payload: TaskPayload): void {
    this.busy.set(true);
    this.formError.set(null);
    this.taskService
      .update(task.id, payload)
      .pipe(finalize(() => this.busy.set(false)))
      .subscribe({
        next: (updated) => {
          this.task.set(updated);
          this.editing.set(false);
          this.notifications.success('Task updated.');
        },
        error: (error: unknown) => this.formError.set(errorMessage(error)),
      });
  }

  protected delete(task: Task): void {
    this.busy.set(true);
    this.taskService
      .delete(task.id)
      .pipe(finalize(() => this.busy.set(false)))
      .subscribe({
        next: () => {
          this.notifications.success('Task deleted.');
          this.router.navigate(['/dashboard']);
        },
        error: (error: unknown) => this.notifications.error(errorMessage(error)),
      });
  }
}
