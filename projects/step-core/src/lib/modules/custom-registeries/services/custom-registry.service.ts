import { Injectable } from '@angular/core';
import { CustomRegistryItem } from '../shared/custom-registry-item';
import { CustomRegistryType } from '../shared/custom-registry-type.enum';

@Injectable({
  providedIn: 'root',
})
export class CustomRegistryService {
  private store = new Map<CustomRegistryType, Map<string, CustomRegistryItem>>();

  register(storeType: CustomRegistryType, key: string, item: CustomRegistryItem): void {
    this.getStoreForType(storeType).set(key, item);
  }

  getRegisteredItem(storeType: CustomRegistryType, key: string): CustomRegistryItem | undefined {
    return this.getStoreForType(storeType).get(key);
  }

  getRegisteredItems(storeType: CustomRegistryType): ReadonlyArray<CustomRegistryItem> {
    return Array.from(this.getStoreForType(storeType)!.values());
  }

  private getStoreForType(storeType: CustomRegistryType): Map<string, CustomRegistryItem> {
    if (!this.store.has(storeType)) {
      this.store.set(storeType, new Map<string, CustomRegistryItem>());
    }
    return this.store.get(storeType)!;
  }
}
