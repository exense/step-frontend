import { inject, InjectionToken } from '@angular/core';
import { TablePersistenceUrlParamsSerializerService } from './table-persistence-url-params-serializer.service';
import { TablePersistenceUrlParamsRegexSerializerService } from './table-persistence-url-params-regex-serializer.service';
import { TablePersistenceUrlParamsDefaultSerializerService } from './table-persistence-url-params-default-serializer.service';
import { TablePersistenceUrlParamsFilterConditionSerializerService } from './table-persistence-url-params-filter-condition-serializer.service';
import { TablePersistenceUrlParamsArraySerializerService } from './table-persistence-url-params-array-serializer.service';

export const TABLE_PERSISTENCE_URL_PARAMS_SERIALIZERS = new InjectionToken<
  TablePersistenceUrlParamsSerializerService[]
>('Table persistence url serializers', {
  providedIn: 'root',
  factory: () => {
    const arraySerializer = inject(TablePersistenceUrlParamsArraySerializerService);
    const regexSerializer = inject(TablePersistenceUrlParamsRegexSerializerService);
    const filterConditionSerializer = inject(TablePersistenceUrlParamsFilterConditionSerializerService);
    const defaultSerializer = inject(TablePersistenceUrlParamsDefaultSerializerService);

    return [arraySerializer, regexSerializer, filterConditionSerializer, defaultSerializer];
  },
});
