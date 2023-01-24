import { Injectable } from '@angular/core';
import { ExecutionParameters, ExecutionsService } from '../../generated';
import { TableApiWrapperService } from '../../table/services/table-api-wrapper.service';
import { BaseHttpRequest } from '../../generated/core/BaseHttpRequest';
import { TableRemoteDataSource } from '../../../modules/table/shared/table-remote-data-source';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AugmentedExecutionsService extends ExecutionsService {
  private readonly EXECUTIONS_TABLE_ID = 'executions';

  private readonly dataSource = new TableRemoteDataSource(this.EXECUTIONS_TABLE_ID, this._tableRest, {
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

  getExecutionsTableDataSource(): TableRemoteDataSource<any> {
    return this.dataSource;
  }
  override execute(requestBody?: ExecutionParameters): Observable<string> {
    return this._httpClient.post('rest/executions/start', requestBody, { responseType: 'text' });
  }
}
