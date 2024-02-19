import { Component, inject } from '@angular/core';
import { COMMON_IMPORTS } from '../../../timeseries/modules/_common';
import { AugmentedBookmarksService, Bookmark, BookmarkDialogsService } from '@exense/step-core';

@Component({
  selector: 'step-manage-bookmarks-list-page',
  templateUrl: './manage-bookmarks-list.component.html',
  styleUrls: ['./manage-bookmarks-list.component.scss'],
  standalone: true,
  imports: [COMMON_IMPORTS],
})
export class ManageBookmarksListComponent {
  private _bookmarkDialogs = inject(BookmarkDialogsService);

  readonly dataSource = inject(AugmentedBookmarksService).createDataSource();

  renameBookmark(): void {}

  deleteBookmark(bookmark: Bookmark): void {
    console.log('deleteBookmark');
    this._bookmarkDialogs.deleteBookmark(bookmark);
  }
}
