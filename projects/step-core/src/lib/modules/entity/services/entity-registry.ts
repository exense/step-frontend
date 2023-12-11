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

  //FIXME: we attach information like the view to the entityMeta, this approach will not work in Angular2+
  registerEntity(
    displayName: string,
    entityName: string,
    icon?: string,
    entityCollectionName?: string,
    getUrl?: string,
    postUrl?: string,
    tableType?: string,
    templateUrlOrComponent?: string | Type<CustomComponent>,
    callback?: Function
  ): void {
    const type = entityName;
    const label = displayName;

    let templateUrl: string | undefined = undefined;
    let component: Type<CustomComponent> | undefined = undefined;

    if (templateUrlOrComponent) {
      if (typeof templateUrlOrComponent === 'string') {
        templateUrl = templateUrlOrComponent;
      } else {
        component = templateUrlOrComponent;
      }
    }

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
  register(
    type: string,
    label: string,
    options: { icon?: string; templateUrl?: string; component?: Type<CustomComponent> } = {}
  ): void {
    const { icon, templateUrl, component } = options;
    return this.registerEntity(label, type, icon, undefined, undefined, undefined, undefined, component || templateUrl);
  }

  getEntities(): ReadonlyArray<EntityMeta> {
    return this._customRegistry.getRegisteredItems(this.registryType).map((item) => item as EntityMeta);
  }

  getEntityByName(name: string): EntityMeta {
    const item = this._customRegistry.getRegisteredItem(this.registryType, name);
    return item as EntityMeta;
  }
}
