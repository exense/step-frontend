import { computed, Injectable, signal } from '@angular/core';
import { ErrorSearchAction } from '../shared/error-search-action';

@Injectable()
export class ErrorSearchActionsService {
  private readonly actions = signal<readonly ErrorSearchAction[]>([]);

  readonly availableActions = computed<readonly ErrorSearchAction[]>(() => {
    const actions = this.actions();
    return actions.filter((action) => action.isAvailable());
  });

  register(action: ErrorSearchAction): () => void {
    if (this.actions().some((registered) => registered.id === action.id)) {
      throw new Error(`Error search action '${action.id}' is already registered`);
    }

    this.actions.update((actions) => [...actions, action]);
    let registered = true;
    return () => {
      if (!registered) {
        return;
      }
      registered = false;
      this.actions.update((actions) => actions.filter((current) => current !== action));
    };
  }
}
