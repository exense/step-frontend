import { FilterCondition, FilterConditionFactoryService, FilterConditionType, SearchValue } from '../table.module';
import { TablePersistenceUrlParamsSerializerService } from './table-persistence-url-params-serializer.service';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TablePersistenceUrlParamsArraySerializerService implements TablePersistenceUrlParamsSerializerService {
  private _filterConditionFactory = inject(FilterConditionFactoryService);

  serialize(searchValue: SearchValue): string {
    const filterCondition = searchValue as FilterCondition;
    if (filterCondition.isEmpty()) {
      return '';
    }
    const items = filterCondition.sourceObject as string[];
    return `arr[${items.join(',')}]`;
  }

  deserialize(value: string): SearchValue {
    const items = this.isRegexArrayParam(value)
      ? this.extractItemsFromRegexArrayParam(value)
      : this.extractItemsFromArrayParam(value);

    return this._filterConditionFactory.arrayFilterCondition(items);
  }

  isValueMatchForSerialize(searchValue: SearchValue): boolean {
    return (
      searchValue instanceof FilterCondition &&
      (searchValue as FilterCondition).filterConditionType === FilterConditionType.ARRAY
    );
  }
  isValueMatchForDeserialize(value: string): boolean {
    return this.isArrayParam(value) || this.isRegexArrayParam(value);
  }

  private isArrayParam(value: string): boolean {
    return value.startsWith('arr[') && value.endsWith(']');
  }

  private isRegexArrayParam(value: string): boolean {
    return value.startsWith('r[(') && value.endsWith(')]');
  }

  private extractItemsFromArrayParam(value: string): string[] {
    const stringValue = value.slice(4, value.length - 1);
    if (!stringValue) {
      return [];
    }
    return stringValue.split(',');
  }

  private extractItemsFromRegexArrayParam(value: string): string[] {
    const regexValue = value.slice(3, value.length - 2);
    if (!regexValue) {
      return [];
    }
    return regexValue.split('|').map((item) => {
      item = item.startsWith('^') ? item.slice(1) : item;
      item = item.endsWith('$') ? item.slice(0, item.length - 1) : item;
      return item;
    });
  }
}
