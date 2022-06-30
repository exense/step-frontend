import { Injectable } from '@angular/core';
import { Entity } from '../types/entity';
import { Resolver } from '../types/resolver';
import { downgradeInjectable, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE } from '../../../shared';
import { EntityRegistry } from './entity-registry';

@Injectable({
  providedIn: 'root',
})
export class EntityScopeResolver {
  resolvers: Resolver<Entity>[] = [];

  registerResolver(resolver: Resolver<Entity>) {
    this.resolvers.push(resolver);
  }

  /* Will return result of first resolver that is not null */
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

getAngularJSGlobal().module(AJS_MODULE).service('EntityScopeResolver', downgradeInjectable(EntityScopeResolver));
