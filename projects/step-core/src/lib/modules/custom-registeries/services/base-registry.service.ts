import { CustomRegistryType } from '../shared/custom-registry-type.enum';
import { CustomRegistryService } from './custom-registry.service';
import { inject, Type } from '@angular/core';
import { CustomRegistryItem } from '../shared/custom-registry-item';
import { CustomComponent } from '../shared/custom-component';

export type ItemInfo = Pick<CustomRegistryItem, 'type' | 'label'>;

const convert = (item?: CustomRegistryItem): ItemInfo | undefined => {
  if (!item) {
    return undefined;
  }
  const { type, label } = item;
  return { type, label };
};

export abstract class BaseRegistryService {
  protected _customRegistry = inject(CustomRegistryService);
  protected abstract readonly registryType: CustomRegistryType;

  register(type: string, label: string, component?: Type<CustomComponent>): void {
    this._customRegistry.register(this.registryType, type, { type, label, component });
  }

  filterKeys(keys: string[]): string[] {
    return this._customRegistry.filterKeys(this.registryType, keys);
  }

  getItemInfos(): ReadonlyArray<ItemInfo> {
    return this._customRegistry.getRegisteredItems(this.registryType).map((x) => convert(x)!);
  }

  getItemInfo(type: string): ItemInfo | undefined {
    const item = this._customRegistry.getRegisteredItem(this.registryType, type);
    return convert(item);
  }
}
