import { inject, InjectionToken } from '@angular/core';
import { RepositoryParametersStorageService } from '../injectables/repository-parameters-storage.service';

export const REPOSITORY_PARAMETERS = new InjectionToken<ReadonlyArray<string>>('Repository parameters', {
  providedIn: 'root',
  factory: () => inject(RepositoryParametersStorageService).parameters,
});
