import { TestBed } from '@angular/core/testing';
import { AuthService, PrivateApplicationService, StepCoreModule } from '@exense/step-core';
import { BehaviorSubject, map, of } from 'rxjs';
import { ExecutionActionsComponent } from './execution-actions.component';

describe('Scheduling from execution actions', () => {
  it('requires both execution and schedule-write permission before opening the scheduler', () => {
    const rights = new BehaviorSubject(new Set(['plan-execute']));
    TestBed.configureTestingModule({
      imports: [StepCoreModule],
      declarations: [ExecutionActionsComponent],
      providers: [
        {
          provide: AuthService,
          useValue: { hasRight$: (right: string) => rights.pipe(map((current) => current.has(right))) },
        },
        { provide: PrivateApplicationService, useValue: { getAllRepositoriesCanonicalParameters: () => of([]) } },
      ],
    });
    const fixture = TestBed.createComponent(ExecutionActionsComponent);
    fixture.detectChanges();
    const schedule: HTMLButtonElement = fixture.nativeElement.querySelector('button:has(step-icon[name="clock"])');
    const opened = jest.fn();
    fixture.componentInstance.schedule.subscribe(opened);
    expect(schedule.disabled).toBe(true);
    schedule.click();
    expect(opened).not.toHaveBeenCalled();
    rights.next(new Set(['plan-execute', 'task-write']));
    fixture.detectChanges();
    expect(schedule.disabled).toBe(false);
    schedule.click();
    expect(opened).toHaveBeenCalledTimes(1);
    fixture.destroy();
  });
});
