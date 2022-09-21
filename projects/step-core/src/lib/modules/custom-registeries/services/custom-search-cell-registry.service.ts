import { Injectable, Type } from '@angular/core';
import { CustomRegistryType } from '../shared/custom-registry-type.enum';
import { CustomRegistryService } from './custom-registry.service';
import { BaseRegistryService } from './base-registry.service';
import { CustomComponent } from '../shared/custom-component';

@Injectable({
  providedIn: 'root',
})
export class CustomSearchCellRegistryService extends BaseRegistryService {
  protected override readonly registryType = CustomRegistryType.customSearchCell;

  constructor(_customRegistry: CustomRegistryService) {
    super(_customRegistry);
  }

  registerSearchCell(type: string, component: Type<CustomComponent>): void {
    super.register(type, '', component);
  }
}
