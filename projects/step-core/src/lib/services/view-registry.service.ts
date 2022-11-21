import { Injectable } from '@angular/core';
import { downgradeInjectable, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE } from '../shared';

export interface CustomView {
  template: string;
  isPublicView: boolean;
  isStaticView?: boolean;
}

export interface MenuEntry {
  label: string;
  viewId: string;
  parentMenu?: string;
  icon: string;
  weight?: number;
  right?: string;
  isEnabledFct(): boolean;
}

export interface Dashlet {
  label: string;
  template: string;
  id: string;
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
  registeredDashlets: { [key: string]: Dashlet[] } = {};

  constructor() {
    this.registerStandardMenuEntries();
  }

  /**
   * Registers basic set of main- and submenu entries
   */
  registerStandardMenuEntries() {
    // Main Menus
    this.registerMenuEntry('Automation', 'automation-root', 'play', 10);
    this.registerMenuEntry('Execute', 'execute-root', 'sun', 20);
    this.registerMenuEntry('Status', 'status-root', 'check-square', 50);
    this.registerMenuEntry('Support', 'support-root', 'life-buoy', 100);

    // Sub Menus Automation
    this.registerMenuEntry('Keywords', 'functions', 'target', 10, 'automation-root');
    this.registerMenuEntry('Plans', 'plans', 'file', 30, 'automation-root');
    this.registerMenuEntry('Parameters', 'parameters', 'list', 40, 'automation-root');
    // Sub Menus Execute
    this.registerMenuEntry('Executions', 'executions', 'rotate-cw', 10, 'execute-root');
    this.registerMenuEntry('Scheduler', 'scheduler', 'clock', 20, 'execute-root');
    // Sub Menus Status
    this.registerMenuEntry('Agents', 'gridagents', 'users', 20, 'status-root');
    this.registerMenuEntry('Agent tokens', 'gridtokens', 'circle', 30, 'status-root');
    this.registerMenuEntry('Token Groups', 'gridtokengroups', 'tag', 40, 'status-root');
    this.registerMenuEntry('Quota Manager', 'gridquotamanager', 'sidebar', 50, 'status-root');
    // Sub Menus Support
    this.registerMenuEntry(
      'Documentation',
      ViewRegistryService.VIEW_ID_LINK_PREFIX.concat('https://step.exense.ch/knowledgebase/'),
      'help-circle',
      10,
      'support-root'
    );
    this.registerMenuEntry(
      'REST API',
      ViewRegistryService.VIEW_ID_LINK_PREFIX.concat('/doc/rest/'),
      'compass',
      20,
      'support-root'
    );
    this.registerMenuEntry(
      'About',
      ViewRegistryService.VIEW_ID_LINK_PREFIX.concat('https://step.exense.ch/'),
      'book-open',
      30,
      'support-root'
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

  registerMenuEntry(
    label: string,
    viewId: string,
    icon: string,
    weight?: number,
    parentMenu?: string,
    right?: string
  ): void {
    if (!viewId || this.registeredMenuIds.includes(viewId)) {
      return;
    }
    this.registeredMenuIds.push(viewId);
    this.registeredMenuEntries.push({
      label,
      viewId,
      parentMenu,
      icon,
      weight,
      right,
      isEnabledFct: () => true,
    });
  }

  getMainMenuKey(subMenuKey: string): string | undefined {
    return this.registeredMenuEntries.find((entry: MenuEntry) => entry.viewId === subMenuKey)?.parentMenu;
  }

  getMainMenuAll(): MenuEntry[] {
    return this.registeredMenuEntries.filter((entry: MenuEntry) => !entry.parentMenu);
  }

  getDashlets(path: string) {
    let dashlets = this.registeredDashlets[path];
    if (!dashlets) {
      dashlets = [];
      this.registeredDashlets[path] = dashlets;
    }
    return dashlets;
  }

  registerDashlet(path: string, label: string, template: string, id: string, before?: boolean): void {
    if (before) {
      this.getDashlets(path).unshift({ label: label, template: template, id: id });
    } else {
      this.getDashlets(path).push({ label: label, template: template, id: id });
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
