import { Injectable } from '@angular/core';
import { Plan, PlansService } from '../../generated';
import { TableApiWrapperService } from '../../table/services/table-api-wrapper.service';
import { BaseHttpRequest } from '../../generated/core/BaseHttpRequest';
import { TableRemoteDataSource } from '../../../modules/table/shared/table-remote-data-source';

@Injectable({ providedIn: 'root' })
export class AugmentedPlansService extends PlansService {
  private dataSource: TableRemoteDataSource<Plan> = new TableRemoteDataSource<Plan>('plans', this._tableRest, {
    type: 'root._class',
    actions: '',
  });

  constructor(override httpRequest: BaseHttpRequest, private _tableRest: TableApiWrapperService) {
    super(httpRequest);
  }

  public getPlansTableDataSource(): TableRemoteDataSource<Plan> {
    return this.dataSource;
  }
}
