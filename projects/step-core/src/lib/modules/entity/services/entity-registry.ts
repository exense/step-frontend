import { Injectable } from '@angular/core';
import { Entity } from '../types/entity';
import { Resolver } from '../types/resolver';
import { EntityMeta } from '../types/entityMeta';
import { downgradeInjectable, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE } from '../../../shared';
import { AuthService } from '../../../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class EntityRegistry {
  entityMetas: EntityMeta[] = [];

  //FIXME: we attach information like the view to the entityMeta, this approach will not work in Angular2+
  registerEntity(
    _displayName: any,
    _entityName: any,
    _entityCollectionName: any,
    _getUrl: any,
    _postUrl: any,
    _tableType: any,
    _templateUrl: any,
    _callback: any,
    _icon: any,
    _iconAG2: any
  ) {
    const entity: EntityMeta = {
      displayName: _displayName,
      entityName: _entityName,
      entityCollectionName: _entityCollectionName,
      getUrl: _getUrl,
      postUrl: _postUrl,
      tableType: _tableType,
      templateUrl: _templateUrl,
      callback: _callback,
      icon: _icon,
      iconAG2: _iconAG2,
    };
    this.entityMetas.push(entity);
  }

  getEntities() {
    return this.entityMetas;
  }

  getEntityByName(name: string) {
    return this.entityMetas.filter((entityMeta) => entityMeta.entityName === name)[0];
  }
}

getAngularJSGlobal().module(AJS_MODULE).service('EntityRegistry', downgradeInjectable(EntityRegistry));
