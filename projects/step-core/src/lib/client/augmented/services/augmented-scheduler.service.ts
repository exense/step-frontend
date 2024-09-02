/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { inject, Injectable } from '@angular/core';
import { Observable, of, OperatorFunction, tap } from 'rxjs';
import { HttpClient, HttpEvent } from '@angular/common/http';

import { Execution, ExecutiontTaskParameters, FieldFilter, SchedulerService } from '../../generated';
import {
  StepDataSource,
  TableApiWrapperService,
  TableCollectionFilter,
  TableRemoteDataSourceFactoryService,
} from '../../table/step-table-client.module';
import { CompareCondition } from '../../../modules/basics/types/compare-condition.enum';
import { map } from 'rxjs';
import { HttpOverrideResponseInterceptor } from '../shared/http-override-response-interceptor';
import { HttpOverrideResponseInterceptorService } from './http-override-response-interceptor.service';
import { HttpRequestContextHolderService } from './http-request-context-holder.service';
import { AugmentedExecutionsService } from './augmented-executions.service';

@Injectable({ providedIn: 'root' })
export class AugmentedSchedulerService extends SchedulerService implements HttpOverrideResponseInterceptor {
  static readonly TASKS_TABLE_ID = 'tasks';

  private _httpClient = inject(HttpClient);
  private _dataSourceFactory = inject(TableRemoteDataSourceFactoryService);
  private _tableApiWrapper = inject(TableApiWrapperService);
  private _interceptorOverride = inject(HttpOverrideResponseInterceptorService);
  private _requestContextHolder = inject(HttpRequestContextHolderService);

  private cachedTask?: ExecutiontTaskParameters;

  overrideInterceptor(override: OperatorFunction<HttpEvent<any>, HttpEvent<any>>): this {
    this._interceptorOverride.overrideInterceptor(override);
    return this;
  }

  createSelectionDataSource(): StepDataSource<ExecutiontTaskParameters> {
    return this._dataSourceFactory.createDataSource(AugmentedSchedulerService.TASKS_TABLE_ID, {
      'attributes.name': 'attributes.name',
      'executionsParameters.customParameters.env': 'executionsParameters.customParameters.env',
      cronExpression: 'cronExpression',
      automationPackage: 'customFields.automationPackageId',
    });
  }

  /**
   * Execute the given scheduler task.
   * The API does not return a JSON, therefore the expectation of the generated client code does not meet and it throws an error.
   * Using basic HttpClient to configure the responseType
   * @param id
   * @returns string default response
   * @throws ApiError
   */
  override executeTask(id: string): Observable<string> {
    const options = this._requestContextHolder.decorateRequestOptions({ responseType: 'text' })!;
    // @ts-ignore
    return this._httpClient.post<any>('rest/scheduler/task/' + id + '/execute', null, options);
  }

  isSchedulerEnabled(): Observable<boolean> {
    return this._httpClient.get<boolean>('rest/settings/scheduler_enabled');
  }

  searchByIds(scheduleIds: string[]): Observable<ExecutiontTaskParameters[]> {
    const idsFilter: TableCollectionFilter = {
      collectionFilter: {
        type: CompareCondition.OR,
        children: scheduleIds.map((expectedValue) => ({
          type: CompareCondition.EQUALS,
          field: 'id',
          expectedValue,
        })),
      },
    };

    return this._tableApiWrapper
      .requestTable<ExecutiontTaskParameters>(AugmentedSchedulerService.TASKS_TABLE_ID, { filters: [idsFilter] })
      .pipe(map((response) => response.data));
  }

  getExecutionTaskByIdCached(id: string): Observable<ExecutiontTaskParameters> {
    if (this.cachedTask && this.cachedTask.id === id) {
      return of(this.cachedTask);
    }
    return super.getExecutionTaskById(id).pipe(tap((task) => (this.cachedTask = task)));
  }

  cleanupCache(): void {
    this.cachedTask = undefined;
  }

  getExecutionsByTaskId(
    id: string,
    start?: number,
    end?: number,
  ): Observable<{
    recordsTotal: number;
    recordsFiltered: number;
    data: any[];
  }> {
    const runningFilter: FieldFilter = {
      field: 'executionTaskID',
      regex: false,
      value: id,
    };
    return this._tableApiWrapper
      .requestTable<Execution>(AugmentedExecutionsService.EXECUTIONS_TABLE_ID, { filters: [runningFilter] })
      .pipe(
        map((response) => {
          if (start !== undefined && end !== undefined) {
            response.data = response.data.filter((execution: any) => {
              return execution.startTime >= start && execution.endTime <= end;
            });
          }
          return response;
        }),
      );
  }
}
