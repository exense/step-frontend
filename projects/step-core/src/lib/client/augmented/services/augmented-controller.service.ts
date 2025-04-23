import { inject, Injectable } from '@angular/core';
import { HttpOverrideResponseInterceptor } from '../shared/http-override-response-interceptor';
import { HttpOverrideResponseInterceptorService } from './http-override-response-interceptor.service';
import { HttpRequestContextHolderService } from './http-request-context-holder.service';
import { OperatorFunction } from 'rxjs';
import { HttpEvent } from '@angular/common/http';
import { ControllerService, ReportNode, TableParameters } from '../../generated';
import {
  SortDirection,
  StepDataSource,
  TableApiWrapperService,
  TableRemoteDataSourceFactoryService,
} from '../../table/step-table-client.module';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AugmentedControllerService extends ControllerService implements HttpOverrideResponseInterceptor {
  readonly REPORT_TABLE_ID = 'leafReports';

  private _tableApi = inject(TableApiWrapperService);
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

  getReportNodes<T extends TableParameters>(tableParameters: T): Observable<ReportNode[]> {
    return this._tableApi
      .requestTable<ReportNode>(this.REPORT_TABLE_ID, {
        skip: 0,
        sort: [
          {
            field: 'executionTime',
            direction: SortDirection.DESCENDING,
          },
        ],
        tableParameters,
      })
      .pipe(map((response) => response.data));
  }
}
