import { ComponentFixture, fakeAsync, flushMicrotasks, TestBed, tick } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { config } from 'rxjs';
import {
  AugmentedScreenService,
  AuthService,
  CustomFormComponent,
  PlanContextApiService,
  provideTestStepApi,
  ScreenDataMetaService,
  ScreenInput,
} from '@exense/step-core';
import { ExecutionCommandsService } from './execution-commands.service';
import { InteractiveSessionService } from '../../plan-editor/injectables/interactive-session.service';
import { AutomationPackageExecutionDialogComponent } from '../../automation-packages/components/automation-package-execution-dialog/automation-package-execution-dialog.component';

describe('Execution parameter activation', () => {
  const definition = (id: string, key: string, value: string, active = true): ScreenInput => ({
    id,
    screenId: 'executionParameters',
    input: {
      id: key,
      label: key,
      type: 'TEXT',
      defaultValue: value,
      activationExpression: { script: String(active) },
    },
  });
  const definitions = [
    definition('global', 'globalParameter', 'GLOBAL'),
    definition('local', 'localParameter', 'LOCAL'),
    definition('active-shared', 'shared', 'ACTIVE'),
    definition('inactive-shared', 'shared', 'INACTIVE', false),
    definition('hidden', 'hidden', 'HIDDEN', false),
  ];
  const activeDefinitions = definitions.filter((item) => item.input!.activationExpression!.script === 'true');
  const defaults = { globalParameter: 'GLOBAL', localParameter: 'LOCAL', shared: 'ACTIVE' };
  let http: HttpTestingController;
  let model: Record<string, unknown>;
  let form: ComponentFixture<CustomFormComponent> | undefined;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomFormComponent, NoopAnimationsModule],
      providers: [
        provideTestStepApi(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { routeConfig: { path: '' } } },
        ExecutionCommandsService,
        InteractiveSessionService,
        { provide: PlanContextApiService, useValue: {} },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { automationPackage: { id: 'package', attributes: { name: 'Package' } } },
        },
        { provide: MatDialogRef, useValue: { close: jest.fn() } },
        { provide: AuthService, useValue: { getUserID: () => 'zatecu01' } },
      ],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    model = {};
    form = undefined;
    jest.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const route = TestBed.inject(ActivatedRoute);
    TestBed.inject(ScreenDataMetaService).addMetaInformationAboutScreenToRoute('executionParameters', route);
  });

  afterEach(() => {
    form?.destroy();
    http.verify();
  });

  function respondToScreens(active = activeDefinitions): void {
    for (let i = 0; i < 4; i++) {
      tick(500);
      http
        .match((request) => request.url.includes('/screens/'))
        .forEach((request) => {
          if (request.request.method === 'GET') {
            request.flush(definitions);
          } else if (request.request.url.endsWith('/screen-inputs')) {
            request.flush(
              active.map((item) => ({ ...item, input: { ...item.input, activationExpression: undefined } })),
            );
          } else {
            request.flush(active.map((item) => ({ ...item.input, activationExpression: undefined })));
          }
        });
    }
    tick();
  }

  function createForm(): void {
    form = TestBed.createComponent(CustomFormComponent);
    form.componentRef.setInput('stScreen', 'executionParameters');
    form.componentRef.setInput('stModel', model);
    form.componentInstance.stModelChange.subscribe((value) => (model = value));
    form.detectChanges();
  }

  function execute(): void {
    TestBed.inject(ExecutionCommandsService)
      .useContext({
        getCustomForms: () => form?.componentInstance,
        getDescription: () => 'Activation regression',
        getRepositoryObjectRef: () => ({ repositoryID: 'local', repositoryParameters: { planid: 'plan' } }),
        getIncludedTestcases: () => undefined,
        getExecution: () => undefined,
        getExecutionParameters: () => model as Record<string, string>,
        getIsExecutionIsolated: () => false,
      })
      .execute(false);
  }

  function expectStart(parameters: Record<string, unknown>): void {
    flushMicrotasks();
    const start = http.expectOne((request) => request.url.endsWith('/executions/start'));
    const actual = start.request.body.customParameters;
    start.flush('execution');
    flushMicrotasks();
    expect(actual).toEqual(parameters);
  }

  function failActivation(): void {
    const previousHandler = config.onUnhandledError;
    config.onUnhandledError = jest.fn();
    try {
      http
        .expectOne((request) => request.url.endsWith('/screen-inputs'))
        .flush('Temporary failure', { status: 503, statusText: 'Service Unavailable' });
      tick();
    } finally {
      config.onUnhandledError = previousHandler;
    }
  }

  it('loads defaults only from active definitions, including global and local parameters sharing an ID', fakeAsync(() => {
    TestBed.inject(AugmentedScreenService)
      .getDefaultParametersByScreenId('executionParameters')
      .subscribe((parameters) => (model = parameters));
    respondToScreens();
    expect(model).toEqual(defaults);
  }));

  it('uses only active form defaults when launching an execution', fakeAsync(() => {
    createForm();
    respondToScreens();
    expect(model).toEqual(defaults);
    execute();
    respondToScreens();
    expectStart(defaults);
  }));

  it('omits inactive existing values on launch while keeping active shared IDs and historical keys', fakeAsync(() => {
    model = { ...defaults, shared: 'USER VALUE', hidden: 'OLD VALUE', historical: 'RETAIN' };
    execute();
    respondToScreens();
    expectStart({ ...defaults, shared: 'USER VALUE', historical: 'RETAIN' });
  }));

  it('waits for an edited parameter and activation response before submitting the remaining active values', fakeAsync(() => {
    model = { ...defaults, historical: 'RETAIN' };
    createForm();
    respondToScreens();
    form!.detectChanges();
    const control = form!.debugElement.query(By.css('step-standard-custom-form-inputs'));
    control.triggerEventHandler('ngModelChange', 'DISABLE');
    execute();
    tick(500);
    http.expectNone((request) => request.url.endsWith('/executions/start'));
    const evaluation = http.expectOne((request) => request.url.endsWith('/screen-inputs'));
    expect(JSON.parse(evaluation.request.body).globalParameter).toBe('DISABLE');
    const active = activeDefinitions.filter((item) => item.input!.id !== 'shared');
    evaluation.flush(active);
    respondToScreens(active);
    expectStart({ globalParameter: 'DISABLE', localParameter: 'LOCAL', historical: 'RETAIN' });
  }));

  it('waits for edits to multiple parameters even when no activation expressions are defined', fakeAsync(() => {
    createForm();
    flushMicrotasks();
    http
      .expectOne((request) => request.url.includes('/screens/input/byscreen/'))
      .flush(activeDefinitions.map((item) => ({ ...item, input: { ...item.input, activationExpression: undefined } })));
    tick(500);
    form!.detectChanges();
    const controls = form!.debugElement.queryAll(By.css('step-standard-custom-form-inputs'));
    controls[0].triggerEventHandler('ngModelChange', 'ONE');
    tick(200);
    controls[1].triggerEventHandler('ngModelChange', 'TWO');
    execute();
    tick(300);
    http.expectNone((request) => request.url.endsWith('/executions/start'));
    tick(200);
    expectStart({ globalParameter: 'ONE', localParameter: 'TWO', shared: 'ACTIVE' });
  }));

  it('preserves fields and blocks submission after an activation failure, then recovers on the next edit', fakeAsync(() => {
    createForm();
    respondToScreens();
    form!.detectChanges();
    const control = form!.debugElement.query(By.css('step-standard-custom-form-inputs'));
    control.triggerEventHandler('ngModelChange', 'FIRST EDIT');
    execute();
    tick(500);
    failActivation();
    form!.detectChanges();
    expect(form!.componentInstance.inputs().map((input) => input.id)).toEqual(Object.keys(defaults));
    expect(form!.componentInstance.changeInProgress()).toBe(true);
    http.expectNone((request) => request.url.endsWith('/executions/start'));

    control.triggerEventHandler('ngModelChange', 'RECOVERED');
    tick(500);
    const retry = http.expectOne((request) => request.url.endsWith('/screen-inputs'));
    expect(JSON.parse(retry.request.body).globalParameter).toBe('RECOVERED');
    const active = activeDefinitions.filter((item) => item.input!.id !== 'shared');
    retry.flush(active);
    respondToScreens(active);
    expectStart({ globalParameter: 'RECOVERED', localParameter: 'LOCAL' });
    form!.detectChanges();
    expect(form!.componentInstance.inputs().map((input) => input.id)).toEqual(['globalParameter', 'localParameter']);
    expect(form!.nativeElement.querySelector('[role="alert"]')).toBeNull();
  }));

  it('allows retrying an initial activation failure before using defaults or submitting', fakeAsync(() => {
    createForm();
    flushMicrotasks();
    http.expectOne((request) => request.url.includes('/screens/input/byscreen/')).flush(definitions);
    tick(500);
    execute();
    failActivation();
    form!.detectChanges();
    expect(model).toEqual({});
    http.expectNone((request) => request.url.endsWith('/executions/start'));
    const alert = form!.debugElement.query(By.css('[role="alert"]'));
    expect(alert).not.toBeNull();
    alert.query(By.css('button')).nativeElement.click();
    respondToScreens();
    expectStart(defaults);
    form!.detectChanges();
    expect(form!.nativeElement.querySelector('[role="alert"]')).toBeNull();
  }));

  it('filters inactive parameters when starting an interactive session', fakeAsync(() => {
    const session = TestBed.inject(InteractiveSessionService);
    session.executionParameters.set({ ...defaults, hidden: 'OLD VALUE', historical: 'RETAIN' });
    session.startInteractive({ repositoryID: 'local', repositoryParameters: { planid: 'plan' } }).subscribe();
    respondToScreens();
    const start = http.expectOne((request) => request.url.endsWith('/interactive/start'));
    const actual = start.request.body.customParameters;
    start.flush('session');
    session.stopInteractive().subscribe();
    flushMicrotasks();
    http.expectOne((request) => request.url.endsWith('/interactive/session/stop')).flush(null);
    expect(actual).toEqual({ ...defaults, historical: 'RETAIN' });
  }));

  it('waits for loading and prevents duplicate launches while filtering automation package parameters', fakeAsync(() => {
    const dialog = TestBed.createComponent(AutomationPackageExecutionDialogComponent);
    dialog.detectChanges();
    const executeButton = dialog.debugElement.queryAll(By.css('button')).at(-1)!;
    expect(executeButton.nativeElement.disabled).toBe(true);
    respondToScreens();
    dialog.detectChanges();
    respondToScreens();
    dialog.detectChanges();
    expect(executeButton.nativeElement.disabled).toBe(false);
    dialog.debugElement.query(By.directive(CustomFormComponent)).triggerEventHandler('stModelChange', {
      ...defaults,
      hidden: 'OLD VALUE',
      historical: 'RETAIN',
    });
    executeButton.triggerEventHandler('click');
    executeButton.triggerEventHandler('click');
    expect(TestBed.inject(MatDialogRef).disableClose).toBe(true);
    respondToScreens();
    const start = http.expectOne((request) => request.url.endsWith('/automation-packages/execute/package'));
    const actual = JSON.parse(start.request.body).customParameters;
    start.flush(['execution']);
    flushMicrotasks();
    expect(TestBed.inject(MatDialogRef).disableClose).toBe(false);
    dialog.destroy();
    expect(actual).toEqual({ ...defaults, historical: 'RETAIN' });
  }));
});
