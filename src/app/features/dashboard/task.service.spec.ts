import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { Task } from '../../models/task.model';
import { TaskApiService } from './task-api.service';
import { TaskService } from './task.service';

function makeTask(id: string, title: string, completed: boolean): Task {
  return {
    id,
    userId: 'u1',
    title,
    description: '',
    priority: 'medium',
    completed,
    dueDate: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

describe('TaskService', () => {
  const tasks = [makeTask('1', 'Write tests', true), makeTask('2', 'Learn RxJS', false), makeTask('3', 'Ship it', false)];
  let service: TaskService;
  let getAllCalls: number;

  beforeEach(() => {
    getAllCalls = 0;
    TestBed.configureTestingModule({
      providers: [
        TaskService,
        {
          provide: TaskApiService,
          useValue: {
            getAll: () => {
              getAllCalls++;
              return of(tasks);
            },
          },
        },
      ],
    });
    service = TestBed.inject(TaskService);
  });

  it('derives stats from the task list', async () => {
    const stats = await firstValueFrom(service.stats$);
    expect(stats).toEqual({ total: 3, completed: 1, pending: 2, completionRate: 33 });
  });

  it('filters by status', async () => {
    service.setStatus('pending');
    const filtered = await firstValueFrom(service.filteredTasks$);
    expect(filtered.map((task) => task.id)).toEqual(['2', '3']);
  });

  it('shares one request between subscribers', () => {
    const a = service.stats$.subscribe();
    const b = service.filteredTasks$.subscribe();
    expect(getAllCalls).toBe(1);
    a.unsubscribe();
    b.unsubscribe();
  });
});
