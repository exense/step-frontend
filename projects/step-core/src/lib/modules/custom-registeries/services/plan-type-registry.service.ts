import { BaseRegistryService } from './base-registry.service';
import { CustomRegistryType } from '../shared/custom-registry-type.enum';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PlanTypeRegistryService extends BaseRegistryService {
  protected readonly registryType: CustomRegistryType = CustomRegistryType.PLAN_TYPE;
}
