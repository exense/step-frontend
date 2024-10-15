import { SearchValue } from '../shared/search-value';
import { TablePersistenceUrlParamsSerializerService } from './table-persistence-url-params-serializer.service';
import { inject, Injectable } from '@angular/core';
import { FilterConditionJson } from '../shared/filter-condition-json.interface';
import { FilterConditionFactoryService } from './filter-condition-factory.service';
import { FilterCondition } from '../shared/filter-condition';

@Injectable({
  providedIn: 'root',
})
export class TablePersistenceUrlParamsFilterConditionSerializerService
  implements TablePersistenceUrlParamsSerializerService
{
  private _filterConditionFactory = inject(FilterConditionFactoryService);

  serialize(searchValue: SearchValue): string {
    const filterCondition = searchValue as FilterCondition;
    if (filterCondition.isEmpty()) {
      return '';
    }
    return JSON.stringify(filterCondition);
  }
  deserialize(value: string): SearchValue | undefined {
    const jsonValue = JSON.parse(value) as FilterConditionJson;
    if (jsonValue.filterConditionType !== undefined) {
      const filterCondition = this._filterConditionFactory.create(jsonValue as FilterConditionJson);
      if (filterCondition && !filterCondition?.isEmpty()) {
        return filterCondition;
      } else {
        return undefined;
      }
    }
    return undefined;
  }
  isValueMatchForSerialize(searchValue: SearchValue): boolean {
    return searchValue instanceof FilterCondition;
  }
  isValueMatchForDeserialize(value: string): boolean {
    return value.startsWith('{') && value.endsWith('}');
  }
}
