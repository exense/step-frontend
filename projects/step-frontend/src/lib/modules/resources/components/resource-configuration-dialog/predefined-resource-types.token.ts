import { InjectionToken } from '@angular/core';
import { PredefinedResourceType } from './predefined-resource-type.enum';

export const PREDEFINED_RESOURCE_TYPES = new InjectionToken<PredefinedResourceType[]>('Predefined resource types', {
  providedIn: 'root',
  factory: () => {
    return [
      PredefinedResourceType.ATTACHMENT,
      PredefinedResourceType.DATA_SOURCE,
      PredefinedResourceType.FUNCTIONS,
      PredefinedResourceType.PDF_TEST_SCENARIO_FILE,
      PredefinedResourceType.SECRET,
      PredefinedResourceType.STAGING_CONTEXT_FILES,
      PredefinedResourceType.TEMP,
    ];
  },
});
