import { Injectable } from '@angular/core';
import { INJECTOR } from './angularjs-provider-options';

export interface CustomView {
  template: string;
  isPublicView: boolean;
}

export interface MenuEntry {
  label: string;
  viewId: string;
  mainMenu: boolean;
  menuIconClass: string;
  right: string;
  inEnabledFct(): boolean;
}

export interface Dashlet {
  label: string;
  template: string;
  id: string;
  isEnabledFct?(): boolean;
}

@Injectable({
  providedIn: 'root',
  useFactory: ($injector: any) => $injector.get('ViewRegistry'),
  deps: [INJECTOR],
})
export abstract class LegacyViewRegistryService {
  abstract getViewTemplate(view: string): string;
  abstract isPublicView(view: string): boolean;
  abstract registerView(viewId: string, template: string, isPublicView?: boolean): void;
  abstract registerCustomMenuEntry(label: string, viewId: string, menuIconsClass: string, right: string): void;
  abstract registerCustomMenuEntryOptional(
    label: string,
    viewId: string,
    menuIconsClass: string,
    right: string,
    isEnabledFct: () => boolean
  ): void;
  abstract getCustomMenuEntries(): MenuEntry[];
  abstract getCustomMainMenuEntries(): MenuEntry[];
  abstract getDashlets(path: string): Dashlet[];
  abstract registerDashlet(path: string, label: string, template: string, id: string, before?: boolean): void;
  abstract registerDashletAdvanced(
    path: string,
    label: string,
    template: string,
    id: string,
    position: number,
    isEnabledFct: () => boolean
  ): void;
}
