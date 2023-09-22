import { inject, Injectable } from '@angular/core';
import { DEFAULT_PAGE } from './default-page.token';
import { AJS_MODULE } from '../../../shared/constants';
import { AJS_LOCATION } from '../../../shared/angularjs-providers';
import { DOCUMENT } from '@angular/common';
import { downgradeInjectable, getAngularJSGlobal } from '@angular/upgrade/static';
import { VIEW_ID_LINK_PREFIX } from './view-id-link-prefix.token';

@Injectable({
  providedIn: 'root',
})
export class NavigatorService {
  private _$location = inject(AJS_LOCATION);
  private _defaultPage = inject(DEFAULT_PAGE);
  private _window = inject(DOCUMENT).defaultView!;
  private _viewIdLinkPrefix = inject(VIEW_ID_LINK_PREFIX);

  navigate(viewId: string, isOpenInSeparateTab: boolean = false): void {
    if (viewId.startsWith(this._viewIdLinkPrefix)) {
      const link = viewId.split(this._viewIdLinkPrefix)[1];
      this._window.open(link, '_blank');
      return;
    }
    const link = `/root/${viewId}`;
    this.navigateInternal(link, isOpenInSeparateTab);
  }

  navigateToHome({
    isOpenInSeparateTab,
    forceClientUrl,
  }: { isOpenInSeparateTab?: boolean; forceClientUrl?: boolean } = {}): void {
    this.navigateInternal(this._defaultPage(forceClientUrl), isOpenInSeparateTab);
  }

  private navigateInternal(link: string, isOpenInSeparateTab?: boolean): void {
    if (isOpenInSeparateTab) {
      this.navigateToSeparateTab(link);
    } else {
      this.navigateInCurrentView(link);
    }
  }

  private navigateToSeparateTab(link: string): void {
    const pathIndex = this._$location.absUrl().indexOf(this._$location.path());
    let url = this._$location.absUrl().slice(0, pathIndex);
    url = `${url}${link}`;
    this._window.open(url, '_blank');
  }

  private navigateInCurrentView(link: string): void {
    if (this._$location.path().includes(link)) {
      this._$location.path('/');
      setTimeout(() => this._$location.path(link).replace());
    } else {
      this._$location.path(link);
    }
    this.cleanupQueryParams();
  }

  private cleanupQueryParams(): void {
    const queryParams = this._$location.search();
    if (queryParams['tsParams']) {
      const clear = queryParams['tsParams'].split(',');
      clear.forEach((value: string) => {
        delete queryParams[value];
      });
      delete queryParams.tsParams;
      this._$location.search(queryParams);
    }
  }
}

getAngularJSGlobal().module(AJS_MODULE).service('navigatorService', downgradeInjectable(NavigatorService));
