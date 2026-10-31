import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { AuthService, PrivateApplicationService, StepCoreModule } from '@exense/step-core';
import { BehaviorSubject, map, of } from 'rxjs';
import { InteractiveSessionService } from '../../injectables/interactive-session.service';
import { PlanEditorActionsComponent } from './plan-editor-actions.component';

describe('Interactive session action permissions', () => {
  let fixture: ComponentFixture<PlanEditorActionsComponent>;
  const rights = new BehaviorSubject(new Set<string>());

  beforeEach(() => {
    rights.next(new Set(['plan-write']));
    TestBed.configureTestingModule({
      imports: [StepCoreModule],
      declarations: [PlanEditorActionsComponent],
      providers: [
        provideNoopAnimations(),
        { provide: PrivateApplicationService, useValue: { getAllRepositoriesCanonicalParameters: () => of([]) } },
        {
          provide: AuthService,
          useValue: { hasRight$: (right: string) => rights.pipe(map((current) => current.has(right))) },
        },
        { provide: InteractiveSessionService, useValue: { hasExecutionParameters: signal(false) } },
      ],
    });
    fixture = TestBed.createComponent(PlanEditorActionsComponent);
  });

  afterEach(() => fixture.destroy());

  it('starts, stops and resets interactive sessions with interactive permission rather than plan-write', () => {
    fixture.detectChanges();
    const toggle: HTMLButtonElement = fixture.nativeElement.querySelector(
      'button[matTooltipPosition="below"]:has(step-icon[name="bug-01"])',
    );
    expect(toggle.disabled).toBe(true);
    rights.next(new Set(['interactive']));
    fixture.detectChanges();
    const start = jest.fn();
    const stop = jest.fn();
    fixture.componentInstance.startInteractive.subscribe(start);
    fixture.componentInstance.stop.subscribe(stop);
    expect(toggle.disabled).toBe(false);
    toggle.click();
    expect(start).toHaveBeenCalledTimes(1);
    fixture.componentRef.setInput('isInteractiveSessionActive', true);
    fixture.detectChanges();
    toggle.click();
    expect(stop).toHaveBeenCalledTimes(1);
    rights.next(new Set(['plan-write']));
    fixture.detectChanges();
    expect(toggle.disabled).toBe(true);
    const reset: HTMLButtonElement = fixture.nativeElement.querySelector('button:has(step-icon[name="refresh-cw"])');
    expect(reset.disabled).toBe(true);
  });
});
