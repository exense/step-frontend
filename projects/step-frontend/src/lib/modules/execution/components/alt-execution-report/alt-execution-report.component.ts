import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  untracked,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { AltExecutionStateService } from '../../services/alt-execution-state.service';
import {
  ArtefactClass,
  CanLeaveComponent,
  DialogsService,
  ExecutionCustomPanelRegistryService,
  GridEditableService,
  IS_SMALL_SCREEN,
  ReportNode,
  TableIndicatorMode,
  TimeRange,
  WidgetsPersistenceStateService,
} from '@exense/step-core';
import { ActivatedRoute, Router } from '@angular/router';
import { AltKeywordNodesStateService } from '../../services/alt-keyword-nodes-state.service';
import { AltTestCasesNodesStateService } from '../../services/alt-test-cases-nodes-state.service';
import { VIEW_MODE, ViewMode } from '../../shared/view-mode';
import { DashboardUrlParamsService } from '../../../timeseries/modules/_common/injectables/dashboard-url-params.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { first, map, noop, Observable, scan, tap } from 'rxjs';
import { AltExecutionTreeWidgetComponent } from '../alt-execution-tree-widget/alt-execution-tree-widget.component';
import { TimeRangePickerSelection } from '../../../timeseries/modules/_common/types/time-selection/time-range-picker-selection';
import { Status } from '../../../_common/shared/status.enum';
import {
  AggregatedTreeNodeDialogHooksService,
  AggregatedTreeNodeDialogHooksStrategy,
} from '../../services/aggregated-tree-node-dialog-hooks.service';
import { AltReportNodeTestcasesWidgetComponent } from '../alt-report-node-testcases-widget/alt-report-node-testcases-widget.component';
import { AltReportNodeKeywordsWidgetComponent } from '../alt-report-node-keywords-widget/alt-report-node-keywords-widget.component';
import { SearchError, SearchErrorType } from '../../shared/search-error';
import { ErrorSearchActionsService } from '../../services/error-search-actions.service';

@Component({
  selector: 'step-alt-execution-report',
  templateUrl: './alt-execution-report.component.html',
  styleUrl: './alt-execution-report.component.scss',
  providers: [
    ErrorSearchActionsService,
    {
      provide: VIEW_MODE,
      useFactory: () => {
        const _activatedRoute = inject(ActivatedRoute);
        return (_activatedRoute.snapshot.data['mode'] ?? ViewMode.VIEW) as ViewMode;
      },
    },
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class AltExecutionReportComponent
  implements OnInit, OnDestroy, AggregatedTreeNodeDialogHooksStrategy, CanLeaveComponent
{
  private _activatedRoute = inject(ActivatedRoute);
  private _widgetsPersistence = inject(WidgetsPersistenceStateService);
  protected readonly _mode = inject(VIEW_MODE);
  protected readonly hasNoLayout = computed(
    () =>
      this._widgetsPersistence.isInitialized() &&
      !this._widgetsPersistence.gridPresets().length &&
      !this._gridEditable.editMode(),
  );
  private _router = inject(Router);
  private _gridEditable = inject(GridEditableService);
  private _dialogs = inject(DialogsService);
  private _executionCustomPanelRegistry = inject(ExecutionCustomPanelRegistryService);
  private _hooks = inject(AggregatedTreeNodeDialogHooksService);

  private readonly treeWidget = viewChild('treeWidget', { read: AltExecutionTreeWidgetComponent });
  private readonly treeWidgetContainer = viewChild('treeWidget', { read: ElementRef });
  private readonly testCasesWidget = viewChild('testCasesWidget', { read: AltReportNodeTestcasesWidgetComponent });
  private readonly testCasesWidgetContainer = viewChild('testCasesWidget', { read: ElementRef });
  private readonly keywordWidget = viewChild('keywordWidget', { read: AltReportNodeKeywordsWidgetComponent });
  private readonly keywordWidgetContainer = viewChild('keywordWidget', { read: ElementRef });

  private readonly errors = viewChild('errors', { read: ElementRef });

  private readonly _errorSearchActions = inject(ErrorSearchActionsService);
  protected readonly availableErrorSearchActions = this._errorSearchActions.availableActions;
  protected readonly showErrorDetailsAvailable = computed(() => {
    const errors = this.errors();
    return !!errors;
  });

  protected readonly _state = inject(AltExecutionStateService);

  protected readonly _isSmallScreen$ = inject(IS_SMALL_SCREEN);
  protected readonly _keywordsState = inject(AltKeywordNodesStateService);
  protected readonly _testCasesState = inject(AltTestCasesNodesStateService);
  protected readonly TableIndicatorMode = TableIndicatorMode;
  protected readonly renderReportContent = signal(this._mode === ViewMode.PRINT);

  protected readonly hasTestCases$ = this._state.testCases$.pipe(
    map((testCases) => {
      if (!testCases?.length) return false;
      if (testCases.length > 1) return true;
      const totalCount = Object.values(testCases[0].countByStatus ?? {}).reduce((sum, n) => sum + n, 0);
      return totalCount > 1;
    }),
  );

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

  constructor() {
    afterNextRender(() => {
      if (this._mode === ViewMode.PRINT) {
        return;
      }
      this.scheduleAfterNextPaint(() => this.renderReportContent.set(true));
    });
  }

  private registerErrorSearchActions(): void {
    this._errorSearchActions.register({
      id: 'tree',
      label: 'Find error in tree',
      icon: 'tree',
      isAvailable: () => {
        const widget = this.treeWidget();
        const container = this.treeWidgetContainer();
        return !!widget && !!container;
      },
      activate: (error) => this.searchErrorInTree(error.errorMessage),
    });
    this._errorSearchActions.register({
      id: 'steps',
      label: 'Find error in Steps',
      icon: 'list',
      isAvailable: () => {
        const widget = this.keywordWidget();
        const container = this.keywordWidgetContainer();
        return !!widget && !!container;
      },
      activate: (error) => this.searchErrorInKeywords(error.errorMessage),
    });
    this._errorSearchActions.register({
      id: 'testCases',
      label: 'Find error in Test Cases',
      icon: 'plan-testcase',
      isAvailable: () => {
        const widget = this.testCasesWidget();
        const container = this.testCasesWidgetContainer();
        return !!widget && !!container;
      },
      activate: (error) => this.searchErrorInTestCases(error.errorMessage),
    });
  }

  private scheduleAfterNextPaint(callback: () => void): void {
    requestAnimationFrame(callback);
  }

  ngOnInit(): void {
    this.registerErrorSearchActions();
    this._hooks.useStrategy(this);
  }

  ngOnDestroy(): void {
    this._hooks.cleanupStrategy();
  }

  // eslint-disable-next-line step-lint/component-public-fields -- Required by CanLeaveComponent.
  canLeave(): boolean | Observable<boolean> {
    const isEditMode = untracked(() => this._gridEditable.editMode());
    const hasChanges = untracked(() => this._gridEditable.hasChanges());
    if (!isEditMode || !hasChanges) {
      return true;
    }

    return this._dialogs
      .showWarning('Navigating away will discard all changes to the layout. Do you want to navigate anyway?', {
        confirmButtonLabel: 'Ok',
        confirmButtonAppearance: 'stroked',
        cancelButtonLabel: 'Keep editing',
        cancelButtonAppearance: 'flat',
        cancelButtonColor: 'primary',
      })
      .pipe(tap((isConfirmed) => (isConfirmed ? this._gridEditable.reset() : noop())));
  }

  // eslint-disable-next-line step-lint/component-public-fields -- Required by AggregatedTreeNodeDialogHooksStrategy.
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

  protected handleChartZooming(range: TimeRange): void {
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

  protected searchErrorInTree(error: string): void {
    const treeWidget = untracked(() => this.treeWidget());
    const treeWidgetContainer = untracked(() => this.treeWidgetContainer());

    if (!treeWidget || !treeWidgetContainer) {
      return;
    }

    treeWidgetContainer.nativeElement.scrollIntoView({ behavior: 'smooth' });
    treeWidget.focusAndSearch(error);
  }

  private searchErrorInTestCases(error: string): void {
    const testCasesWidget = untracked(() => this.testCasesWidget());
    const testCasesContainer = untracked(() => this.testCasesWidgetContainer());

    if (!testCasesWidget || !testCasesContainer) {
      return;
    }

    testCasesContainer.nativeElement.scrollIntoView({ behavior: 'smooth' });
    testCasesWidget.search(error);
  }

  private searchErrorInKeywords(error: string): void {
    const keywordsWidget = untracked(() => this.keywordWidget());
    const keywordsContainer = untracked(() => this.keywordWidgetContainer());

    if (!keywordsWidget || !keywordsContainer) {
      return;
    }

    keywordsContainer.nativeElement.scrollIntoView({ behavior: 'smooth' });
    keywordsWidget.search(error);
  }

  protected searchError({ type, value }: SearchError): void {
    switch (type) {
      case SearchErrorType.TREE:
        this.searchErrorInTree(value);
        break;
      case SearchErrorType.KEYWORD:
        this.searchErrorInKeywords(value);
        break;
      case SearchErrorType.TEST_CASE:
        this.searchErrorInTestCases(value);
        break;
      default:
        break;
    }
  }
}
