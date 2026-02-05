import { inject, Injectable } from '@angular/core';
import { ExecutionStepPanel } from '../shared/execution-step-panel';
import { ExecutionCustomPanelRegistryService, ItemInfo, Mutable, ViewRegistryService } from '@exense/step-core';
import { BehaviorSubject, Observable } from 'rxjs';

type FieldsAccessor = Mutable<Pick<ExecutionsPanelsService, 'panels' | 'customPanels'>>;
type EditablePanel = Mutable<ExecutionStepPanel>;
type Panel = { id: string; label: string };

/**
 * @deprecated Relates to legacy execution's view
 * **/
@Injectable({
  providedIn: 'root',
})
export class ExecutionsPanelsService {
  private _executionCustomPanels = inject(ExecutionCustomPanelRegistryService);

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
  readonly customPanels: ReadonlyArray<ItemInfo> = [];

  initialize(): void {
    if (this._isInitialized) {
      return;
    }
    (this as FieldsAccessor).customPanels = this._executionCustomPanels.getItemInfos();
    this.customPanels.forEach(({ type, label }) => {
      this._defaultPanels[type] = { label, show: true, enabled: true };
    });
  }

  getPanel(viewId: string, executionId: string): ExecutionStepPanel | undefined {
    if (this._panels[executionId]) {
      return this._panels[executionId][viewId];
    }
    return this._defaultPanels[viewId];
  }

  observePanel(viewId: string, executionId: string): Observable<ExecutionStepPanel | undefined> {
    if (!this._panels$?.[executionId]?.[viewId]) {
      this._panels$[executionId] = this._panels$[executionId] || {};
      this._panels$[executionId][viewId] = new BehaviorSubject<ExecutionStepPanel | undefined>(
        this.getPanel(viewId, executionId),
      );
      return this._panels$[executionId][viewId];
    }
    return this._panels$[executionId][viewId];
  }

  isShowPanel(viewId: string, executionId: string): boolean {
    return !!this.getPanel(viewId, executionId)?.show;
  }

  setShowPanel(viewId: string, show: boolean, executionId: string): void {
    if (!this._panels[executionId]) {
      this._panels[executionId] = this._copyDefaultPanels();
    }
    (this._panels[executionId][viewId] as EditablePanel).show = show;
    this.updateObservable(viewId, executionId);
  }

  isPanelEnabled(viewId: string, executionId: string): boolean {
    return !!this.getPanel(viewId, executionId)?.enabled;
  }

  toggleShowPanel(viewId: string, executionId: string): void {
    this.setShowPanel(viewId, !this.isShowPanel(viewId, executionId), executionId);
  }

  enablePanel(viewId: string, enabled: boolean, executionId: string): void {
    if (!this._panels[executionId]) {
      this._panels[executionId] = this._copyDefaultPanels();
    }
    (this._panels[executionId][viewId] as EditablePanel).enabled = enabled;

    this.updateObservable(viewId, executionId);
  }

  getPanelTitle(viewId: string, executionId: string): string {
    return this.getPanel(viewId, executionId)?.label || '';
  }

  updateObservable(viewId: string, executionId: string): void {
    if (this._panels$[executionId] && this._panels$[executionId][viewId]) {
      this._panels$[executionId][viewId].next(this._panels[executionId][viewId]);
    }
  }

  private _copyDefaultPanels(): Record<string, ExecutionStepPanel> {
    return Object.entries(this._defaultPanels).reduce(
      (result, [key, panel]) => {
        result[key] = { ...panel };
        return result;
      },
      {} as Record<string, ExecutionStepPanel>,
    );
  }
}
