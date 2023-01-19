import { BaseRegistryService } from './base-registry.service';
import { CustomRegistryType } from '../shared/custom-registry-type.enum';
import { CustomRegistryService } from './custom-registry.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ExecutionCustomPanelRegistryService extends BaseRegistryService {
  protected override readonly registryType = CustomRegistryType.executionCustomPanel;

  constructor(_customRegistry: CustomRegistryService) {
    super(_customRegistry);
  }
}
