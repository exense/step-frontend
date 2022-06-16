import { Injectable } from '@angular/core';
import { Entity } from '../types/entity';
import { Resolver } from '../types/resolver';
import { EntityMeta } from '../types/entityMeta';

@Injectable({
  providedIn: 'root',
})
export class EntityRegistry {
  entityMetas: EntityMeta[] = [];

  //FIXME: we attach information like the view to the entityMet, this approach will not work in Angular2+
  registerEntity(entity: EntityMeta) {
    this.entityMetas.push(entity);
  }

  getEntities() {
    return this.entityMetas;
  }

  getEntityByName(name: string) {
    return this.entityMetas.filter((entityMeta) => entityMeta.entityName === name)[0];
  }
}
