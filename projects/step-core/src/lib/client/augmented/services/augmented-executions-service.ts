import { Injectable } from '@angular/core';
import { ExecutionsService } from '../../generated';
import { TableRestService } from '../../table/services/table-rest.service';
import { BaseHttpRequest } from '../../generated/core/BaseHttpRequest';
import { TableRemoteDataSource } from '../../../modules/table/shared/table-remote-data-source';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AugmentedExecutionsService extends ExecutionsService {
  private readonly EXECUTIONS_TABLE_ID = 'executions';

  private readonly dataSource = new TableRemoteDataSource(this.EXECUTIONS_TABLE_ID, this._tableRest, {
    description: 'description',
    startTime: 'startTime',
    endTime: 'endTime',
    user: 'executionParameters.userID',
    environment: 'executionParameters.customParameters.env',
    status: 'status',
    result: 'result',
  });

  constructor(override httpRequest: BaseHttpRequest, private _tableRest: TableRestService) {
    super(httpRequest);
  }

  getExecutionsTableDataSource(): TableRemoteDataSource<any> {
    return this.dataSource;
  }
}
