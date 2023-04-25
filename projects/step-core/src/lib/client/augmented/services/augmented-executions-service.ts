import { Injectable } from '@angular/core';
import { Execution, ExecutionParameters, ExecutionsService } from '../../generated';
import { TableApiWrapperService } from '../../table/services/table-api-wrapper.service';
import { BaseHttpRequest } from '../../generated/core/BaseHttpRequest';
import { TableRemoteDataSource } from '../../../modules/table/shared/table-remote-data-source';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AugmentedExecutionsService extends ExecutionsService {
  private readonly EXECUTIONS_TABLE_ID = 'executions';

  private readonly dataSource = new TableRemoteDataSource<Execution>(this.EXECUTIONS_TABLE_ID, this._tableRest, {
    description: 'description',
    startTime: 'startTime',
    endTime: 'endTime',
    user: 'executionParameters.userID',
    status: 'status',
    result: 'result',
  });

  constructor(
    httpRequest: BaseHttpRequest,
    private _tableRest: TableApiWrapperService,
    private _httpClient: HttpClient
  ) {
    super(httpRequest);
  }

  getExecutionsTableDataSource(): TableRemoteDataSource<Execution> {
    return this.dataSource;
  }

  getExecutionsSelectionTableDataSource(): TableRemoteDataSource<Execution> {
    return new TableRemoteDataSource(this.EXECUTIONS_TABLE_ID, this._tableRest, {
      description: 'description',
      startTime: 'startTime',
      user: 'executionParameters.userID',
    });
  }

  override execute(requestBody?: ExecutionParameters): Observable<string> {
    return this._httpClient.post('rest/executions/start', requestBody, { responseType: 'text' });
  }
}
