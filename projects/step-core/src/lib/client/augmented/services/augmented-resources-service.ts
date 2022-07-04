import { Injectable } from '@angular/core';
import { ResourcesService } from '../../generated';
import { TableRestService } from '../../table/services/table-rest.service';
import { BaseHttpRequest } from '../../generated/core/BaseHttpRequest';
import { TableRemoteDataSource } from '../../../modules/table/shared/table-remote-data-source';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AugmentedResourcesService extends ResourcesService {
  readonly RESOURCES_TABLE_ID = 'resources';

  readonly dataSource = new TableRemoteDataSource(this.RESOURCES_TABLE_ID, this._tableRest, {
    name: 'attributes.name',
    resourceType: 'resourceType',
    id: 'id',
  });

  constructor(override httpRequest: BaseHttpRequest, private _tableRest: TableRestService) {
    super(httpRequest);
  }

  public getResourcesTableDataSource(): TableRemoteDataSource<any> {
    return this.dataSource;
  }

  public reloadResourcesTableDataSource(): void {
    this.dataSource.reload();
  }
}
