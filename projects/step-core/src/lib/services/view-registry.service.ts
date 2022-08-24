import { ITemplateCacheService } from 'angular';
import { Inject, Injectable } from '@angular/core';
import { v4 } from 'uuid';
import { AJS_TEMPLATES_CACHE } from '../shared/angularjs-providers';
import { CustomView, Dashlet, LegacyViewRegistryService, MenuEntry } from '../shared/legacy-view-registry.service';

@Injectable({
  providedIn: 'root',
})
export class ViewRegistryService implements LegacyViewRegistryService {
  constructor(
    private _legacyViewRegistry: LegacyViewRegistryService,
    @Inject(AJS_TEMPLATES_CACHE) private _templatesCache: ITemplateCacheService
  ) {}

  private registerTemplate(templateContent: string): string {
    const virtualPath = `upgraded/${v4()}.html`;
    this._templatesCache.put(virtualPath, templateContent);
    return virtualPath;
  }

  getCustomMainMenuEntries(): MenuEntry[] {
    return this._legacyViewRegistry.getCustomMainMenuEntries();
  }

  getCustomMenuEntries(): MenuEntry[] {
    return this._legacyViewRegistry.getCustomMenuEntries();
  }

  getCustomMenuEntriesIncludedInMainMenu(mainMenuName: string): MenuEntry[] {
    return this._legacyViewRegistry.getCustomMenuEntriesIncludedInMainMenu(mainMenuName);
  }

  getMainMenuNameOfSubmenu(subMenuName: string): string {
    return this._legacyViewRegistry.getMainMenuNameOfSubmenu(subMenuName);
  }

  getDashlets(path: string): Dashlet[] {
    return this._legacyViewRegistry.getDashlets(path);
  }

  getViewTemplate(view: string): string {
    return this._legacyViewRegistry.getViewTemplate(view);
  }

  isPublicView(view: string): boolean {
    return this._legacyViewRegistry.isPublicView(view);
  }

  registerCustomMenuEntry(
    label: string,
    viewId?: string,
    mainMenu?: boolean,
    menuIconsClass?: string,
    right?: string,
    includedInMainMenu?: string
  ): void {
    this._legacyViewRegistry.registerCustomMenuEntry(
      label,
      viewId,
      mainMenu,
      menuIconsClass,
      right,
      includedInMainMenu
    );
  }

  registerCustomMenuEntryOptional(
    label: string,
    viewId: string,
    menuIconsClass: string,
    right: string,
    isEnabledFct: () => boolean
  ): void {
    this._legacyViewRegistry.registerCustomMenuEntryOptional(label, viewId, menuIconsClass, right, isEnabledFct);
  }

  registerDashletAdvanced(
    path: string,
    label: string,
    template: string,
    id: string,
    position: number,
    isEnabledFct: () => boolean
  ): void {
    const virtualTemplateFilePath = this.registerTemplate(template);
    this._legacyViewRegistry.registerDashletAdvanced(path, label, virtualTemplateFilePath, id, position, isEnabledFct);
  }

  registerDashlet(path: string, label: string, template: string, id: string, before?: boolean): void {
    const virtualTemplateFilePath = this.registerTemplate(template);
    this._legacyViewRegistry.registerDashlet(path, label, virtualTemplateFilePath, id, before);
  }

  registerView(viewId: string, template: string, isPublicView?: boolean): void {
    const virtualTemplateFilePath = this.registerTemplate(template);
    this._legacyViewRegistry.registerView(viewId, virtualTemplateFilePath, isPublicView);
  }

  getCustomView(view: string): CustomView {
    return this._legacyViewRegistry.getCustomView(view);
  }

  isStaticView(view: string): boolean {
    return this._legacyViewRegistry.isStaticView(view);
  }

  registerViewWithConfig(
    viewId: string,
    template: string,
    config: { isPublicView: boolean; isStaticView: boolean }
  ): void {
    this._legacyViewRegistry.registerViewWithConfig(viewId, template, config);
  }
}
