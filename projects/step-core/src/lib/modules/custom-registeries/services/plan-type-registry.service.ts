import { BaseRegistryService } from './base-registry.service';
import { CustomRegistryType } from '../shared/custom-registry-type.enum';
import { Injectable } from '@angular/core';
import { CustomRegistryService } from './custom-registry.service';

@Injectable({
  providedIn: 'root',
})
export class PlanTypeRegistryService extends BaseRegistryService {
  protected readonly registryType: CustomRegistryType = CustomRegistryType.planType;

  constructor(_customRegistry: CustomRegistryService) {
    super(_customRegistry);
  }
}
