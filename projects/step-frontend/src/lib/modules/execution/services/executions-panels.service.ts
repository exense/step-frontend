import { Injectable } from '@angular/core';
import { ExecutionStepPanel } from '../shared/execution-step-panel';
import { AJS_MODULE, Dashlet, Mutable, ViewRegistryService } from '@exense/step-core';
import { downgradeInjectable, getAngularJSGlobal } from '@angular/upgrade/static';

type FieldsAccessor = Mutable<Pick<ExecutionsPanelsService, 'panels' | 'customPanels'>>;
type EditablePanel = Mutable<ExecutionStepPanel>;
type Panel = { id: string; label: string };

@Injectable({
  providedIn: 'root',
})
export class ExecutionsPanelsService {
  private _panels: Record<string, ExecutionStepPanel> = {
    testCases: { label: 'Test cases', show: false, enabled: false },
    steps: { label: 'Keyword calls', show: true, enabled: true },
    throughput: { label: 'Keyword throughput', show: true, enabled: true },
    threadGroups: { label: 'ThreadGroup Usage', show: true, enabled: true },
    performance: { label: 'Performance', show: true, enabled: true },
    reportTree: { label: 'Execution tree', show: true, enabled: true },
    executionDetails: { label: 'Execution details', show: true, enabled: true },
    parameters: { label: 'Execution parameters', show: false, enabled: true },
    currentOperations: { label: 'Current operations', show: true, enabled: true },
  };
  private _isInitialized: boolean = false;

  readonly panels: Panel[] = [];
  readonly customPanels: Dashlet[] = [];

  constructor(private _viewRegistry: ViewRegistryService) {}

  initialize(): void {
    if (this._isInitialized) {
      return;
    }
    (this as FieldsAccessor).customPanels = this._viewRegistry.getDashlets('execution');
    this.customPanels.forEach(({ id, label }) => {
      this._panels[id] = { label, show: true, enabled: true };
    });

    (this as FieldsAccessor).panels = Object.entries(this._panels).map(([id, { label }]) => ({ id, label }));
  }

  getPanel(viewId: string): ExecutionStepPanel | undefined {
    return this._panels[viewId];
  }

  isShowPanel(viewId: string): boolean {
    return !!this._panels[viewId]?.show;
  }

  setShowPanel(viewId: string, show: boolean): void {
    if (this._panels[viewId]) {
      this._panels[viewId].show = show;
    }
  }

  isPanelEnabled(viewId: string): boolean {
    return !!this._panels[viewId]?.enabled;
  }

  toggleShowPanel(viewId: string) {
    this.setShowPanel(viewId, !this.isShowPanel(viewId));
  }

  enablePanel(viewId: string, enabled: boolean): void {
    if (this._panels[viewId]) {
      (this._panels[viewId] as EditablePanel).enabled = enabled;
    }
  }

  getPanelTitle(viewId: string): string {
    return this._panels[viewId]?.label || '';
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .service('executionsPanelsService', downgradeInjectable(ExecutionsPanelsService));
