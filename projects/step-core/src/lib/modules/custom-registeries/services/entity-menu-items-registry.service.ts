import { inject, Injectable, Type } from '@angular/core';
import { Observable } from 'rxjs';
import { CustomRegistryService } from './custom-registry.service';
import { CustomRegistryType } from '../shared/custom-registry-type.enum';
import { CustomRegistryItem } from '../shared/custom-registry-item';

export abstract class EntityMenuItemCommandInvoker<E> {
  abstract invoke(entityType: string, entityKey: string, entity: E): Observable<boolean>;
}

interface EntityMenuItem<E = unknown> extends CustomRegistryItem {
  entity: string;
  menuId: string;
  entityKeyProperty: string;
  operation: Type<EntityMenuItemCommandInvoker<E>>;
  icon?: string;
  permission?: string;
}

export type EntityMenuItemInfo = Omit<EntityMenuItem, 'component' | 'type'>;
export type EntityMenuItemRegistryInfo = Omit<EntityMenuItemInfo, 'entity'>;

@Injectable({
  providedIn: 'root',
})
export class EntityMenuItemsRegistryService {
  private _customRegistry = inject(CustomRegistryService);

  private readonly registryType = CustomRegistryType.entityMenuItems;

  register(entity: string, menuItemInfo: EntityMenuItemRegistryInfo): this {
    const type = `${entity}_${menuItemInfo.menuId}`;
    const menuItem: EntityMenuItem = {
      ...menuItemInfo,
      type,
      entity,
    };
    this._customRegistry.register(this.registryType, type, menuItem);
    return this;
  }

  getEntityMenuItems(entity: string): EntityMenuItemInfo[] {
    return (this._customRegistry.getRegisteredItems(this.registryType) as EntityMenuItem[])
      .filter((item) => item.entity === entity)
      .map(({ menuId, entity, entityKeyProperty, icon, label, operation, permission }) => ({
        menuId,
        entity,
        entityKeyProperty,
        icon,
        label,
        operation,
        permission,
      }));
  }
}
