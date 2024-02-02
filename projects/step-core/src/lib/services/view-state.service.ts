import { inject, Injectable, OnDestroy } from '@angular/core';
import { ViewRegistryService } from './view-registry.service';
import { Mutable } from '../shared';
import { BehaviorSubject, map } from 'rxjs';

type PropsAccessor = Mutable<Pick<ViewStateService, 'viewTemplate' | 'isPublicView' | 'isStaticView'>>;

@Injectable({
  providedIn: 'root',
})
export class ViewStateService implements OnDestroy {
  private _viewRegistry = inject(ViewRegistryService);

  private viewInternal$ = new BehaviorSubject<string | undefined>(undefined);

  readonly view$ = this.viewInternal$.asObservable();

  readonly viewTemplate?: string;
  readonly isPublicView: boolean = false;
  readonly isStaticView: boolean = false;

  private customView$ = this.view$.pipe(
    map((view) =>
      !!view && !this._viewRegistry.isMigratedRoute(view) ? this._viewRegistry.getCustomView(view) : undefined
    )
  );

  readonly viewTemplate$ = this.customView$.pipe(map((view) => view?.template ?? undefined));

  readonly isPublicView$ = this.customView$.pipe(map((view) => view?.isPublicView ?? false));

  readonly isStaticView$ = this.customView$.pipe(map((view) => view?.isStaticView ?? false));

  setView(view: string): void {
    if (view === this.viewInternal$.value) {
      return;
    }

    this.viewInternal$.next(view);

    const customView =
      !!view && !this._viewRegistry.isMigratedRoute(view) ? this._viewRegistry.getCustomView(view) : undefined;

    const propsAccessor = this as PropsAccessor;
    propsAccessor.viewTemplate = customView?.template ?? undefined;
    propsAccessor.isPublicView = customView?.isPublicView ?? false;
    propsAccessor.isStaticView = customView?.isStaticView ?? false;
  }

  isViewActive(view: string): boolean {
    return this.viewInternal$.value === view;
  }

  getViewName(): string | undefined {
    return this.viewInternal$.value;
  }

  ngOnDestroy(): void {
    this.viewInternal$.complete();
  }
}
