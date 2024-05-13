import { inject, Injectable } from '@angular/core';
import { ControllerService, ReportNode } from '../../generated';
import { StepDataSource, TableRemoteDataSourceFactoryService } from '../../table/step-table-client.module';
import { HttpOverrideResponseInterceptor } from '../shared/http-override-response-interceptor';
import { HttpOverrideResponseInterceptorService } from './http-override-response-interceptor.service';
import { HttpRequestContextHolderService } from './http-request-context-holder.service';
import { OperatorFunction } from 'rxjs';
import { HttpEvent } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AugmentedControllerService extends ControllerService implements HttpOverrideResponseInterceptor {
  private readonly REPORT_TABLE_ID = 'leafReports';

  private _dataSourceFactory = inject(TableRemoteDataSourceFactoryService);
  private _interceptorOverride = inject(HttpOverrideResponseInterceptorService);
  private _requestContextHolder = inject(HttpRequestContextHolderService);

  overrideInterceptor(override: OperatorFunction<HttpEvent<any>, HttpEvent<any>>): this {
    this._interceptorOverride.overrideInterceptor(override);
    return this;
  }

  createDataSource(): StepDataSource<ReportNode> {
    return this._dataSourceFactory.createDataSource(this.REPORT_TABLE_ID, {
      executionTime: 'executionTime',
      step: 'step',
      status: 'status',
    });
  }
}
