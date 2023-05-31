import { Injectable } from '@angular/core';
import { downgradeInjectable, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE } from '../shared';

export interface CustomView {
  template: string;
  isPublicView: boolean;
  isStaticView?: boolean;
}

export interface MenuEntry {
  id: string;
  title: string;
  icon: string;
  weight?: number;
  parentId?: string;
  isEnabledFct(): boolean;
}

export interface Dashlet {
  label: string;
  template: string;
  id: string;
  weight?: number;
  isEnabledFct?(): boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ViewRegistryService {
  static readonly VIEW_ID_LINK_PREFIX: string = 'link:';

  registeredViews: { [key: string]: CustomView } = {};
  registeredMenuEntries: MenuEntry[] = [];
  registeredMenuIds: string[] = [];
  registeredDashlets: { [key: string]: Dashlet[] | undefined } = {};

  constructor() {
    this.registerStandardMenuEntries();
  }

  /**
   * Registers basic set of main- and submenu entries
   */
  registerStandardMenuEntries() {
    // Main Menus
    this.registerMenuEntry('Design', 'automation-root', 'edit', { weight: 10 });
    this.registerMenuEntry('Execute', 'execute-root', 'sun', { weight: 20 });
    this.registerMenuEntry('Status', 'status-root', 'check-square', { weight: 50 });
    this.registerMenuEntry('Support', 'support-root', 'life-buoy', { weight: 100 });

    // Sub Menus Automation
    this.registerMenuEntry('Keywords', 'functions', 'target', { weight: 10, parentId: 'automation-root' });
    this.registerMenuEntry('Plans', 'plans', 'file', { weight: 30, parentId: 'automation-root' });
    this.registerMenuEntry('Parameters', 'parameters', 'list', { weight: 40, parentId: 'automation-root' });
    // Sub Menus Execute
    this.registerMenuEntry('Executions', 'executions', 'rocket', { weight: 10, parentId: 'execute-root' });
    this.registerMenuEntry('Scheduler', 'scheduler', 'clock', { weight: 20, parentId: 'execute-root' });
    this.registerMenuEntry('Analytics', 'analytics', 'bar-chart-2', { weight: 20, parentId: 'execute-root' });
    // Sub Menus Status
    this.registerMenuEntry('Current Operations', 'operations', 'airplay', { weight: 10, parentId: 'status-root' });
    this.registerMenuEntry('Agents', 'gridagents', 'users', { weight: 20, parentId: 'status-root' });
    this.registerMenuEntry('Agent tokens', 'gridtokens', 'circle', { weight: 30, parentId: 'status-root' });
    this.registerMenuEntry('Token Groups', 'gridtokengroups', 'tag', { weight: 40, parentId: 'status-root' });
    this.registerMenuEntry('Quota Manager', 'gridquotamanager', 'sidebar', { weight: 50, parentId: 'status-root' });
    // Sub Menus Support
    this.registerMenuEntry(
      'Documentation',
      ViewRegistryService.VIEW_ID_LINK_PREFIX.concat('https://step.exense.ch/knowledgebase/'),
      'help-circle',
      {
        weight: 10,
        parentId: 'support-root',
      }
    );
    this.registerMenuEntry('REST API', ViewRegistryService.VIEW_ID_LINK_PREFIX.concat('doc/rest/'), 'compass', {
      weight: 20,
      parentId: 'support-root',
    });
    this.registerMenuEntry(
      'About',
      ViewRegistryService.VIEW_ID_LINK_PREFIX.concat('https://step.exense.ch/'),
      'book-open',
      {
        weight: 30,
        parentId: 'support-root',
      }
    );
  }

  getCustomView(view: string): CustomView {
    const customView = this.registeredViews[view];
    if (customView) {
      return customView;
    } else {
      throw 'Undefined view: ' + view;
    }
  }

  getViewTemplate(view: string) {
    return this.getCustomView(view).template;
  }

  isPublicView(view: string) {
    return this.getCustomView(view).isPublicView;
  }

  isStaticView(view: string) {
    return this.getCustomView(view).isStaticView;
  }

  registerView(viewId: string, template: string, isPublicView?: boolean): void {
    this.registerViewWithConfig(viewId, template, { isPublicView: isPublicView });
  }

  registerViewWithConfig(
    viewId: string,
    template: string,
    config: { isPublicView?: boolean; isStaticView?: boolean }
  ): void {
    const isPublicView = config.isPublicView || false;
    const isStaticView = config.isStaticView || false;
    this.registeredViews[viewId] = { template: template, isPublicView: isPublicView, isStaticView: isStaticView };
  }

  registerMenuEntry(title: string, id: string, icon: string, options?: { weight?: number; parentId?: string }): void {
    if (!id || this.registeredMenuIds.includes(id)) {
      return;
    }
    this.registeredMenuIds.push(id);
    this.registeredMenuEntries.push({
      title,
      id,
      parentId: options?.parentId,
      icon,
      weight: options?.weight,
      isEnabledFct: () => true,
    });
  }

  getMainMenuKey(subMenuId: string): string | undefined {
    return this.registeredMenuEntries.find((entry: MenuEntry) => entry.id === subMenuId)?.parentId;
  }

  getMainMenuAll(): MenuEntry[] {
    return this.registeredMenuEntries.filter((entry: MenuEntry) => !entry.parentId);
  }

  getDashlets(path: string): Dashlet[] {
    let dashlets = this.registeredDashlets[path];

    if (!dashlets) {
      dashlets = [];
      this.registeredDashlets[path] = dashlets;
    }

    // weightless dashlets should be last
    const normalizeWeight = (weight?: number) => weight || Infinity;

    return dashlets.sort((a, b) => normalizeWeight(a.weight) - normalizeWeight(b.weight));
  }

  registerDashlet(path: string, label: string, template: string, id: string, before?: boolean, weight?: number): void {
    if (before) {
      this.getDashlets(path).unshift({
        label,
        template,
        id,
        weight,
      });
    } else {
      this.getDashlets(path).push({
        label,
        template,
        id,
        weight,
      });
    }
  }

  registerDashletAdvanced(
    path: string,
    label: string,
    template: string,
    id: string,
    position: number,
    isEnabledFct: () => boolean
  ): void {
    this.getDashlets(path).splice(position, 0, {
      label: label,
      template: template,
      id: id,
      isEnabledFct: isEnabledFct,
    });
  }
}

getAngularJSGlobal().module(AJS_MODULE).service('ViewRegistry', downgradeInjectable(ViewRegistryService));
