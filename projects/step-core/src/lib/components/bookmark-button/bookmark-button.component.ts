import { Component, inject } from '@angular/core';
import { BookmarkService } from '../../services/bookmark.service';

@Component({
  selector: 'step-bookmark-button',
  template: `<step-icon name="star" (click)="addBookmark()"></step-icon>`,
  styleUrls: [],
})
export class BookmarkButtonComponent {
  private _bookmarkService = inject(BookmarkService);

  protected addBookmark(): void {
    this._bookmarkService.createBookmark();
  }
}
