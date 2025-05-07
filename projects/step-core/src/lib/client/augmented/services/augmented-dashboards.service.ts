import { inject, Injectable } from '@angular/core';
import { DashboardsService, DashboardView } from '../../generated';
import { StepDataSource, TableRemoteDataSourceFactoryService } from '../../table';
import { HttpOverrideResponseInterceptor } from '../shared/http-override-response-interceptor';
import { HttpOverrideResponseInterceptorService } from './http-override-response-interceptor.service';
import { HttpRequestContextHolderService } from './http-request-context-holder.service';
import { OperatorFunction } from 'rxjs';
import { HttpEvent } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AugmentedDashboardsService extends DashboardsService implements HttpOverrideResponseInterceptor {
  static readonly TABLE_ID = 'dashboards';

  private _dataSourceFactory = inject(TableRemoteDataSourceFactoryService);
  private _interceptorOverride = inject(HttpOverrideResponseInterceptorService);
  private _requestContextHolder = inject(HttpRequestContextHolderService);

  overrideInterceptor(override: OperatorFunction<HttpEvent<any>, HttpEvent<any>>): this {
    this._interceptorOverride.overrideInterceptor(override);
    return this;
  }

  createDataSource(): StepDataSource<DashboardView> {
    return this._dataSourceFactory.createDataSource(AugmentedDashboardsService.TABLE_ID, {
      name: 'name',
      description: 'description',
      actions: '',
    });
  }
}
