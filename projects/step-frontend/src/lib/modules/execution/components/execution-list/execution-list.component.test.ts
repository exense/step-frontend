import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import {
  AugmentedExecutionsService,
  AugmentedScreenService,
  AuthService,
  DialogsService,
  DashletRegistryService,
  EntityRefDirective,
  Execution,
  PrivateApplicationService,
  provideTestStepApi,
  StepCoreModule,
  ScreenDataMetaService,
  TableApiWrapperService,
  TableFetchLocalDataSource,
  UserService,
} from '@exense/step-core';
import { of } from 'rxjs';
import { TimeSeriesEntityService } from '../../../timeseries/modules/_common';
import { ExecutionListComponent } from './execution-list.component';
import { DashletEmptyColumnComponent } from '../dashlet-empty-column/dashlet-empty-column.component';

jest.mock('../../../timeseries/modules/_common', () => ({ TimeSeriesEntityService: class TimeSeriesEntityService {} }));

describe('Individual execution-list commands', () => {
  let fixture: ComponentFixture<ExecutionListComponent>;
  let http: HttpTestingController;
  let execution: Execution;
  const showWarning = jest.fn(() => of(true));

  beforeEach(() => {
    showWarning.mockReset().mockReturnValue(of(true));
    execution = {
      id: 'original',
      description: 'Original execution',
      status: 'RUNNING',
      executionParameters: {
        description: 'Original execution',
        userID: 'expert',
        mode: 'RUN',
        customParameters: { application: 'customer' },
        repositoryObject: { repositoryID: 'local', repositoryParameters: { planid: 'plan' } },
        artefactFilter: { class: 'filter' },
        isolatedExecution: true,
      },
    };
    TestBed.configureTestingModule({
      imports: [StepCoreModule, EntityRefDirective],
      declarations: [ExecutionListComponent, DashletEmptyColumnComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        provideTestStepApi(),
        provideHttpClientTesting(),
        {
          provide: AuthService,
          useValue: {
            getUserID: () => 'tester',
            hasRight$: (right: string) => of(['plan-execute', 'execution-read'].includes(right)),
            getConf: () => ({}),
          },
        },
        { provide: DialogsService, useValue: { showWarning } },
        { provide: TimeSeriesEntityService, useValue: { clearCache: jest.fn() } },
        { provide: PrivateApplicationService, useValue: { getAllRepositoriesCanonicalParameters: () => of([]) } },
        { provide: AugmentedScreenService, useValue: { getScreenInputsByScreenIdWithCache: () => of([]) } },
        {
          provide: TableApiWrapperService,
          useValue: { getTableSettings: () => of({ columnSettingList: [] }), saveTableSettings: () => of({}) },
        },
        { provide: UserService, useValue: { getPreferences: () => of({}) } },
        { provide: ScreenDataMetaService, useValue: { checkMetaInformationAboutScreenInRoute: () => undefined } },
      ],
    });
    const api = TestBed.inject(AugmentedExecutionsService);
    TestBed.inject(DashletRegistryService).registerDashlet('executionEntityColumn', DashletEmptyColumnComponent);
    jest
      .spyOn(api, 'getExecutionsTableDataSource')
      .mockReturnValue(new TableFetchLocalDataSource(() => of([execution])));
    jest.spyOn(api, 'countExecutionsByStatus').mockReturnValue(of(1));
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    fixture?.destroy();
    http.verify();
  });

  function render(): void {
    fixture = TestBed.createComponent(ExecutionListComponent);
    fixture.detectChanges();
    tick(500);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
  }

  it('re-executes the row with its original parameters as the current user through the single-execution API', fakeAsync(() => {
    render();
    const restart: HTMLAnchorElement = fixture.nativeElement.querySelector('[data-step-testid="execute-plan-btn"]');
    expect(restart).not.toBeNull();
    restart.click();
    tick();
    const request = http.expectOne((value) => value.url.endsWith('/executions/start'));
    expect(request.request.body).toEqual({ ...execution.executionParameters, userID: 'tester' });
    expect(execution.executionParameters!.userID).toBe('expert');
    request.flush('restarted');
    tick();
    showWarning.mockReturnValue(of(false));
    restart.click();
    tick();
    http.expectNone((value) => value.url.includes('/executions/'));
  }));

  it('stops the selected row without using the bulk-execution API', fakeAsync(() => {
    render();
    const stop: HTMLButtonElement = fixture.nativeElement.querySelector('button[matTooltip="Stop execution"]');
    expect(stop.disabled).toBe(false);
    stop.click();
    tick();
    const request = http.expectOne((value) => value.url.endsWith('/executions/original/stop'));
    expect(request.request.method).toBe('GET');
    request.flush(null);
    tick();
  }));

  it('loads the original execution when a list row does not contain its execution parameters', fakeAsync(() => {
    const parameters = execution.executionParameters;
    execution.executionParameters = undefined;
    render();
    fixture.nativeElement.querySelector('[data-step-testid="execute-plan-btn"]').click();
    tick();
    http
      .expectOne((request) => request.url.endsWith('/executions/original'))
      .flush({ ...execution, executionParameters: parameters });
    tick();
    const request = http.expectOne((value) => value.url.endsWith('/executions/start'));
    expect(request.request.body).toEqual({ ...parameters, userID: 'tester' });
    request.flush('restarted');
    tick();
  }));
});
