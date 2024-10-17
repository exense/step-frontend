import { SearchValue } from '../shared/search-value';

export abstract class TablePersistenceUrlParamsSerializerService {
  abstract serialize(searchValue: SearchValue): string;
  abstract deserialize(value: string): SearchValue | undefined;
  abstract isValueMatchForSerialize(searchValue: SearchValue): boolean;
  abstract isValueMatchForDeserialize(value: string): boolean;
}
