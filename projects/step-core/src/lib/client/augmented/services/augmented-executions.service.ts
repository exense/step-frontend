import { inject, Injectable } from '@angular/core';
import { Execution, ExecutionParameters, ExecutionsService } from '../../generated';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { StepDataSource, TableRemoteDataSourceFactoryService } from '../../table/step-table-client.module';

@Injectable({ providedIn: 'root' })
export class AugmentedExecutionsService extends ExecutionsService {
  private readonly EXECUTIONS_TABLE_ID = 'executions';

  private _httpClient = inject(HttpClient);
  private _dataSourceFactory = inject(TableRemoteDataSourceFactoryService);

  getExecutionsTableDataSource(): StepDataSource<Execution> {
    return this._dataSourceFactory.createDataSource(this.EXECUTIONS_TABLE_ID, {
      description: 'description',
      startTime: 'startTime',
      endTime: 'endTime',
      user: 'executionParameters.userID',
      status: 'status',
      result: 'result',
    });
  }

  getExecutionsSelectionTableDataSource(): StepDataSource<Execution> {
    return this._dataSourceFactory.createDataSource(this.EXECUTIONS_TABLE_ID, {
      description: 'description',
      startTime: 'startTime',
      user: 'executionParameters.userID',
    });
  }

  override execute(requestBody?: ExecutionParameters): Observable<string> {
    return this._httpClient.post('rest/executions/start', requestBody, { responseType: 'text' });
  }
}
