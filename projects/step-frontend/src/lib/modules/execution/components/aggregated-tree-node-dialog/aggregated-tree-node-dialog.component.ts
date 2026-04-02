import { Component, computed, inject, OnDestroy, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Status } from '../../../_common/shared/status.enum';
import { ActivatedRoute } from '@angular/router';
import { AltExecutionDialogsService } from '../../services/alt-execution-dialogs.service';
import { NODE_DETAILS_RELATIVE_PARENT } from '../../services/node-details-relative-parent.token';
import {
  ExecutionDrilldownLeafPanel,
  ExecutionDrilldownSource,
  ExecutionDrilldownStateService,
} from '../../services/execution-drilldown-state.service';
import { VIEW_MODE, ViewMode } from '../../shared/view-mode';
import { DOCUMENT } from '@angular/common';

export interface AggregatedTreeNodeDialogData {
  aggregatedNodeId?: string;
  resolvedPartialPath?: string;
  reportNodeId?: string;
  searchStatus?: Status;
  searchStatusCount?: number;
}

type RootRenderedPanel = {
  key: 'root';
  kind: 'root';
  source: ExecutionDrilldownSource;
  title: string;
};

type LeafRenderedPanel = {
  key: string;
  kind: ExecutionDrilldownLeafPanel['kind'];
  panel: ExecutionDrilldownLeafPanel;
  title: string;
};

type RenderedPanel = RootRenderedPanel | LeafRenderedPanel;

type VisibleEntry =
  | {
      kind: 'panel';
      key: string;
      panel: RenderedPanel;
    }
  | {
      kind: 'minimized';
      key: 'minimized';
      panels: RenderedPanel[];
    };

const MAX_VISIBLE_CONTENT_PANELS = 3;

@Component({
  selector: 'step-aggregated-tree-node-dialog',
  templateUrl: './aggregated-tree-node-dialog.component.html',
  styleUrl: './aggregated-tree-node-dialog.component.scss',
  encapsulation: ViewEncapsulation.None,
  standalone: false,
  providers: [
    {
      provide: NODE_DETAILS_RELATIVE_PARENT,
      useFactory: () => inject(ActivatedRoute).parent!.parent!,
    },
    AltExecutionDialogsService,
    {
      provide: VIEW_MODE,
      useValue: ViewMode.VIEW,
    },
  ],
})
export class AggregatedTreeNodeDialogComponent implements OnInit, OnDestroy {
  private readonly _data = inject<AggregatedTreeNodeDialogData>(MAT_DIALOG_DATA);
  private readonly _dialogRef = inject(MatDialogRef);
  private readonly _document = inject(DOCUMENT);
  protected readonly _dialogsService = inject(AltExecutionDialogsService);
  private readonly _drilldownState = inject(ExecutionDrilldownStateService);

  private readonly maximizedPanelId = signal<string | undefined>(undefined);
  private readonly panelSizes = signal<Record<string, number>>({});
  private dragState?: {
    leftKey: string;
    rightKey: string;
    startX: number;
    leftSize: number;
    rightSize: number;
  };

  protected readonly rootPanel = this._drilldownState.rootPanel;
  protected readonly leafPanels = this._drilldownState.panels;

  protected readonly rootPanelTitle = computed(() => this.resolveRootTitle(this.rootPanel()));
  protected readonly actualPanels = computed<RenderedPanel[]>(() => {
    const rootPanel: RootRenderedPanel = {
      key: 'root',
      kind: 'root',
      source: this.rootPanel(),
      title: this.rootPanelTitle(),
    };

    const leafPanels = this.leafPanels().map<LeafRenderedPanel>((panel) => ({
      key: panel.instanceId,
      kind: panel.kind,
      panel,
      title: panel.title ?? this.resolveLeafTitle(panel),
    }));

    return [rootPanel, ...leafPanels];
  });

  protected readonly breadcrumbs = computed(() => this.actualPanels().map((panel) => panel.title));
  protected readonly hasBackButton = computed(() => this.leafPanels().length > 1);
  protected readonly rightMostLeafPanelId = computed(() => this.leafPanels()[this.leafPanels().length - 1]?.instanceId);

  protected readonly visibleEntries = computed<VisibleEntry[]>(() => {
    const panels = this.actualPanels();
    const maximizedPanelId = this.maximizedPanelId();

    if (maximizedPanelId) {
      const target = panels.find((panel) => panel.key === maximizedPanelId);
      const minimizedPanels = panels.filter((panel) => panel.key !== maximizedPanelId);
      return [
        ...(minimizedPanels.length
          ? [{ kind: 'minimized', key: 'minimized', panels: minimizedPanels } as VisibleEntry]
          : []),
        ...(target ? [{ kind: 'panel', key: target.key, panel: target } as VisibleEntry] : []),
      ];
    }

    if (panels.length <= MAX_VISIBLE_CONTENT_PANELS) {
      return panels.map<VisibleEntry>((panel) => ({ kind: 'panel', key: panel.key, panel }));
    }

    // Keep the root panel visible, keep the right-most panels visible, and minimize only
    // the panels between them. The minimized column itself is rendered separately and
    // therefore can never be minimized again.
    const visibleRightPanelsCount = MAX_VISIBLE_CONTENT_PANELS - 1;
    const tail = panels.slice(-visibleRightPanelsCount);
    const minimizedPanels = panels.slice(1, panels.length - visibleRightPanelsCount);
    return [
      { kind: 'panel', key: panels[0].key, panel: panels[0] },
      { kind: 'minimized', key: 'minimized', panels: minimizedPanels },
      ...tail.map<VisibleEntry>((panel) => ({ kind: 'panel', key: panel.key, panel })),
    ];
  });

  ngOnInit(): void {
    const routePanel = this.createRoutePanel();
    if (!routePanel) {
      this._dialogRef.close(false);
      return;
    }

    this._drilldownState.ensureRoutePanel(routePanel);
  }

  ngOnDestroy(): void {
    this.stopDragging();
  }

  protected closeDialog(): void {
    this._dialogRef.close(false);
  }

  protected navigateBack(): void {
    const leafPanels = this.leafPanels();
    const lastPanel = leafPanels[leafPanels.length - 1];
    if (!lastPanel) {
      this.closeDialog();
      return;
    }
    this.closePanel(lastPanel.instanceId);
  }

  protected closePanel(instanceId: string): void {
    this._drilldownState.closePanel(instanceId);
    this.maximizedPanelId.set(undefined);
    if (this.leafPanels().length) {
      this.syncRouteToLastPanel();
    }
  }

  protected reopenPanel(panel: RenderedPanel): void {
    if (panel.kind === 'root') {
      this.maximizedPanelId.set(undefined);
      return;
    }

    this._drilldownState.trimToPanel(panel.panel.instanceId);
    this.maximizedPanelId.set(undefined);
    this.syncRouteToLastPanel();
  }

  protected toggleRightMostPanelSize(panel: LeafRenderedPanel): void {
    const maximizedPanelId = this.maximizedPanelId();
    this.maximizedPanelId.set(maximizedPanelId === panel.panel.instanceId ? undefined : panel.panel.instanceId);
  }

  protected handleDividerMouseDown(left: VisibleEntry, right: VisibleEntry, event: MouseEvent): void {
    event.preventDefault();
    const leftElement = this.findPanelArea(left.key);
    const rightElement = this.findPanelArea(right.key);
    this.dragState = {
      leftKey: left.key,
      rightKey: right.key,
      startX: event.clientX,
      leftSize: leftElement?.getBoundingClientRect().width ?? this.entrySize(left),
      rightSize: rightElement?.getBoundingClientRect().width ?? this.entrySize(right),
    };

    this._document.defaultView?.addEventListener('mousemove', this.handleWindowMouseMove);
    this._document.defaultView?.addEventListener('mouseup', this.handleWindowMouseUp);
  }

  protected entrySize(entry: VisibleEntry): number {
    const savedSize = this.panelSizes()[entry.key];
    if (savedSize) {
      return savedSize;
    }

    if (entry.kind === 'minimized') {
      return 92;
    }

    if (entry.panel.kind === 'root') {
      return entry.panel.source === 'tree' ? 460 : 400;
    }

    return entry.panel.kind === 'iteration-list' ? 340 : 420;
  }

  protected panelWidth(entry: VisibleEntry, isLast: boolean): string | null {
    const savedSize = this.panelSizes()[entry.key];
    if (savedSize) {
      return `${savedSize}px`;
    }

    if (isLast && entry.kind === 'panel' && entry.panel.kind !== 'root' && !this.maximizedPanelId()) {
      return null;
    }

    return `${this.entrySize(entry)}px`;
  }

  protected minimizedTooltip(panel: RenderedPanel): string {
    return `${panel.title}\nClick to reopen`;
  }

  protected minimizedLabel(panel: RenderedPanel): string {
    const text = panel.title.trim();
    if (!text) {
      return '?';
    }

    const words = text.split(/\s+/).filter((item) => !!item);
    if (words.length === 1) {
      return words[0][0]!.toUpperCase();
    }

    return `${words[0][0] ?? ''}${words[1][0] ?? ''}`.toUpperCase();
  }

  protected panelIcon(panel: RenderedPanel): string {
    if (panel.kind === 'root') {
      switch (panel.source) {
        case 'steps':
          return 'list';
        case 'testcases':
          return 'plan-testcase';
        default:
          return 'tree';
      }
    }

    return panel.kind === 'iteration-list' ? 'list' : 'sidebar';
  }

  protected isRightMostPanel(panel: RenderedPanel): panel is LeafRenderedPanel {
    return panel.kind !== 'root' && panel.panel.instanceId === this.rightMostLeafPanelId();
  }

  protected isMaximized(panel: LeafRenderedPanel): boolean {
    return this.maximizedPanelId() === panel.panel.instanceId;
  }

  private syncRouteToLastPanel(): void {
    const lastPanel = this.leafPanels()[this.leafPanels().length - 1];
    if (!lastPanel) {
      this.closeDialog();
      return;
    }

    this._dialogsService.syncRouteToPanel(lastPanel);
  }

  private handleWindowMouseMove = (event: MouseEvent): void => {
    if (!this.dragState) {
      return;
    }

    const delta = event.clientX - this.dragState.startX;
    const nextLeft = this.dragState.leftSize + delta;
    const nextRight = this.dragState.rightSize - delta;
    const leftMin = this.minPanelWidth(this.dragState.leftKey);
    const rightMin = this.minPanelWidth(this.dragState.rightKey);

    if (nextLeft < leftMin || nextRight < rightMin) {
      return;
    }

    this.panelSizes.update((sizes) => ({
      ...sizes,
      [this.dragState!.leftKey]: nextLeft,
      [this.dragState!.rightKey]: nextRight,
    }));
  };

  private handleWindowMouseUp = (): void => {
    this.stopDragging();
  };

  private stopDragging(): void {
    this.dragState = undefined;
    this._document.defaultView?.removeEventListener('mousemove', this.handleWindowMouseMove);
    this._document.defaultView?.removeEventListener('mouseup', this.handleWindowMouseUp);
  }

  private findPanelArea(key: string): HTMLElement | null {
    return this._document.querySelector(`[data-panel-key="${key}"]`);
  }

  private minPanelWidth(key: string): number {
    if (key === 'minimized') {
      return 92;
    }

    if (key === 'root') {
      return 180;
    }

    const panel = this.actualPanels().find((item) => item.key === key);
    if (!panel || panel.kind === 'root') {
      return 160;
    }

    return panel.kind === 'iteration-list' ? 180 : 220;
  }

  private createRoutePanel(): Omit<ExecutionDrilldownLeafPanel, 'instanceId'> | undefined {
    if (this._data.reportNodeId) {
      return {
        routeKey: `rnid_${this._data.reportNodeId}`,
        kind: 'node-details',
        reportNodeId: this._data.reportNodeId,
      };
    }

    if (this._data.aggregatedNodeId) {
      return {
        routeKey: `agid_${this._data.aggregatedNodeId}:${this._data.searchStatus ?? ''}:${this._data.searchStatusCount ?? ''}`,
        kind: 'iteration-list',
        aggregatedNodeId: this._data.aggregatedNodeId,
        resolvedPartialPath: this._data.resolvedPartialPath,
        searchStatus: this._data.searchStatus,
        searchStatusCount: this._data.searchStatusCount,
      };
    }

    return undefined;
  }

  private resolveRootTitle(source: ExecutionDrilldownSource): string {
    switch (source) {
      case 'steps':
        return 'Execution Steps';
      case 'testcases':
        return 'TestCase List';
      default:
        return 'Execution Tree';
    }
  }

  private resolveLeafTitle(panel: ExecutionDrilldownLeafPanel): string {
    return panel.kind === 'iteration-list' ? 'Iteration List' : 'Node Details';
  }
}
