import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { StorageProxy } from '../modules/basics/shared/storage-proxy';
import { LOCAL_STORAGE } from '../modules/basics/shared/storage.token';
import { Bookmark } from '../client/generated/models/Bookmark';

@Injectable({
  providedIn: 'root',
})
export class BookmarkService extends StorageProxy {
  private bookmarks$ = new BehaviorSubject<Bookmark[] | undefined>(undefined);

  constructor(@Inject(LOCAL_STORAGE) storage: Storage) {
    super(storage, 'BOOKMARKS');
  }

  getBookmarks(): Bookmark[] | undefined {
    return this.bookmarks$.value;
  }

  createBookmark(value: any): Observable<null | undefined> | any {
    const bookmarks = JSON.parse(this.getItem('BOOKMARKS') || '[]');
    bookmarks.push(value);
    this.setItem('BOOKMARKS', JSON.stringify(bookmarks));
    this.bookmarks$.next(bookmarks);
  }

  deleteBookmark(label?: string): Observable<string | undefined> {
    const bookmarks = JSON.parse(this.getItem('BOOKMARKS') || '[]');
    const filteredBookmarks = bookmarks.filter((element: Bookmark) => element.label !== label);
    this.setItem('BOOKMARKS', JSON.stringify(filteredBookmarks));
    this.bookmarks$.next(filteredBookmarks);
    return of('');
  }

  renameBookmark(oldLabel: string, newLabel: string): Observable<string | undefined> {
    const bookmarks = JSON.parse(this.getItem('BOOKMARKS') || '[]');
    const updatedBookmarks = bookmarks.map((element: Bookmark) =>
      element.label !== oldLabel ? element : { ...element, label: newLabel },
    );
    this.setItem('BOOKMARKS', JSON.stringify(updatedBookmarks));
    this.bookmarks$.next(updatedBookmarks);
    return of('');
  }
}
