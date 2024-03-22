import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { AugmentedBookmarksService } from '../../../client/augmented/services/augmented-bookmarks.service';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class BookmarkService {
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
  );

  refreshBookmarks(): void {
    this.refreshBookmarks$.next(undefined);
  }
}
