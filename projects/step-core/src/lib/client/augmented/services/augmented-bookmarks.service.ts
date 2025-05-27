import { inject, Injectable } from '@angular/core';
import { map, Observable, of, OperatorFunction } from 'rxjs';
import { StepDataSource, TableRemoteDataSourceFactoryService } from '../../table';
import { BookmarksService } from '../../generated/services/BookmarksService';
import { Bookmark } from '../../../modules/bookmarks';
import { MenuEntry } from '../../../modules/routing';
import { HttpOverrideResponseInterceptor } from '../shared/http-override-response-interceptor';
import { HttpOverrideResponseInterceptorService } from './http-override-response-interceptor.service';
import { HttpRequestContextHolderService } from './http-request-context-holder.service';
import { HttpEvent } from '@angular/common/http';

const BOOKMARKS_TABLE_ID = 'bookmarks';

@Injectable({
  providedIn: 'root',
})
export class AugmentedBookmarksService extends BookmarksService implements HttpOverrideResponseInterceptor {
  private _dataSourceFactory = inject(TableRemoteDataSourceFactoryService);
  private _interceptorOverride = inject(HttpOverrideResponseInterceptorService);
  private _requestContextHolder = inject(HttpRequestContextHolderService);

  overrideInterceptor(override: OperatorFunction<HttpEvent<any>, HttpEvent<any>>): this {
    this._interceptorOverride.overrideInterceptor(override);
    return this;
  }

  createDataSource(): StepDataSource<Bookmark> {
    return this._dataSourceFactory.createDataSource(BOOKMARKS_TABLE_ID, {
      name: 'attributes.name',
      version: 'packageAttributes.version',
      actions: '',
    });
  }

  getMenuEntries(): Observable<MenuEntry[]> {
    return this.findUserBookmarksByAttributes().pipe(
      map((bookmarks) =>
        bookmarks.map((element) => {
          const menuEntry = {
            title: element.customFields!['label'],
            id: element.id!,
            icon: element.customFields!['icon'],
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
  }
}
