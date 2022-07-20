import { Injectable } from '@angular/core';
import { ControllerService } from '../../generated';
import { TableRestService } from '../../table/services/table-rest.service';
import { BaseHttpRequest } from '../../generated/core/BaseHttpRequest';
import { TableRemoteDataSource } from '../../../modules/table/shared/table-remote-data-source';

@Injectable({ providedIn: 'root' })
export class AugmentedControllerService extends ControllerService {
  readonly dataSource: TableRemoteDataSource<any> = new TableRemoteDataSource<any>('artefacts', this._tableRest, {
    name: 'attributes.name',
    type: 'root._class',
    actions: '',
  });

  constructor(override httpRequest: BaseHttpRequest, private _tableRest: TableRestService) {
    super(httpRequest);
  }
}
