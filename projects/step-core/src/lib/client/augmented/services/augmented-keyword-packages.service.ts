import { FunctionPackage, KeywordPackagesService } from '../../generated';
import { Injectable } from '@angular/core';
import { BaseHttpRequest } from '../../generated/core/BaseHttpRequest';
import { TableRestService } from '../../table/services/table-rest.service';
import { TableRemoteDataSource } from '../../../modules/table/shared/table-remote-data-source';

@Injectable({
  providedIn: 'root',
})
export class AugmentedKeywordPackagesService extends KeywordPackagesService {
  readonly dataSource = new TableRemoteDataSource<FunctionPackage>('functionPackage', this._tableRest, {
    name: 'attributes.name',
    version: 'packageAttributes.version',
    actions: '',
  });

  constructor(httpRequest: BaseHttpRequest, private _tableRest: TableRestService) {
    super(httpRequest);
  }
}
