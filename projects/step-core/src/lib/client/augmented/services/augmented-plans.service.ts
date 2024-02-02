import { inject, Injectable } from '@angular/core';
import { Plan, PlansService } from '../../generated';
import { StepDataSource, TableRemoteDataSourceFactoryService } from '../../table/step-table-client.module';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AugmentedPlansService extends PlansService {
  readonly PLANS_TABLE_ID = 'plans';
  private _dataSourceFactory = inject(TableRemoteDataSourceFactoryService);
  private _httpClient = inject(HttpClient);

  getPlansTableDataSource(): StepDataSource<Plan> {
    return this._dataSourceFactory.createDataSource(this.PLANS_TABLE_ID, {
      name: 'attributes.name',
      type: 'root._class',
      automationPackage: 'customFields.automationPackageId',
      actions: '',
    });
  }

  createSelectionDataSource(): StepDataSource<Plan> {
    return this._dataSourceFactory.createDataSource(this.PLANS_TABLE_ID, { name: 'attributes.name' });
  }

  override getYamlPlan(id: string): Observable<any> {
    return this._httpClient.get(`rest/plans/${id}/yaml`, { responseType: 'text' });
  }
}
