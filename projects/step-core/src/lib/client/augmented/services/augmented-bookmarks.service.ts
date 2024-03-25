import { FunctionPackage, KeywordPackagesService } from '../../generated';
import { inject, Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  StepDataSource,
  TableRemoteDataSourceFactoryService,
  TableApiWrapperService,
} from '../../table/step-table-client.module';
import { BookmarksService } from '../../generated/services/BookmarksService';
import { Bookmark } from '../../../modules/bookmarks';
import { MenuEntry } from '../../../modules/routing';
import { Menu } from '@angular/cdk/menu';

const BOOKMARKS_TABLE_ID = 'bookmarks';

@Injectable({
  providedIn: 'root',
})
export class AugmentedBookmarksService extends BookmarksService {
  private _dataSourceFactory = inject(TableRemoteDataSourceFactoryService);

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
