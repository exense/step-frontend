import { inject, Injectable } from '@angular/core';
import { FetchBucketsRequest, TimeRange, TimeSeriesService } from '../../generated';
import { map, Observable, of, OperatorFunction, switchMap, tap } from 'rxjs';
import { TableApiWrapperService } from '../../table/step-table-client.module';
import { HttpOverrideResponseInterceptor } from '../shared/http-override-response-interceptor';
import { HttpOverrideResponseInterceptorService } from './http-override-response-interceptor.service';
import { HttpRequestContextHolderService } from './http-request-context-holder.service';
import { HttpEvent } from '@angular/common/http';
import { TimeSeriesErrorEntry } from '../shared/time-series-error-entry';
import { TimeSeriesErrorsRequest } from '../shared/time-series-errors-request';
import { TableDataSource } from '../../../modules/table/shared/table-data-source';
import { TableFetchLocalDataSource } from '../../../modules/table/shared/table-fetch-local-data-source';
import { TableLocalDataSource } from '../../../modules/table/shared/table-local-data-source';

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
    }

    const executionsAttributesLimit = 10;
    const fetchBucketRequest: FetchBucketsRequest = {
      start: request.timeRange.from,
      end: request.timeRange.to,
      numberOfBuckets: 1,
      oqlFilter,
      groupDimensions: ['errorMessage', 'errorCode'],
      collectAttributeKeys: ['status', 'executionId'],
      collectAttributesValuesLimit: executionsAttributesLimit,
    };

    return this.getReportNodesTimeSeries(fetchBucketRequest).pipe(
      map((response) => {
        let totalCountWithErrors = 0;
        const result = response.matrixKeys
          .map((keyAttributes, index) => {
            const errorCode = keyAttributes['errorCode'];
            const errorMessage = keyAttributes['errorMessage'];

            if (errorCode === undefined && errorMessage === undefined) {
              return undefined;
            }

            const bucket = response.matrix[index][0];
            const count = bucket.count;
            const executionIds = (bucket.attributes['executionId'] ?? []) as string[];
            const executionIdsTruncated = executionIds.length >= executionsAttributesLimit;
            const types = (bucket.attributes['status'] ?? []) as string[];
            totalCountWithErrors += count;

            const errorItem: TimeSeriesErrorEntry = {
              errorCode,
              errorMessage,
              count,
              percentage: 0,
              executionIds,
              executionIdsTruncated,
              types,
            };

            return errorItem;
          })
          .filter((item) => !!item) as TimeSeriesErrorEntry[];

        result.forEach((error) => {
          error.percentage = Number(((error.count / totalCountWithErrors) * 100).toFixed(2));
        });

        return result;
      }),
      tap((result) => console.log('RESULT', result)),
    );
  }

  createErrorsDataSource(): TableFetchLocalDataSource<TimeSeriesErrorEntry> {
    return new TableFetchLocalDataSource((request?: TimeSeriesErrorsRequest) =>
      !request ? of([]) : this.findErrors(request),
    );
  }
}
