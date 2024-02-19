import { inject, Injectable } from '@angular/core';
import { Resource } from '../../generated';
import { StepDataSource, TableRemoteDataSourceFactoryService } from '../../table/step-table-client.module';
import { BookmarkService } from '../../../services/bookmark.service';
import { Bookmark } from '../../generated/models/Bookmark';
import { CollectionViewer } from '@angular/cdk/collections';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AugmentedBookmarksService extends BookmarkService {
  private _dataSourceFactory = inject(TableRemoteDataSourceFactoryService);
  private readonly RESOURCES_TABLE_ID = 'bookmarks';
  private el: StepDataSource<Bookmark> = {
    disconnect(collectionViewer: CollectionViewer): void {},
    skipOngoingRequest(): void {},
    reload(reloadOptions?: { hideProgress: boolean }) {},
    connect(collectionViewer: CollectionViewer): any {
      return [];
    },
  };

  createDataSource(): StepDataSource<Bookmark> | undefined {
    let item = JSON.parse(this.getItem('BOOKMARKS')!);
    return item;
  }
}
