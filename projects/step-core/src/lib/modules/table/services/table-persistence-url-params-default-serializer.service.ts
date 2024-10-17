import { SearchValue } from '../shared/search-value';
import { TablePersistenceUrlParamsSerializerService } from './table-persistence-url-params-serializer.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TablePersistenceUrlParamsDefaultSerializerService implements TablePersistenceUrlParamsSerializerService {
  serialize(searchValue: SearchValue): string {
    if (typeof searchValue === 'string') {
      return searchValue;
    }
    return (searchValue as { value: string }).value;
  }
  deserialize(value: string): SearchValue | undefined {
    return value;
  }
  isValueMatchForSerialize(searchValue: SearchValue): boolean {
    return true;
  }
  isValueMatchForDeserialize(value: string): boolean {
    return true;
  }
}
