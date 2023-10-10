import { inject, Injectable } from '@angular/core';
import { DEFAULT_PAGE } from './default-page.token';
import { AJS_MODULE } from '../../../shared/constants';
import { DOCUMENT } from '@angular/common';
import { downgradeInjectable, getAngularJSGlobal } from '@angular/upgrade/static';
import { VIEW_ID_LINK_PREFIX } from './view-id-link-prefix.token';
import { ActivatedRoute, Params, QueryParamsHandling, Router } from '@angular/router';
import { from, switchMap, timer } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NavigatorService {
  private _router = inject(Router);
  private _activatedRoute = inject(ActivatedRoute);
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
    const pathIndex = this._window.location.href.indexOf(this._router.url);
    let url = this._window.location.href.slice(0, pathIndex);
    url = `${url}${link}`;
    this._window.open(url, '_blank');
  }

  private navigateInCurrentView(link: string): void {
    const queryParams = this.prepareQueryParams();
    const queryParamsHandling: QueryParamsHandling = !queryParams ? 'preserve' : '';
    const segments = link.split('/');
    if (this._router.url.includes(link)) {
      from(this._router.navigateByUrl('/'))
        .pipe(switchMap(() => timer(100)))
        .subscribe(() => {
          this._router.navigate(segments, { replaceUrl: true, queryParams, queryParamsHandling });
        });
    } else {
      this._router.navigate(segments, { queryParams, queryParamsHandling });
    }
  }

  private prepareQueryParams(): Params | null {
    const queryParams = this._activatedRoute.snapshot.queryParams;
    if (!queryParams?.['tsParams']) {
      return null;
    }
    const clear = queryParams['tsParams'].split(',');
    clear.forEach((value: string) => delete queryParams[value]);
    delete queryParams['tsParams'];
    return queryParams;
  }
}

getAngularJSGlobal().module(AJS_MODULE).service('navigatorService', downgradeInjectable(NavigatorService));
