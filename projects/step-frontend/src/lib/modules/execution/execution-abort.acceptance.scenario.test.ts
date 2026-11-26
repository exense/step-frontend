import { OverlayContainer } from '@angular/cdk/overlay';
import { HttpRequest } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting, TestRequest } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatTooltip } from '@angular/material/tooltip';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import * as stepCore from '@exense/step-core';
import {
  AugmentedExecutionsService,
  AugmentedScreenService,
  AuthService,
  CustomRegistryType,
  DashletRegistryService,
  EntityRefDirective,
  Execution,
  PrivateApplicationService,
  provideTestStepApi,
  ScreenDataMetaService,
  StepCoreModule,
  TableApiWrapperService,
  TableFetchLocalDataSource,
  UserService,
} from '@exense/step-core';
import { defer, of } from 'rxjs';
import { TimeSeriesEntityService } from '../timeseries/modules/_common';
import { DashletEmptyColumnComponent } from './components/dashlet-empty-column/dashlet-empty-column.component';
import { ExecutionActionsComponent } from './components/execution-actions/execution-actions.component';
import { ExecutionCommandsComponent } from './components/execution-commands/execution-commands.component';
import { ExecutionListComponent } from './components/execution-list/execution-list.component';
import { ExecutionBulkOperationsRegisterService } from './services/execution-bulk-operations-register.service';

jest.mock('../timeseries/modules/_common', () => ({ TimeSeriesEntityService: class TimeSeriesEntityService {} }));

describe('SED-4973 execution abort', () => {
  const executionId = 'execution-a';
  const executionName = 'Nightly integration';
  const singleStopUrl = `/executions/${executionId}/stop`;
  const bulkStopUrl = '/executions/bulk/stop';
  const confirmBulkStop = /^(Stop|Ok|Confirm)$/i;
  const reason = 'Stopped for <maintenance>.\nResume after approval.';

  let fixture: ComponentFixture<ExecutionListComponent | ExecutionCommandsComponent>;
  let http: HttpTestingController;
  let overlay: HTMLElement;
  let currentUserId: string | undefined;
  let executions: Execution[];
  const fetchRows = jest.fn(() => of(executions));

  beforeEach(() => {
    currentUserId = 'operator';
    executions = [
      {
        id: executionId,
        description: executionName,
        status: 'RUNNING',
        executionParameters: {
          description: executionName,
          userID: 'original-user',
          mode: 'RUN',
          repositoryObject: { repositoryID: 'local', repositoryParameters: { planid: 'plan' } },
        },
      },
      { id: 'execution-b', description: 'Weekly integration', status: 'RUNNING' },
      { id: 'execution-c', description: 'On-demand integration', status: 'RUNNING' },
    ];
    fetchRows.mockClear();
    TestBed.configureTestingModule({
      imports: [StepCoreModule, EntityRefDirective],
      declarations: [
        ExecutionListComponent,
        ExecutionCommandsComponent,
        ExecutionActionsComponent,
        DashletEmptyColumnComponent,
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        provideTestStepApi(),
        provideHttpClientTesting(),
        {
          provide: AuthService,
          useValue: {
            getUserID: () => currentUserId,
            context$: defer(() => of(currentUserId ? { userID: currentUserId } : undefined)),
            hasRight$: (right: string) => of(['plan-execute', 'plan-bulk-execute', 'execution-read'].includes(right)),
            getConf: () => ({}),
          },
        },
        { provide: TimeSeriesEntityService, useValue: { clearCache: jest.fn() } },
        { provide: PrivateApplicationService, useValue: { getAllRepositoriesCanonicalParameters: () => of([]) } },
        {
          provide: AugmentedScreenService,
          useValue: {
            getScreenInputsByScreenIdWithCache: () => of([]),
            filterInactiveParameters: (_screen: string, parameters: Record<string, string>) => of(parameters),
          },
        },
        {
          provide: TableApiWrapperService,
          useValue: { getTableSettings: () => of({ columnSettingList: [] }), saveTableSettings: () => of({}) },
        },
        { provide: UserService, useValue: { getPreferences: () => of({}) } },
        { provide: ScreenDataMetaService, useValue: { checkMetaInformationAboutScreenInRoute: () => undefined } },
      ],
    });

    const api = TestBed.inject(AugmentedExecutionsService);
    const rows = new TableFetchLocalDataSource(fetchRows);
    // The test data returns synchronously, so there is no in-flight row request to skip.
    jest.spyOn(rows, 'skipOngoingRequest').mockImplementation(() => undefined);
    jest.spyOn(api, 'getExecutionsTableDataSource').mockReturnValue(rows);
    jest.spyOn(api, 'countExecutionsByStatus').mockReturnValue(of(3));
    TestBed.inject(DashletRegistryService).registerDashlet('executionEntityColumn', DashletEmptyColumnComponent);
    TestBed.inject(ExecutionBulkOperationsRegisterService).register();
    http = TestBed.inject(HttpTestingController);
    overlay = TestBed.inject(OverlayContainer).getContainerElement();
  });

  afterEach(() => {
    fixture?.destroy();
    http.verify();
  });

  function settle(ms = 0): void {
    fixture.detectChanges();
    TestBed.tick();
    tick(ms);
    fixture.detectChanges();
    TestBed.tick();
  }

  function renderList(): void {
    fixture = TestBed.createComponent(ExecutionListComponent);
    settle(500);
    settle();
  }

  function renderDetails(status: Execution['status'] = 'RUNNING'): void {
    fixture = TestBed.createComponent(ExecutionCommandsComponent);
    fixture.componentRef.setInput('execution', { ...executions[0], status });
    fixture.componentRef.setInput('description', executionName);
    fixture.componentRef.setInput('repositoryObjectRef', executions[0].executionParameters?.repositoryObject);
    fixture.componentRef.setInput('displayParametersForm', false);
    settle();
  }

  function actionNamed(label: string, within?: HTMLElement): HTMLElement {
    // The existing icon actions expose their names through Material tooltips.
    const actions = fixture.debugElement
      .queryAll(By.directive(MatTooltip))
      .filter((element) => element.injector.get(MatTooltip).message === label)
      .map((element) => element.nativeElement as HTMLElement)
      .filter((element) => !within || within.contains(element));
    expect(actions).toHaveLength(1);
    return actions[0];
  }

  function rowNamed(name: string): HTMLElement {
    const root: HTMLElement = fixture.nativeElement;
    const rows = Array.from(root.querySelectorAll<HTMLElement>('tr, [role="row"]'));
    const row = rows.find((candidate) =>
      Array.from(candidate.querySelectorAll('a')).some((a) => a.textContent?.trim() === name),
    );
    expect(row).toBeDefined();
    return row!;
  }

  function dialog(): HTMLElement {
    const dialogs = overlay.querySelectorAll<HTMLElement>('[role="dialog"], [role="alertdialog"]');
    expect(dialogs).toHaveLength(1);
    return dialogs[0];
  }

  function dialogButton(name: string | RegExp): HTMLButtonElement {
    const buttons = Array.from(dialog().querySelectorAll<HTMLButtonElement>('button'));
    const button = buttons.find((candidate) => {
      const text = (candidate.getAttribute('aria-label') ?? candidate.textContent ?? '').trim();
      return typeof name === 'string' ? text === name : name.test(text);
    });
    expect(button).toBeDefined();
    return button!;
  }

  function reasonEditor(): HTMLTextAreaElement {
    const modal = dialog();
    expect(modal.textContent).toMatch(/\bReason\b/);
    const editors = modal.querySelectorAll<HTMLTextAreaElement>('[aria-label="Reason"]');
    expect(editors).toHaveLength(1);
    expect(editors[0]).toBeInstanceOf(HTMLTextAreaElement);
    return editors[0];
  }

  function editReason(text: string): void {
    const editor = reasonEditor();
    editor.value = text;
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    settle();
  }

  function expectDefaultReason(): void {
    expect(reasonEditor().value).toBe('Interrupted by operator');
  }

  function expectReasonRequired(confirmLabel: string | RegExp): void {
    editReason('');
    const validation = (): number => dialog().textContent?.match(/\brequired\b/gi)?.length ?? 0;
    const beforeSubmit = validation();
    dialogButton(confirmLabel).click();
    settle();
    expect(validation()).toBeGreaterThan(beforeSubmit);
    expectNoAbortRequests();
  }

  function requestUrl(request: HttpRequest<unknown>): URL {
    return new URL(request.urlWithParams, document.baseURI);
  }

  function executionRequest(path: string): TestRequest {
    return http.expectOne((request) => requestUrl(request).pathname.endsWith(path));
  }

  function expectNoAbortRequests(): void {
    http.expectNone((request) =>
      [singleStopUrl, bulkStopUrl].some((path) => requestUrl(request).pathname.endsWith(path)),
    );
  }

  function expectNoDescriptionWrite(): void {
    http.expectNone((request) => request.url.includes(`/executions/${executionId}`) && request.method !== 'GET');
  }

  function startBulkStop(): TestRequest {
    renderList();
    for (const name of [executionName, 'Weekly integration']) {
      const checkbox = rowNamed(name).querySelector<HTMLInputElement>('input[type="checkbox"], [role="checkbox"]');
      expect(checkbox).not.toBeNull();
      checkbox!.click();
      settle();
    }
    actionNamed('Stop selected').click();
    settle();
    return executionRequest(bulkStopUrl);
  }

  function completePreview(request: TestRequest): void {
    request.flush({ ready: true, result: { count: 2 } });
    settle(500);
    expect(dialog().textContent).toContain('Do you want to stop the 2 selected item(s)?');
  }

  function expectBulkSelection(request: TestRequest, preview: boolean): void {
    const requestBody = request.request.body;
    const body = typeof requestBody === 'string' ? JSON.parse(requestBody) : requestBody;
    expect(body).toEqual({
      targetType: 'LIST',
      ids: expect.arrayContaining([executionId, 'execution-b']),
      preview,
    });
    expect(body.ids).toHaveLength(2);
  }

  function reportBulkFailure(request: TestRequest, message: string): void {
    const logError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      request.flush({ ready: true, error: message });
      settle(500);
    } finally {
      logError.mockRestore();
    }
    expect(dialog().textContent).toContain(`Error: ${message}`);
  }

  it('AC-1: confirms a details Stop once with the entered plain-text reason', fakeAsync(() => {
    renderDetails();
    actionNamed('Stop').click();
    settle();

    expectNoAbortRequests();
    expect(dialog().textContent).toContain(executionName);
    dialogButton('Cancel');
    dialogButton('Stop');
    expectDefaultReason();
    editReason(reason);
    dialogButton('Stop').click();
    settle();

    const request = executionRequest(singleStopUrl);
    expect(requestUrl(request.request).searchParams.get('abortReason')).toBe(reason);
    request.flush(null);
    settle();
    expectNoAbortRequests();
    expectNoDescriptionWrite();
  }));

  it('AC-1: confirms a row Stop and reloads the list after success', fakeAsync(() => {
    renderList();
    const fetchesBeforeStop = fetchRows.mock.calls.length;
    actionNamed('Stop execution', rowNamed(executionName)).click();
    settle();

    expect(dialog().textContent).toContain(executionName);
    dialogButton('Cancel');
    expectDefaultReason();
    expectNoAbortRequests();
    editReason(reason);
    dialogButton('Stop').click();
    settle();

    const request = executionRequest(singleStopUrl);
    expect(requestUrl(request.request).searchParams.get('abortReason')).toBe(reason);
    expect(fetchRows).toHaveBeenCalledTimes(fetchesBeforeStop);
    request.flush(null);
    settle(500);
    expect(fetchRows.mock.calls.length).toBeGreaterThan(fetchesBeforeStop);
    expectNoAbortRequests();
    expectNoDescriptionWrite();
  }));

  it('AC-2: defaults to interrupted without a user and keeps a cleared reason open until cancelled', fakeAsync(() => {
    currentUserId = undefined;
    renderList();
    actionNamed('Stop execution', rowNamed(executionName)).click();
    settle();

    expect(reasonEditor().value).toBe('interrupted');
    expectReasonRequired('Stop');
    dialogButton('Cancel').click();
    settle();
    expect(overlay.querySelector('[role="dialog"], [role="alertdialog"]')).toBeNull();
    expectNoAbortRequests();
  }));

  it('AC-2: dismisses a single Stop without aborting', fakeAsync(() => {
    renderDetails();
    actionNamed('Stop').click();
    settle();
    expectNoAbortRequests();
    reasonEditor();

    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }));
    document.body.dispatchEvent(new KeyboardEvent('keyup', { key: 'Escape', keyCode: 27, bubbles: true }));
    settle();

    expect(overlay.querySelector('[role="dialog"], [role="alertdialog"]')).toBeNull();
    expectNoAbortRequests();
  }));

  it('AC-3: previews the selected executions and performs Stop with the validated plain-text reason', fakeAsync(() => {
    const preview = startBulkStop();
    expectBulkSelection(preview, true);
    completePreview(preview);

    expectDefaultReason();
    expectReasonRequired(confirmBulkStop);
    editReason(reason);
    dialogButton(confirmBulkStop).click();
    settle();

    const perform = executionRequest(bulkStopUrl);
    expect(requestUrl(perform.request).searchParams.get('abortReason')).toBe(reason);
    expectBulkSelection(perform, false);
    perform.flush({ ready: true, result: { count: 2, warnings: ['One execution already finished'] } });
    settle(500);
    expect(dialog().textContent).toContain('Bulk operation stop for 2 item(s) completed.');
    expect(dialog().textContent).toContain('One execution already finished');
    dialogButton('Ok').click();
    settle();
    expectNoAbortRequests();
  }));

  it('AC-3: confirms without a preview count and reports a failure to stop', fakeAsync(() => {
    currentUserId = undefined;
    const preview = startBulkStop();
    preview.flush({ ready: true, result: {} });
    settle(500);

    expect(dialog().textContent).toContain('Do you want to stop all selected items?');
    expect(reasonEditor().value).toBe('interrupted');
    editReason(reason);
    dialogButton(confirmBulkStop).click();
    settle();

    const perform = executionRequest(bulkStopUrl);
    expect(requestUrl(perform.request).searchParams.get('abortReason')).toBe(reason);
    expectBulkSelection(perform, false);
    reportBulkFailure(perform, 'Stop unavailable');
    dialogButton('Ok').click();
    settle();
    expectNoAbortRequests();
  }));

  it('AC-4: cancels after the bulk preview without sending a perform request', fakeAsync(() => {
    completePreview(startBulkStop());
    dialogButton('Cancel').click();
    settle();

    expect(overlay.querySelector('[role="dialog"], [role="alertdialog"]')).toBeNull();
    expectNoAbortRequests();
  }));

  it('AC-4: reports a failed bulk preview and sends no perform request', fakeAsync(() => {
    reportBulkFailure(startBulkStop(), 'Preview unavailable');
    dialogButton('Ok').click();
    settle();
    expectNoAbortRequests();
  }));

  it('AC-5: removes the publicly exported execution action guard and registry', () => {
    expect(stepCore).not.toHaveProperty('ExecutionActionGuardService');
    expect(stepCore).not.toHaveProperty('ExecutionActionGuardRegistryService');
    expect(CustomRegistryType).not.toHaveProperty('EXECUTION_ACTION_GUARD');
  });

  it('AC-5: starts execution from details directly', fakeAsync(() => {
    jest.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    renderDetails();
    actionNamed('New execution').click();
    settle(500);

    const request = executionRequest('/executions/start');
    expect(request.request.body).toEqual(expect.objectContaining({ description: executionName, userID: 'operator' }));
    expect(overlay.querySelector('[role="dialog"], [role="alertdialog"]')).toBeNull();
    request.flush('new-execution');
    settle();
  }));

  it('AC-5: force-stops an aborting execution from details directly', fakeAsync(() => {
    renderDetails('ABORTING');
    actionNamed('Force stop').click();
    settle();

    const request = executionRequest(`/executions/${executionId}/force-stop`);
    expect(overlay.querySelector('[role="dialog"], [role="alertdialog"]')).toBeNull();
    request.flush(null);
    settle();
  }));

  it('AC-5: confirms before restarting a list row', fakeAsync(() => {
    renderList();
    const restart = actionNamed('Restart execution', rowNamed(executionName));
    restart.click();
    settle();

    expect(dialog().textContent).toContain(`Are you sure you want to restart Execution ${executionName}?`);
    http.expectNone((request) => request.url.endsWith('/executions/start'));
    dialogButton('Cancel').click();
    settle();
    http.expectNone((request) => request.url.endsWith('/executions/start'));

    restart.click();
    settle();
    dialogButton('Yes').click();
    settle();
    const request = executionRequest('/executions/start');
    expect(request.request.body).toEqual({ ...executions[0].executionParameters, userID: 'operator' });
    request.flush('restarted');
    settle();
  }));
});
