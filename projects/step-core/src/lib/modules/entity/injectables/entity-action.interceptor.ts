import { Observable, of, switchMap, tap } from 'rxjs';
import { EntityAction } from '../types/entity-action';

export abstract class EntityActionInterceptor<T> implements EntityAction {
  abstract readonly name?: string;
  abstract readonly entityType: string;
  abstract readonly action: string;
  protected abstract proceedAction(entity: T, additionalParams?: unknown): Observable<boolean>;

  invokeAction(entity: T, additionalParams?: unknown): Observable<boolean> {
    return of(undefined).pipe(
      tap(() => console.log(`INVOKE "${this.entityType}.${this.action}.${this.name}"`)),
      switchMap(() => this.proceedAction(entity, additionalParams))
    );
  }
}
