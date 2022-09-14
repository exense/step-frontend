import { Injectable } from '@angular/core';
import { ExecutionStepPanel } from '../shared/execution-step-panel';
import { AJS_MODULE, Dashlet, Mutable, ViewRegistryService } from '@exense/step-core';
import { downgradeInjectable, getAngularJSGlobal } from '@angular/upgrade/static';
import { BehaviorSubject, Observable } from 'rxjs';

type FieldsAccessor = Mutable<Pick<ExecutionsPanelsService, 'panels' | 'customPanels'>>;
type EditablePanel = Mutable<ExecutionStepPanel>;
type Panel = { id: string; label: string };

@Injectable({
  providedIn: 'root',
})
export class ExecutionsPanelsService {
  private _defaultPanels: Record<string, ExecutionStepPanel> = {
    testCases: { label: 'Test cases', show: false, enabled: false },
    steps: { label: 'Keyword calls', show: true, enabled: true },
    throughput: { label: 'Keyword throughput', show: true, enabled: true },
    performance: { label: 'Performance', show: true, enabled: true },
    reportTree: { label: 'Execution tree', show: true, enabled: true },
    executionDetails: { label: 'Execution details', show: true, enabled: true },
    parameters: { label: 'Execution parameters', show: false, enabled: true },
    currentOperations: { label: 'Current operations', show: true, enabled: true },
  };

  private _panels: Record<string, Record<string, ExecutionStepPanel>> = {};
  private _panels$: Record<string, Record<string, BehaviorSubject<ExecutionStepPanel | undefined>>> = {};
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
      this._defaultPanels[id] = { label, show: true, enabled: true };
    });
  }

  getPanel(viewId: string, eid: string): ExecutionStepPanel | undefined {
    if (this._panels[eid]) {
      return this._panels[eid][viewId];
    }
    return this._defaultPanels[viewId];
  }

  observePanel(viewId: string, eid: string): Observable<ExecutionStepPanel | undefined> {
    if (!this._panels$?.[eid]?.[viewId]) {
      this._panels$[eid] = this._panels$[eid] || {};
      this._panels$[eid][viewId] = new BehaviorSubject<ExecutionStepPanel | undefined>(this.getPanel(viewId, eid));
      return this._panels$[eid][viewId];
    }
    return this._panels$[eid][viewId];
  }

  isShowPanel(viewId: string, eid: string): boolean {
    return !!this.getPanel(viewId, eid)?.show;
  }

  setShowPanel(viewId: string, show: boolean, eid: string): void {
    if (!this._panels[eid]) {
      // deep copy
      this._panels[eid] = JSON.parse(JSON.stringify(this._defaultPanels));
    }
    (this._panels[eid][viewId] as EditablePanel).show = show;
    this.updateObservable(viewId, eid);
  }

  isPanelEnabled(viewId: string, eid: string): boolean {
    return !!this.getPanel(viewId, eid)?.enabled;
  }

  toggleShowPanel(viewId: string, eid: string) {
    this.setShowPanel(viewId, !this.isShowPanel(viewId, eid), eid);
  }

  enablePanel(viewId: string, enabled: boolean, eid: string): void {
    if (!this._panels[eid]) {
      // deep copy
      this._panels[eid] = this._copyDefaultPanels();
    }
    (this._panels[eid][viewId] as EditablePanel).enabled = enabled;

    this.updateObservable(viewId, eid);
  }

  getPanelTitle(viewId: string, eid: string): string {
    return this.getPanel(viewId, eid)?.label || '';
  }

  updateObservable(viewId: string, eid: string) {
    if (this._panels$[eid] && this._panels$[eid][viewId]) {
      this._panels$[eid][viewId].next(this._panels[eid][viewId]);
    }
  }

  private _copyDefaultPanels(): Record<string, ExecutionStepPanel> {
    return Object.entries(this._defaultPanels).reduce((result, [key, panel]) => {
      result[key] = { ...panel };
      return result;
    }, {} as Record<string, ExecutionStepPanel>);
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .service('executionsPanelsService', downgradeInjectable(ExecutionsPanelsService));
