import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { fakeAsync, flushMicrotasks, TestBed, tick } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, RouteReuseStrategy, Router, RouterOutlet } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import {
  ApiError,
  AugmentedExecutionsService,
  CustomMenuEntriesService,
  Execution,
  ExecutionOverview,
  ExecutionViewModeService,
} from '@exense/step-core';
import { config, Observable, of, Subject } from 'rxjs';
import { AltExecutionsComponent } from '../components/alt-executions/alt-executions.component';
import { ActiveExecutionContextService } from './active-execution-context.service';
import { ActiveExecutionsService } from './active-executions.service';
import { ExecutionRouteReuseStrategy, RECREATE_ON_EXECUTION_CHANGE } from './execution-route-reuse-strategy';

@Component({
  selector: 'step-active-execution-probe',
  template: '{{ execution()?.id }}',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ActiveExecutionProbeComponent {
  private readonly _context = inject(ActiveExecutionContextService);
  protected readonly execution = toSignal(this._context.execution$);
}

interface OverviewRequest {
  id: string;
  response$: Subject<ExecutionOverview>;
}

describe('Active execution requests and tabs', () => {
  let executions: ActiveExecutionsService;
  let requests: OverviewRequest[];
  let pending: Set<OverviewRequest>;
  let reportedErrors: unknown[];
  let previousErrorHandler: typeof config.onUnhandledError;
  let determineUrl: jest.Mock<Observable<string>, [Execution]>;

  function latest(id: string): OverviewRequest {
    return requests.filter((request) => request.id === id).at(-1)!;
  }

  function complete(id: string): void {
    const request = latest(id);
    request.response$.next({ execution: { id, status: 'ENDED', description: `plan${id}` } });
    request.response$.complete();
  }

  function apiError(status: number): ApiError {
    return new ApiError(
      { method: 'GET', url: '/executions/{id}/overview' },
      { url: 'rest/executions/A/overview', ok: false, status, statusText: 'Failed', body: {} },
      'Execution overview failed',
    );
  }

  beforeEach(() => {
    requests = [];
    pending = new Set();
    reportedErrors = [];
    previousErrorHandler = config.onUnhandledError;
    config.onUnhandledError = (error): void => {
      reportedErrors.push(error);
    };
    determineUrl = jest.fn((execution: Execution): Observable<string> => of(`/executions/${execution.id}`));
    const loadOverview = (id: string): Observable<ExecutionOverview> =>
      new Observable((subscriber) => {
        const request: OverviewRequest = { id, response$: new Subject<ExecutionOverview>() };
        requests.push(request);
        pending.add(request);
        const subscription = request.response$.subscribe(subscriber);
        return (): void => {
          pending.delete(request);
          subscription.unsubscribe();
        };
      });
    TestBed.configureTestingModule({
      declarations: [AltExecutionsComponent],
      imports: [RouterOutlet, ActiveExecutionProbeComponent],
      providers: [
        ActiveExecutionsService,
        CustomMenuEntriesService,
        {
          provide: AugmentedExecutionsService,
          useValue: {
            getExecutionOverviewCached: loadOverview,
            getExecutionOverview: loadOverview,
            cleanupCache: jest.fn(),
          },
        },
        {
          provide: ExecutionViewModeService,
          useValue: { determineUrl },
        },
        { provide: RouteReuseStrategy, useClass: ExecutionRouteReuseStrategy },
        provideRouter([
          {
            path: 'executions',
            component: AltExecutionsComponent,
            children: [
              { path: 'list', component: ActiveExecutionProbeComponent, providers: [ActiveExecutionContextService] },
              {
                path: ':id',
                component: ActiveExecutionProbeComponent,
                providers: [ActiveExecutionContextService],
                data: { [RECREATE_ON_EXECUTION_CHANGE]: true },
                resolve: {
                  context: (route: ActivatedRouteSnapshot): void => {
                    inject(ActiveExecutionContextService).setupExecutionId(route.params['id']);
                  },
                },
              },
            ],
          },
        ]),
      ],
    });
    TestBed.overrideComponent(AltExecutionsComponent, { set: { template: '<router-outlet />' } });
    executions = TestBed.inject(ActiveExecutionsService);
  });

  afterEach(() => {
    executions.cleanup();
    config.onUnhandledError = previousErrorHandler;
  });

  it('cancels pending and queued overview loads when A closes while B remains usable', fakeAsync(() => {
    const closedExecution = executions.getActiveExecution('A');
    tick(350);
    closedExecution.manualRefresh();
    expect(pending.size).toBe(2);
    executions.removeActiveExecution('A');
    expect(pending.size).toBe(0);

    const closedRequests = [...requests];
    const requestCount = requests.length;
    closedExecution.manualRefresh();
    closedExecution.adjustAutoRefresh(6000);
    closedRequests.forEach((request) => {
      request.response$.next({ execution: { id: 'A', status: 'RUNNING' } });
      request.response$.complete();
    });
    tick(10_000);
    expect(requests).toHaveLength(requestCount);
    expect(executions.hasExecution('A')).toBe(false);

    const currentExecution = executions.getActiveExecution('B');
    complete('B');
    const observedIds: (string | undefined)[] = [];
    const subscription = currentExecution.execution$.subscribe((execution) => observedIds.push(execution.id));
    currentExecution.manualRefresh();
    complete('B');
    expect(observedIds).toEqual(['B', 'B']);
    expect(pending.size).toBe(0);
    subscription.unsubscribe();
    executions.cleanup();
  }));

  it('closes missing background A without leaving B, retries a temporary B failure, then closes forbidden B', fakeAsync(() => {
    let harness!: RouterTestingHarness;
    RouterTestingHarness.create().then((created) => (harness = created));
    flushMicrotasks();
    const open = (id: string): void => {
      harness.navigateByUrl(`/executions/${id}?viewAll=true`);
      flushMicrotasks();
      complete(id);
      harness.detectChanges();
    };
    open('A');
    open('B');
    const menus = TestBed.inject(CustomMenuEntriesService);
    expect(menus.has('executions/A')).toBe(true);
    expect(menus.has('executions/B')).toBe(true);
    harness.navigateByUrl('/executions/A?viewAll=true');
    flushMicrotasks();
    harness.navigateByUrl('/executions/B?viewAll=true');
    flushMicrotasks();
    expect(determineUrl).toHaveBeenCalledTimes(2);

    executions.getActiveExecution('A').manualRefresh();
    latest('A').response$.error(apiError(404));
    tick();
    expect(executions.hasExecution('A')).toBe(false);
    expect(menus.has('executions/A')).toBe(false);
    expect(TestBed.inject(Router).url).toBe('/executions/B?viewAll=true');

    const currentExecution = executions.getActiveExecution('B');
    currentExecution.manualRefresh();
    latest('B').response$.error(apiError(500));
    tick();
    expect(executions.hasExecution('B')).toBe(true);
    expect(menus.has('executions/B')).toBe(true);
    currentExecution.manualRefresh();
    complete('B');
    harness.detectChanges();
    expect(harness.routeNativeElement?.textContent).toContain('B');

    currentExecution.manualRefresh();
    latest('B').response$.error(apiError(403));
    flushMicrotasks();
    tick(250);
    expect(executions.hasExecution('B')).toBe(false);
    expect(menus.has('executions/B')).toBe(false);
    expect(TestBed.inject(Router).url).toBe('/executions/list');
    expect(executions.size()).toBe(0);
    expect(reportedErrors).toEqual([]);
    harness.fixture.destroy();
  }));

  it('closes a missing execution before its first response can register a report tab', fakeAsync(() => {
    let harness!: RouterTestingHarness;
    RouterTestingHarness.create('/executions/A?viewAll=true').then((created) => (harness = created));
    flushMicrotasks();
    latest('A').response$.next({});
    latest('A').response$.complete();
    tick();
    flushMicrotasks();
    expect(executions.hasExecution('A')).toBe(false);
    expect(TestBed.inject(CustomMenuEntriesService).has('executions/A')).toBe(false);
    expect(TestBed.inject(Router).url).toBe('/executions/list');
    expect(reportedErrors).toEqual([]);
    harness.fixture.destroy();
  }));
});
