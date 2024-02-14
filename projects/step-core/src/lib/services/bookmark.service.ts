import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { BookmarkCreateDialogComponent } from '../components/bookmark-create-dialog/bookmark-create-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class BookmarkService {
  private _matDialog = inject(MatDialog);

  createBookmark(): Observable<null | undefined> | any {
    return this._matDialog.open(BookmarkCreateDialogComponent).afterClosed();
  }
}
