import { inject, Injectable } from '@angular/core';
import { Plan, PlansService } from '../../generated';
import { StepDataSource, TableRemoteDataSourceFactoryService } from '../../table/step-table-client.module';
import { Observable, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AugmentedPlansService extends PlansService {
  static readonly PLANS_TABLE_ID = 'plans';
  private _dataSourceFactory = inject(TableRemoteDataSourceFactoryService);
  private _httpClient = inject(HttpClient);

  private cachedPlan?: Plan;

  getPlansTableDataSource(): StepDataSource<Plan> {
    return this._dataSourceFactory.createDataSource(AugmentedPlansService.PLANS_TABLE_ID, {
      name: 'attributes.name',
      type: 'root._class',
      automationPackage: 'customFields.automationPackageId',
      actions: '',
    });
  }

  createSelectionDataSource(): StepDataSource<Plan> {
    return this._dataSourceFactory.createDataSource(AugmentedPlansService.PLANS_TABLE_ID, { name: 'attributes.name' });
  }

  getPlanByIdCached(id: string): Observable<Plan> {
    if (this.cachedPlan && this.cachedPlan.id === id) {
      return of(this.cachedPlan);
    }
    return super.getPlanById(id).pipe(tap((plan) => (this.cachedPlan = plan)));
  }

  cleanupCache(): void {
    this.cachedPlan = undefined;
  }

  override getYamlPlan(id: string): Observable<any> {
    return this._httpClient.get(`rest/plans/${id}/yaml`, { responseType: 'text' });
  }
}
