import { StorageProxy, LOCAL_STORAGE } from '../../basics/step-basics.module';
import { Inject, Injectable } from '@angular/core';
import { Bookmark } from '../types/bookmark';

const bookmark = 'BOOKMARKS';

@Injectable({
  providedIn: 'root',
})
export class BookmarkStorageService extends StorageProxy {
  constructor(@Inject(LOCAL_STORAGE) storage: Storage) {
    super(storage, bookmark);
  }

  getStorageBookmarks(): Bookmark[] {
    return JSON.parse(this.getItem(bookmark) || '[]');
  }
}
