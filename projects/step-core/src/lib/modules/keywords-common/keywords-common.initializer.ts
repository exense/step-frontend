import { APP_INITIALIZER, FactoryProvider, inject, Injector, runInInjectionContext } from '@angular/core';
import { EntityRegistry } from '../entity/entity.module';
import { FunctionSelectionTableComponent } from './components/function-selection-table/function-selection-table.component';
import { FunctionBulkOperationsRegisterService } from './injectables/function-bulk-operations-register.service';

const registerEntities = () => {
  const _entityRegistry = inject(EntityRegistry);
  _entityRegistry.register('functions', 'Keyword', {
    icon: 'keyword',
    component: FunctionSelectionTableComponent,
  });
};

const registerBulkOperations = () => {
  inject(FunctionBulkOperationsRegisterService).register();
};

export const KEYWORDS_COMMON_INITIALIZER: FactoryProvider = {
  provide: APP_INITIALIZER,
  useFactory: () => {
    const _injector = inject(Injector);
    return () => {
      runInInjectionContext(_injector, registerEntities);
      runInInjectionContext(_injector, registerBulkOperations);
    };
  },
  multi: true,
};
