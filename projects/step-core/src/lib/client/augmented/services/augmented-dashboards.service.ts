import { inject, Injectable } from '@angular/core';
import { DashboardsService, DashboardView } from '../../generated';
import { StepDataSource, TableRemoteDataSourceFactoryService } from '../../table/step-table-client.module';

@Injectable({
  providedIn: 'root',
})
export class AugmentedDashboardsService extends DashboardsService {
  static readonly TABLE_ID = 'dashboards';

  private _dataSourceFactory = inject(TableRemoteDataSourceFactoryService);

  createDataSource(): StepDataSource<DashboardView> {
    return this._dataSourceFactory.createDataSource(AugmentedDashboardsService.TABLE_ID, {
      name: 'name',
      description: 'description',
      actions: '',
    });
  }
}
