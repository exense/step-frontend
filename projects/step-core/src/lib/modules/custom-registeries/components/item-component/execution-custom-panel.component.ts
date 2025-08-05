import { BaseItemComponent } from './base-item.component';
import { CustomRegistryType } from '../../shared/custom-registry-type.enum';
import { Component, ViewEncapsulation } from '@angular/core';
import { CustomRegistryItem } from '../../shared/custom-registry-item';

@Component({
  selector: 'step-execution-custom-panel',
  templateUrl: './base-item.component.html',
  styleUrls: ['./plan-type.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class ExecutionCustomPanelComponent extends BaseItemComponent<CustomRegistryItem> {
  protected override readonly registryType: CustomRegistryType = CustomRegistryType.EXECUTION_CUSTOM_PANEL;
}
