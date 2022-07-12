import { Injectable } from '@angular/core';
import { FunctionPackage, KeywordsService } from '../../generated';
import { TableRestService } from '../../table/services/table-rest.service';
import { BaseHttpRequest } from '../../generated/core/BaseHttpRequest';
import { TableRemoteDataSource } from '../../../modules/table/shared/table-remote-data-source';

@Injectable({ providedIn: 'root' })
export class AugmentedKeywordsService extends KeywordsService {
  private readonly FUNCTIONS_TABLE_ID = 'functions';

  createFilteredTableDataSource(filter?: [string]) {
    return new TableRemoteDataSource<FunctionPackage>(
      this.FUNCTIONS_TABLE_ID,
      this._tableRest,
      {
        name: 'attributes.name',
        type: 'type',
        actions: '',
      },
      filter
    );
  }

  constructor(override httpRequest: BaseHttpRequest, private _tableRest: TableRestService) {
    super(httpRequest);
  }
}
