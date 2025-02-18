import { Injectable, signal } from '@angular/core';
import { Tab } from '@exense/step-core';

export enum STATIC_TABS {
  REPORT = 'report',
  TREE = 'tree',
  ANALYTICS = 'analytics',
}

@Injectable()
export class AltExecutionTabsService {
  private addedTabs = new Set<string>([STATIC_TABS.REPORT, STATIC_TABS.TREE, STATIC_TABS.ANALYTICS]);

  private tabsInternal = signal<Tab<string>[]>([
    this.createTab(STATIC_TABS.REPORT, 'Report'),
    this.createTab(STATIC_TABS.TREE, 'Tree'),
    this.createTab(STATIC_TABS.ANALYTICS, 'Analytics'),
  ]);

  readonly tabs = this.tabsInternal.asReadonly();

  addTab(id: string, label: string, link?: string, before?: string | STATIC_TABS): void {
    if (this.addedTabs.has(id)) {
      return;
    }
    this.tabsInternal.update((tabs) => {
      if (!before) {
        return [...tabs, this.createTab(id, label, link)];
      }
      const index = tabs.findIndex((tab) => tab.id === before);
      if (index < 0) {
        return [...tabs, this.createTab(id, label, link)];
      }
      const result = [...tabs];
      result.splice(index, 0, this.createTab(id, label, link));
      return result;
    });
    this.addedTabs.add(id);
  }

  removeTab(id: string): void {
    if (!this.addedTabs.has(id)) {
      return;
    }
    this.tabsInternal.update((tabs) => tabs.filter((tab) => tab.id !== id));
    this.addedTabs.delete(id);
  }

  private createTab(id: string, label: string, link?: string): Tab<string> {
    return {
      id,
      label,
      link: [{ outlets: { primary: link ?? id, modal: null, nodeDetails: null } }],
    };
  }
}
