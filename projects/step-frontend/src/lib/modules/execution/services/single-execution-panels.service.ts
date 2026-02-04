import { inject, Injectable } from '@angular/core';
import { ExecutionsPanelsService } from './executions-panels.service';
import { ExecutionStepPanel } from '../shared/execution-step-panel';
import { Observable, of } from 'rxjs';
import { ItemInfo, Mutable } from '@exense/step-core';

type FieldAccessor = Mutable<Pick<SingleExecutionPanelsService, 'customPanels'>>;

/**
 * @deprecated Relates to legacy execution's view
 * **/
@Injectable()
export class SingleExecutionPanelsService {
  private _executionsPanelService = inject(ExecutionsPanelsService);

  private executionId?: string;

  readonly customPanels: ReadonlyArray<ItemInfo> = [];

  initialize(executionId: string): void {
    this.executionId = executionId;
    this._executionsPanelService.initialize();
    (this as FieldAccessor).customPanels = this._executionsPanelService.customPanels;
  }

  getPanel(viewId: string): ExecutionStepPanel | undefined {
    if (!this.executionId) {
      return undefined;
    }
    return this._executionsPanelService.getPanel(viewId, this.executionId);
  }

  getPanelId(viewId: string): string | undefined {
    if (!this.executionId) {
      return undefined;
    }
    return 'id-' + this.executionId + viewId;
  }

  observePanel(viewId: string): Observable<ExecutionStepPanel | undefined> {
    if (!this.executionId) {
      return of(undefined);
    }
    return this._executionsPanelService.observePanel(viewId, this.executionId);
  }

  isShowPanel(viewId: string): boolean {
    if (!this.executionId) {
      return false;
    }
    return this._executionsPanelService.isShowPanel(viewId, this.executionId);
  }

  isPanelEnabled(viewId: string): boolean {
    if (!this.executionId) {
      return false;
    }
    return this._executionsPanelService.isPanelEnabled(viewId, this.executionId);
  }

  setShowPanel(viewId: string, show: boolean): void {
    if (!this.executionId) {
      return;
    }
    this._executionsPanelService.setShowPanel(viewId, show, this.executionId);
  }

  toggleShowPanel(viewId: string): void {
    if (!this.executionId) {
      return;
    }
    this._executionsPanelService.toggleShowPanel(viewId, this.executionId);
  }

  enablePanel(viewId: string, enabled: boolean): void {
    if (!this.executionId) {
      return;
    }
    this._executionsPanelService.enablePanel(viewId, enabled, this.executionId);
  }
}
