import { Injectable } from '@angular/core';
import { Entity } from '../types/entity';
import { Resolver } from '../types/resolver';
import { downgradeInjectable, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE } from '../../../shared';

@Injectable({
  providedIn: 'root',
})
export class EntityScopeResolver {
  resolvers: Resolver<Entity>[] = [];

  registerResolver(resolver: Resolver<Entity>): void {
    this.resolvers.push(resolver);
  }

  /* Will return result of first resolver that is not null */
  getScope(entity: Entity, type?: any): any {
    for (const resolver of this.resolvers) {
      const entityScope = resolver(entity, type);
      if (entityScope != null) {
        return entityScope;
      }
    }
    return null;
  }
}

getAngularJSGlobal().module(AJS_MODULE).service('EntityScopeResolver', downgradeInjectable(EntityScopeResolver));
