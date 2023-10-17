import { CustomRegistryType } from '../shared/custom-registry-type.enum';
import { BaseRegistryService } from './base-registry.service';
import { CustomRegistryService } from './custom-registry.service';
import { Injectable, Type } from '@angular/core';
import { CustomComponent } from '../shared/custom-component';

@Injectable({
  providedIn: 'root',
})
export class DashletRegistryService extends BaseRegistryService {
  protected override readonly registryType = CustomRegistryType.DASHLET;

  constructor(_customRegistry: CustomRegistryService) {
    super(_customRegistry);
  }

  registerDashlet(type: string, component: Type<CustomComponent>): void {
    super.register(type, '', component);
  }
}
