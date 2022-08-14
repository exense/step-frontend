import { BaseRegistryService } from './base-registry.service';
import { Injectable, Type } from '@angular/core';
import { CustomRegistryType } from '../shared/custom-registry-type.enum';
import { EntityItem } from '../shared/entity-item';
import { CustomRegistryService } from './custom-registry.service';

@Injectable({
  providedIn: 'root',
})
export class EntityRegistryService extends BaseRegistryService {
  protected override readonly registryType: CustomRegistryType = CustomRegistryType.entity;

  constructor(_customRegistry: CustomRegistryService) {
    super(_customRegistry);
  }

  override register(type: string, label: string, component?: Type<unknown>, icon?: Type<unknown>) {
    this._customRegistry.register(this.registryType, type, { type, label, component, icon } as EntityItem);
  }
}
