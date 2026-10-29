import { ChangeDetectionStrategy, Component, OnInit, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Task, TaskPayload, TaskPriority } from '../../../models/task.model';
import { ModalComponent } from '../../../shared/components/modal.component';
import { PRIORITY_OPTIONS } from '../task.utils';

@Component({
  selector: 'app-task-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ModalComponent],
  templateUrl: './task-form.component.html',
})
export class TaskFormComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);

  readonly task = input<Task | null>(null);
  readonly saving = input(false);
  readonly error = input<string | null>(null);
  readonly saved = output<TaskPayload>();
  readonly cancelled = output<void>();

  protected readonly priorities = PRIORITY_OPTIONS;

  protected readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
    description: ['', [Validators.maxLength(500)]],
    priority: ['medium' as TaskPriority, [Validators.required]],
    dueDate: [''],
  });

  ngOnInit(): void {
    const task = this.task();
    if (task) {
      this.form.setValue({
        title: task.title,
        description: task.description,
        priority: task.priority,
        dueDate: task.dueDate ?? '',
      });
    }
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.saved.emit({
      title: value.title.trim(),
      description: value.description.trim(),
      priority: value.priority,
      dueDate: value.dueDate || null,
    });
  }
}
