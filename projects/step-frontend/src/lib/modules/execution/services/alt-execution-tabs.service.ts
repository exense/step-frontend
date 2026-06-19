import { Injectable, signal } from '@angular/core';
import { Params } from '@angular/router';
import { v4 } from 'uuid';

export enum STATIC_TABS {
  REPORT = 'report',
  ANALYTICS = 'analytics',
}

export interface DrilldownExecutionTab {
  id: string;
  label: string;
  nodeDetailsPath: string[];
  queryParams?: Params;
}

@Injectable()
export class AltExecutionTabsService {
  private readonly drilldownTabsInternal = signal<DrilldownExecutionTab[]>([]);
  private readonly activeDrilldownTabIdInternal = signal<string | undefined>(undefined);

  readonly drilldownTabs = this.drilldownTabsInternal.asReadonly();
  readonly activeDrilldownTabId = this.activeDrilldownTabIdInternal.asReadonly();

  openDrilldownTab(nodeDetailsPath: string[], queryParams?: Params, label = 'Drilldown'): string {
    const id = v4();
    this.drilldownTabsInternal.update((tabs) => [...tabs, { id, label, nodeDetailsPath, queryParams }]);
    this.activeDrilldownTabIdInternal.set(id);
    return id;
  }

  ensureActiveDrilldownTab(nodeDetailsPath: string[], queryParams?: Params): string {
    const activeId = this.activeDrilldownTabIdInternal();
    if (activeId && this.drilldownTabsInternal().some((tab) => tab.id === activeId)) {
      this.updateDrilldownTab(activeId, nodeDetailsPath, queryParams);
      return activeId;
    }
    return this.openDrilldownTab(nodeDetailsPath, queryParams);
  }

  activateDrilldownTab(id: string): DrilldownExecutionTab | undefined {
    const tab = this.drilldownTabsInternal().find((item) => item.id === id);
    if (tab) {
      this.activeDrilldownTabIdInternal.set(id);
    }
    return tab;
  }

  updateActiveDrilldownTab(nodeDetailsPath: string[], queryParams?: Params): void {
    const activeId = this.activeDrilldownTabIdInternal();
    if (!activeId) {
      this.openDrilldownTab(nodeDetailsPath, queryParams);
      return;
    }
    this.updateDrilldownTab(activeId, nodeDetailsPath, queryParams);
  }

  updateActiveDrilldownLabel(label: string): void {
    const activeId = this.activeDrilldownTabIdInternal();
    if (!activeId) {
      return;
    }
    this.drilldownTabsInternal.update((tabs) => tabs.map((tab) => (tab.id === activeId ? { ...tab, label } : tab)));
  }

  removeDrilldownTab(id: string): DrilldownExecutionTab | undefined {
    const tabs = this.drilldownTabsInternal();
    const index = tabs.findIndex((tab) => tab.id === id);
    if (index < 0) {
      return undefined;
    }
    const isActive = this.activeDrilldownTabIdInternal() === id;
    const nextTabs = tabs.filter((tab) => tab.id !== id);
    this.drilldownTabsInternal.set(nextTabs);
    if (!isActive) {
      return this.drilldownTabsInternal().find((tab) => tab.id === this.activeDrilldownTabIdInternal());
    }
    const nextActive = nextTabs[index - 1] ?? nextTabs[index] ?? nextTabs[nextTabs.length - 1];
    this.activeDrilldownTabIdInternal.set(nextActive?.id);
    return nextActive;
  }

  clearActiveDrilldownTab(): void {
    this.activeDrilldownTabIdInternal.set(undefined);
  }

  private updateDrilldownTab(id: string, nodeDetailsPath: string[], queryParams?: Params): void {
    this.drilldownTabsInternal.update((tabs) =>
      tabs.map((tab) => (tab.id === id ? { ...tab, nodeDetailsPath, queryParams } : tab)),
    );
  }
}
