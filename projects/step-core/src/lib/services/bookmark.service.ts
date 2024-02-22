import { inject, Inject, Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, of } from 'rxjs';
import { StorageProxy } from '../modules/basics/shared/storage-proxy';
import { LOCAL_STORAGE } from '../modules/basics/shared/storage.token';
import { Bookmark } from '../shared/bookmark';
import { BookmarkStorageService } from './bookmark-storage.service';

const bookmark = 'BOOKMARKS';

@Injectable({
  providedIn: 'root',
})
export class BookmarkService extends StorageProxy {
  private _bookmarkStorageService = inject(BookmarkStorageService);
  private bookmarksInternal$ = new BehaviorSubject<Bookmark[]>(this._bookmarkStorageService.getStorageBookmarks());
  readonly bookmarks$ = this.bookmarksInternal$.asObservable();
  readonly bookmarkMenuEntries$ = this.bookmarks$.pipe(
    map((bookmarks) =>
      bookmarks.map((element) => {
        const menuEntry = {
          title: element.label!,
          id: element.link!,
          icon: element.icon!,
          parentId: 'bookmarks-root',
          weight: 1000 + bookmarks.length,
          isEnabledFct(): boolean {
            return true;
          },
        };
        return menuEntry;
      }),
    ),
  );

  constructor(@Inject(LOCAL_STORAGE) storage: Storage) {
    super(storage, bookmark);
    this.bookmarksInternal$.next(this._bookmarkStorageService.getStorageBookmarks());
  }

  createDataSource(): Bookmark[] | undefined {
    let item = this._bookmarkStorageService.getStorageBookmarks();
    return item;
  }

  createBookmark(value: any): Observable<null | undefined> | any {
    const bookmarks = this._bookmarkStorageService.getStorageBookmarks();
    bookmarks.push(value);
    this._bookmarkStorageService.setItem(bookmark, JSON.stringify(bookmarks));
    this.bookmarksInternal$.next(bookmarks);
  }

  deleteBookmark(label?: string): Observable<string | undefined> {
    const bookmarks = this._bookmarkStorageService.getStorageBookmarks();
    const filteredBookmarks = bookmarks.filter((element: Bookmark) => element.label !== label);
    this._bookmarkStorageService.setItem(bookmark, JSON.stringify(filteredBookmarks));
    this.bookmarksInternal$.next(filteredBookmarks);
    return of('');
  }

  renameBookmark(oldLabel: string, newLabel: string): Observable<string | undefined> {
    const bookmarks = this._bookmarkStorageService.getStorageBookmarks();
    const updatedBookmarks = bookmarks.map((element: Bookmark) =>
      element.label !== oldLabel ? element : { ...element, label: newLabel },
    );
    this._bookmarkStorageService.setItem(bookmark, JSON.stringify(updatedBookmarks));
    this.bookmarksInternal$.next(updatedBookmarks);
    return of('');
  }
}
