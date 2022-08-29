import { Injectable } from '@angular/core';
import { Parameter, ParametersService } from '../../generated';
import { TableApiWrapperService } from '../../table/services/table-api-wrapper.service';
import { BaseHttpRequest } from '../../generated/core/BaseHttpRequest';
import { TableRemoteDataSource } from '../../../modules/table/shared/table-remote-data-source';

@Injectable({ providedIn: 'root' })
export class AugmentedParametersService extends ParametersService {
  private readonly PARAMETERS_TABLE_ID = 'parameters';

  readonly dataSource = new TableRemoteDataSource<Parameter>(this.PARAMETERS_TABLE_ID, this._tableRest, {
    scope: 'scope',
    key: 'key',
    value: 'value',
    activationExpressionScript: 'activationExpression.script',
    priority: 'priority',
  });

  constructor(override httpRequest: BaseHttpRequest, private _tableRest: TableApiWrapperService) {
    super(httpRequest);
  }
}
