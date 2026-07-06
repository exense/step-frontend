import { inject, Injectable } from '@angular/core';
import {
  AsyncTaskStatusTableBulkOperationReport,
  Execution,
  ExecutionOverview,
  ExecutionParameters,
  ExecutionsService,
  FieldFilter,
  TableBulkOperationRequest,
} from '../../generated';
import { map, Observable, of, OperatorFunction, tap } from 'rxjs';
import { HttpClient, HttpEvent } from '@angular/common/http';
import {
  SortDirection,
  StepDataSource,
  TableApiWrapperService,
  TableCollectionFilter,
  TableRemoteDataSourceFactoryService,
} from '../../table';
import { CompareCondition } from '../../../modules/basics/types/compare-condition.enum';
import { HttpOverrideResponseInterceptor } from '../shared/http-override-response-interceptor';
import { HttpOverrideResponseInterceptorService } from './http-override-response-interceptor.service';
import { HttpRequestContextHolderService } from './http-request-context-holder.service';

interface SearchExecutionsByCanonicalPlanNameOptions {
  limit?: number;
  from?: number;
  to?: number;
}

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
  private cachedOverview?: ExecutionOverview;

  getExecutionByIdCached(id: string): Observable<Execution> {
    if (this.cachedExecution && this.cachedExecution.id === id) {
      return of(this.cachedExecution);
    }
    return super.getExecutionById(id).pipe(tap((plan) => (this.cachedExecution = plan)));
  }

  /**
   * Fetches the execution overview and caches it, so guards and the overview page can share a single
   * request for the same execution instead of also calling getExecutionById. The cache is cleared on
   * route deactivation via cleanupCache().
   */
  getExecutionOverviewCached(id: string): Observable<ExecutionOverview> {
    if (this.cachedOverview && this.cachedOverview.execution?.id === id) {
      return of(this.cachedOverview);
    }
    return this.getExecutionOverview(id).pipe(tap((overview) => (this.cachedOverview = overview)));
  }

  /** Like getExecutionOverviewCached, but exposes only the execution (for guards / entity checks). */
  getExecutionViaOverviewCached(id: string): Observable<Execution> {
    return this.getExecutionOverviewCached(id).pipe(map((overview) => this.getOverviewExecution(overview)));
  }

  cleanupCache(): void {
    this.cachedExecution = undefined;
    this.cachedOverview = undefined;
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
      { includeGlobalEntities: false },
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

  searchByCanonicalPlanName(
    canonicalPlanName: string,
    options: SearchExecutionsByCanonicalPlanNameOptions = {},
  ): Observable<Execution[]> {
    const filter: FieldFilter = {
      field: 'importResult.canonicalPlanName',
      regex: false,
      value: canonicalPlanName,
    };
    const filters = [filter, ...this.createStartTimeRangeFilters(options.from, options.to)];
    return this._tableApiWrapper
      .requestTable<Execution>(AugmentedExecutionsService.EXECUTIONS_TABLE_ID, {
        filters,
        limit: options.limit,
        sort: [
          {
            field: 'startTime',
            direction: SortDirection.DESCENDING,
          },
        ],
      })
      .pipe(map((response) => response.data));
  }

  private createStartTimeRangeFilters(from?: number, to?: number): TableCollectionFilter[] {
    return [
      from != null
        ? {
            collectionFilter: {
              type: CompareCondition.GREATER_THAN_OR_EQUAL,
              field: 'startTime',
              value: from,
            },
          }
        : undefined,
      to != null
        ? {
            collectionFilter: {
              type: CompareCondition.LOWER_THAN,
              field: 'startTime',
              value: to,
            },
          }
        : undefined,
    ].filter((filter): filter is TableCollectionFilter => !!filter);
  }

  countExecutionsByStatus(status: string): Observable<number> {
    const runningFilter: FieldFilter = {
      field: 'status',
      regex: false,
      value: `${status}`,
    };
    return this._tableApiWrapper
      .requestTable<Execution>(
        AugmentedExecutionsService.EXECUTIONS_TABLE_ID,
        { filters: [runningFilter], calculateCounts: false },
        false,
      )
      .pipe(map((response) => response.data.length || 0));
  }

  private getOverviewExecution(overview: ExecutionOverview): Execution {
    if (!overview.execution) {
      throw new Error('Execution overview response does not include an execution.');
    }
    return overview.execution;
  }
}
