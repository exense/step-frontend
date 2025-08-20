import { DestroyRef, inject, Provider } from '@angular/core';
import { EntitySelectionState, EntitySelectionStateUpdatable } from './entity-selection-state';
import { EntitySelectionStateImpl } from './entity-selection-state-impl';

export const entitySelectionStateProvider = <KEY, ENTITY>(selectionKeyProperty: string): Provider[] => [
  {
    provide: EntitySelectionStateUpdatable<KEY, ENTITY>,
    useFactory: () => {
      const destroyRef = inject(DestroyRef);
      const instance = new EntitySelectionStateImpl<KEY, ENTITY>();
      instance.setup(selectionKeyProperty);
      destroyRef.onDestroy(() => instance.ngOnDestroy());
      return instance;
    },
  },
  {
    provide: EntitySelectionState<KEY, ENTITY>,
    useExisting: EntitySelectionStateUpdatable<KEY, ENTITY>,
  },
];
