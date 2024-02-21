import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { StorageProxy } from '../modules/basics/shared/storage-proxy';
import { LOCAL_STORAGE } from '../modules/basics/shared/storage.token';
import { Bookmark } from '../shared/Bookmark';
import { StepDataSource } from '../client/table/shared/step-data-source';

const bookmark = 'BOOKMARKS';

@Injectable({
  providedIn: 'root',
})
export class BookmarkService extends StorageProxy {
  private bookmarks$ = new BehaviorSubject<Bookmark[] | undefined>(undefined);

  constructor(@Inject(LOCAL_STORAGE) storage: Storage) {
    super(storage, bookmark);
  }

  createDataSource(): StepDataSource<Bookmark> | undefined {
    let item = JSON.parse(this.getItem(bookmark)!);
    return item;
  }

  getStorageBookmarks(): Bookmark[] {
    return JSON.parse(this.getItem(bookmark) || '[]');
  }

  getBookmarks(): Bookmark[] | undefined {
    return this.bookmarks$.value;
  }

  createBookmark(value: any): Observable<null | undefined> | any {
    const bookmarks = JSON.parse(this.getItem(bookmark) || '[]');
    bookmarks.push(value);
    this.setItem(bookmark, JSON.stringify(bookmarks));
    this.bookmarks$.next(bookmarks);
  }

  deleteBookmark(label?: string): Observable<string | undefined> {
    const bookmarks = JSON.parse(this.getItem(bookmark) || '[]');
    const filteredBookmarks = bookmarks.filter((element: Bookmark) => element.label !== label);
    this.setItem(bookmark, JSON.stringify(filteredBookmarks));
    this.bookmarks$.next(filteredBookmarks);
    return of('');
  }

  renameBookmark(oldLabel: string, newLabel: string): Observable<string | undefined> {
    const bookmarks = JSON.parse(this.getItem(bookmark) || '[]');
    const updatedBookmarks = bookmarks.map((element: Bookmark) =>
      element.label !== oldLabel ? element : { ...element, label: newLabel },
    );
    this.setItem(bookmark, JSON.stringify(updatedBookmarks));
    this.bookmarks$.next(updatedBookmarks);
    return of('');
  }
}
