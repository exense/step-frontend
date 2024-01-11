import { inject, Injectable, Injector, Type } from '@angular/core';
import { EntityActionInterceptor } from './entity-action.interceptor';

@Injectable({
  providedIn: 'root',
})
export class EntityActionRegistryService {
  private _injector = inject(Injector);

  private interceptors: EntityActionInterceptor<unknown>[] = [];

  register(interceptorClass: Type<EntityActionInterceptor<unknown>>): this {
    this.interceptors.unshift(this._injector.get(interceptorClass));
    return this;
  }

  getInterceptors<T>(entityType: string, action: string): ReadonlyArray<EntityActionInterceptor<T>> {
    return this.interceptors.filter((item) => {
      return item.entityType === entityType && item.action === action;
    }) as ReadonlyArray<EntityActionInterceptor<T>>;
  }
}
