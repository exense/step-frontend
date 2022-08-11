import { BaseItemComponent } from './base-item.component';
import { CustomRegistryType } from '../../shared/custom-registry-type.enum';
import { Component } from '@angular/core';
import { CustomRegistryService } from '../../services/custom-registry.service';
import { CustomRegistryItem } from '../../shared/custom-registry-item';

@Component({
  selector: 'step-plan-type',
  templateUrl: './base-item.component.html',
  styleUrls: [],
})
export class PlanTypeComponent extends BaseItemComponent<CustomRegistryItem> {
  protected override readonly registryType: CustomRegistryType = CustomRegistryType.planType;

  constructor(_customRegistryService: CustomRegistryService) {
    super(_customRegistryService);
  }
}
