import { Inject, Injectable, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { StorageProxy } from '../modules/basics/shared/storage-proxy';
import { LOCAL_STORAGE } from '../modules/basics/shared/storage.token';
import { Bookmark } from '../shared/Bookmark';
import { StepDataSource } from '../client/table/shared/step-data-source';
import { MenuEntry } from './view-registry.service';

const bookmark = 'BOOKMARKS';

@Injectable({
  providedIn: 'root',
})
export class BookmarkService extends StorageProxy {
  private bookmarks$ = new BehaviorSubject<Bookmark[]>(JSON.parse(this.getItem(bookmark) || '[]'));
  private bookmarkMenuEntries$ = new BehaviorSubject<MenuEntry[]>([]);

  constructor(@Inject(LOCAL_STORAGE) storage: Storage) {
    super(storage, bookmark);
    this.bookmarks$.next(this.getStorageBookmarks());
    this.loadMenuEntries();
  }

  getNewMenuEntries(): Observable<MenuEntry[]> {
    return this.bookmarkMenuEntries$.asObservable();
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
    this.loadMenuEntries();
  }

  deleteBookmark(label?: string): Observable<string | undefined> {
    const bookmarks = JSON.parse(this.getItem(bookmark) || '[]');
    const filteredBookmarks = bookmarks.filter((element: Bookmark) => element.label !== label);
    this.setItem(bookmark, JSON.stringify(filteredBookmarks));
    this.bookmarks$.next(filteredBookmarks);
    this.loadMenuEntries();
    return of('');
  }

  renameBookmark(oldLabel: string, newLabel: string): Observable<string | undefined> {
    this.bookmarkMenuEntries$.next([
      {
        weight: 90,
        id: 'test',
        icon: 'edit',
        parentId: 'bookmarks-root',
        title: 'test1',
        isEnabledFct(): boolean {
          return true;
        },
      },
    ]);
    const bookmarks = JSON.parse(this.getItem(bookmark) || '[]');
    const updatedBookmarks = bookmarks.map((element: Bookmark) =>
      element.label !== oldLabel ? element : { ...element, label: newLabel },
    );
    this.setItem(bookmark, JSON.stringify(updatedBookmarks));
    this.bookmarks$.next(updatedBookmarks);
    this.loadMenuEntries();
    return of('');
  }

  private loadMenuEntries(): void {
    const menuEntries: MenuEntry[] = [];
    this.bookmarks$.value?.forEach((element) => {
      menuEntries.push({
        title: element.label!,
        id: element.link!,
        icon: element.icon!,
        parentId: 'bookmarks-root',
        weight: 1000 + menuEntries.length,
        isEnabledFct(): boolean {
          return true;
        },
      });
    });
    this.bookmarkMenuEntries$.next(menuEntries);
  }
}
