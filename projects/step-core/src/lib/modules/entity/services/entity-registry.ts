import { Injectable } from '@angular/core';
import { EntityMeta } from '../types/entity-meta';
import { downgradeInjectable, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE } from '../../../shared';
import { CustomRegistryService, CustomRegistryType } from '../../custom-registeries/custom-registries.module';

@Injectable({
  providedIn: 'root',
})
export class EntityRegistry {
  protected readonly registryType = CustomRegistryType.entity;

  constructor(private _customRegistry: CustomRegistryService) {}

  //FIXME: we attach information like the view to the entityMeta, this approach will not work in Angular2+
  registerEntity(
    displayName: string,
    entityName: string,
    icon?: string,
    entityCollectionName?: string,
    getUrl?: string,
    postUrl?: string,
    tableType?: string,
    templateUrl?: string,
    callback?: Function
  ): void {
    const type = entityName;
    const label = displayName;
    const entity: EntityMeta = {
      type,
      label,
      displayName,
      entityName,
      entityCollectionName,
      getUrl,
      postUrl,
      tableType,
      templateUrl,
      callback,
      icon,
    };
    this._customRegistry.register(this.registryType, type, entity);
  }

  /**
   * Shortcut for ng2+ invocation
   * @param type
   * @param label
   * @param icon
   * @param templateUrl
   */
  register(type: string, label: string, icon?: string, templateUrl?: string): void {
    return this.registerEntity(label, type, icon, undefined, undefined, undefined, undefined, templateUrl);
  }

  getEntities(): ReadonlyArray<EntityMeta> {
    return this._customRegistry.getRegisteredItems(this.registryType).map((item) => item as EntityMeta);
  }

  getEntityByName(name: string): EntityMeta {
    const item = this._customRegistry.getRegisteredItem(this.registryType, name);
    return item as EntityMeta;
  }
}

getAngularJSGlobal().module(AJS_MODULE).service('EntityRegistry', downgradeInjectable(EntityRegistry));
