import { inject, Injectable } from '@angular/core';
import {
  AsyncTaskStatusTableBulkOperationReport,
  Execution,
  ExecutionParameters,
  ExecutionsService,
  FieldFilter,
  ReportNode,
  TableBulkOperationRequest,
} from '../../generated';
import { map, Observable, OperatorFunction } from 'rxjs';
import { HttpClient, HttpEvent } from '@angular/common/http';
import {
  StepDataSource,
  TableApiWrapperService,
  TableCollectionFilter,
  TableRemoteDataSourceFactoryService,
} from '../../table/step-table-client.module';
import { CompareCondition } from '../../../modules/basics/types/compare-condition.enum';
import { HttpOverrideResponseInterceptor } from '../shared/http-override-response-interceptor';
import { HttpOverrideResponseInterceptorService } from './http-override-response-interceptor.service';
import { HttpRequestContextHolderService } from './http-request-context-holder.service';
import { SearchValue } from '../../../modules/table/shared/search-value';

@Injectable({ providedIn: 'root' })
export class AugmentedExecutionsService extends ExecutionsService implements HttpOverrideResponseInterceptor {
  static readonly EXECUTIONS_TABLE_ID = 'executions';
  static readonly REPORTS_TABLE_ID = 'reports';

  private _httpClient = inject(HttpClient);
  private _dataSourceFactory = inject(TableRemoteDataSourceFactoryService);
  private _tableApiWrapper = inject(TableApiWrapperService);
  private _interceptorOverride = inject(HttpOverrideResponseInterceptorService);
  private _requestContextHolder = inject(HttpRequestContextHolderService);

  overrideInterceptor(override: OperatorFunction<HttpEvent<any>, HttpEvent<any>>): this {
    this._interceptorOverride.overrideInterceptor(override);
    return this;
  }

  getExecutionsTableDataSource(): StepDataSource<Execution> {
    return this._dataSourceFactory.createDataSource(AugmentedExecutionsService.EXECUTIONS_TABLE_ID, {
      description: 'description',
      executionTime: 'startTime',
      startTime: 'startTime',
      endTime: 'endTime',
      user: 'executionParameters.userID',
      status: 'status',
      result: 'result',
    });
  }

  getReportNodeDataSource(artefactHash?: string, resolvedPartialPath?: string): StepDataSource<ReportNode> {
    let filters: Record<string, string | string[] | SearchValue> | undefined = undefined;
    if (artefactHash) {
      filters = filters ?? {};
      filters['artefactHash'] = artefactHash;
    }
    if (resolvedPartialPath) {
      filters = filters ?? {};
      filters['path'] = { value: `^${resolvedPartialPath}`, regex: true };
    }
    return this._dataSourceFactory.createDataSource(
      AugmentedExecutionsService.REPORTS_TABLE_ID,
      {
        name: 'name',
        status: 'status',
        executionTime: 'executionTime',
      },
      filters,
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
