import { Component, inject, signal } from '@angular/core';
import { fakeAsync, flushMicrotasks, TestBed, tick } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { By } from '@angular/platform-browser';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  provideRouter,
  RouteReuseStrategy,
  Router,
  RouterOutlet,
} from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import {
  AutoRefreshModelFactoryService,
  AugmentedControllerService,
  AugmentedExecutionsService,
  AugmentedPlansService,
  AugmentedTimeSeriesService,
  CustomMenuEntriesService,
  DateUtilsService,
  Execution,
  ExecutionOverview,
  ExecutionCloseHandleService,
  ExecutionViewModeService,
  FlatAggregatedReport,
  GlobalReloadService,
  GridEditableService,
  IS_SMALL_SCREEN,
  NavigatorService,
  SystemService,
  TableLocalDataSource,
  TableRemoteDataSourceFactoryService,
  ViewRegistryService,
} from '@exense/step-core';
import { NEVER, Observable, of, take, throwError } from 'rxjs';
import { AltExecutionProgressComponent } from './alt-execution-progress.component';
import { AltExecutionsComponent } from '../alt-executions/alt-executions.component';
import { ActiveExecutionsService } from '../../services/active-executions.service';
import { ActiveExecutionContextService } from '../../services/active-execution-context.service';
import { AltExecutionCloseHandleService } from '../../services/alt-execution-close-handle.service';
import { AltExecutionRefreshActivityService } from '../../services/alt-execution-refresh-activity.service';
import { AltExecutionRefreshActivity } from '../../shared/alt-execution-refresh-activity.enum';
import {
  ExecutionRouteReuseStrategy,
  RECREATE_ON_EXECUTION_CHANGE,
} from '../../services/execution-route-reuse-strategy';
import { EXECUTION_ID } from '../../services/execution-id.token';
import { AltExecutionTabsService } from '../../services/alt-execution-tabs.service';
import { AltExecutionDialogsService } from '../../services/alt-execution-dialogs.service';
import { AGGREGATED_TREE_WIDGET_STATE } from '../../services/aggregated-report-view-tree-state.service';
import { AggregatedTreeDataLoaderService } from '../../services/aggregated-tree-data-loader.service';
import { DashboardUrlParamsService } from '../../../timeseries/modules/_common/injectables/dashboard-url-params.service';

jest.mock('../../../timeseries/modules/_common/types/uPlot', () => ({}));

@Component({ selector: 'step-execution-list-probe', template: '' })
class ExecutionListProbeComponent {}

describe('Execution report after archiving', () => {
  it('loads B without requesting the deleted A after both executions were opened and closed', fakeAsync(() => {
    const executions = new Map<string, Execution>([
      ['A', { id: 'A', status: 'ENDED', startTime: 100, endTime: 200, description: 'planA' }],
      ['B', { id: 'B', status: 'ENDED', startTime: 100, endTime: 200, description: 'planB' }],
    ]);
    const failedAggregationIds: string[] = [];
    const getOverview = (id: string): Observable<ExecutionOverview> =>
      executions.has(id) ? of({ execution: executions.get(id) }) : NEVER;
    const aggregate = jest.fn((id: string): Observable<FlatAggregatedReport> => {
      if (!executions.has(id)) {
        failedAggregationIds.push(id);
        return throwError(() => new Error('Aggregation Report failed: execution is null'));
      }
      return of({
        aggregatedReportViews: [
          {
            singleInstanceReportNode: {
              _class: 'step.artefacts.reports.TestCaseReportNode',
              executionID: id,
              name: id,
            },
          },
        ],
      });
    });
    TestBed.configureTestingModule({
      declarations: [AltExecutionProgressComponent, AltExecutionsComponent],
      imports: [RouterOutlet, ExecutionListProbeComponent],
      providers: [
        ActiveExecutionsService,
        AutoRefreshModelFactoryService,
        CustomMenuEntriesService,
        DateUtilsService,
        { provide: GlobalReloadService, useValue: { register: jest.fn(), unRegister: jest.fn() } },
        { provide: NavigatorService, useValue: { reloadCurrentRoute: jest.fn() } },
        {
          provide: ExecutionViewModeService,
          useValue: { determineUrl: (execution: Execution) => of(`/executions/${execution.id}`) },
        },
        {
          provide: AugmentedExecutionsService,
          useValue: {
            getExecutionOverviewCached: getOverview,
            getExecutionOverview: getOverview,
            getFlatAggregatedReportView: aggregate,
            getFullAggregatedReportView: () => of({}),
            cleanupCache: jest.fn(),
          },
        },
        { provide: AugmentedPlansService, useValue: {} },
        { provide: AugmentedControllerService, useValue: { createDataSource: () => new TableLocalDataSource([]) } },
        { provide: SystemService, useValue: {} },
        { provide: TableRemoteDataSourceFactoryService, useValue: {} },
        { provide: AGGREGATED_TREE_WIDGET_STATE, useValue: { init: jest.fn(), searchCtrl: new FormControl('') } },
        { provide: IS_SMALL_SCREEN, useValue: of(false) },
        { provide: AugmentedTimeSeriesService, useValue: {} },
        { provide: GridEditableService, useValue: { editMode: signal(false) } },
        { provide: ViewRegistryService, useValue: { getDashlets: () => [] } },
        { provide: DashboardUrlParamsService, useValue: { patchUrlParams: jest.fn(), collectUrlParams: () => ({}) } },
        { provide: AltExecutionDialogsService, useValue: {} },
        { provide: RouteReuseStrategy, useClass: ExecutionRouteReuseStrategy },
        provideRouter([
          {
            path: 'executions',
            component: AltExecutionsComponent,
            children: [
              { path: '', redirectTo: 'list', pathMatch: 'full' },
              { path: 'list', component: ExecutionListProbeComponent },
              {
                path: ':id',
                component: AltExecutionProgressComponent,
                data: { [RECREATE_ON_EXECUTION_CHANGE]: true },
                providers: [ActiveExecutionContextService, AltExecutionRefreshActivityService],
                resolve: {
                  execution: (route: ActivatedRouteSnapshot): void => {
                    inject(ActiveExecutionContextService).setupExecutionId(route.params['id']);
                  },
                },
                canActivate: [
                  () => {
                    inject(AltExecutionRefreshActivityService).setupRefreshActivity(
                      AltExecutionRefreshActivity.TEST_CASES_TABLE,
                    );
                    return true;
                  },
                ],
              },
            ],
          },
        ]),
      ],
    });
    TestBed.overrideComponent(AltExecutionProgressComponent, {
      set: {
        template: '{{ currentEntity()?.id }}',
        providers: [
          AltExecutionTabsService,
          AggregatedTreeDataLoaderService,
          {
            provide: EXECUTION_ID,
            useFactory: (): (() => string) => {
              const _activatedRoute = inject(ActivatedRoute);
              return (): string => _activatedRoute.snapshot.params['id'];
            },
          },
          { provide: ExecutionCloseHandleService, useClass: AltExecutionCloseHandleService },
        ],
      },
    });
    TestBed.overrideComponent(AltExecutionsComponent, { set: { template: '<router-outlet />' } });
    let harness!: RouterTestingHarness;
    RouterTestingHarness.create('/executions/list').then((value) => (harness = value));
    flushMicrotasks();
    const open = (id: string): void => {
      harness.navigateByUrl(`/executions/${id}?viewAll=true`);
      flushMicrotasks();
      tick(1000);
      harness.detectChanges();
    };
    const close = (id: string): void => {
      (harness.routeDebugElement!.componentInstance as AltExecutionsComponent).handleTabClose(id, true);
      flushMicrotasks();
      tick(1000);
    };
    open('A');
    close('A');
    open('B');
    close('B');
    open('A');
    aggregate.mockClear();
    executions.delete('A');
    harness
      .routeDebugElement!.query(By.directive(AltExecutionProgressComponent))
      .injector.get(ExecutionCloseHandleService)
      .closeExecution();
    flushMicrotasks();
    tick(1000);
    open('B');
    expect(TestBed.inject(Router).url).toBe('/executions/B?viewAll=true');
    expect(failedAggregationIds).toEqual([]);
    expect(aggregate.mock.calls.map(([id]) => id)).toEqual(['B']);
    expect(harness.routeNativeElement?.textContent).toContain('B');
    const report = harness.routeDebugElement!.query(By.directive(AltExecutionProgressComponent))
      .componentInstance as AltExecutionProgressComponent;
    let reportExecutionIds: (string | undefined)[] = [];
    report.testCases$.pipe(take(1)).subscribe((nodes) => {
      reportExecutionIds = (nodes ?? []).map((node) => node.singleInstanceReportNode?.executionID);
    });
    expect(reportExecutionIds).toEqual(['B']);
    report.updateTimeRangeSelection({ type: 'ABSOLUTE', absoluteSelection: { from: 120, to: 180 } });
    tick(200);
    expect(aggregate.mock.calls.map(([id]) => id)).toEqual(['B', 'B']);
    expect(failedAggregationIds).toEqual([]);
    TestBed.inject(ActiveExecutionsService).cleanup();
    harness.fixture.destroy();
  }));
});
