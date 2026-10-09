import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { fakeAsync, flushMicrotasks, TestBed, tick } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, RouteReuseStrategy } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { AugmentedExecutionsService, Execution, ExecutionOverview } from '@exense/step-core';
import { EMPTY, Observable, of } from 'rxjs';
import { ActiveExecutionContextService } from './active-execution-context.service';
import { ActiveExecutionsService } from './active-executions.service';
import { ExecutionRouteReuseStrategy, RECREATE_ON_EXECUTION_CHANGE } from './execution-route-reuse-strategy';

@Component({
  selector: 'step-execution-context-probe',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ExecutionContextProbeComponent {}

describe('Execution context lifetime', () => {
  it('keeps a deleted execution closed during a delayed refresh and then opens another execution', fakeAsync(() => {
    const executions = new Map<string, Execution>([
      ['deleted', { id: 'deleted', status: 'ENDED' }],
      ['other', { id: 'other', status: 'ENDED' }],
    ]);
    const loadOverview = jest.fn((id: string): Observable<ExecutionOverview> => {
      const execution = executions.get(id);
      return execution ? of({ execution }) : EMPTY;
    });
    TestBed.configureTestingModule({
      imports: [ExecutionContextProbeComponent],
      providers: [
        ActiveExecutionsService,
        {
          provide: AugmentedExecutionsService,
          useValue: {
            getExecutionOverviewCached: loadOverview,
            getExecutionOverview: loadOverview,
            cleanupCache: jest.fn(),
          },
        },
        { provide: RouteReuseStrategy, useClass: ExecutionRouteReuseStrategy },
        provideRouter([
          { path: 'executions/list', component: ExecutionContextProbeComponent },
          {
            path: 'executions/:id',
            component: ExecutionContextProbeComponent,
            data: { [RECREATE_ON_EXECUTION_CHANGE]: true },
            providers: [ActiveExecutionContextService],
            resolve: {
              context: (route: ActivatedRouteSnapshot): boolean => {
                inject(ActiveExecutionContextService).setupExecutionId(route.params['id']);
                return true;
              },
            },
          },
        ]),
      ],
    });
    let harness!: RouterTestingHarness;
    RouterTestingHarness.create().then((createdHarness) => (harness = createdHarness));
    flushMicrotasks();
    harness.navigateByUrl('/executions/deleted?viewAll=true');
    flushMicrotasks();
    const context = harness.routeDebugElement!.injector.get(ActiveExecutionContextService);
    const openedIds: (string | undefined)[] = [];
    const subscription = context.execution$.subscribe((execution) => openedIds.push(execution.id));
    tick(500);
    expect(openedIds).toEqual(['deleted']);

    const activeExecutions = TestBed.inject(ActiveExecutionsService);
    executions.delete('deleted');
    activeExecutions.removeActiveExecution('deleted');
    loadOverview.mockClear();
    harness.navigateByUrl('/executions/list');
    flushMicrotasks();
    tick(250);
    expect(loadOverview).not.toHaveBeenCalled();
    context.adjustAutoRefresh(6000);
    expect(activeExecutions.hasExecution('deleted')).toBe(false);
    expect(loadOverview).not.toHaveBeenCalled();

    harness.navigateByUrl('/executions/other?viewAll=true');
    flushMicrotasks();
    tick(500);
    expect(openedIds).toEqual(['deleted', 'other']);
    expect(activeExecutions.activeExecutionIds()).toEqual(['other']);
    expect(loadOverview.mock.calls.map(([id]) => id)).toEqual(['other']);

    loadOverview.mockClear();
    context.manualRefresh();
    expect(loadOverview).toHaveBeenCalledWith('other');
    expect(openedIds).toEqual(['deleted', 'other', 'other']);
    subscription.unsubscribe();
    activeExecutions.cleanup();
    harness.fixture.destroy();
  }));
});
