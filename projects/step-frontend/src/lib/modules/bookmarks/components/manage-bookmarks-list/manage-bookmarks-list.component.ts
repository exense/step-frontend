import { Component, inject } from '@angular/core';
import { COMMON_IMPORTS } from '../../../timeseries/modules/_common';
import {
  AugmentedBookmarksService,
  Bookmark,
  BookmarkCreateDialogComponent,
  BookmarkService,
  DialogsService,
} from '@exense/step-core';
import { of, switchMap, take } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'step-manage-bookmarks-list-page',
  templateUrl: './manage-bookmarks-list.component.html',
  styleUrls: ['./manage-bookmarks-list.component.scss'],
  standalone: true,
  imports: [COMMON_IMPORTS],
})
export class ManageBookmarksListComponent {
  private _dialogs = inject(DialogsService);
  private _matDialog = inject(MatDialog);
  private _bookmarksService = inject(BookmarkService);
  readonly _bookmarksApiService = inject(AugmentedBookmarksService);

  readonly dataSource = this._bookmarksApiService.createDataSource();

  renameBookmark(bookmark: Bookmark): void {
    this._matDialog
      .open(BookmarkCreateDialogComponent, { data: bookmark })
      .afterClosed()
      .subscribe(() => {
        this._bookmarksService.refreshBookmarks();
        this.dataSource.reload();
      });
  }

  deleteBookmark(bookmark: Bookmark): any {
    this._dialogs
      .showDeleteWarning(1, `Bookmark "${bookmark.id}"`)
      .pipe(
        switchMap((isDeleteConfirmed) => {
          if (isDeleteConfirmed) {
            return this._bookmarksApiService.deleteUserBookmark(bookmark.id!);
          } else {
            return of('');
          }
        }),
        take(1),
      )
      .subscribe(() => {
        this._bookmarksService.refreshBookmarks();
        this.dataSource.reload();
      });
  }
}
