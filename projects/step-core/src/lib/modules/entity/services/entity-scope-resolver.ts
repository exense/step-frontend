import { Injectable } from '@angular/core';
import { Entity } from '../types/entity';
import { Resolver } from '../types/resolver';

@Injectable({
  providedIn: 'root',
})
export class EntityScopeResolver {
  resolvers: Resolver<Entity>[] = [];

  registerResolver(resolver: Resolver<Entity>) {
    this.resolvers.push(resolver);
  }

  getScope(entity: Entity) {
    for (const resolver of this.resolvers) {
      const entityScope = resolver(entity);
      if (entityScope != null) {
        return entityScope;
      }
    }
    return null;
  }
}
