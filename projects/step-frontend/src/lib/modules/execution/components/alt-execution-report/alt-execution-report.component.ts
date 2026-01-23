import {
  Component,
  computed,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  TemplateRef,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { AltExecutionStateService } from '../../services/alt-execution-state.service';
import {
  ArtefactClass,
  AuthService,
  Execution,
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
import {
  AltExecutionDashboardLayout,
  AltExecutionDashboardLayoutService,
  AltExecutionDashboardState,
  AltExecutionDashboardWidget,
  AltExecutionDashboardWidgetType,
} from '../../services/alt-execution-dashboard-layout.service';
import { MatDialog } from '@angular/material/dialog';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

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
  private static readonly GRID_COLUMNS = 8;
  private static readonly MAX_ROW_SPAN = 18;
  private static readonly MAX_COL_SPAN = 8;

  private _activatedRoute = inject(ActivatedRoute);
  protected readonly _mode = inject(VIEW_MODE);
  private _router = inject(Router);
  private _executionCustomPanelRegistry = inject(ExecutionCustomPanelRegistryService);
  private _hooks = inject(AggregatedTreeNodeDialogHooksService);
  private _layoutService = inject(AltExecutionDashboardLayoutService);
  private _auth = inject(AuthService);
  private _dialog = inject(MatDialog);

  private treeWidget = viewChild('treeWidget', { read: AltExecutionTreeWidgetComponent });
  private treeWidgetContainer = viewChild('treeWidget', { read: ElementRef });
  private errors = viewChild('errors', { read: ElementRef });
  private gridRef = viewChild('grid', { read: ElementRef });
  private enlargeDialog = viewChild('enlargeDialog', { read: TemplateRef });

  protected readonly _state = inject(AltExecutionStateService);

  protected readonly _isSmallScreen$ = inject(IS_SMALL_SCREEN);
  protected readonly _keywordsState = inject(AltKeywordNodesStateService);
  protected readonly _testCasesState = inject(AltTestCasesNodesStateService);

  protected readonly hasTestCases$ = this._state.testCases$.pipe(map((testCases) => (testCases?.length ?? 0) > 1));

  private _urlParamsService = inject(DashboardUrlParamsService);

  private _storageKey = '';
  private _executionSnapshot?: Execution;
  private _hasTestCases = false;
  private _errorsCount = 0;

  readonly editMode = signal(false);
  readonly addWidgetOpen = signal(false);
  readonly dirty = signal(false);
  readonly layoutsState = signal<AltExecutionDashboardState | undefined>(undefined);

  readonly activeLayout = computed(() => {
    const state = this.layoutsState();
    if (!state) {
      return undefined;
    }
    return state.layouts.find((layout) => layout.id === state.activeLayoutId) ?? state.layouts[0];
  });

  readonly orderedWidgets = computed(() => {
    const layout = this.activeLayout();
    if (!layout) {
      return [];
    }
    return [...layout.widgets].sort((a, b) => {
      const row = (a.rowStart ?? 0) - (b.rowStart ?? 0);
      if (row !== 0) {
        return row;
      }
      return (a.colStart ?? 0) - (b.colStart ?? 0);
    });
  });

  readonly dragPreview = signal<
    | {
        colStart: number;
        rowStart: number;
        colSpan: number;
        rowSpan: number;
      }
    | undefined
  >(undefined);

  private dragOrigins = new Map<string, { colStart: number; rowStart: number; colSpan: number; rowSpan: number }>();

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
    this.ensureLayoutsInitialized();
    this._state.execution$.pipe(takeUntilDestroyed()).subscribe((execution) => {
      this._executionSnapshot = execution;
      this.tryInitializeLayouts();
    });
    this.hasTestCases$.pipe(takeUntilDestroyed()).subscribe((hasTestCases) => {
      this._hasTestCases = hasTestCases;
    });
    this._state.errors$.pipe(takeUntilDestroyed()).subscribe((errors) => {
      this._errorsCount = errors?.length ?? 0;
    });
  }

  ngOnDestroy(): void {
    this._hooks.cleanupStrategy();
    this.clearResizeListeners();
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

  protected toggleEditMode(): void {
    this.editMode.set(!this.editMode());
    if (!this.editMode()) {
      this.addWidgetOpen.set(false);
      this.dragPreview.set(undefined);
    }
  }

  protected selectLayout(layoutId: string): void {
    const state = this.layoutsState();
    if (!state) {
      return;
    }
    this.layoutsState.set({ ...state, activeLayoutId: layoutId });
    this.persistLayouts();
    this.dirty.set(false);
  }

  protected saveLayout(): void {
    const state = this.layoutsState();
    const layout = this.activeLayout();
    if (!state || !layout) {
      return;
    }
    if (layout.protected) {
      const name = window.prompt('Layout name', `${layout.name} (copy)`);
      if (!name) {
        return;
      }
      const clone: AltExecutionDashboardLayout = {
        ...layout,
        id: `layout-${Date.now()}`,
        name,
        protected: false,
        widgets: layout.widgets.map((widget) => ({ ...widget, id: `widget-${widget.id}-${Date.now()}` })),
      };
      this.layoutsState.set({
        ...state,
        activeLayoutId: clone.id,
        layouts: [...state.layouts, clone],
      });
      this.persistLayouts();
      this.dirty.set(false);
      return;
    }

    this.layoutsState.set({ ...state });
    this.persistLayouts();
    this.dirty.set(false);
  }

  protected cloneLayout(): void {
    const layout = this.activeLayout();
    const state = this.layoutsState();
    if (!layout || !state) {
      return;
    }
    const name = window.prompt('New layout name', `${layout.name} (copy)`);
    if (!name) {
      return;
    }
    const clone: AltExecutionDashboardLayout = {
      ...layout,
      id: `layout-${Date.now()}`,
      name,
      protected: false,
      widgets: layout.widgets.map((widget) => ({ ...widget, id: `widget-${widget.id}-${Date.now()}` })),
    };
    this.layoutsState.set({
      ...state,
      activeLayoutId: clone.id,
      layouts: [...state.layouts, clone],
    });
    this.persistLayouts();
    this.dirty.set(false);
  }

  protected toggleAddWidget(): void {
    this.addWidgetOpen.set(!this.addWidgetOpen());
  }

  protected addWidget(widgetType: AltExecutionDashboardWidgetType): void {
    const layout = this.activeLayout();
    const state = this.layoutsState();
    const definition = this.getWidgetDefinition(widgetType);
    if (!layout || !state || !definition) {
      return;
    }
    const widget: AltExecutionDashboardWidget = {
      id: `widget-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: widgetType,
      colSpan: definition.defaultColSpan,
      rowSpan: definition.defaultRowSpan,
    };
    const placement = this.findFirstAvailableSlot(layout.widgets, widget);
    widget.colStart = placement.colStart;
    widget.rowStart = placement.rowStart;
    layout.widgets.push(widget);
    this.layoutsState.set({ ...state });
    this.addWidgetOpen.set(false);
    this.markDirty();
  }

  protected removeWidget(widget: AltExecutionDashboardWidget): void {
    const layout = this.activeLayout();
    const state = this.layoutsState();
    if (!layout || !state) {
      return;
    }
    const nextLayout: AltExecutionDashboardLayout = {
      ...layout,
      widgets: layout.widgets.filter((item) => item.id !== widget.id),
    };
    this.layoutsState.set({
      ...state,
      activeLayoutId: nextLayout.id,
      layouts: state.layouts.map((entry) => (entry.id === nextLayout.id ? nextLayout : entry)),
    });
    this.markDirty();
  }

  protected handleDrop(event: CdkDragDrop<AltExecutionDashboardWidget[]>): void {
    if (!this.editMode()) {
      return;
    }
    event.item.reset();
  }

  protected canEnlarge(widget: AltExecutionDashboardWidget): boolean {
    return !!this.getWidgetDefinition(widget.type)?.canEnlarge;
  }

  protected openEnlarge(widget: AltExecutionDashboardWidget): void {
    const dialog = this.enlargeDialog();
    if (!dialog) {
      return;
    }
    this._dialog.open(dialog, {
      width: '90vw',
      height: '90vh',
      maxWidth: '140rem',
      data: widget,
      panelClass: 'alt-execution-dashboard-enlarge',
    });
  }

  protected isCompact(widget: AltExecutionDashboardWidget): boolean {
    const definition = this.getWidgetDefinition(widget.type);
    if (!definition?.supportsCompact) {
      return false;
    }
    return widget.colSpan <= 2 || widget.rowSpan <= 3;
  }

  protected availableWidgetDefinitions(): Array<{ type: AltExecutionDashboardWidgetType; label: string }> {
    const layout = this.activeLayout();
    if (!layout) {
      return [];
    }
    const existingTypes = new Set(layout.widgets.map((widget) => widget.type));
    return this.getWidgetDefinitions()
      .filter((definition) => !existingTypes.has(definition.type))
      .map((definition) => ({ type: definition.type, label: definition.label }));
  }

  protected startResize(event: PointerEvent, widget: AltExecutionDashboardWidget): void {
    if (!this.editMode() || !this.gridRef()) {
      return;
    }
    event.stopPropagation();
    event.preventDefault();
    (event.target as HTMLElement | null)?.setPointerCapture?.(event.pointerId);
    const metrics = this.getGridMetrics();
    if (!metrics) {
      return;
    }
    const layout = this.activeLayout();
    if (layout) {
      this.ensureLayoutPositions(layout);
    }
    const { columnGap, rowGap, rowHeight, columnWidth } = metrics;

    const startColSpan = widget.colSpan;
    const startRowSpan = widget.rowSpan;
    const startX = event.clientX;
    const startY = event.clientY;
    const minColSpan = this.getWidgetDefinition(widget.type)?.minColSpan ?? 1;
    const minRowSpan = this.getWidgetDefinition(widget.type)?.minRowSpan ?? 1;

    const handleMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      const width = startColSpan * columnWidth + (startColSpan - 1) * columnGap + deltaX;
      const height = startRowSpan * rowHeight + (startRowSpan - 1) * rowGap + deltaY;

      const rawColSpan = Math.max(
        minColSpan,
        Math.min(AltExecutionReportComponent.MAX_COL_SPAN, Math.round((width + columnGap) / (columnWidth + columnGap))),
      );
      const rawRowSpan = Math.max(
        minRowSpan,
        Math.min(AltExecutionReportComponent.MAX_ROW_SPAN, Math.round((height + rowGap) / (rowHeight + rowGap))),
      );
      const { colSpan, rowSpan } = this.adjustSpanForCollisions(widget, rawColSpan, rawRowSpan);
      widget.colSpan = colSpan;
      widget.rowSpan = rowSpan;
      this.layoutsState.set({ ...this.layoutsState()! });
      this.markDirty();
    };

    const handleUp = () => {
      this.clearResizeListeners();
    };

    this._resizeMoveHandler = handleMove;
    this._resizeUpHandler = handleUp;
    window.addEventListener('pointermove', this._resizeMoveHandler);
    window.addEventListener('pointerup', this._resizeUpHandler, { once: true });
  }

  protected shouldHideWidget(widget: AltExecutionDashboardWidget): boolean {
    return !this.isWidgetVisible(widget);
  }

  protected handleDragEnd(
    event: { source: { getRootElement(): HTMLElement; reset(): void } },
    widget: AltExecutionDashboardWidget,
  ): void {
    if (!this.editMode()) {
      return;
    }
    const metrics = this.getGridMetrics();
    const layout = this.activeLayout();
    if (!metrics || !layout) {
      event.source.reset();
      return;
    }
    this.ensureLayoutPositions(layout);

    const preview = this.dragPreview();
    const targetCol = preview?.colStart ?? widget.colStart ?? 1;
    const targetRow = preview?.rowStart ?? widget.rowStart ?? 1;

    const targetWidget = this.findWidgetAtCell(layout.widgets, targetCol, targetRow, widget.id);

    if (targetWidget) {
      const origin = this.dragOrigins.get(widget.id) ?? {
        colStart: widget.colStart ?? 1,
        rowStart: widget.rowStart ?? 1,
        colSpan: widget.colSpan,
        rowSpan: widget.rowSpan,
      };
      if (preview) {
        widget.colStart = preview.colStart;
        widget.rowStart = preview.rowStart;
        widget.colSpan = preview.colSpan;
        widget.rowSpan = preview.rowSpan;
      }
      targetWidget.colStart = origin.colStart;
      targetWidget.rowStart = origin.rowStart;
      targetWidget.colSpan = origin.colSpan;
      targetWidget.rowSpan = origin.rowSpan;
    } else if (preview) {
      widget.colStart = preview.colStart;
      widget.rowStart = preview.rowStart;
      widget.colSpan = preview.colSpan;
      widget.rowSpan = preview.rowSpan;
    }

    this.layoutsState.set({ ...this.layoutsState()! });
    this.markDirty();
    event.source.reset();
    this.dragPreview.set(undefined);
    this.dragOrigins.delete(widget.id);
  }

  protected gridCellIds(): number[] {
    const rowCount = this.getGridRows();
    return Array.from({ length: rowCount * AltExecutionReportComponent.GRID_COLUMNS }, (_, i) => i);
  }

  protected getGridRows(): number {
    const layout = this.activeLayout();
    if (!layout) {
      return 12;
    }
    const maxRow = layout.widgets.reduce((acc, widget) => {
      const start = widget.rowStart ?? 1;
      return Math.max(acc, start + widget.rowSpan - 1);
    }, 1);
    return Math.max(12, maxRow + 2);
  }

  private _resizeMoveHandler?: (event: PointerEvent) => void;
  private _resizeUpHandler?: () => void;

  private clearResizeListeners(): void {
    if (this._resizeMoveHandler) {
      window.removeEventListener('pointermove', this._resizeMoveHandler);
      this._resizeMoveHandler = undefined;
    }
    if (this._resizeUpHandler) {
      window.removeEventListener('pointerup', this._resizeUpHandler);
      this._resizeUpHandler = undefined;
    }
  }

  private getGridMetrics(): {
    gridRect: DOMRect;
    columnGap: number;
    rowGap: number;
    rowHeight: number;
    columnWidth: number;
  } | null {
    const grid = this.gridRef()?.nativeElement as HTMLElement | undefined;
    if (!grid) {
      return null;
    }
    const gridStyles = getComputedStyle(grid);
    const columnGap = Number.parseFloat(gridStyles.columnGap || '0') || 0;
    const rowGap = Number.parseFloat(gridStyles.rowGap || '0') || 0;
    const rowHeight = Number.parseFloat(gridStyles.gridAutoRows || '0') || 0;
    if (!rowHeight) {
      return null;
    }
    const gridRect = grid.getBoundingClientRect();
    const gridWidth = grid.clientWidth;
    const columnWidth =
      (gridWidth - columnGap * (AltExecutionReportComponent.GRID_COLUMNS - 1)) /
      AltExecutionReportComponent.GRID_COLUMNS;
    return { gridRect, columnGap, rowGap, rowHeight, columnWidth };
  }

  private adjustSpanForCollisions(
    widget: AltExecutionDashboardWidget,
    colSpan: number,
    rowSpan: number,
  ): { colSpan: number; rowSpan: number } {
    let adjustedColSpan = colSpan;
    let adjustedRowSpan = rowSpan;
    while (
      adjustedColSpan >= 1 &&
      adjustedRowSpan >= 1 &&
      this.hasCollision(widget, widget.colStart ?? 1, widget.rowStart ?? 1, adjustedColSpan, adjustedRowSpan)
    ) {
      if (adjustedColSpan > 1) {
        adjustedColSpan -= 1;
      }
      if (adjustedRowSpan > 1) {
        adjustedRowSpan -= 1;
      }
      if (adjustedColSpan === 1 && adjustedRowSpan === 1) {
        break;
      }
    }
    return { colSpan: adjustedColSpan, rowSpan: adjustedRowSpan };
  }

  protected handleDragMoved(
    event: { pointerPosition: { x: number; y: number }; source?: { getRootElement(): HTMLElement } },
    widget: AltExecutionDashboardWidget,
  ): void {
    if (!this.editMode()) {
      return;
    }
    const metrics = this.getGridMetrics();
    const layout = this.activeLayout();
    if (!metrics || !layout) {
      return;
    }
    this.ensureLayoutPositions(layout);
    if (!this.dragOrigins.has(widget.id)) {
      this.dragOrigins.set(widget.id, {
        colStart: widget.colStart ?? 1,
        rowStart: widget.rowStart ?? 1,
        colSpan: widget.colSpan,
        rowSpan: widget.rowSpan,
      });
    }
    const { col: targetCol, row: targetRow } = this.getCellFromPointer(
      event.pointerPosition.x,
      event.pointerPosition.y,
      metrics,
    );

    const targetWidget = layout.widgets.find((candidate) => {
      if (candidate.id === widget.id) {
        return false;
      }
      return this.isCellWithinWidget(targetCol, targetRow, candidate);
    });

    if (targetWidget) {
      const placement = this.bestFitSpanAt(widget, targetCol, targetRow, targetWidget.id);
      if (placement) {
        this.dragPreview.set(placement);
        return;
      }
      this.dragPreview.set({
        colStart: targetWidget.colStart ?? 1,
        rowStart: targetWidget.rowStart ?? 1,
        colSpan: Math.min(widget.colSpan, targetWidget.colSpan),
        rowSpan: Math.min(widget.rowSpan, targetWidget.rowSpan),
      });
      return;
    }

    const placement = this.bestFitSpanAt(widget, targetCol, targetRow);
    this.dragPreview.set(placement ?? { colStart: targetCol, rowStart: targetRow, colSpan: 1, rowSpan: 1 });
  }

  private findPlacement(
    widget: AltExecutionDashboardWidget,
    desiredCol: number,
    desiredRow: number,
  ): { colStart: number; rowStart: number } {
    const colSpan = widget.colSpan;
    const rowSpan = widget.rowSpan;
    for (let row = desiredRow; row < desiredRow + 12; row += 1) {
      for (let col = 1; col <= AltExecutionReportComponent.GRID_COLUMNS; col += 1) {
        const colStart = Math.min(col, AltExecutionReportComponent.GRID_COLUMNS - colSpan + 1);
        if (!this.hasCollision(widget, colStart, row, colSpan, rowSpan)) {
          return { colStart, rowStart: row };
        }
      }
    }
    return {
      colStart: this.clamp(desiredCol, 1, AltExecutionReportComponent.GRID_COLUMNS - colSpan + 1),
      rowStart: desiredRow,
    };
  }

  private getCellFromPointer(
    x: number,
    y: number,
    metrics: { gridRect: DOMRect; columnGap: number; rowGap: number; rowHeight: number; columnWidth: number },
  ): { col: number; row: number } {
    const unitWidth = metrics.columnWidth + metrics.columnGap;
    const unitHeight = metrics.rowHeight + metrics.rowGap;
    const localX = x - metrics.gridRect.left;
    const localY = y - metrics.gridRect.top;
    let colIndex = Math.floor(localX / unitWidth);
    let rowIndex = Math.floor(localY / unitHeight);
    const colOffset = localX - colIndex * unitWidth;
    const rowOffset = localY - rowIndex * unitHeight;
    if (colOffset > metrics.columnWidth) {
      colIndex += 1;
    }
    if (rowOffset > metrics.rowHeight) {
      rowIndex += 1;
    }
    const col = this.clamp(colIndex + 1, 1, AltExecutionReportComponent.GRID_COLUMNS);
    const row = Math.max(1, rowIndex + 1);
    return { col, row };
  }

  private bestFitSpanAt(
    widget: AltExecutionDashboardWidget,
    colStart: number,
    rowStart: number,
    ignoreId?: string,
  ): { colStart: number; rowStart: number; colSpan: number; rowSpan: number } | undefined {
    const maxColSpan = Math.min(widget.colSpan, AltExecutionReportComponent.GRID_COLUMNS - colStart + 1);
    const maxRowSpan = widget.rowSpan;
    for (let rowSpan = maxRowSpan; rowSpan >= 1; rowSpan -= 1) {
      for (let colSpan = maxColSpan; colSpan >= 1; colSpan -= 1) {
        if (!this.hasCollision(widget, colStart, rowStart, colSpan, rowSpan, ignoreId)) {
          return { colStart, rowStart, colSpan, rowSpan };
        }
      }
    }
    return undefined;
  }

  private hasCollision(
    widget: AltExecutionDashboardWidget,
    colStart: number,
    rowStart: number,
    colSpan: number,
    rowSpan: number,
    ignoreId?: string,
  ): boolean {
    const layout = this.activeLayout();
    if (!layout) {
      return false;
    }
    const colEnd = colStart + colSpan - 1;
    const rowEnd = rowStart + rowSpan - 1;
    return layout.widgets.some((candidate) => {
      if (candidate.id === widget.id) {
        return false;
      }
      if (ignoreId && candidate.id === ignoreId) {
        return false;
      }
      if (candidate.colStart === undefined || candidate.rowStart === undefined) {
        return false;
      }
      if (this.shouldHideWidget(candidate)) {
        return false;
      }
      const candidateColStart = candidate.colStart ?? 1;
      const candidateRowStart = candidate.rowStart ?? 1;
      const candidateColEnd = candidateColStart + candidate.colSpan - 1;
      const candidateRowEnd = candidateRowStart + candidate.rowSpan - 1;
      const overlapCols = colStart <= candidateColEnd && colEnd >= candidateColStart;
      const overlapRows = rowStart <= candidateRowEnd && rowEnd >= candidateRowStart;
      return overlapCols && overlapRows;
    });
  }

  private isCellWithinWidget(col: number, row: number, widget: AltExecutionDashboardWidget): boolean {
    if (widget.colStart === undefined || widget.rowStart === undefined) {
      return false;
    }
    const colStart = widget.colStart;
    const rowStart = widget.rowStart;
    const colEnd = colStart + widget.colSpan - 1;
    const rowEnd = rowStart + widget.rowSpan - 1;
    return col >= colStart && col <= colEnd && row >= rowStart && row <= rowEnd;
  }

  private findWidgetAtCell(
    widgets: AltExecutionDashboardWidget[],
    col: number,
    row: number,
    excludeId: string,
  ): AltExecutionDashboardWidget | undefined {
    return widgets.find(
      (widget) =>
        widget.id !== excludeId && !this.shouldHideWidget(widget) && this.isCellWithinWidget(col, row, widget),
    );
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  private markDirty(): void {
    this.dirty.set(true);
  }

  private persistLayouts(): void {
    const state = this.layoutsState();
    if (!state) {
      return;
    }
    this._layoutService.save(this._storageKey, state);
  }

  private tryInitializeLayouts(): void {
    if (!this._executionSnapshot) {
      return;
    }
    const userId = this._auth.isAuthenticated()
      ? this._auth.getUserID()
      : this._executionSnapshot?.executionParameters?.userID || 'anonymous';
    const projectId =
      this._executionSnapshot?.attributes?.['project'] ??
      this._executionSnapshot?.executionParameters?.repositoryObject?.repositoryID ??
      'global';
    this.loadLayouts(userId, projectId);
  }

  private ensureLayoutsInitialized(): void {
    if (this.layoutsState()) {
      return;
    }
    const userId = this._auth.isAuthenticated() ? this._auth.getUserID() : 'anonymous';
    this.loadLayouts(userId, 'global');
  }

  private loadLayouts(userId: string, projectId: string): void {
    const newKey = this._layoutService.buildStorageKey(userId, projectId);
    if (this._storageKey === newKey && this.layoutsState()) {
      return;
    }
    this._storageKey = newKey;
    const defaults = this.buildDefaultLayouts();
    const state = this._layoutService.load(this._storageKey, defaults);
    this.pruneLayouts(state.layouts);
    this.normalizeLayouts(state.layouts);
    this.layoutsState.set(state);
  }

  private buildDefaultLayouts(): AltExecutionDashboardLayout[] {
    const defaultLayout: AltExecutionDashboardLayout = {
      id: 'default',
      name: 'Default',
      protected: true,
      widgets: [
        this.createWidget('errorsSummary', 8, 3),
        this.createWidget('testCasesList', 6, 6),
        this.createWidget('testCasesSummary', 2, 3),
        this.createWidget('keywordsSummary', 2, 3),
        this.createWidget('executionTree', 6, 9),
        this.createWidget('keywordsList', 6, 9),
        this.createWidget('performanceChart', 2, 6),
        this.createWidget('errorsTable', 8, 9),
        this.createWidget('currentOperations', 4, 6),
        ...this.customPanels.map((panel) =>
          this.createWidget(`customPanel:${panel.type}`, panel.metadata?.colSpan ? panel.metadata.colSpan * 2 : 4, 6),
        ),
      ],
    };
    return [defaultLayout];
  }

  private createWidget(
    type: AltExecutionDashboardWidgetType,
    colSpan: number,
    rowSpan: number,
  ): AltExecutionDashboardWidget {
    return {
      id: `widget-${type}-${Math.floor(Math.random() * 100000)}`,
      type,
      colSpan: Math.min(AltExecutionReportComponent.MAX_COL_SPAN, colSpan),
      rowSpan: Math.min(AltExecutionReportComponent.MAX_ROW_SPAN, rowSpan),
      colStart: undefined,
      rowStart: undefined,
    };
  }

  private normalizeLayouts(layouts: AltExecutionDashboardLayout[]): void {
    layouts.forEach((layout) => {
      this.ensureLayoutPositions(layout);
    });
  }

  private ensureLayoutPositions(layout: AltExecutionDashboardLayout): void {
    const placed: AltExecutionDashboardWidget[] = [];
    layout.widgets.forEach((widget) => {
      if (widget.colStart !== undefined && widget.rowStart !== undefined) {
        placed.push(widget);
        return;
      }
      const placement = this.findFirstAvailableSlot(placed, widget);
      widget.colStart = placement.colStart;
      widget.rowStart = placement.rowStart;
      placed.push(widget);
    });
  }

  private pruneLayouts(layouts: AltExecutionDashboardLayout[]): void {
    const knownTypes = new Set(this.getWidgetDefinitions().map((def) => def.type));
    layouts.forEach((layout) => {
      const seenIds = new Set<string>();
      layout.widgets = layout.widgets.filter((widget) => {
        if (!knownTypes.has(widget.type)) {
          return false;
        }
        if (seenIds.has(widget.id)) {
          return false;
        }
        seenIds.add(widget.id);
        return true;
      });
    });
  }

  private findFirstAvailableSlot(
    placed: AltExecutionDashboardWidget[],
    widget: AltExecutionDashboardWidget,
  ): { colStart: number; rowStart: number } {
    const colSpan = widget.colSpan;
    const rowSpan = widget.rowSpan;
    for (let row = 1; row < 200; row += 1) {
      for (let col = 1; col <= AltExecutionReportComponent.GRID_COLUMNS; col += 1) {
        const colStart = Math.min(col, AltExecutionReportComponent.GRID_COLUMNS - colSpan + 1);
        if (!this.hasCollisionWithList(placed, colStart, row, colSpan, rowSpan)) {
          return { colStart, rowStart: row };
        }
      }
    }
    return { colStart: 1, rowStart: 1 };
  }

  private hasCollisionWithList(
    widgets: AltExecutionDashboardWidget[],
    colStart: number,
    rowStart: number,
    colSpan: number,
    rowSpan: number,
  ): boolean {
    const colEnd = colStart + colSpan - 1;
    const rowEnd = rowStart + rowSpan - 1;
    return widgets.some((candidate) => {
      if (candidate.colStart === undefined || candidate.rowStart === undefined) {
        return false;
      }
      if (this.shouldHideWidget(candidate)) {
        return false;
      }
      const candidateColStart = candidate.colStart ?? 1;
      const candidateRowStart = candidate.rowStart ?? 1;
      const candidateColEnd = candidateColStart + candidate.colSpan - 1;
      const candidateRowEnd = candidateRowStart + candidate.rowSpan - 1;
      const overlapCols = colStart <= candidateColEnd && colEnd >= candidateColStart;
      const overlapRows = rowStart <= candidateRowEnd && rowEnd >= candidateRowStart;
      return overlapCols && overlapRows;
    });
  }

  private isWidgetVisible(widget: AltExecutionDashboardWidget): boolean {
    const definition = this.getWidgetDefinition(widget.type);
    if (definition?.rule) {
      if (!this.evaluateRule(definition.rule)) {
        return false;
      }
    }
    if (definition?.requiresTestCases && !this._hasTestCases) {
      return false;
    }
    if (definition?.requiresErrors && this._errorsCount === 0) {
      return false;
    }
    if (definition?.requiresExecutionId && !this._executionSnapshot?.id) {
      return false;
    }
    return true;
  }

  private evaluateRule(rule: { field: 'execution.status'; op: 'EQ'; value: string }): boolean {
    if (rule.field === 'execution.status') {
      return (this._executionSnapshot?.status ?? '') === rule.value;
    }
    return true;
  }

  private getWidgetDefinitions(): Array<{
    type: AltExecutionDashboardWidgetType;
    label: string;
    minColSpan: number;
    minRowSpan: number;
    defaultColSpan: number;
    defaultRowSpan: number;
    supportsCompact: boolean;
    canEnlarge: boolean;
    requiresExecutionId?: boolean;
    requiresTestCases?: boolean;
    requiresErrors?: boolean;
    rule?: { field: 'execution.status'; op: 'EQ'; value: string };
  }> {
    const base = [
      {
        type: 'errorsSummary' as const,
        label: 'Errors summary',
        minColSpan: 4,
        minRowSpan: 3,
        defaultColSpan: 8,
        defaultRowSpan: 3,
        supportsCompact: true,
        canEnlarge: true,
        requiresErrors: false,
      },
      {
        type: 'testCasesList' as const,
        label: 'Test cases',
        minColSpan: 4,
        minRowSpan: 6,
        defaultColSpan: 6,
        defaultRowSpan: 6,
        supportsCompact: false,
        canEnlarge: true,
        requiresTestCases: true,
      },
      {
        type: 'testCasesSummary' as const,
        label: 'Test case summary',
        minColSpan: 2,
        minRowSpan: 3,
        defaultColSpan: 2,
        defaultRowSpan: 3,
        supportsCompact: true,
        canEnlarge: false,
        requiresTestCases: true,
      },
      {
        type: 'keywordsSummary' as const,
        label: 'Keyword summary',
        minColSpan: 2,
        minRowSpan: 3,
        defaultColSpan: 2,
        defaultRowSpan: 3,
        supportsCompact: true,
        canEnlarge: false,
      },
      {
        type: 'executionTree' as const,
        label: 'Execution tree',
        minColSpan: 4,
        minRowSpan: 6,
        defaultColSpan: 6,
        defaultRowSpan: 9,
        supportsCompact: false,
        canEnlarge: true,
      },
      {
        type: 'keywordsList' as const,
        label: 'Keyword calls',
        minColSpan: 4,
        minRowSpan: 6,
        defaultColSpan: 6,
        defaultRowSpan: 9,
        supportsCompact: false,
        canEnlarge: true,
      },
      {
        type: 'performanceChart' as const,
        label: 'Performance overview',
        minColSpan: 2,
        minRowSpan: 4,
        defaultColSpan: 2,
        defaultRowSpan: 6,
        supportsCompact: true,
        canEnlarge: true,
        requiresExecutionId: true,
      },
      {
        type: 'errorsTable' as const,
        label: 'Errors list',
        minColSpan: 4,
        minRowSpan: 6,
        defaultColSpan: 8,
        defaultRowSpan: 9,
        supportsCompact: false,
        canEnlarge: true,
        requiresErrors: false,
      },
      {
        type: 'currentOperations' as const,
        label: 'Current operations',
        minColSpan: 3,
        minRowSpan: 4,
        defaultColSpan: 4,
        defaultRowSpan: 6,
        supportsCompact: false,
        canEnlarge: true,
        rule: { field: 'execution.status', op: 'EQ', value: 'RUNNING' } as const,
      },
    ];

    const customPanels = this.customPanels.map((panel) => ({
      type: `customPanel:${panel.type}` as const,
      label: panel.label,
      minColSpan: 2,
      minRowSpan: 4,
      defaultColSpan: panel.metadata?.colSpan ? panel.metadata.colSpan * 2 : 4,
      defaultRowSpan: 6,
      supportsCompact: false,
      canEnlarge: true,
    }));

    return [...base, ...customPanels];
  }

  protected getWidgetDefinition(type: AltExecutionDashboardWidgetType) {
    return this.getWidgetDefinitions().find((definition) => definition.type === type);
  }
}
