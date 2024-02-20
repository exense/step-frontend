import { Injectable } from '@angular/core';
import { StepDataSource } from '../../table/step-table-client.module';
import { BookmarkService } from '../../../services/bookmark.service';
import { Bookmark } from '../../generated/models/Bookmark';

@Injectable({ providedIn: 'root' })
export class AugmentedBookmarksService extends BookmarkService {
  createDataSource(): StepDataSource<Bookmark> | undefined {
    let item = JSON.parse(this.getItem('BOOKMARKS')!);
    return item;
  }
}
