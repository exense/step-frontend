import { inject, Injectable } from '@angular/core';
import {
  AsyncTaskStatusTableBulkOperationReport,
  Execution,
  ExecutionParameters,
  ExecutionsService,
  FieldFilter,
  TableBulkOperationRequest,
} from '../../generated';
import { map, Observable, of, OperatorFunction, tap } from 'rxjs';
import { HttpClient, HttpEvent } from '@angular/common/http';
import {
  StepDataSource,
  TableApiWrapperService,
  TableCollectionFilter,
  TableRemoteDataSourceFactoryService,
} from '../../table';
import { CompareCondition } from '../../../modules/basics/types/compare-condition.enum';
import { HttpOverrideResponseInterceptor } from '../shared/http-override-response-interceptor';
import { HttpOverrideResponseInterceptorService } from './http-override-response-interceptor.service';
import { HttpRequestContextHolderService } from './http-request-context-holder.service';

@Injectable({ providedIn: 'root' })
export class AugmentedExecutionsService extends ExecutionsService implements HttpOverrideResponseInterceptor {
  static readonly EXECUTIONS_TABLE_ID = 'executions';
  static readonly REPORTS_TABLE_ID = 'reports';

  private _httpClient = inject(HttpClient);
  private _dataSourceFactory = inject(TableRemoteDataSourceFactoryService);
  private _tableApiWrapper = inject(TableApiWrapperService);
  private _interceptorOverride = inject(HttpOverrideResponseInterceptorService);
  private _requestContextHolder = inject(HttpRequestContextHolderService);

  private cachedExecution?: Execution;

  getExecutionByIdCached(id: string): Observable<Execution> {
    if (this.cachedExecution && this.cachedExecution.id === id) {
      return of(this.cachedExecution);
    }
    return super.getExecutionById(id).pipe(tap((plan) => (this.cachedExecution = plan)));
  }

  cleanupCache(): void {
    this.cachedExecution = undefined;
  }

  overrideInterceptor(override: OperatorFunction<HttpEvent<any>, HttpEvent<any>>): this {
    this._interceptorOverride.overrideInterceptor(override);
    return this;
  }

  getExecutionsTableDataSource(): StepDataSource<Execution> {
    return this._dataSourceFactory.createDataSource(
      AugmentedExecutionsService.EXECUTIONS_TABLE_ID,
      {
        description: 'description',
        executionTime: 'startTime',
        startTime: 'startTime',
        endTime: 'endTime',
        user: 'executionParameters.userID',
        status: ['status', 'result'],
      },
      undefined,
      false,
    );
  }

  getExecutionsSelectionTableDataSource(): StepDataSource<Execution> {
    return this._dataSourceFactory.createDataSource(AugmentedExecutionsService.EXECUTIONS_TABLE_ID, {
      description: 'description',
      startTime: 'startTime',
      user: 'executionParameters.userID',
    });
  }

  override execute(requestBody?: ExecutionParameters): Observable<string> {
    return this._httpClient.post(
      'rest/executions/start',
      requestBody,
      this._requestContextHolder.decorateRequestOptions({ responseType: 'text' }),
    );
  }

  /**
   * Delete multiple executions according to the provided parameters.
   * @param requestBody
   * @returns AsyncTaskStatusTableBulkOperationReport default response
   * @throws ApiError
   */
  public deleteExecutions(
    requestBody?: TableBulkOperationRequest,
  ): Observable<AsyncTaskStatusTableBulkOperationReport> {
    return this.httpRequest.request(
      this._requestContextHolder.decorateRequestOptions({
        method: 'DELETE',
        url: '/housekeeping/executions/bulk',
        body: requestBody,
        mediaType: 'application/json',
      }),
    );
  }

  searchByIds(executionIds: string[]): Observable<Execution[]> {
    const idsFilter: TableCollectionFilter = {
      collectionFilter: {
        type: CompareCondition.OR,
        children: executionIds.map((expectedValue) => ({
          type: CompareCondition.EQUALS,
          field: 'id',
          expectedValue,
        })),
      },
    };

    return this._tableApiWrapper
      .requestTable<Execution>(AugmentedExecutionsService.EXECUTIONS_TABLE_ID, { filters: [idsFilter] })
      .pipe(map((response) => response.data));
  }

  countExecutionsByStatus(status: string): Observable<number> {
    const runningFilter: FieldFilter = {
      field: 'status',
      regex: false,
      value: `${status}`,
    };
    return this._tableApiWrapper
      .requestTable<Execution>(AugmentedExecutionsService.EXECUTIONS_TABLE_ID, { filters: [runningFilter] })
      .pipe(map((response) => response.recordsFiltered));
  }
}
