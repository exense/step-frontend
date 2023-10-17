import { inject, Injectable } from '@angular/core';
import { downgradeInjectable, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE } from '../shared';
import { VIEW_ID_LINK_PREFIX } from '../modules/basics/services/view-id-link-prefix.token';
import { Route, Router, UrlMatcher, UrlSegment } from '@angular/router';

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
  private _viewIdLinkPrefix = inject(VIEW_ID_LINK_PREFIX);
  private _router = inject(Router);

  registeredViews: { [key: string]: CustomView } = {};
  registeredMenuEntries: MenuEntry[] = [];
  registeredMenuIds: string[] = [];
  registeredDashlets: { [key: string]: Dashlet[] | undefined } = {};

  private static registeredRoutes: string[] = [];

  static readonly isMatchToLegacyRoutes: UrlMatcher = (url: UrlSegment[]) => {
    if (url.length < 0) {
      return null;
    }
    const path = url[0].path;
    if (ViewRegistryService.registeredRoutes.find((route) => path.startsWith(route))) {
      return null;
    }

    return { consumed: url };
  };

  isMigratedRoute(view: string): boolean {
    return ViewRegistryService.registeredRoutes.includes(view);
  }

  constructor() {
    this.registerStandardMenuEntries();
  }

  /**
   * Registers basic set of main- and submenu entries
   */
  registerStandardMenuEntries() {
    // Main Menus
    this.registerMenuEntry('Design', 'automation-root', 'edit', { weight: 10 });
    this.registerMenuEntry('Reporting', 'execute-root', 'file-check-03', { weight: 20 });
    this.registerMenuEntry('Status', 'status-root', 'check-square', { weight: 50 });
    this.registerMenuEntry('Support', 'support-root', 'life-buoy', { weight: 100 });

    // Sub Menus Automation
    this.registerMenuEntry('Keywords', 'functions', 'keyword', { weight: 10, parentId: 'automation-root' });
    this.registerMenuEntry('Plans', 'plans', 'plan', { weight: 30, parentId: 'automation-root' });
    this.registerMenuEntry('Parameters', 'parameters', 'list', { weight: 40, parentId: 'automation-root' });
    this.registerMenuEntry('Scheduler', 'scheduler', 'clock', { weight: 100, parentId: 'automation-root' });

    // Sub Menus Execute
    this.registerMenuEntry('Executions', 'executions', 'rocket', { weight: 10, parentId: 'execute-root' });
    this.registerMenuEntry('Analytics', 'analytics', 'bar-chart-square-01', { weight: 20, parentId: 'execute-root' });
    // Sub Menus Status
    this.registerMenuEntry('Current Operations', 'operations', 'airplay', { weight: 10, parentId: 'status-root' });
    this.registerMenuEntry('Agents', 'gridagents', 'agent', { weight: 20, parentId: 'status-root' });
    this.registerMenuEntry('Agent tokens', 'gridtokens', 'agent-token', { weight: 30, parentId: 'status-root' });
    this.registerMenuEntry('Token Groups', 'gridtokengroups', 'agent-token-group', {
      weight: 40,
      parentId: 'status-root',
    });
    this.registerMenuEntry('Quota Manager', 'gridquotamanager', 'sidebar', { weight: 50, parentId: 'status-root' });
    // Sub Menus Support
    this.registerMenuEntry(
      'Documentation',
      this._viewIdLinkPrefix.concat('https://step.exense.ch/knowledgebase/'),
      'book-open',
      {
        weight: 10,
        parentId: 'support-root',
      }
    );
    this.registerMenuEntry('REST API', this._viewIdLinkPrefix.concat('doc/rest/'), 'compass', {
      weight: 20,
      parentId: 'support-root',
    });
    this.registerMenuEntry('About', this._viewIdLinkPrefix.concat('https://step.exense.ch/'), 'help-circle', {
      weight: 30,
      parentId: 'support-root',
    });
  }

  getCustomView(view: string): CustomView {
    const customView = this.registeredViews[view];
    if (customView) {
      return customView;
    } else {
      throw 'Undefined view: ' + view;
    }
  }

  /**
   * @deprecated use getCustomView instead
   * @param view
   */
  getViewTemplate(view: string) {
    return this.getCustomView(view).template;
  }

  /**
   * @deprecated use getCustomView instead
   * @param view
   */
  isPublicView(view: string) {
    return this.getCustomView(view).isPublicView;
  }

  /**
   * @deprecated use getCustomView instead
   * @param view
   */
  isStaticView(view: string) {
    return this.getCustomView(view).isStaticView;
  }

  /**
   * @deprecated
   * **/
  registerView(viewId: string, template: string, isPublicView?: boolean): void {
    this.registerViewWithConfig(viewId, template, { isPublicView: isPublicView });
  }

  registerRoute(route: Route): void {
    const root = this._router.config.find((parent) => parent.path === 'root');
    if (!root?.children) {
      return;
    }
    if (route.path) {
      ViewRegistryService.registeredRoutes.push(route.path);
    }
    root.children.push(route);
  }

  /**
   * @deprecated
   * **/
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
    const dashlets = this.getDashletsInternal(path);

    // weightless dashlets should be last
    const normalizeWeight = (weight?: number) => weight || Infinity;

    const result = dashlets.sort((a, b) => normalizeWeight(a.weight) - normalizeWeight(b.weight));
    return result;
  }

  registerDashlet(path: string, label: string, template: string, id: string, before?: boolean, weight?: number): void {
    const dashlets = this.getDashletsInternal(path);
    if (before) {
      dashlets.unshift({
        label,
        template,
        id,
        weight,
      });
    } else {
      dashlets.push({
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

  private getDashletsInternal(path: string): Dashlet[] {
    let dashlets = this.registeredDashlets[path];

    if (!dashlets) {
      dashlets = [];
      this.registeredDashlets[path] = dashlets;
    }

    return dashlets;
  }
}

getAngularJSGlobal().module(AJS_MODULE).service('ViewRegistry', downgradeInjectable(ViewRegistryService));
