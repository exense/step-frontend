import { Injectable } from '@angular/core';
import { ViewRegistryService } from './view-registry.service';
import { downgradeInjectable, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE, Mutable } from '../shared';

type PropsAccessor = Mutable<Pick<ViewStateService, 'viewTemplate' | 'isPublicView' | 'isStaticView'>>;

@Injectable({
  providedIn: 'root',
})
export class ViewStateService {
  private _view?: string;

  readonly viewTemplate?: string;
  readonly isPublicView: boolean = false;
  readonly isStaticView: boolean = false;

  constructor(private _viewRegistry: ViewRegistryService) {}

  setView(view: string): void {
    if (view === this._view) {
      return;
    }

    this._view = view;

    const propsAccessor = this as PropsAccessor;
    propsAccessor.viewTemplate = this._view ? this._viewRegistry.getViewTemplate(this._view) : undefined;
    propsAccessor.isPublicView = this._view ? this._viewRegistry.isPublicView(this._view) : false;
    propsAccessor.isStaticView = this._view ? this._viewRegistry.isStaticView(this._view) : false;
  }

  isViewActive(view: string): boolean {
    return this._view === view;
  }

  getViewName(): string | undefined {
    return this._view;
  }
}

getAngularJSGlobal().module(AJS_MODULE).service('ViewState', downgradeInjectable(ViewStateService));
