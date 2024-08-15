import { inject, Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, map, shareReplay } from 'rxjs';
import { AugmentedBookmarksService } from '../../../client/step-client-module';
import { switchMap } from 'rxjs/operators';
import { MenuEntry } from '../../routing';

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

  readonly bookmarkMenuItems$ = this.bookmarks$.pipe(
    map(
      (bookmarks) =>
        (bookmarks ?? [])
          .map((item) => ({
            title: item.customFields!['label'],
            id: `${item.customFields!['link']}`,
            icon: item.customFields!['icon'],
            position: item.customFields!['position'] || 100,
            parentId: 'bookmarks-root',
            weight: 1000 + bookmarks!.length,
            isBookmark: true,
            isEnabledFct(): boolean {
              return true;
            },
          }))
          .sort((a, b) => a.position - b.position) as MenuEntry[],
    ),
  );

  refreshBookmarks(): void {
    this.refreshBookmarks$.next(undefined);
  }

  ngOnDestroy(): void {
    this.refreshBookmarks$.complete();
  }
}
