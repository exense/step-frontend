import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AugmentedBookmarksService } from '../../../client/augmented/services/augmented-bookmarks.service';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class BookmarkService {
  private _bookmarksApi = inject(AugmentedBookmarksService);

  public refreshBookmarks$ = new BehaviorSubject<unknown>(undefined);

  readonly bookmarks$ = this.refreshBookmarks$.pipe(
    switchMap(() => this._bookmarksApi.findUserBookmarksByAttributes()),
  );
}
