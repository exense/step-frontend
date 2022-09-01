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
  registeredViews: { [key: string]: CustomView } = {};
  registeredMenuEntries: MenuEntry[] = [];
  registeredDashlets: { [key: string]: Dashlet[] } = {};

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

  registerMenuEntryOptional(
    isEnabledFct: () => boolean,
    label: string,
    viewId: string,
    icon: string,
    weight?: number,
    parentMenu?: string,
    right?: string
  ): void {
    this.registeredMenuEntries.push({ label, viewId, parentMenu, icon, weight, right, isEnabledFct });
  }

  getMainMenuKey(subMenuKey: string): string | undefined {
    return this.registeredMenuEntries.find((entry: MenuEntry) => entry.viewId === subMenuKey)?.parentMenu;
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
