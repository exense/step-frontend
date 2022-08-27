import { ITemplateCacheService } from 'angular';
import { Inject, Injectable } from '@angular/core';
import { AJS_TEMPLATES_CACHE } from '../shared/angularjs-providers';
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
  constructor(@Inject(AJS_TEMPLATES_CACHE) private _templatesCache: ITemplateCacheService) {}

  customViews: { [key: string]: CustomView } = {};
  customMenuEntries: MenuEntry[] = [];
  customDashlets: { [key: string]: Dashlet[] } = {};

  getCustomView(view: string): CustomView {
    const customView = this.customViews[view];
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
    this.customViews[viewId] = { template: template, isPublicView: isPublicView, isStaticView: isStaticView };
  }

  registerCustomMenuEntry(label: string, viewId: string, icon: string, parentMenu?: string, right?: string): void {
    this.customMenuEntries.push({
      label,
      viewId,
      parentMenu,
      icon,
      right,
      isEnabledFct: () => true,
    });
  }

  registerCustomMenuEntryOptional(
    label: string,
    viewId: string,
    icon: string,
    isEnabledFct: () => boolean,
    parentMenu?: string,
    right?: string
  ): void {
    this.customMenuEntries.push({ label, viewId, parentMenu, icon, right, isEnabledFct });
  }

  getMenuRootEntries() {
    return this.customMenuEntries.filter((entry) => entry && !entry.parentMenu && entry.isEnabledFct());
  }

  getMenuEntries(parentMenu: string) {
    const filteredEntries = this.customMenuEntries.filter(
      (entry) => entry?.parentMenu === parentMenu && entry.isEnabledFct()
    );
    return filteredEntries.sort((a, b) => a.label.localeCompare(b.label));
  }

  getCustomMainMenuEntries() {
    let filteredEntries = this.customMenuEntries.filter((entry) => entry?.parentMenu && entry.isEnabledFct());
    return filteredEntries.sort((a, b) => a.label.localeCompare(b.label));
  }

  // returns the name of the main menu that contains the submenu or undefined
  // FIXME: use MenuEntry.parentMenu instead of string reference as input
  getMainMenuNameOfSubmenu(subMenuName: string) {
    let subMenu = this.customMenuEntries.filter(
      (entry) => entry?.parentMenu && entry.isEnabledFct() && entry.viewId === subMenuName
    );
    if (subMenu.length === 1) {
      return subMenu[0].parentMenu;
    } else {
      return undefined;
    }
  }

  getDashlets(path: string) {
    let dashlets = this.customDashlets[path];
    if (!dashlets) {
      dashlets = [];
      this.customDashlets[path] = dashlets;
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
