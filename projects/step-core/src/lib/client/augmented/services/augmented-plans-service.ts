import { Injectable } from '@angular/core';
import { Plan, PlansService } from '../../generated';
import { TableRestService } from '../../table/services/table-rest.service';
import { BaseHttpRequest } from '../../generated/core/BaseHttpRequest';
import { TableRemoteDataSource } from '../../../modules/table/shared/table-remote-data-source';

@Injectable({ providedIn: 'root' })
export class AugmentedPlansService extends PlansService {
  private dataSource: TableRemoteDataSource<Plan> = new TableRemoteDataSource<Plan>('plans', this._tableRest, {
    name: 'attributes.name',
    type: 'root._class',
    actions: '',
  });

  constructor(override httpRequest: BaseHttpRequest, private _tableRest: TableRestService) {
    super(httpRequest);
  }

  public getPlansTableDataSource(): TableRemoteDataSource<Plan> {
    return this.dataSource;
  }
}
