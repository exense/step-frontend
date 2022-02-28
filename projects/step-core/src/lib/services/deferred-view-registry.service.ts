import { Injectable, Injector } from '@angular/core';
import { LegacyViewRegistryService } from '../shared';
import { InvokeRunRegister } from './invoke-run.service';
import { ViewRegistryService } from './view-registry.service';

type RegisterMethods =
  | 'registerCustomMenuEntry'
  | 'registerView'
  | 'registerCustomMenuEntryOptional'
  | 'registerDashlet'
  | 'registerDashletAdvanced';

@Injectable({
  providedIn: 'root',
})
export class DeferredViewRegistryService implements Pick<LegacyViewRegistryService, RegisterMethods> {
  constructor(private _injector: Injector, private _invokeRunRegister: InvokeRunRegister) {}

  private get _viewRegistry(): LegacyViewRegistryService {
    return this._injector.get(ViewRegistryService);
  }

  registerCustomMenuEntry(label: string, viewId: string, menuIconsClass: string, right: string): void {
    this._invokeRunRegister.registerRun(() => {
      this._viewRegistry.registerCustomMenuEntry(label, viewId, menuIconsClass, right);
    });
  }

  registerCustomMenuEntryOptional(
    label: string,
    viewId: string,
    menuIconsClass: string,
    right: string,
    isEnabledFct: () => boolean
  ): void {
    this._invokeRunRegister.registerRun(() => {
      this._viewRegistry.registerCustomMenuEntryOptional(label, viewId, menuIconsClass, right, isEnabledFct);
    });
  }

  registerDashlet(path: string, label: string, template: string, id: string, before?: boolean): void {
    this._invokeRunRegister.registerRun(() => {
      this._viewRegistry.registerDashlet(path, label, template, id, before);
    });
  }

  registerDashletAdvanced(
    path: string,
    label: string,
    template: string,
    id: string,
    position: number,
    isEnabledFct: () => boolean
  ): void {
    this._invokeRunRegister.registerRun(() => {
      this._viewRegistry.registerDashletAdvanced(path, label, template, id, position, isEnabledFct);
    });
  }

  registerView(viewId: string, template: string, isPublicView?: boolean): void {
    this._invokeRunRegister.registerRun(() => {
      this._viewRegistry.registerView(viewId, template, isPublicView);
    });
  }
}
