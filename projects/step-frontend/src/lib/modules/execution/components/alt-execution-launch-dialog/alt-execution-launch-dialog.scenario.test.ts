import { ApplicationRef } from '@angular/core';
import { fakeAsync, flush, flushMicrotasks, TestBed, tick } from '@angular/core/testing';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import {
  AuthService,
  ErrorMessageHandlerService,
  provideTestStepApi,
  RepositoryObjectReference,
  ScreenDataMetaService,
  StepCoreModule,
} from '@exense/step-core';
import { of } from 'rxjs';
import { HttpErrorInterceptor } from '../../../_common/interceptors/http-error.interceptor';
import { HttpErrorOverrideInterceptor } from '../../../_common/interceptors/http-error-override.interceptor';
import { HttpErrorLoggerService } from '../../../_common/injectables/http-error-logger.service';
import { ErrorViewDialogComponent } from '../../../errors-view/components/error-view-dialog/error-view-dialog.component';
import { ErrorsService } from '../../../errors-view/injectables/errors.service';
import { AltExecutionRepositoryComponent } from '../alt-execution-repository/alt-execution-repository.component';
import { ExecutionActionsComponent } from '../execution-actions/execution-actions.component';
import { RepositoryPlanTestcaseListComponent } from '../repository-plan-testcase-list/repository-plan-testcase-list.component';
import { StatusComponent } from '../status/status.component';
import {
  AltExecutionLaunchDialogComponent,
  AltExecutionLaunchDialogData,
} from './alt-execution-launch-dialog.component';

describe('Execution launch dialog loading', () => {
  const repoRef: RepositoryObjectReference = {
    repositoryID: 'Artifact',
    repositoryParameters: {
      groupId: 'ch.exense.step',
      artifactId: 'step-automation-packages-sample1',
      version: 'none',
    },
  };
  const resolvedRepoRef: RepositoryObjectReference = {
    ...repoRef,
    repositoryParameters: { ...repoRef.repositoryParameters, version: '1.0.0' },
  };
  const resolutionError = 'Could not find artifact ch.exense.step:step-automation-packages-sample1:jar:none';
  let http: HttpTestingController;
  let dialogs: MatDialog;
  let application: ApplicationRef;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepCoreModule, NoopAnimationsModule, ErrorViewDialogComponent],
      declarations: [
        AltExecutionLaunchDialogComponent,
        AltExecutionRepositoryComponent,
        ExecutionActionsComponent,
        RepositoryPlanTestcaseListComponent,
        StatusComponent,
      ],
      providers: [
        provideTestStepApi(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: HttpErrorOverrideInterceptor, multi: true },
        {
          provide: AuthService,
          useValue: { getConf: () => ({}), getUserID: () => 'user', hasRight$: () => of(true) },
        },
        { provide: ScreenDataMetaService, useValue: { checkMetaInformationAboutScreenInRoute: () => undefined } },
      ],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    dialogs = TestBed.inject(MatDialog);
    application = TestBed.inject(ApplicationRef);
    TestBed.inject(ErrorMessageHandlerService).useStrategy(TestBed.inject(ErrorsService));
    TestBed.inject(HttpErrorLoggerService).disable();
    jest.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
  });

  afterEach(fakeAsync(() => {
    dialogs.closeAll();
    flush();
    http.verify();
  }));

  function render(): void {
    for (let i = 0; i < 4; i++) {
      application.tick();
      tick(500);
      http.match((request) => request.url.includes('/screens/')).forEach((request) => request.flush([]));
      http
        .match((request) => request.url.endsWith('/app/repositories/parameters'))
        .forEach((request) => request.flush([]));
      http
        .match((request) => request.url.endsWith('/admin/myaccount/preferences'))
        .forEach((request) => request.flush({}));
    }
    application.tick();
    flushMicrotasks();
  }

  function openLaunch(data: Partial<AltExecutionLaunchDialogData> = {}): void {
    dialogs.open(AltExecutionLaunchDialogComponent, { data: { repoRef, hideCancel: true, ...data } });
    render();
  }

  function loadArtifactInfo(): void {
    const info = http.expectOne((request) => request.url.endsWith('/controller/repository/artefact/info'));
    info.flush({ name: 'step-automation-packages-sample1', type: 'TestSet' });
    render();
  }

  function expectDisabledActions(): void {
    const buttons = document.querySelectorAll<HTMLButtonElement>('step-execution-actions button');
    expect(buttons).toHaveLength(4);
    buttons.forEach((button) => {
      expect(button.disabled).toBe(true);
      button.click();
    });
    render();
    http.expectNone((request) => request.url.endsWith('/executions/start'));
  }

  function expectInlineResolutionError(): void {
    const view = document.querySelector('step-alt-execution-launch-dialog');
    expect(view).not.toBeNull();
    expect(view!.querySelector('[role="alert"]')?.textContent).toContain(resolutionError);
    expect(document.querySelector('step-error-view-dialog')).toBeNull();
    expect(dialogs.openDialogs).toHaveLength(1);
    expect(view!.querySelector('.initial-loading')).toBeNull();
    expectDisabledActions();
  }

  it('shows Maven resolution failures inline and disables the launch actions', fakeAsync(() => {
    openLaunch();
    loadArtifactInfo();
    const report = http.expectOne((request) => request.url.endsWith('/controller/repository/report'));
    report.flush(
      { errorMessage: resolutionError },
      { status: 500, statusText: 'Internal Server Error', headers: { 'Content-Type': 'application/json' } },
    );
    render();

    expectInlineResolutionError();
  }));

  it('keeps the repository view open with an inline artifact-details error', fakeAsync(() => {
    openLaunch();
    http
      .expectOne((request) => request.url.endsWith('/controller/repository/artefact/info'))
      .flush(
        { errorMessage: resolutionError },
        { status: 500, statusText: 'Internal Server Error', headers: { 'Content-Type': 'application/json' } },
      );
    render();

    expectInlineResolutionError();
  }));

  it('waits for test cases and keeps a successful empty list executable', fakeAsync(() => {
    openLaunch({ repoRef: resolvedRepoRef });
    loadArtifactInfo();
    expectDisabledActions();
    http.expectOne((request) => request.url.endsWith('/controller/repository/report')).flush({ runs: [] });
    render();

    expect(document.querySelector('step-error-view-dialog')).toBeNull();
    expect(dialogs.openDialogs).toHaveLength(1);
    const execute = document.querySelector<HTMLButtonElement>('step-execution-actions button.mat-primary')!;
    expect(execute.disabled).toBe(false);
    execute.click();
    render();

    const start = http.expectOne((request) => request.url.endsWith('/executions/start'));
    expect(start.request.body.repositoryObject).toEqual(resolvedRepoRef);
    start.flush('execution');
    flushMicrotasks();
    expect(TestBed.inject(Router).navigateByUrl).toHaveBeenCalled();
  }));

  it('preserves the previously executed test-case selection when relaunching', fakeAsync(() => {
    openLaunch({ repoRef: resolvedRepoRef, relaunchExecutionId: 'previous' });
    loadArtifactInfo();
    http
      .expectOne((request) => request.url.endsWith('/controller/repository/report'))
      .flush({
        runs: [
          { id: 'one', testplanName: 'One', status: 'NORUN' },
          { id: 'two', testplanName: 'Two', status: 'NORUN' },
        ],
      });
    http
      .expectOne((request) => request.url.includes('/executions/previous/reportnodes?'))
      .flush([
        { name: 'One', status: 'PASSED' },
        { name: 'Two', status: 'SKIPPED' },
      ]);
    render();

    const execute = document.querySelector<HTMLButtonElement>('step-execution-actions button.mat-primary')!;
    expect(execute.disabled).toBe(false);
    expect(document.querySelector('step-repository-plan-testcase-list')?.textContent).toContain('One');
    expect(document.querySelector('step-repository-plan-testcase-list')?.textContent).toContain('Two');
    execute.click();
    render();

    const start = http.expectOne((request) => request.url.endsWith('/executions/start'));
    expect(start.request.body.artefactFilter).toEqual({
      class: 'step.artefacts.filters.TestCaseFilter',
      includedNames: ['One'],
    });
    start.flush('execution');
    flushMicrotasks();
  }));
});
