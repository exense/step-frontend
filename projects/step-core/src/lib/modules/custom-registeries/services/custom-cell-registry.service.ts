import { BaseRegistryService } from './base-registry.service';
import { Injectable, Type } from '@angular/core';
import { CustomRegistryType } from '../shared/custom-registry-type.enum';
import { CustomRegistryService } from './custom-registry.service';
import { CustomComponent } from '../shared/custom-component';

@Injectable({
  providedIn: 'root',
})
export class CustomCellRegistryService extends BaseRegistryService {
  protected override readonly registryType = CustomRegistryType.CUSTOM_CELL;

  constructor(_customRegistry: CustomRegistryService) {
    super(_customRegistry);
  }

  registerCell(type: string, component: Type<CustomComponent>): void {
    super.register(type, '', component);
  }
}
