import { inject, Injectable } from '@angular/core';
import { FetchBucketsRequest, TimeSeriesService } from '../../generated';
import { delay, map, Observable, of, OperatorFunction, switchMap } from 'rxjs';
import { TableApiWrapperService } from '../../table';
import { HttpOverrideResponseInterceptor } from '../shared/http-override-response-interceptor';
import { HttpOverrideResponseInterceptorService } from './http-override-response-interceptor.service';
import { HttpRequestContextHolderService } from './http-request-context-holder.service';
import { HttpEvent } from '@angular/common/http';
import { TimeSeriesErrorEntry } from '../shared/time-series-error-entry';
import { TimeSeriesErrorsRequest } from '../shared/time-series-errors-request';
import { TableFetchLocalDataSource } from '../../../modules/table/shared/table-fetch-local-data-source';
import { TableLocalDataSource } from '../../../modules/table/shared/table-local-data-source';
import { TableLocalDataSourceConfig } from '../../../modules/table/shared/table-local-data-source-config';

@Injectable({
  providedIn: 'root',
})
export class AugmentedTimeSeriesService extends TimeSeriesService implements HttpOverrideResponseInterceptor {
  private _tableApi = inject(TableApiWrapperService);
  private _interceptorOverride = inject(HttpOverrideResponseInterceptorService);
  private _requestContextHolder = inject(HttpRequestContextHolderService);

  overrideInterceptor(override: OperatorFunction<HttpEvent<any>, HttpEvent<any>>): this {
    this._interceptorOverride.overrideInterceptor(override);
    return this;
  }

  exportRawMeasurementsAsCSV(oqlFilter: string): Observable<string> {
    return this.getMeasurementsAttributes(oqlFilter).pipe(
      switchMap((fields) => this._tableApi.exportAsCSV('measurements', fields, { filters: [{ oql: oqlFilter }] })),
    );
  }

  findErrors(request: TimeSeriesErrorsRequest): Observable<TimeSeriesErrorEntry[]> {
    let oqlFilter = '';
    if (request.taskId) {
      oqlFilter = `attributes.taskId = ${request.taskId}`;
    } else if (request.executionId) {
      oqlFilter = `attributes.executionId = ${request.executionId}`;
    } else if (request.planId) {
      oqlFilter = `(attributes.planId = \"${request.planId}\")`;
    } else if (request.canonicalPlanName) {
      oqlFilter = `attributes.canonicalPlanName = \"${request.canonicalPlanName}\"`;
    }

    const executionsAttributesLimit = 10;
    const fetchBucketRequest: FetchBucketsRequest = {
      start: request.timeRange.from,
      end: request.timeRange.to,
      numberOfBuckets: 1,
      oqlFilter,
      groupDimensions: ['errorMessage', 'errorCode', 'status'],
      collectAttributeKeys: ['executionId'],
      collectAttributesValuesLimit: executionsAttributesLimit,
    };

    return this.getReportNodesTimeSeries(fetchBucketRequest).pipe(
      map((response) => {
        let totalCountWithErrors = 0;
        const errorsByMessageAndCode = new Map<string, TimeSeriesErrorEntry>();

        response.matrixKeys.forEach((keyAttributes, index) => {
          const errorCode = keyAttributes['errorCode'];
          const errorMessage = keyAttributes['errorMessage'];
          const status = keyAttributes['status'] as string | undefined;

          if (errorCode === undefined && errorMessage === undefined) {
            return;
          }

          const key = JSON.stringify([errorMessage, errorCode]);
          let error = errorsByMessageAndCode.get(key);
          if (!error) {
            error = {
              errorCode,
              errorMessage,
              count: 0,
              countByStatus: {},
              percentage: 0,
              executionIds: [],
              executionIdsTruncated: false,
              types: [],
            };
            errorsByMessageAndCode.set(key, error);
          }

          const bucket = response.matrix[index][0];
          error.count += bucket.count;
          totalCountWithErrors += bucket.count;
          if (status) {
            error.countByStatus[status] = (error.countByStatus[status] ?? 0) + bucket.count;
          }

          const bucketExecutionIds = (bucket.attributes['executionId'] ?? []) as string[];
          const executionIds = Array.from(new Set([...error.executionIds, ...bucketExecutionIds]));
          error.executionIdsTruncated ||= executionIds.length >= executionsAttributesLimit;
          error.executionIds = executionIds.slice(0, executionsAttributesLimit);
        });

        return Array.from(errorsByMessageAndCode.values()).map((error) => ({
          ...error,
          types: Object.keys(error.countByStatus),
          percentage: Number(((error.count / totalCountWithErrors) * 100).toFixed(2)),
        }));
      }),
    );
  }

  createErrorsFetchDataSource(): TableFetchLocalDataSource<TimeSeriesErrorEntry> {
    return new TableFetchLocalDataSource(
      (request?: TimeSeriesErrorsRequest) => (!request ? of(undefined) : this.findErrors(request)),
      this.createErrorsDataSourceConfig(),
    );
  }

  createErrorsLocalDataSource(
    data: TimeSeriesErrorEntry[] | Observable<TimeSeriesErrorEntry[]>,
  ): TableLocalDataSource<TimeSeriesErrorEntry> {
    return new TableLocalDataSource(data, this.createErrorsDataSourceConfig());
  }

  private createErrorsDataSourceConfig(): TableLocalDataSourceConfig<TimeSeriesErrorEntry> {
    return TableLocalDataSource.configBuilder<TimeSeriesErrorEntry>()
      .addSearchNumberPredicate('errorCode', (item) => item.errorCode)
      .addCustomSearchPredicate('types', (item, searchValue) => {
        const search = new RegExp(searchValue, 'ig');
        return item.types.some((type) => search.test(type));
      })
      .addSortNumberPredicate('errorCode', (item) => item.errorCode)
      .addSortNumberPredicate('count', (item) => item.count)
      .addSortNumberPredicate('percentage', (item) => item.percentage)
      .build();
  }
}
