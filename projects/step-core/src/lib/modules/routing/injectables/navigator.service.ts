import { DestroyRef, inject, Injectable, DOCUMENT } from '@angular/core';
import { DEFAULT_PAGE } from './default-page.token';
import { Location } from '@angular/common';
import { VIEW_ID_LINK_PREFIX } from './view-id-link-prefix.token';
import {
  ActivatedRoute,
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationSkipped,
  Params,
  QueryParamsHandling,
  Router,
} from '@angular/router';
import { asapScheduler, filter, first, map, Observable, observeOn, shareReplay, startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NAVIGATOR_QUERY_PARAMS_CLEANUP } from './navigator-query-params-cleanup.token';
import { QUERY_PARAMS_CLEANUP_NAVIGATION } from './navigator-query-params-cleanup.service';
import { MenuEntry } from '../types/menu-entry';
import { MultipleProjectsService } from '../../basics/step-basics.module';

export type DisplayMenuEntry = Pick<MenuEntry, 'id' | 'title' | 'icon' | 'isCustom' | 'isActiveFunction'> & {
  isEnabled: boolean;
  isBookmark?: boolean;
  hasChildren?: boolean;
  children?: DisplayMenuEntry[];
};

@Injectable({
  providedIn: 'root',
})
export class NavigatorService {
  private _destroyRef = inject(DestroyRef);
  private _router = inject(Router);
  private _location = inject(Location);
  private _activatedRoute = inject(ActivatedRoute);
  private _defaultPage = inject(DEFAULT_PAGE);
  private _window = inject(DOCUMENT).defaultView!;
  private _viewIdLinkPrefix = inject(VIEW_ID_LINK_PREFIX);
  private _queryParamsCleanups = inject(NAVIGATOR_QUERY_PARAMS_CLEANUP);
  private _multipleProjects = inject(MultipleProjectsService);

  private forcedActivatedViewId?: string;

  readonly activeUrl$ = this._router.events.pipe(
    filter((event) => event instanceof NavigationEnd),
    map(() => this._router.url),
    shareReplay(1),
  );

  private navigationFinished$ = this._router.events.pipe(
    filter(
      (event) =>
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError ||
        event instanceof NavigationSkipped,
    ),
    observeOn(asapScheduler),
  );

  isViewIdActive(view: MenuEntry | DisplayMenuEntry): Observable<boolean> {
    const viewLink = `/${view.id}`;

    return this.activeUrl$.pipe(
      startWith(this._router.url),
      map((url) =>
        view.isActiveFunction
          ? view.isActiveFunction(url)
          : this.forcedActivatedViewId === view.id || url.startsWith(viewLink),
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

  navigateLogin(queryParams: Params = {}): void {
    this._router.navigate(['/', 'login'], { queryParams, skipLocationChange: true, queryParamsHandling: 'merge' });
  }

  navigateAfterLogin(): void {
    const emptyUrls = ['', '/', '/login'];
    const baseUrl = this._location.path().split('?')[0];
    if (emptyUrls.includes(baseUrl)) {
      this.navigateToHome();
      return;
    }
    this._router.navigateByUrl(this._location.path(), { skipLocationChange: true });
  }

  forceActivateView(viewId: string): string {
    this.forcedActivatedViewId = viewId;
    return viewId;
  }

  cleanupActivateView(): boolean {
    this.forcedActivatedViewId = undefined;
    return true;
  }

  reloadCurrentRoute(): void {
    if (this._router.getCurrentNavigation()) {
      this.navigationFinished$
        .pipe(first(), takeUntilDestroyed(this._destroyRef))
        .subscribe(() => this.reloadCurrentRoute());
      return;
    }

    const url = this._location.path(true);
    this._router.navigateByUrl('/in-progress', { state: { goTo: url }, skipLocationChange: true });
  }

  private navigateInternal(link: string, isOpenInSeparateTab?: boolean): void {
    if (isOpenInSeparateTab) {
      this.navigateToSeparateTab(link);
    } else {
      this.navigateInCurrentView(link);
    }
  }

  private navigateToSeparateTab(link: string): void {
    let appliedLink = link;
    const currentProject = this._multipleProjects.currentProject();
    if (currentProject !== undefined) {
      const urlTree = this._router.parseUrl(appliedLink);
      appliedLink = this._multipleProjects.getUrlForProject(currentProject, {
        url: appliedLink,
        search: urlTree.queryParams,
      });
    }

    const pathIndex = this._window.location.href.indexOf(this._router.url);
    const host = this._window.location.href.slice(0, pathIndex);

    const url = `${host}${appliedLink}`;
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
      this._router.navigate(segments, {
        queryParams,
        queryParamsHandling,
        info: queryParams ? QUERY_PARAMS_CLEANUP_NAVIGATION : undefined,
      });
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
