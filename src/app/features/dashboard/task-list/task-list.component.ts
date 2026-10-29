import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { NotificationService } from '../../../core/notifications/notification.service';
import { Task, TaskPayload, TaskStatusFilter } from '../../../models/task.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';
import { SpinnerComponent } from '../../../shared/components/spinner.component';
import { StatCardComponent } from '../../../shared/components/stat-card.component';
import { errorMessage } from '../../../shared/utils/error-message';
import { TaskFormComponent } from '../task-form/task-form.component';
import { TaskService } from '../task.service';
import { isOverdue, priorityBadge } from '../task.utils';

@Component({
  selector: 'app-task-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    StatCardComponent,
    SpinnerComponent,
    EmptyStateComponent,
    ConfirmDialogComponent,
    TaskFormComponent,
  ],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css',
})
export class TaskListComponent {
  private readonly taskService = inject(TaskService);
  private readonly notifications = inject(NotificationService);

  protected readonly tasks = toSignal(this.taskService.filteredTasks$, { initialValue: null });
  protected readonly stats = toSignal(this.taskService.stats$);
  protected readonly loading = toSignal(this.taskService.loading$, { initialValue: true });
  protected readonly error = toSignal(this.taskService.error$, { initialValue: null });
  protected readonly status = toSignal(this.taskService.status$, { initialValue: 'all' });

  protected readonly searchControl = new FormControl('', { nonNullable: true });
  protected readonly statusOptions: Array<{ value: TaskStatusFilter; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
  ];

  protected readonly formOpen = signal(false);
  protected readonly editingTask = signal<Task | null>(null);
  protected readonly saving = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly taskToDelete = signal<Task | null>(null);
  protected readonly deleting = signal(false);
  protected readonly togglingId = signal<string | null>(null);

  protected readonly priorityBadge = priorityBadge;
  protected readonly isOverdue = isOverdue;

  constructor() {
    this.searchControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((term) => this.taskService.setSearch(term));
  }

  protected setStatus(status: TaskStatusFilter): void {
    this.taskService.setStatus(status);
  }

  protected clearFilters(): void {
    this.searchControl.setValue('');
    this.taskService.setStatus('all');
  }

  protected retry(): void {
    this.taskService.reload();
  }

  protected openCreate(): void {
    this.editingTask.set(null);
    this.formError.set(null);
    this.formOpen.set(true);
  }

  protected openEdit(task: Task): void {
    this.editingTask.set(task);
    this.formError.set(null);
    this.formOpen.set(true);
  }

  protected closeForm(): void {
    if (!this.saving()) {
      this.formOpen.set(false);
    }
  }

  protected save(payload: TaskPayload): void {
    const editing = this.editingTask();
    const request$ = editing
      ? this.taskService.update(editing.id, payload)
      : this.taskService.create(payload);
    this.saving.set(true);
    this.formError.set(null);
    request$.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: () => {
        this.formOpen.set(false);
        this.notifications.success(editing ? 'Task updated.' : 'Task created.');
      },
      error: (error: unknown) => this.formError.set(errorMessage(error)),
    });
  }

  protected toggle(task: Task): void {
    this.togglingId.set(task.id);
    this.taskService
      .toggleCompleted(task)
      .pipe(finalize(() => this.togglingId.set(null)))
      .subscribe({
        next: (updated) =>
          this.notifications.success(updated.completed ? 'Nice! Task completed.' : 'Task moved back to pending.'),
        error: (error: unknown) => {
          this.notifications.error(errorMessage(error));
          this.taskService.reload();
        },
      });
  }

  protected confirmDelete(): void {
    const task = this.taskToDelete();
    if (!task) {
      return;
    }
    this.deleting.set(true);
    this.taskService
      .delete(task.id)
      .pipe(finalize(() => this.deleting.set(false)))
      .subscribe({
        next: () => {
          this.taskToDelete.set(null);
          this.notifications.success('Task deleted.');
        },
        error: (error: unknown) => this.notifications.error(errorMessage(error)),
      });
  }
}
