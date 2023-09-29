import { inject, Injectable } from '@angular/core';
import { Plan, PlansService } from '../../generated';
import { StepDataSource, TableRemoteDataSourceFactoryService } from '../../table/step-table-client.module';

@Injectable({ providedIn: 'root' })
export class AugmentedPlansService extends PlansService {
  private readonly PLANS_TABLE_ID = 'plans';
  private _dataSourceFactory = inject(TableRemoteDataSourceFactoryService);

  getPlansTableDataSource(): StepDataSource<Plan> {
    return this._dataSourceFactory.createDataSource(this.PLANS_TABLE_ID, {
      name: 'attributes.name',
      type: 'root._class',
      actions: '',
    });
  }

  createSelectionDataSource(): StepDataSource<Plan> {
    return this._dataSourceFactory.createDataSource(this.PLANS_TABLE_ID, { name: 'attributes.name' });
  }
}
