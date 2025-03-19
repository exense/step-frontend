import { Component, inject, viewChild, ViewEncapsulation } from '@angular/core';
import { AltExecutionStateService } from '../../services/alt-execution-state.service';
import { ExecutionCustomPanelRegistryService, IS_SMALL_SCREEN, ReportNode, TimeRange } from '@exense/step-core';
import { ActivatedRoute, Router } from '@angular/router';
import { AltKeywordNodesStateService } from '../../services/alt-keyword-nodes-state.service';
import { AltTestCasesNodesStateService } from '../../services/alt-test-cases-nodes-state.service';
import { VIEW_MODE, ViewMode } from '../../shared/view-mode';
import { DashboardUrlParamsService } from '../../../timeseries/modules/_common/injectables/dashboard-url-params.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { AltExecutionTreeWidgetComponent } from '../alt-execution-tree-widget/alt-execution-tree-widget.component';

@Component({
  selector: 'step-alt-execution-report',
  templateUrl: './alt-execution-report.component.html',
  styleUrl: './alt-execution-report.component.scss',
  providers: [
    {
      provide: VIEW_MODE,
      useFactory: () => {
        const _activatedRoute = inject(ActivatedRoute);
        return (_activatedRoute.snapshot.data['mode'] ?? ViewMode.VIEW) as ViewMode;
      },
    },
  ],
  encapsulation: ViewEncapsulation.None,
})
export class AltExecutionReportComponent {
  private _activatedRoute = inject(ActivatedRoute);
  protected readonly _mode = inject(VIEW_MODE);
  private _router = inject(Router);
  private _executionCustomPanelRegistry = inject(ExecutionCustomPanelRegistryService);

  private treeWidget = viewChild('treeWidget', { read: AltExecutionTreeWidgetComponent });

  protected readonly _state = inject(AltExecutionStateService);

  protected readonly _isSmallScreen$ = inject(IS_SMALL_SCREEN);

  protected readonly keywordsSummary$ = inject(AltKeywordNodesStateService).summary$;
  protected readonly testCasesSummary$ = inject(AltTestCasesNodesStateService).summary$;
  protected readonly hasTestCases$ = this._state.testCases$.pipe(map((testCases) => !!testCases?.length));

  protected readonly layoutStructureInitialized$ = this._state.testCases$.pipe(map((testCases) => true));

  private _urlParamsService = inject(DashboardUrlParamsService);

  updateUrlParamsSubscription = this._state.timeRangeSelection$.pipe(takeUntilDestroyed()).subscribe((range) => {
    this._urlParamsService.updateUrlParams(range);
  });

  protected handleOpenNodeInTreePage(keyword: ReportNode): void {
    const reportNodeId = keyword.id;
    const artefactId = keyword.artefactID;
    if (!artefactId) {
      return;
    }
    this._router.navigate(['..', 'tree'], {
      queryParams: { reportNodeId, artefactId },
      relativeTo: this._activatedRoute,
    });
  }

  protected handleOpenNodeInTreeWidget(node: ReportNode): void {
    this.treeWidget()?.focusNode(node.artefactID!);
  }

  handleChartZooming(range: TimeRange) {
    this._state.updateTimeRangeSelection({ type: 'ABSOLUTE', absoluteSelection: range });
  }

  protected readonly customPanels = this._executionCustomPanelRegistry.getItemInfos();

  protected readonly ViewMode = ViewMode;
}
