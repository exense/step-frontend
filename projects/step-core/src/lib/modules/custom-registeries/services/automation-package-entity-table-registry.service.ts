import { Injectable } from '@angular/core';
import { BaseRegistryService } from './base-registry.service';
import { CustomRegistryType } from '../shared/custom-registry-type.enum';

@Injectable({
  providedIn: 'root',
})
export class AutomationPackageEntityTableRegistryService extends BaseRegistryService {
  protected override readonly registryType = CustomRegistryType.AUTOMATION_PACKAGE_ENTITY_TABLE;
}
