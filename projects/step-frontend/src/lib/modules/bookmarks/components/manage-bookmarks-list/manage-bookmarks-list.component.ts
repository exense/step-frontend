import { Component, inject, OnInit } from '@angular/core';
import { COMMON_IMPORTS } from '../../../timeseries/modules/_common';
import {
  AugmentedBookmarksService,
  Bookmark,
  BookmarkCreateDialogComponent,
  BookmarkService,
  DialogsService,
  User,
  UserService,
} from '@exense/step-core';
import { of, switchMap, take } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'step-manage-bookmarks-list-page',
  templateUrl: './manage-bookmarks-list.component.html',
  styleUrls: ['./manage-bookmarks-list.component.scss'],
  imports: [COMMON_IMPORTS],
})
export class ManageBookmarksListComponent implements OnInit {
  private _dialogs = inject(DialogsService);
  private _matDialog = inject(MatDialog);
  private _bookmarksService = inject(BookmarkService);
  private _api = inject(AugmentedBookmarksService);
  private _userApi = inject(UserService);
  private user: Partial<User> = {};
  readonly _bookmarksApiService = inject(AugmentedBookmarksService);

  readonly dataSource = this._bookmarksApiService.createDataSource();

  ngOnInit(): void {
    this._userApi.getMyUser().subscribe((user) => {
      this.user = user || {};
    });
  }

  setPosition(e: any, bookmark: Bookmark): void {
    const value = e.target.value;
    if (!isNaN(Number(value)) && +value[0]) {
      const bookmarkWithPosition = {
        ...bookmark,
        userId: this.user?.id || '',
        url: bookmark.customFields!.link || '',
        customFields: { ...bookmark.customFields, position: e.target.value },
      };
      this._api.saveUserBookmark(bookmarkWithPosition).subscribe((data) => {
        this._bookmarksService.refreshBookmarks();
        this.dataSource.reload();
      });
    } else {
      return;
    }
  }

  numberOnly(event: any): boolean {
    if ((event.target.value === '0' || !event.target.value) && event.which === 48) {
      return false;
    }
    return true;
  }

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
