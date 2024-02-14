import { inject, Injectable, OnDestroy } from '@angular/core';
import { routesPrioritySortPredicate, SUB_ROUTE_DATA, SubRouteData, SubRouterConfig } from '../shared';
import { Route, Router, Routes } from '@angular/router';
import { checkPermissionsGuard } from './check-permissions-guard.service';
import { VIEW_ID_LINK_PREFIX } from '../modules/basics/services/view-id-link-prefix.token';
import { BehaviorSubject } from 'rxjs';

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
export class ViewRegistryService implements OnDestroy {
  private _viewIdLinkPrefix = inject(VIEW_ID_LINK_PREFIX);
  private _router = inject(Router);

  private temporaryRouteChildren = new Map<string, Routes>();

  private isNavigationInitializedInternal$ = new BehaviorSubject(false);
  readonly isNavigationInitialized$ = this.isNavigationInitializedInternal$.asObservable();

  registeredViews: { [key: string]: CustomView } = {};
  registeredMenuEntries: MenuEntry[] = [];
  registeredMenuIds: string[] = [];
  registeredDashlets: { [key: string]: Dashlet[] | undefined } = {};

  private static registeredRoutes: string[] = [];

  isMigratedRoute(view: string): boolean {
    return ViewRegistryService.registeredRoutes.includes(view);
  }

  constructor() {
    this.registerStandardMenuEntries();
  }

  ngOnDestroy(): void {
    this.isNavigationInitializedInternal$.complete();
  }

  initialNavigation(): void {
    this._router.initialNavigation();
    if (!this.isNavigationInitializedInternal$.value) {
      this.isNavigationInitializedInternal$.next(true);
    }
  }

  /**
   * Registers basic set of main- and submenu entries
   */
  registerStandardMenuEntries() {
    // Main Menus
    this.registerMenuEntry('Design', 'automation-root', 'edit', { weight: 10 });
    this.registerMenuEntry('Reporting', 'execute-root', 'file-check-03', { weight: 20 });
    this.registerMenuEntry('Status', 'status-root', 'check-square', { weight: 50 });
    this.registerMenuEntry('Bookmarks', 'bookmarks-root', 'bookmark', { weight: 80 });
    this.registerMenuEntry('Support', 'support-root', 'life-buoy', { weight: 100 });

    // Sub Menus Automation
    this.registerMenuEntry('Keywords', 'functions', 'keyword', { weight: 10, parentId: 'automation-root' });
    this.registerMenuEntry('Plans', 'plans', 'plan', { weight: 30, parentId: 'automation-root' });
    this.registerMenuEntry('Parameters', 'parameters', 'list', { weight: 40, parentId: 'automation-root' });
    this.registerMenuEntry('Schedules', 'scheduler', 'clock', { weight: 100, parentId: 'automation-root' });

    // Sub Menus Execute
    this.registerMenuEntry('Executions', 'executions', 'rocket', { weight: 10, parentId: 'execute-root' });
    this.registerMenuEntry('Analytics', 'dashboards', 'bar-chart-square-01', { weight: 20, parentId: 'execute-root' });
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
      },
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

  getChildrenRouteInfo(parentPath: string): SubRouteData[] {
    const parentChildren = this.getRouteParentChildren(parentPath);
    return parentChildren
      .map((child) => {
        const data = child.data?.[SUB_ROUTE_DATA];
        if (!data) {
          return undefined;
        }
        const path = child.path;
        return { ...data, path } as SubRouteData;
      })
      .filter((data) => !!data)
      .sort((a, b) => {
        const weightA = a?.weight ?? 1;
        const weightB = b?.weight ?? 1;
        return weightA - weightB;
      }) as SubRouteData[];
  }

  private getRootRoute(): Route {
    return this._router.config[0]!.children!.find((route) => route.path === 'root')!;
  }

  private getRouteParentChildren(parentPath: string): Routes {
    const root = this.getRootRoute();
    let parentChildren = root.children!;

    if (!parentPath) {
      return parentChildren;
    }

    const parts = parentPath.split('/');

    for (const parentPathPart of parts) {
      const parent = parentChildren.find((route) => route.path === parentPathPart);

      if (parent) {
        parent.children = parent.children ?? [];
        parentChildren = parent.children;
        continue;
      }

      if (this.temporaryRouteChildren.has(parentPathPart)) {
        parentChildren = this.temporaryRouteChildren.get(parentPathPart)!;
      } else {
        parentChildren = [];
        this.temporaryRouteChildren.set(parentPathPart, parentChildren);
      }
    }

    return parentChildren;
  }

  registerRoute(route: Route, { parentPath, label, weight, accessPermissions }: SubRouterConfig = {}): void {
    const root = this.getRootRoute();
    if (!root?.children) {
      return;
    }

    if (route.path && this.temporaryRouteChildren.has(route.path)) {
      route.children = route.children || [];
      route.children.push(...this.temporaryRouteChildren.get(route.path)!);
      this.temporaryRouteChildren.delete(route.path);
    }

    if (!parentPath) {
      if (route.path) {
        let path = route.path;
        if (path.includes('/') && path.includes(':')) {
          path = path.split('/')[0];
        }
        ViewRegistryService.registeredRoutes.push(path);
      }

      if (weight || label || accessPermissions) {
        route.data = { ...route.data, [SUB_ROUTE_DATA]: { weight, label, accessPermissions } };
      }

      if (accessPermissions) {
        route.canActivate = route.canActivate ?? [];
        route.canActivate.push(checkPermissionsGuard);
      }
      root.children.push(route);
      return;
    }

    const parentChildren = this.getRouteParentChildren(parentPath);

    let redirectRoute = parentChildren!.find((route) => route.path === '')!;
    if (!redirectRoute) {
      redirectRoute = { path: '', redirectTo: route.path };
      parentChildren.push(redirectRoute);
    }

    if (weight || label || accessPermissions) {
      route.data = { ...route.data, [SUB_ROUTE_DATA]: { weight, label, accessPermissions } };
    }

    if (accessPermissions) {
      route.canActivate = route.canActivate ?? [];
      route.canActivate.push(checkPermissionsGuard);
    }

    parentChildren!.push(route);
    const otherRoutes = parentChildren!.filter((route) => route.path !== '').sort(routesPrioritySortPredicate);

    redirectRoute.redirectTo = otherRoutes[0].path;
  }

  /**
   * @deprecated
   * **/
  registerViewWithConfig(
    viewId: string,
    template: string,
    config: { isPublicView?: boolean; isStaticView?: boolean },
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
    isEnabledFct: () => boolean,
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
