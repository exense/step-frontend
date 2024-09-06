import { inject, Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, map, shareReplay } from 'rxjs';
import { AugmentedBookmarksService } from '../../../client/step-client-module';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class BookmarkService implements OnDestroy {
  private _bookmarksApi = inject(AugmentedBookmarksService);

  private refreshBookmarks$ = new BehaviorSubject<unknown>(undefined);

  readonly bookmarks$ = this.refreshBookmarks$.pipe(
    switchMap(() =>
      this._bookmarksApi.getUserBookmarkTable({
        skip: 0,
        limit: 0,
        sort: {
          field: 'label',
          direction: 'ASCENDING',
        },
      }),
    ),
    map((table) => table.data),
    shareReplay(1),
  );

  refreshBookmarks(): void {
    this.refreshBookmarks$.next(undefined);
  }

  ngOnDestroy(): void {
    this.refreshBookmarks$.complete();
  }
}
