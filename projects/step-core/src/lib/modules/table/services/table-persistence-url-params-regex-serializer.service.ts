import { SearchValue } from '../shared/search-value';
import { TablePersistenceUrlParamsSerializerService } from './table-persistence-url-params-serializer.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TablePersistenceUrlParamsRegexSerializerService implements TablePersistenceUrlParamsSerializerService {
  serialize(searchValue: SearchValue): string {
    const value = searchValue as { regex?: boolean; value: string };
    return `r[${value.value}]`;
  }
  deserialize(value: string): SearchValue | undefined {
    const regexValue = value.slice(2, value.length - 1);
    if (!regexValue) {
      return undefined;
    }
    return { regex: true, value: regexValue };
  }
  isValueMatchForSerialize(searchValue: SearchValue): boolean {
    const value = searchValue as { regex?: boolean; value: string };
    return !!value.regex && !!value.value;
  }
  isValueMatchForDeserialize(value: string): boolean {
    return value.startsWith('r[') && value.endsWith(']');
  }
}
