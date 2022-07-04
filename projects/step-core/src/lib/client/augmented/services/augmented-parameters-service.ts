import { Injectable } from '@angular/core';
import { ParametersService } from '../../generated';
import { TableRestService } from '../../table/services/table-rest.service';
import { BaseHttpRequest } from '../../generated/core/BaseHttpRequest';
import { TableRemoteDataSource } from '../../../modules/table/shared/table-remote-data-source';

@Injectable({ providedIn: 'root' })
export class AugmentedParametersService extends ParametersService {
  readonly PARAMETERS_TABLE_ID = 'parameters';

  readonly dataSource = new TableRemoteDataSource(this.PARAMETERS_TABLE_ID, this._tableRest, {
    scope: 'scope',
    key: 'key',
    value: 'value',
    activationExpressionScript: 'activationExpression.script',
    priority: 'priority',
  });

  constructor(override httpRequest: BaseHttpRequest, private _tableRest: TableRestService) {
    super(httpRequest);
  }

  public getParametersTableDataSource(): TableRemoteDataSource<any> {
    return this.dataSource;
  }

  public reloadParametersTableDataSource(): void {
    this.dataSource.reload();
  }
}
