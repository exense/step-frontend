import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageProxy } from '../modules/basics/shared/storage-proxy';
import { LOCAL_STORAGE } from '../modules/basics/shared/storage.token';

@Injectable({
  providedIn: 'root',
})
export class BookmarkService extends StorageProxy {
  constructor(@Inject(LOCAL_STORAGE) storage: Storage) {
    super(storage, 'BOOKMARKS');
  }

  createBookmark(value: any): Observable<null | undefined> | any {
    const bookmarks = JSON.parse(this.getItem('BOOKMARKS') || '[]');
    bookmarks.push(value);
    this.setItem('BOOKMARKS', JSON.stringify(bookmarks));
  }
}
