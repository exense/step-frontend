import { Component, inject } from '@angular/core';
import { COMMON_IMPORTS } from '../../../timeseries/modules/_common';
import {
  AugmentedBookmarksService,
  Bookmark,
  BookmarkCreateDialogComponent,
  BookmarkService,
  DialogsService,
  StepDataSource,
  ViewRegistryService,
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
  private _bookmarkService = inject(BookmarkService);
  private _matDialog = inject(MatDialog);

  dataSource: Bookmark[] | undefined | StepDataSource<Bookmark> = inject(AugmentedBookmarksService).createDataSource();

  renameBookmark(bookmark: Bookmark): void {
    this._matDialog
      .open(BookmarkCreateDialogComponent, { data: bookmark.label })
      .afterClosed()
      .pipe(take(1))
      .subscribe(() => (this.dataSource = this._bookmarkService.getBookmarks()));
  }

  deleteBookmark(bookmark: Bookmark): any {
    this._dialogs
      .showDeleteWarning(1, `Bookmark "${bookmark.label}"`)
      .pipe(
        switchMap((isDeleteConfirmed) => {
          if (isDeleteConfirmed) {
            return this._bookmarkService.deleteBookmark(bookmark!.label);
          } else {
            return of('');
          }
        }),
        take(1),
      )
      .subscribe(() => (this.dataSource = this._bookmarkService.getBookmarks()));
  }
}
