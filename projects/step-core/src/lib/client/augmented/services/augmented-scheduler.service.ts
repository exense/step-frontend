/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { ExecutiontTaskParameters, SchedulerService } from '../../generated';
import { StepDataSource, TableRemoteDataSourceFactoryService } from '../../table/step-table-client.module';

@Injectable({ providedIn: 'root' })
export class AugmentedSchedulerService extends SchedulerService {
  private readonly TASKS_TABLE_ID = 'tasks';

  private _httpClient = inject(HttpClient);
  private _dataSourceFactory = inject(TableRemoteDataSourceFactoryService);

  createSelectionDataSource(): StepDataSource<ExecutiontTaskParameters> {
    return this._dataSourceFactory.createDataSource(this.TASKS_TABLE_ID, {
      'attributes.name': 'attributes.name',
      'executionsParameters.customParameters.env': 'executionsParameters.customParameters.env',
      cronExpression: 'cronExpression',
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
    //@ts-ignore
    return this._httpClient.post<any>('rest/scheduler/task/' + id + '/execute', null, { responseType: 'text' });
  }

  isSchedulerEnabled(): Observable<boolean> {
    return this._httpClient.get<boolean>('rest/settings/scheduler_enabled');
  }
}
