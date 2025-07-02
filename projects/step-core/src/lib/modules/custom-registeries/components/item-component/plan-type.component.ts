import { BaseItemComponent } from './base-item.component';
import { CustomRegistryType } from '../../shared/custom-registry-type.enum';
import { Component, ViewEncapsulation } from '@angular/core';
import { CustomRegistryItem } from '../../shared/custom-registry-item';

@Component({
  selector: 'step-plan-type',
  templateUrl: './base-item.component.html',
  styleUrls: ['./plan-type.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class PlanTypeComponent extends BaseItemComponent<CustomRegistryItem> {
  protected override readonly registryType: CustomRegistryType = CustomRegistryType.PLAN_TYPE;
}
