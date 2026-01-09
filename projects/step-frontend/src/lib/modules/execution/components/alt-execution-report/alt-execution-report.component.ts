import { Component, ElementRef, inject, OnDestroy, OnInit, viewChild, ViewEncapsulation } from '@angular/core';
import { AltExecutionStateService } from '../../services/alt-execution-state.service';
import {
  ArtefactClass,
  ExecutionCustomPanelRegistryService,
  IS_SMALL_SCREEN,
  ReportNode,
  TimeRange,
} from '@exense/step-core';
import { ActivatedRoute, Router } from '@angular/router';
import { AltKeywordNodesStateService } from '../../services/alt-keyword-nodes-state.service';
import { AltTestCasesNodesStateService } from '../../services/alt-test-cases-nodes-state.service';
import { VIEW_MODE, ViewMode } from '../../shared/view-mode';
import { DashboardUrlParamsService } from '../../../timeseries/modules/_common/injectables/dashboard-url-params.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { first, map, scan } from 'rxjs';
import { AltExecutionTreeWidgetComponent } from '../alt-execution-tree-widget/alt-execution-tree-widget.component';
import { TimeRangePickerSelection } from '../../../timeseries/modules/_common/types/time-selection/time-range-picker-selection';
import { Status } from '../../../_common/shared/status.enum';
import {
  AggregatedTreeNodeDialogHooksService,
  AggregatedTreeNodeDialogHooksStrategy,
} from '../../services/aggregated-tree-node-dialog-hooks.service';

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
  standalone: false,
})
export class AltExecutionReportComponent implements OnInit, OnDestroy, AggregatedTreeNodeDialogHooksStrategy {
  private _activatedRoute = inject(ActivatedRoute);
  protected readonly _mode = inject(VIEW_MODE);
  private _router = inject(Router);
  private _executionCustomPanelRegistry = inject(ExecutionCustomPanelRegistryService);
  private _hooks = inject(AggregatedTreeNodeDialogHooksService);

  private treeWidget = viewChild('treeWidget', { read: AltExecutionTreeWidgetComponent });
  private treeWidgetContainer = viewChild('treeWidget', { read: ElementRef });
  private errors = viewChild('errors', { read: ElementRef });

  protected readonly _state = inject(AltExecutionStateService);

  protected readonly _isSmallScreen$ = inject(IS_SMALL_SCREEN);
  protected readonly _keywordsState = inject(AltKeywordNodesStateService);
  protected readonly _testCasesState = inject(AltTestCasesNodesStateService);

  protected readonly hasTestCases$ = this._state.testCases$.pipe(map((testCases) => (testCases?.length ?? 0) > 1));

  protected readonly layoutStructureInitialized$ = this._state.testCases$.pipe(map((testCases) => true));

  private _urlParamsService = inject(DashboardUrlParamsService);

  private updateUrlParamsSubscription = this._state.timeRangeSelection$
    .pipe(
      scan(
        (acc, range) => {
          const isFirst = !acc.hasEmitted;
          return { range, isFirst, hasEmitted: true };
        },
        { range: null as unknown as TimeRangePickerSelection, isFirst: true, hasEmitted: false },
      ),
      takeUntilDestroyed(),
      first(),
    )
    .subscribe(({ range, isFirst }: { range: TimeRangePickerSelection; isFirst: boolean }) => {
      this._urlParamsService.patchUrlParams(range, undefined, isFirst);
    });

  ngOnInit(): void {
    this._hooks.useStrategy(this);
  }

  ngOnDestroy(): void {
    this._hooks.cleanupStrategy();
  }

  reportNodeOpened(reportNode: ReportNode): void {
    this.treeWidget()?.focusNodeByReport(reportNode);
  }

  protected handleOpenNodeInTreePage(reportNode: ReportNode): void {
    const { artefactID: artefactId, artefactHash, id: reportNodeId } = reportNode;
    if (!artefactId) {
      return;
    }
    this._router.navigate(['..', 'tree'], {
      queryParams: { reportNodeId, artefactId, artefactHash },
      relativeTo: this._activatedRoute,
    });
  }

  protected scrollToErrorsSection(): void {
    const errorsElement = this.errors()?.nativeElement as HTMLHtmlElement | undefined;
    errorsElement?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  }

  protected handleOpenNodeInTreeWidget(node: ReportNode): void {
    this.treeWidget()?.focusNodeByArtefactId(node.artefactID!);
  }

  protected handleChartZooming(range: TimeRange) {
    this._state.updateTimeRangeSelection({ type: 'ABSOLUTE', absoluteSelection: range });
  }

  protected handleTestCasesSummaryStatusSelection(statuses: Status[]): void {
    this._testCasesState.updateStatusCtrl(statuses);
  }

  protected handleKeywordsSummaryStatusSelection(statuses: Status[]): void {
    this._keywordsState.updateStatusCtrl(statuses, statuses?.length > 0 ? ArtefactClass.KEYWORD : undefined);
  }

  protected readonly customPanels = this._executionCustomPanelRegistry.getItemInfos();

  protected readonly ViewMode = ViewMode;

  searchFor($event: string) {
    if (!this.treeWidget() || !this.treeWidgetContainer()) {
      return;
    }

    this.treeWidgetContainer()!.nativeElement.scrollIntoView({ behavior: 'smooth' });

    this.treeWidget()!.focusAndSearch($event);
  }
}
