import { Injectable, Type } from '@angular/core';
import { EntityMeta } from '../types/entity-meta';
import {
  CustomComponent,
  CustomRegistryService,
  CustomRegistryType,
} from '../../custom-registeries/custom-registries.module';

@Injectable({
  providedIn: 'root',
})
export class EntityRegistry {
  protected readonly registryType = CustomRegistryType.ENTITY;

  constructor(private _customRegistry: CustomRegistryService) {}

  registerEntity(
    displayName: string,
    entityName: string,
    icon?: string,
    entityCollectionName?: string,
    getUrl?: string,
    postUrl?: string,
    tableType?: string,
    component?: Type<CustomComponent>,
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
      callback,
      icon,
      component,
    };
    this._customRegistry.register(this.registryType, type, entity);
  }

  /**
   * Shortcut for ng2+ invocation
   * @param type
   * @param label
   * @param options
   */
  register(type: string, label: string, options: { icon?: string; component?: Type<CustomComponent> } = {}): void {
    const { icon, component } = options;
    return this.registerEntity(label, type, icon, undefined, undefined, undefined, undefined, component);
  }

  getEntities(): ReadonlyArray<EntityMeta> {
    return this._customRegistry.getRegisteredItems(this.registryType).map((item) => item as EntityMeta);
  }

  getEntityByName(name: string): EntityMeta {
    const item = this._customRegistry.getRegisteredItem(this.registryType, name);
    return item as EntityMeta;
  }
}
