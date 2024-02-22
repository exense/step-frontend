import { StorageProxy } from '../modules/basics/shared/storage-proxy';
import { Inject, Injectable } from '@angular/core';
import { LOCAL_STORAGE } from '../modules/basics/shared/storage.token';
import { Bookmark } from '../shared/bookmark';

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
