import { Component } from '@angular/core';
import { Bookmark } from '../../client/generated/models/Bookmark';

@Component({
  selector: 'step-bookmark-create-dialog',
  templateUrl: './bookmark-create-dialog.component.html',
  styleUrls: ['./bookmark-create-dialog.component.scss'],
})
export class BookmarkCreateDialogComponent {
  protected bookmark: Partial<Bookmark> = {};

  save(): void {}
}
