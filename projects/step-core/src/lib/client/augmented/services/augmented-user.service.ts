import { inject, Injectable } from '@angular/core';
import { User, UserService } from '../../generated';
import { StepDataSource, TableRemoteDataSourceFactoryService } from '../../table/step-table-client.module';

@Injectable({ providedIn: 'root' })
export class AugmentedUserService extends UserService {
  private readonly USER_TABLE_ID = 'users';
  private _dataSourceFactory = inject(TableRemoteDataSourceFactoryService);

  getPlansTableDataSource(): StepDataSource<User> {
    return this._dataSourceFactory.createDataSource(this.USER_TABLE_ID, {
      name: 'attributes.name',
      type: 'root._class',
      actions: '',
    });
  }

  createSelectionDataSource(): StepDataSource<User> {
    return this._dataSourceFactory.createDataSource(this.USER_TABLE_ID, { name: 'attributes.name' });
  }
}
