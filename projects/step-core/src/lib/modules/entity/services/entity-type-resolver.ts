import { Injectable } from '@angular/core';
import { Entity } from '../types/entity';
import { Resolver } from '../types/resolver';
import { downgradeInjectable, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE } from '../../../shared';

@Injectable({
  providedIn: 'root',
})
export class EntityTypeResolver {
  resolvers: Resolver<Entity>[] = [];

  registerResolver(resolver: Resolver<Entity>): void {
    this.resolvers.push(resolver);
  }

  getTypeExtension(entity: Entity, type?: any): { icon: string; tooltip: string } {
    for (const resolver of this.resolvers) {
      const entityScope = resolver(entity, type);
      if (entityScope) {
        return entityScope;
      }
    }
    return;
  }
}

getAngularJSGlobal().module(AJS_MODULE).service('EntityTypeResolver', downgradeInjectable(EntityTypeResolver));
