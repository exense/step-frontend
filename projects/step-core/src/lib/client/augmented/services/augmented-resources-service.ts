import { Injectable } from '@angular/core';
import { ResourcesService } from '../../generated';
import { TableApiWrapperService } from '../../table/services/table-api-wrapper.service';
import { BaseHttpRequest } from '../../generated/core/BaseHttpRequest';
import { TableRemoteDataSource } from '../../../modules/table/shared/table-remote-data-source';

@Injectable({ providedIn: 'root' })
export class AugmentedResourcesService extends ResourcesService {
  private readonly RESOURCES_TABLE_ID = 'resources';

  readonly dataSource = new TableRemoteDataSource(this.RESOURCES_TABLE_ID, this._tableRest, {
    name: 'attributes.name',
    resourceType: 'resourceType',
    id: 'id',
  });

  constructor(httpRequest: BaseHttpRequest, private _tableRest: TableApiWrapperService) {
    super(httpRequest);
  }
}
