import { Injectable } from '@angular/core';
import { ExecutionsPanelsService } from './executions-panels.service';
import { ExecutionStepPanel } from '../shared/execution-step-panel';
import { Observable, of } from 'rxjs';
import { ItemInfo, Mutable } from '@exense/step-core';

type FieldAccessor = Mutable<Pick<SingleExecutionPanelsService, 'customPanels'>>;

@Injectable()
export class SingleExecutionPanelsService {
  private eid?: string;

  readonly customPanels: ReadonlyArray<ItemInfo> = [];

  constructor(private _executionsPanelService: ExecutionsPanelsService) {}

  initialize(eid: string): void {
    this.eid = eid;
    this._executionsPanelService.initialize();
    (this as FieldAccessor).customPanels = this._executionsPanelService.customPanels;
  }

  getPanel(viewId: string): ExecutionStepPanel | undefined {
    if (!this.eid) {
      return undefined;
    }
    return this._executionsPanelService.getPanel(viewId, this.eid);
  }

  getPanelId(viewId: string): string | undefined {
    if (!this.eid) {
      return undefined;
    }
    return this.eid + viewId;
  }

  observePanel(viewId: string): Observable<ExecutionStepPanel | undefined> {
    if (!this.eid) {
      return of(undefined);
    }
    return this._executionsPanelService.observePanel(viewId, this.eid);
  }

  isShowPanel(viewId: string): boolean {
    if (!this.eid) {
      return false;
    }
    return this._executionsPanelService.isShowPanel(viewId, this.eid);
  }

  isPanelEnabled(viewId: string): boolean {
    if (!this.eid) {
      return false;
    }
    return this._executionsPanelService.isPanelEnabled(viewId, this.eid);
  }

  setShowPanel(viewId: string, show: boolean): void {
    if (!this.eid) {
      return;
    }
    this._executionsPanelService.setShowPanel(viewId, show, this.eid);
  }

  toggleShowPanel(viewId: string) {
    if (!this.eid) {
      return;
    }
    this._executionsPanelService.toggleShowPanel(viewId, this.eid);
  }

  enablePanel(viewId: string, enabled: boolean): void {
    if (!this.eid) {
      return;
    }
    this._executionsPanelService.enablePanel(viewId, enabled, this.eid);
  }
}
