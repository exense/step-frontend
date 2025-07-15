import { BaseItemComponent } from './base-item.component';
import { CustomRegistryType } from '../../shared/custom-registry-type.enum';
import { Component } from '@angular/core';
import { CustomRegistryItem } from '../../shared/custom-registry-item';

@Component({
  selector: 'step-function-type',
  templateUrl: './base-item.component.html',
  styleUrls: [],
  standalone: false,
})
export class FunctionTypeComponent extends BaseItemComponent<CustomRegistryItem> {
  protected override readonly registryType: CustomRegistryType = CustomRegistryType.FUNCTION_TYPE;
}
