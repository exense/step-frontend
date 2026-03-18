import { Injectable, signal } from '@angular/core';
import { Status } from '../../_common/shared/status.enum';

export type ExecutionDrilldownSource = 'tree' | 'steps' | 'testcases';
export type ExecutionDrilldownLeafKind = 'iteration-list' | 'node-details';

export interface ExecutionDrilldownLeafPanel {
  instanceId: string;
  routeKey: string;
  kind: ExecutionDrilldownLeafKind;
  title?: string;
  aggregatedNodeId?: string;
  reportNodeId?: string;
  resolvedPartialPath?: string;
  searchStatus?: Status;
  searchStatusCount?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ExecutionDrilldownStateService {
  private readonly _rootPanel = signal<ExecutionDrilldownSource>('tree');
  private readonly _panels = signal<ExecutionDrilldownLeafPanel[]>([]);
  private _panelCounter = 0;

  readonly rootPanel = this._rootPanel.asReadonly();
  readonly panels = this._panels.asReadonly();

  reset(rootPanel: ExecutionDrilldownSource): void {
    this._rootPanel.set(rootPanel);
    this._panels.set([]);
  }

  openFromRoot(rootPanel: ExecutionDrilldownSource, panel: Omit<ExecutionDrilldownLeafPanel, 'instanceId'>): void {
    this._rootPanel.set(rootPanel);
    this._panels.set([this.withInstanceId(panel)]);
  }

  openNested(panel: Omit<ExecutionDrilldownLeafPanel, 'instanceId'>): void {
    this._panels.update((items) => [...items, this.withInstanceId(panel)]);
  }

  ensureRoutePanel(panel: Omit<ExecutionDrilldownLeafPanel, 'instanceId'>): void {
    const current = this._panels();
    if (!current.length) {
      this._panels.set([this.withInstanceId(panel)]);
      return;
    }

    if (current[current.length - 1]?.routeKey === panel.routeKey) {
      return;
    }

    this._panels.update((items) => [...items, this.withInstanceId(panel)]);
  }

  trimToPanel(instanceId: string): void {
    const current = this._panels();
    const index = current.findIndex((item) => item.instanceId === instanceId);
    if (index < 0) {
      return;
    }
    this._panels.set(current.slice(0, index + 1));
  }

  closePanel(instanceId: string): void {
    const current = this._panels();
    const index = current.findIndex((item) => item.instanceId === instanceId);
    if (index < 0) {
      return;
    }
    this._panels.set(current.slice(0, index));
  }

  private withInstanceId(panel: Omit<ExecutionDrilldownLeafPanel, 'instanceId'>): ExecutionDrilldownLeafPanel {
    this._panelCounter += 1;
    return { ...panel, instanceId: `drilldown-panel-${this._panelCounter}` };
  }
}
