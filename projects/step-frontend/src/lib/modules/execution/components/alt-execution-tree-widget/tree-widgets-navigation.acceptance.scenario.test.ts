import { Component, NO_ERRORS_SCHEMA, signal, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { ScheduledTaskTemporaryStorageService } from '@exense/step-core';
import { AltExecutionTreeWidgetComponent } from './alt-execution-tree-widget.component';
import { AltExecutionTreeNonAggregatedWidgetComponent } from '../alt-execution-tree-non-aggregated-widget/alt-execution-tree-non-aggregated-widget.component';
import { AggregatedReportViewTreeStateService } from '../../services/aggregated-report-view-tree-state.service';
import { AggregatedReportViewTreeSearchFacadeService } from '../../services/aggregated-report-view-tree-search-facade.service';
import { AltExecutionDialogsService } from '../../services/alt-execution-dialogs.service';
import { AltExecutionDrilldownNavigationUtilsService } from '../../services/alt-execution-drilldown-navigation-utils.service';
import { AltExecutionReportSettingsService } from '../../services/alt-execution-report-settings.service';
import { AltExecutionStateService } from '../../services/alt-execution-state.service';
import { AltExecutionTabsService } from '../../services/alt-execution-tabs.service';
import { NODE_DETAILS_RELATIVE_PARENT } from '../../services/node-details-relative-parent.token';

@Component({ selector: 'step-tree-navigation-destination', template: '' })
class NavigationDestinationComponent {}

interface WidgetNavigationScenario {
  widget: Type<unknown>;
  title: string;
  ownRoot: string;
  alternateRoot: string;
  alternateLabel: string;
}

const SCENARIOS: WidgetNavigationScenario[] = [
  {
    widget: AltExecutionTreeWidgetComponent,
    title: 'aggregated tree',
    ownRoot: 'tree',
    alternateRoot: 'reportTree',
    alternateLabel: 'Open Execution Trace Tree',
  },
  {
    widget: AltExecutionTreeNonAggregatedWidgetComponent,
    title: 'trace tree',
    ownRoot: 'reportTree',
    alternateRoot: 'tree',
    alternateLabel: 'Open Aggregated Execution Tree',
  },
];

describe('SED-4988 tree widget navigation acceptance', () => {
  let fixture: ComponentFixture<unknown> | undefined;
  let router: Router;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [AltExecutionTreeWidgetComponent, AltExecutionTreeNonAggregatedWidgetComponent],
      imports: [NavigationDestinationComponent, MatTooltipModule, NoopAnimationsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideRouter([
          {
            path: 'executions/:id',
            children: [
              { path: 'report', component: NavigationDestinationComponent },
              { path: 'node-details/:root', component: NavigationDestinationComponent },
            ],
          },
        ]),
        AltExecutionDialogsService,
        AltExecutionDrilldownNavigationUtilsService,
        {
          provide: NODE_DETAILS_RELATIVE_PARENT,
          useFactory: (currentRouter: Router) => currentRouter.routerState.root.firstChild,
          deps: [Router],
        },
        { provide: ScheduledTaskTemporaryStorageService, useValue: {} },
        { provide: AltExecutionTabsService, useValue: {} },
        { provide: AggregatedReportViewTreeStateService, useValue: {} },
        { provide: AggregatedReportViewTreeSearchFacadeService, useValue: {} },
        { provide: AltExecutionReportSettingsService, useValue: { details: () => signal(false) } },
        {
          provide: AltExecutionStateService,
          useValue: { aggregatedTreeInProgress: signal(false), reportTreeInProgress: signal(false) },
        },
      ],
    });
    // Tree state host directives are unrelated to header navigation; keep the real widget templates and navigation chain.
    TestBed.overrideComponent(AltExecutionTreeWidgetComponent, { set: { hostDirectives: [] } });
    TestBed.overrideComponent(AltExecutionTreeNonAggregatedWidgetComponent, { set: { hostDirectives: [] } });
    await TestBed.compileComponents();
    router = TestBed.inject(Router);
    await router.navigateByUrl('/executions/execution-4988/report?filter=failed');
  });

  afterEach(() => {
    fixture?.destroy();
    fixture = undefined;
  });

  it.each(SCENARIOS)(
    'AC-3: $title opens its alternate root for the same execution and preserves maximize navigation',
    async ({ widget, ownRoot, alternateRoot, alternateLabel }) => {
      fixture = TestBed.createComponent(widget);
      fixture.detectChanges();

      const maximize = fixture.debugElement
        .queryAll(By.directive(MatTooltip))
        .find((element) => element.injector.get(MatTooltip).message === 'Maximize');
      expect(maximize).toBeDefined();
      (maximize!.nativeElement as HTMLButtonElement).click();
      await fixture.whenStable();
      expect(router.url).toBe(`/executions/execution-4988/node-details/${ownRoot}?filter=failed`);

      await router.navigateByUrl('/executions/execution-4988/report?filter=failed');
      fixture.detectChanges();
      const host = fixture.nativeElement as HTMLElement;
      const alternate = Array.from(host.getElementsByTagName('button')).find(
        (button) => (button.getAttribute('aria-label') ?? button.textContent?.trim()) === alternateLabel,
      );
      expect(alternate).toBeDefined();
      alternate!.click();
      await fixture.whenStable();
      expect(router.url).toBe(`/executions/execution-4988/node-details/${alternateRoot}?filter=failed`);
    },
  );
});
