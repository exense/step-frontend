import { Injectable } from '@angular/core';
import { Function as KeywordFunction, KeywordsService } from '../../generated';
import { TableApiWrapperService } from '../../table/services/table-api-wrapper.service';
import { BaseHttpRequest } from '../../generated/core/BaseHttpRequest';
import { TableRemoteDataSource } from '../../../modules/table/shared/table-remote-data-source';

@Injectable({ providedIn: 'root' })
export class AugmentedKeywordsService extends KeywordsService {
  private readonly FUNCTIONS_TABLE_ID = 'functions';

  createFilteredTableDataSource(filter?: string[]): TableRemoteDataSource<KeywordFunction> {
    return new TableRemoteDataSource<KeywordFunction>(
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

  constructor(override httpRequest: BaseHttpRequest, private _tableRest: TableApiWrapperService) {
    super(httpRequest);
  }
}
