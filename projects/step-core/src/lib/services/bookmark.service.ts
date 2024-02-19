import { inject, Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageProxy } from '../modules/basics/shared/storage-proxy';
import { LOCAL_STORAGE } from '../modules/basics/shared/storage.token';
import { Plan } from '../client/generated';
import { PlanAction } from '../shared';
import { Bookmark } from '../client/generated/models/Bookmark';
import { EntityActionInvokerService } from '../modules/entity/injectables/entity-action-invoker.service';

@Injectable({
  providedIn: 'root',
})
export class BookmarkService extends StorageProxy {
  private _entityActionsInvoker = inject(EntityActionInvokerService);

  constructor(@Inject(LOCAL_STORAGE) storage: Storage) {
    super(storage, 'BOOKMARKS');
  }

  createBookmark(value: any): Observable<null | undefined> | any {
    const bookmarks = JSON.parse(this.getItem('BOOKMARKS') || '[]');
    bookmarks.push(value);
    this.setItem('BOOKMARKS', JSON.stringify(bookmarks));
  }
}
