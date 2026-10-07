import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { firstValueFrom, Observable, of } from 'rxjs';
import {
  AppConfigContainerService,
  ApplicationConfiguration,
  AugmentedExecutionsService,
  Execution,
  ExecutionViewModeService,
  LOCAL_STORAGE,
  StepMaterialModule,
} from '@exense/step-core';
import { ExecutionLegacySwitcherComponent } from './execution-legacy-switcher.component';
import { altExecutionGuard } from '../../guards/alt-execution.guard';
import { legacyExecutionGuard } from '../../guards/legacy-execution.guard';

describe('Execution report view policy', () => {
  let fixture: ComponentFixture<ExecutionLegacySwitcherComponent>;
  let viewMode: ExecutionViewModeService;
  let execution: Execution;

  beforeEach(async () => {
    execution = {
      id: 'execution-id',
      status: 'ENDED',
      result: 'PASSED',
      resolvedPlanRootNodeId: 'root-id',
      customFields: { hasReportNodeTimeSeries: true },
    };
    localStorage.removeItem('executionViewMode');
    await TestBed.configureTestingModule({
      declarations: [ExecutionLegacySwitcherComponent],
      imports: [ReactiveFormsModule, StepMaterialModule, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: LOCAL_STORAGE, useValue: localStorage },
        {
          provide: AugmentedExecutionsService,
          useValue: {
            getExecutionViaOverviewCached: () => of(execution),
            getExecutionByIdCached: () => of(execution),
          },
        },
      ],
    }).compileComponents();
    viewMode = TestBed.inject(ExecutionViewModeService);
  });

  afterEach(() => localStorage.removeItem('executionViewMode'));

  function render(configuration: ApplicationConfiguration): void {
    TestBed.inject(AppConfigContainerService).setConfiguration(configuration);
    fixture = TestBed.createComponent(ExecutionLegacySwitcherComponent);
    fixture.componentRef.setInput('execution', execution);
    fixture.detectChanges();
  }

  async function checkRoutes(expectedMode: 'executions' | 'legacy-executions'): Promise<void> {
    expect(await firstValueFrom(viewMode.determineUrl(execution))).toBe(`/${expectedMode}/${execution.id}`);
    for (const [mode, guard] of [
      ['executions', altExecutionGuard],
      ['legacy-executions', legacyExecutionGuard],
    ] as const) {
      const result = await firstValueFrom(
        TestBed.runInInjectionContext(() =>
          guard(
            { data: {}, queryParams: {} } as ActivatedRouteSnapshot,
            { url: `/${mode}/${execution.id}` } as RouterStateSnapshot,
          ),
        ) as Observable<boolean | UrlTree>,
      );
      if (mode === expectedMode) {
        expect(result).toBe(true);
      } else {
        expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe(`/${expectedMode}/${execution.id}`);
      }
    }
  }

  it('hides the switch and redirects saved legacy preferences to the new report when legacy is disabled', async () => {
    viewMode.setForceLegacyView(true);
    render({ disableLegacyReporting: true });

    expect(fixture.debugElement.query(By.directive(MatSlideToggle))).toBeNull();
    await checkRoutes('executions');
    expect(localStorage.getItem('executionViewMode')).toBe('legacyExecution');
  });

  it('gives disabling legacy precedence over forcing legacy for supported reports', async () => {
    render({ disableLegacyReporting: true, forceLegacyReporting: true });

    expect(fixture.debugElement.query(By.directive(MatSlideToggle))).toBeNull();
    await checkRoutes('executions');
  });

  it('keeps unsupported reports in legacy with the switch hidden when legacy is disabled', async () => {
    execution.customFields = {};
    render({ disableLegacyReporting: true });

    expect(fixture.debugElement.query(By.directive(MatSlideToggle))).toBeNull();
    await checkRoutes('legacy-executions');

    execution.customFields = { hasReportNodeTimeSeries: false };
    await checkRoutes('legacy-executions');

    execution.customFields = { hasReportNodeTimeSeries: true };
    execution.resolvedPlanRootNodeId = null!;
    await checkRoutes('legacy-executions');
  });

  it('continues to support running, vetoed and import-error reports when legacy is disabled', async () => {
    viewMode.setForceLegacyView(true);
    execution.customFields = {};
    execution.status = 'RUNNING';
    render({ disableLegacyReporting: true });
    await checkRoutes('executions');

    execution.status = 'ENDED';
    execution.result = 'VETOED';
    await checkRoutes('executions');

    execution.result = 'IMPORT_ERROR';
    await checkRoutes('executions');
  });

  it.each([undefined, false])('retains the user preference when disableLegacyReporting is %s', async (disabled) => {
    viewMode.setForceLegacyView(true);
    render({ disableLegacyReporting: disabled });

    const toggle = fixture.debugElement.query(By.directive(MatSlideToggle)).componentInstance as MatSlideToggle;
    expect(toggle.checked).toBe(true);
    expect(toggle.disabled).toBe(false);
    await checkRoutes('legacy-executions');

    viewMode.setForceLegacyView(false);
    await checkRoutes('executions');
  });

  it('still forces legacy and hides the switch when only forceLegacyReporting is enabled', async () => {
    render({ forceLegacyReporting: true });

    expect(fixture.debugElement.query(By.directive(MatSlideToggle))).toBeNull();
    await checkRoutes('legacy-executions');
  });
});
