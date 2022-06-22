import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { PlansService } from '../../generated';
import { TableRestService } from '../../../modules/table/services/api/table-rest.service';
import { BaseHttpRequest } from '../../generated/core/BaseHttpRequest';
import { TableRemoteDataSource } from '../../../modules/table/shared/table-remote-data-source';
import { DataSource } from '../../../modules/table/components/table/table.component';
import { TableResponse } from '../../../modules/table/services/api/dto/table-response';

@Injectable({ providedIn: 'root' })
export class AugmentedPlansService extends PlansService {
  readonly dataSource = new TableRemoteDataSource('plans', this._tableRest, {
    name: 'attributes.name',
    type: 'root._class',
    actions: '',
  });

  constructor(override httpRequest: BaseHttpRequest, private _tableRest: TableRestService) {
    super(httpRequest);
  }

  public getPlansTableDataSource(): TableRemoteDataSource<unknown> {
    return this.dataSource;
  }
}
