import { inject, Injectable } from '@angular/core';
import { DEFAULT_PAGE } from './default-page.token';
import { DOCUMENT, Location } from '@angular/common';
import { VIEW_ID_LINK_PREFIX } from './view-id-link-prefix.token';
import { ActivatedRoute, NavigationEnd, Params, QueryParamsHandling, Router } from '@angular/router';
import { filter, from, map, Observable, shareReplay, startWith, switchMap, tap, timer } from 'rxjs';
import { NAVIGATOR_QUERY_PARAMS_CLEANUP } from './navigator-query-params-cleanup.token';
import { MenuEntry } from '../types/menu-entry';

export type DisplayMenuEntry = Pick<MenuEntry, 'id' | 'title' | 'icon' | 'isCustom' | 'isActiveFct'> & {
  isBookmark?: boolean;
  hasChildren?: boolean;
  children?: DisplayMenuEntry[];
};

@Injectable({
  providedIn: 'root',
})
export class NavigatorService {
  private _router = inject(Router);
  private _location = inject(Location);
  private _activatedRoute = inject(ActivatedRoute);
  private _defaultPage = inject(DEFAULT_PAGE);
  private _window = inject(DOCUMENT).defaultView!;
  private _viewIdLinkPrefix = inject(VIEW_ID_LINK_PREFIX);
  private _queryParamsCleanups = inject(NAVIGATOR_QUERY_PARAMS_CLEANUP);

  private forcedActivatedViewId?: string;

  readonly activeUrl$ = this._router.events.pipe(
    filter((event) => event instanceof NavigationEnd),
    map(() => this._router.url),
    shareReplay(1),
  );

  isViewIdActive(view: MenuEntry | DisplayMenuEntry): Observable<boolean> {
    const viewLink = `/${view.id}`;

    return this.activeUrl$.pipe(
      startWith(this._router.url),
      map((url) =>
        view.isActiveFct ? view.isActiveFct(url) : this.forcedActivatedViewId === view.id || url.startsWith(viewLink),
      ),
    );
  }

  navigate(viewId: string, isOpenInSeparateTab: boolean = false): void {
    if (viewId.startsWith(this._viewIdLinkPrefix)) {
      const link = viewId.split(this._viewIdLinkPrefix)[1];
      this._window.open(link, '_blank');
      return;
    }
    const link = `/${viewId}`;
    this.navigateInternal(link, isOpenInSeparateTab);
  }

  navigateToHome({
    isOpenInSeparateTab,
    forceClientUrl,
  }: { isOpenInSeparateTab?: boolean; forceClientUrl?: boolean } = {}): void {
    this.navigateInternal(this._defaultPage(forceClientUrl), isOpenInSeparateTab);
  }

  navigateToRoot(): void {
    this._router.navigate(['/']);
  }

  navigateLogin(skipLocationChange: boolean = true): void {
    this._router.navigate(['/', 'login'], { skipLocationChange });
  }

  navigateAfterLogin(): void {
    const emptyUrls = ['', '/', '/login'];
    const url = this._location.path();
    if (emptyUrls.includes(url)) {
      this.navigateToHome();
      return;
    }
    this._router.navigateByUrl(url, { skipLocationChange: true });
  }

  forceActivateView(viewId: string): string {
    this.forcedActivatedViewId = viewId;
    return viewId;
  }

  cleanupActivateView(): boolean {
    this.forcedActivatedViewId = undefined;
    return true;
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
    const hasInlineQueryParameters = link.includes('?');
    if (hasInlineQueryParameters) {
      this._router.navigateByUrl(link);
    } else {
      const segments = link.split('/');
      const queryParams = this.prepareQueryParams();
      const queryParamsHandling: QueryParamsHandling = !queryParams ? 'preserve' : '';
      this._router.navigate(segments, { queryParams, queryParamsHandling });
    }
  }

  private prepareQueryParams(): Params | null {
    const queryParams = { ...this._activatedRoute.snapshot.queryParams };
    const cleanupsToPerform = this._queryParamsCleanups.filter((clenaup) => clenaup.isCleanUpRequired(queryParams));
    if (!cleanupsToPerform.length) {
      return null;
    }
    cleanupsToPerform.forEach((cleanup) => cleanup.cleanup(queryParams));
    return queryParams;
  }
}
