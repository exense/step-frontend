import { inject, Injectable } from '@angular/core';
import { Plan, PlansService } from '../../generated';
import { StepDataSource, TableRemoteDataSourceFactoryService } from '../../table';
import { Observable, of, OperatorFunction, tap } from 'rxjs';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { HttpOverrideResponseInterceptor } from '../shared/http-override-response-interceptor';
import { HttpOverrideResponseInterceptorService } from './http-override-response-interceptor.service';
import { HttpRequestContextHolderService } from './http-request-context-holder.service';

@Injectable({ providedIn: 'root' })
export class AugmentedPlansService extends PlansService implements HttpOverrideResponseInterceptor {
  static readonly PLANS_TABLE_ID = 'plans';
  private _dataSourceFactory = inject(TableRemoteDataSourceFactoryService);
  private _httpClient = inject(HttpClient);
  private _interceptorOverride = inject(HttpOverrideResponseInterceptorService);
  private _requestContextHolder = inject(HttpRequestContextHolderService);

  private cachedPlan?: Plan;

  overrideInterceptor(override: OperatorFunction<HttpEvent<any>, HttpEvent<any>>): this {
    this._interceptorOverride.overrideInterceptor(override);
    return this;
  }

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
    return this._httpClient.get(
      `rest/plans/${id}/yaml`,
      this._requestContextHolder.decorateRequestOptions({ responseType: 'text' }),
    );
  }
}
