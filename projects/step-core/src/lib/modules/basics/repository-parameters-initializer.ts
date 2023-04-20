import { APP_INITIALIZER, FactoryProvider, inject } from '@angular/core';
import { RepositoryParametersStorageService } from './services/repository-parameters-storage.service';

export const REPOSITORY_PARAMETERS_INITIALIZER: FactoryProvider = {
  provide: APP_INITIALIZER,
  useFactory: () => {
    const storage = inject(RepositoryParametersStorageService);
    return () => storage.loadParameters();
  },
  multi: true,
};
